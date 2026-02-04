/**
 * Core abstractions for the OpenWork messaging gateway
 */

/**
 * Interface for messaging platform implementations (Telegram, Slack, Discord, etc.)
 */
export interface MessagingPlatform {
  /**
   * Start the messaging platform integration
   */
  start(): Promise<void>

  /**
   * Stop the messaging platform integration
   */
  stop(): Promise<void>

  /**
   * Send a text message to a chat
   */
  sendMessage(chatId: string, text: string): Promise<void>
}

/**
 * Configuration for the gateway
 */
export interface GatewayConfig {
  /**
   * List of allowed user IDs that can interact with the gateway
   */
  allowedUserIds: string[]

  /**
   * API keys for various services
   */
  apiKeys: {
    telegram?: string
    slack?: string
    discord?: string
    anthropic?: string
    [key: string]: string | undefined
  }

  /**
   * Maximum number of concurrent sessions
   */
  maxSessions?: number

  /**
   * Session timeout in milliseconds
   */
  sessionTimeout?: number
}

/**
 * Represents an agent session
 */
export interface AgentSession {
  /**
   * Unique session ID
   */
  id: string

  /**
   * Chat ID this session is associated with
   */
  chatId: string

  /**
   * User ID who owns this session
   */
  userId: string

  /**
   * Timestamp when the session was created
   */
  createdAt: Date

  /**
   * Timestamp of the last activity
   */
  lastActivityAt: Date

  /**
   * Session state
   */
  state: 'active' | 'idle' | 'processing' | 'completed'
}

/**
 * Message in the processing queue
 */
export interface QueuedMessage {
  /**
   * Unique message ID
   */
  id: string

  /**
   * Chat ID where the message originated
   */
  chatId: string

  /**
   * User ID who sent the message
   */
  userId: string

  /**
   * Message text content
   */
  text: string

  /**
   * Timestamp when the message was queued
   */
  queuedAt: Date

  /**
   * Current status of the message
   */
  status: 'pending' | 'processing' | 'completed' | 'failed'

  /**
   * Session ID handling this message
   */
  sessionId?: string
}

/**
 * Manages agent sessions mapped to chat IDs
 */
export class SessionManager {
  private sessions: Map<string, AgentSession> = new Map()
  private chatToSession: Map<string, string> = new Map()
  private config: GatewayConfig

  constructor(config: GatewayConfig) {
    this.config = config
  }

  /**
   * Create a new session for a chat
   */
  createSession(chatId: string, userId: string): AgentSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const session: AgentSession = {
      id: sessionId,
      chatId,
      userId,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      state: 'active',
    }

    this.sessions.set(sessionId, session)
    this.chatToSession.set(chatId, sessionId)

    return session
  }

  /**
   * Get session by chat ID
   */
  getSessionByChatId(chatId: string): AgentSession | undefined {
    const sessionId = this.chatToSession.get(chatId)
    if (!sessionId) return undefined
    return this.sessions.get(sessionId)
  }

  /**
   * Get session by session ID
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivityAt = new Date()
    }
  }

  /**
   * Update session state
   */
  updateState(sessionId: string, state: AgentSession['state']): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.state = state
    }
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.chatToSession.delete(session.chatId)
      this.sessions.delete(sessionId)
    }
  }

  /**
   * Clean up idle sessions based on timeout
   */
  cleanupIdleSessions(): number {
    const timeout = this.config.sessionTimeout || 30 * 60 * 1000 // 30 minutes default
    const now = Date.now()
    let cleaned = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      const idleTime = now - session.lastActivityAt.getTime()
      if (idleTime > timeout && session.state !== 'processing') {
        this.removeSession(sessionId)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): AgentSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.state === 'active' || s.state === 'processing')
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size
  }
}

/**
 * Message queue for handling long-running tasks
 */
export class MessageQueue {
  private queue: QueuedMessage[] = []
  private processing: Map<string, QueuedMessage> = new Map()

  /**
   * Add a message to the queue
   */
  enqueue(chatId: string, userId: string, text: string): QueuedMessage {
    const message: QueuedMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      chatId,
      userId,
      text,
      queuedAt: new Date(),
      status: 'pending',
    }

    this.queue.push(message)
    return message
  }

  /**
   * Get the next pending message from the queue
   */
  dequeue(): QueuedMessage | undefined {
    const message = this.queue.find((m) => m.status === 'pending')
    if (message) {
      message.status = 'processing'
      this.processing.set(message.id, message)
    }
    return message
  }

  /**
   * Mark a message as completed
   */
  complete(messageId: string): void {
    const message = this.processing.get(messageId)
    if (message) {
      message.status = 'completed'
      this.processing.delete(messageId)
      this.removeFromQueue(messageId)
    }
  }

  /**
   * Mark a message as failed
   */
  fail(messageId: string): void {
    const message = this.processing.get(messageId)
    if (message) {
      message.status = 'failed'
      this.processing.delete(messageId)
      this.removeFromQueue(messageId)
    }
  }

  /**
   * Get a message by ID
   */
  getMessage(messageId: string): QueuedMessage | undefined {
    return this.queue.find((m) => m.id === messageId) || this.processing.get(messageId)
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.filter((m) => m.status === 'pending').length
  }

  /**
   * Get processing count
   */
  getProcessingCount(): number {
    return this.processing.size
  }

  /**
   * Remove a message from the queue
   */
  private removeFromQueue(messageId: string): void {
    const index = this.queue.findIndex((m) => m.id === messageId)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
  }

  /**
   * Get all pending messages
   */
  getPendingMessages(): QueuedMessage[] {
    return this.queue.filter((m) => m.status === 'pending')
  }

  /**
   * Get all processing messages
   */
  getProcessingMessages(): QueuedMessage[] {
    return Array.from(this.processing.values())
  }
}
