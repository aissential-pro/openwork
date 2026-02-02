/**
 * OpenWork client for connecting the gateway to the OpenWork agent
 */

/**
 * Interface for the OpenWork client
 * This connects the messaging gateway to the underlying OpenWork agent system
 */
export interface OpenWorkClient {
  /**
   * Send a message to the agent and get a response
   * @param sessionId - Unique identifier for the conversation session
   * @param message - The message text to send to the agent
   * @returns The agent's response
   */
  sendMessage(sessionId: string, message: string): Promise<string>

  /**
   * Send a message with file attachments
   * @param sessionId - Unique identifier for the conversation session
   * @param message - The message text to send to the agent
   * @param files - Array of file paths to attach
   * @returns The agent's response
   */
  sendMessageWithFiles?(sessionId: string, message: string, files: string[]): Promise<string>

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
   * Anthropic API key for Claude
   */
  apiKey: string

  /**
   * Model to use (e.g., "claude-opus-4", "claude-sonnet-4")
   */
  model?: string

  /**
   * Base URL for the OpenWork API (if using a remote instance)
   */
  baseUrl?: string

  /**
   * Timeout for agent responses in milliseconds
   */
  timeout?: number
}

/**
 * Stub implementation of the OpenWork client
 * This will be replaced with the actual SDK integration
 */
export class StubOpenWorkClient implements OpenWorkClient {
  private config: OpenWorkClientConfig
  private sessions: Map<string, string[]> = new Map()

  constructor(config: OpenWorkClientConfig) {
    this.config = config
  }

  /**
   * Send a message to the agent
   * For now, this is a stub that returns a placeholder response
   */
  async sendMessage(sessionId: string, message: string): Promise<string> {
    // Store message in session history
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, [])
    }
    this.sessions.get(sessionId)!.push(`User: ${message}`)

    // TODO: Replace this with actual OpenWork SDK integration
    // The real implementation will:
    // 1. Connect to the OpenWork agent system
    // 2. Pass the message to the agent
    // 3. Stream the response back
    // 4. Handle tool calls and sub-agent spawning
    // 5. Return the final response

    // For now, return a stub response
    const response = `[Stub Response] I received your message: "${message}". This is a placeholder response. The actual OpenWork agent integration will be implemented in the next step.`

    this.sessions.get(sessionId)!.push(`Agent: ${response}`)

    return response
  }

  /**
   * Send a message with file attachments
   */
  async sendMessageWithFiles(sessionId: string, message: string, files: string[]): Promise<string> {
    // TODO: Implement file handling
    return this.sendMessage(sessionId, `${message} [Files: ${files.join(', ')}]`)
  }

  /**
   * Reset a session
   */
  async resetSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<{ active: boolean; messageCount: number }> {
    const messages = this.sessions.get(sessionId) || []
    return {
      active: messages.length > 0,
      messageCount: messages.length,
    }
  }
}

/**
 * Create an OpenWork client
 * This factory function will allow us to swap implementations later
 */
export function createOpenWorkClient(config: OpenWorkClientConfig): OpenWorkClient {
  // For now, return the stub implementation
  // Later, this will return the real SDK-based implementation
  return new StubOpenWorkClient(config)
}
