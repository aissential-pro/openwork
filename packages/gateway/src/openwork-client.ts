/**
 * OpenWork client for connecting the gateway to the OpenWork agent
 *
 * This module provides the real integration with the OpenWork agent system,
 * using the existing Session and SessionPrompt infrastructure.
 */

// Import from openwork package (workspace dependency)
import { Instance } from 'openwork/project/instance'
import { InstanceBootstrap } from 'openwork/project/bootstrap'
import { Session } from 'openwork/session/index'
import { SessionPrompt } from 'openwork/session/prompt'
import { MessageV2 } from 'openwork/session/message-v2'
import path from 'path'
import os from 'os'

/**
 * Response from sending a message
 */
export interface MessageResponse {
  /**
   * The agent's response text
   */
  response: string

  /**
   * Whether this is a newly created session (first message or after reset)
   */
  isNewSession?: boolean
}

/**
 * Interface for the OpenWork client
 * This connects the messaging gateway to the underlying OpenWork agent system
 */
export interface OpenWorkClient {
  /**
   * Send a message to the agent and get a response
   * @param sessionId - Unique identifier for the conversation session
   * @param message - The message text to send to the agent
   * @returns The agent's response with session metadata
   */
  sendMessage(sessionId: string, message: string): Promise<MessageResponse>

  /**
   * Send a message with file attachments
   * @param sessionId - Unique identifier for the conversation session
   * @param message - The message text to send to the agent
   * @param files - Array of file paths to attach
   * @returns The agent's response with session metadata
   */
  sendMessageWithFiles?(sessionId: string, message: string, files: string[]): Promise<MessageResponse>

  /**
   * Reset a session (clear conversation history)
   * @param sessionId - The session to reset
   */
  resetSession?(sessionId: string): Promise<void>

  /**
   * Get session status
   * @param sessionId - The session to check
   * @returns Session status information
   */
  getSessionStatus?(sessionId: string): Promise<{ active: boolean; messageCount: number }>
}

/**
 * Configuration for the OpenWork client
 */
export interface OpenWorkClientConfig {
  /**
   * Model to use in provider/model format
   * Examples:
   *   - "claude-sonnet-4-20250514" (defaults to anthropic provider)
   *   - "openrouter/anthropic/claude-sonnet-4-20250514"
   *   - "openai/gpt-4o"
   *
   * API keys should be set via environment variables:
   *   - ANTHROPIC_API_KEY for Anthropic
   *   - OPENROUTER_API_KEY for OpenRouter
   *   - OPENAI_API_KEY for OpenAI
   */
  model?: string

  /**
   * Working directory for the agent (defaults to ~/business)
   */
  workingDirectory?: string

  /**
   * Timeout for agent responses in milliseconds
   */
  timeout?: number
}

/**
 * Real implementation of the OpenWork client using the existing agent system
 */
export class RealOpenWorkClient implements OpenWorkClient {
  private config: OpenWorkClientConfig
  private initialized = false
  private initializing: Promise<void> | null = null
  private sessionMap: Map<string, string> = new Map() // externalId -> internalSessionId

  constructor(config: OpenWorkClientConfig) {
    this.config = config
    // Start initialization immediately in the background
    this.initializing = this.preInitialize()
  }

  /**
   * Pre-initialize the OpenWork instance at startup
   * This avoids slow initialization on first message
   */
  private async preInitialize(): Promise<void> {
    console.log('Pre-initializing OpenWork instance...')
    const directory = this.getWorkingDirectory()

    try {
      await Instance.provide({
        directory,
        init: async () => {
          await InstanceBootstrap()
          this.initialized = true
          console.log('OpenWork instance initialized successfully')
        },
        fn: async () => {
          // Just initialize, don't do anything else
        },
      })
    } catch (error) {
      console.error('Failed to pre-initialize OpenWork instance:', error)
      throw error
    }
  }

  /**
   * Wait for initialization to complete
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initializing) {
      await this.initializing
      this.initializing = null
    }
  }

  /**
   * Get the working directory for the agent
   */
  private getWorkingDirectory(): string {
    return this.config.workingDirectory || path.join(os.homedir(), 'business')
  }

  /**
   * Parse the model string into provider/model components
   *
   * Supported formats:
   *   - "claude-sonnet-4-20250514" -> anthropic/claude-sonnet-4-20250514
   *   - "anthropic/claude-sonnet-4-20250514" -> anthropic/claude-sonnet-4-20250514
   *   - "openrouter/anthropic/claude-sonnet-4-20250514" -> openrouter/anthropic/claude-sonnet-4-20250514
   */
  private parseModel(): { providerID: string; modelID: string } {
    const model = this.config.model || 'claude-sonnet-4-20250514'

    // Handle OpenRouter format: openrouter/provider/model
    if (model.startsWith('openrouter/')) {
      // For OpenRouter, the modelID includes the nested provider/model
      // e.g., "openrouter/anthropic/claude-sonnet-4" -> providerID: "openrouter", modelID: "anthropic/claude-sonnet-4"
      const parts = model.split('/')
      return {
        providerID: parts[0],
        modelID: parts.slice(1).join('/'),
      }
    }

    // If model contains a slash, it's in provider/model format
    if (model.includes('/')) {
      const [providerID, ...rest] = model.split('/')
      return { providerID, modelID: rest.join('/') }
    }

    // Default to anthropic provider for Claude models
    if (model.startsWith('claude')) {
      return { providerID: 'anthropic', modelID: model }
    }

    // For other models, assume openai-compatible
    return { providerID: 'openai', modelID: model }
  }

  /**
   * Run an operation within the OpenWork instance context
   */
  private async withInstance<T>(fn: () => Promise<T>): Promise<T> {
    const directory = this.getWorkingDirectory()

    return Instance.provide({
      directory,
      init: async () => {
        if (!this.initialized) {
          await InstanceBootstrap()
          this.initialized = true
        }
      },
      fn,
    })
  }

  /**
   * Get or create an internal session ID for the given external session ID
   * Returns both the session and a flag indicating if it's newly created
   */
  private async getOrCreateSession(externalSessionId: string): Promise<{ session: Session.Info; isNew: boolean }> {
    return this.withInstance(async () => {
      // Check if we already have a mapping
      const existingInternalId = this.sessionMap.get(externalSessionId)
      if (existingInternalId) {
        const session = await Session.get(existingInternalId)
        if (session) {
          return { session, isNew: false }
        }
        // Session was deleted, remove mapping
        this.sessionMap.delete(externalSessionId)
      }

      // Create a new session
      const session = await Session.create({
        title: `Gateway session: ${externalSessionId}`,
      })

      // Store the mapping
      this.sessionMap.set(externalSessionId, session.id)

      return { session, isNew: true }
    })
  }

  /**
   * Extract text response from message parts
   */
  private extractTextFromParts(parts: MessageV2.Part[]): string {
    const textParts: string[] = []

    for (const part of parts) {
      if (part.type === 'text' && !('synthetic' in part && part.synthetic)) {
        textParts.push(part.text)
      }
    }

    return textParts.join('\n\n').trim() || 'I completed the task but have no text response.'
  }

  /**
   * Send a message to the agent and get a response
   */
  async sendMessage(sessionId: string, message: string): Promise<MessageResponse> {
    // Ensure initialization is complete before processing
    await this.ensureInitialized()

    const { session, isNew } = await this.getOrCreateSession(sessionId)
    const model = this.parseModel()

    return this.withInstance(async () => {
      try {
        console.log('Sending message to agent:', { sessionId: session.id, model, isNew, message: message.substring(0, 50) })

        // Send the message to the agent using SessionPrompt.prompt
        const result = await SessionPrompt.prompt({
          sessionID: session.id,
          model,
          parts: [
            {
              type: 'text',
              text: message,
            },
          ],
        })

        console.log('Got result from agent:', {
          hasResult: !!result,
          resultType: typeof result,
          hasInfo: result && 'info' in result,
          hasParts: result && 'parts' in result,
          partsCount: result && 'parts' in result ? result.parts.length : 0,
        })

        // Extract the text response from the result
        if (result && 'parts' in result) {
          console.log('Parts types:', result.parts.map(p => ({ type: p.type, synthetic: 'synthetic' in p ? p.synthetic : undefined })))
          const response = this.extractTextFromParts(result.parts)
          console.log('Extracted response length:', response.length, 'preview:', response.substring(0, 100))
          return { response, isNewSession: isNew }
        }

        console.log('No parts in result, returning default message')
        return { response: 'Message processed successfully.', isNewSession: isNew }
      } catch (error) {
        console.error('Error sending message to agent:', error)
        throw error
      }
    })
  }

  /**
   * Send a message with file attachments
   */
  async sendMessageWithFiles(sessionId: string, message: string, files: string[]): Promise<MessageResponse> {
    // Ensure initialization is complete before processing
    await this.ensureInitialized()

    const { session, isNew } = await this.getOrCreateSession(sessionId)
    const model = this.parseModel()

    return this.withInstance(async () => {
      try {
        // Build parts array with text and file references
        const parts: SessionPrompt.PromptInput['parts'] = [
          {
            type: 'text',
            text: message,
          },
        ]

        // Add file parts
        for (const filePath of files) {
          parts.push({
            type: 'file',
            url: `file://${filePath}`,
            filename: path.basename(filePath),
            mime: 'text/plain', // TODO: Detect mime type properly
          })
        }

        const result = await SessionPrompt.prompt({
          sessionID: session.id,
          model,
          parts,
        })

        if (result && 'parts' in result) {
          return { response: this.extractTextFromParts(result.parts), isNewSession: isNew }
        }

        return { response: 'Message with files processed successfully.', isNewSession: isNew }
      } catch (error) {
        console.error('Error sending message with files:', error)
        throw error
      }
    })
  }

  /**
   * Reset a session (delete and recreate)
   */
  async resetSession(sessionId: string): Promise<void> {
    const internalId = this.sessionMap.get(sessionId)
    if (internalId) {
      await this.withInstance(async () => {
        await Session.remove(internalId)
      })
      this.sessionMap.delete(sessionId)
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<{ active: boolean; messageCount: number }> {
    const internalId = this.sessionMap.get(sessionId)
    if (!internalId) {
      return { active: false, messageCount: 0 }
    }

    return this.withInstance(async () => {
      const session = await Session.get(internalId)
      if (!session) {
        return { active: false, messageCount: 0 }
      }

      const messages = await Session.messages({ sessionID: internalId })
      return {
        active: true,
        messageCount: messages.length,
      }
    })
  }
}

/**
 * Create an OpenWork client
 */
export function createOpenWorkClient(config: OpenWorkClientConfig): OpenWorkClient {
  return new RealOpenWorkClient(config)
}
