/**
 * Telegram bot implementation for OpenWork gateway
 */

import { Telegraf, Context } from 'telegraf'
import type { Message } from 'telegraf/types'
import type { MessagingPlatform, GatewayConfig } from './core.js'
import type { OpenWorkClient } from './openwork-client.js'
import { SessionStore } from './session-store.js'
import { join } from 'path'

export interface TelegramConfig {
  botToken: string
  allowedUserIds: string[]
  client: OpenWorkClient
  sessionStorePath?: string // Optional custom path for session storage
}

/**
 * Telegram bot implementation of the MessagingPlatform interface
 */
export class TelegramBot implements MessagingPlatform {
  private bot: Telegraf
  private config: TelegramConfig
  private activeSessions: Map<string, string> = new Map() // chatId -> sessionId (legacy in-memory)
  private sessionStore: SessionStore

  constructor(config: TelegramConfig) {
    this.config = config
    this.bot = new Telegraf(config.botToken)

    // Initialize session store with default or custom path
    const defaultPath = join(process.cwd(), 'data', 'business', '.sessions', 'telegram-sessions.json')
    const storePath = config.sessionStorePath || defaultPath
    this.sessionStore = new SessionStore(storePath)

    this.setupHandlers()
  }

  /**
   * Set up message handlers
   */
  private setupHandlers(): void {
    // Handle text messages
    this.bot.on('text', async (ctx) => {
      await this.handleTextMessage(ctx)
    })

    // Handle document/file uploads (placeholder for future implementation)
    this.bot.on('document', async (ctx) => {
      await this.handleDocument(ctx)
    })

    // Handle photo uploads (placeholder for future implementation)
    this.bot.on('photo', async (ctx) => {
      await this.handlePhoto(ctx)
    })

    // Handle /start command
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from.id.toString()

      if (!this.isUserAllowed(userId)) {
        await ctx.reply('Sorry, you are not authorized to use this bot.')
        return
      }

      const welcomeMessage = `👋 Welcome to OpenWork!

I'm your personal AI assistant. I can help you with:

• 🔍 Research & web search
• ✍️ Writing & editing documents
• 📁 File management & organization
• 💻 Code and automation tasks
• 📊 Data analysis

Just send me a message to get started!

Commands:
/help - See examples and tips
/reset - Start a fresh conversation

Try asking me:
"Search the web for the latest AI news"
"Create a file called notes.txt with today's date"
"Help me write a professional email"

Let's get to work! 🚀`

      await ctx.reply(welcomeMessage)
    })

    // Handle /help command
    this.bot.command('help', async (ctx) => {
      const userId = ctx.from.id.toString()

      if (!this.isUserAllowed(userId)) {
        await ctx.reply('Sorry, you are not authorized to use this bot.')
        return
      }

      const helpMessage = `📚 OpenWork Help

🔧 Commands:
/start - Show welcome message
/help - Show this help message
/reset - Clear conversation history

💡 Example Prompts:

📝 Writing:
• "Write a professional email to follow up with a client"
• "Proofread this text: [your text]"
• "Create a business proposal outline"

🔍 Research:
• "Search for the top 5 project management tools"
• "Summarize this article: [URL]"
• "Find information about [topic]"

📁 Files:
• "Create a file called notes.txt"
• "Read the file plan.md and summarize it"
• "List all files in ~/business/"

💻 Code:
• "Write a Python script to rename files"
• "Explain this code: [code snippet]"

📊 Analysis:
• "Analyze the pros and cons of [topic]"
• "Compare [option A] vs [option B]"

💬 Tips:
• Be specific in your requests
• Provide context when needed
• You can have multi-turn conversations
• I remember context within a session
• Use /reset to start fresh

Need more help? Just ask! 😊`

      await ctx.reply(helpMessage)
    })

    // Handle /reset command to reset the session
    this.bot.command('reset', async (ctx) => {
      const chatId = ctx.chat.id.toString()
      const userId = ctx.from.id.toString()

      // Check if user is allowed
      if (!this.isUserAllowed(userId)) {
        await ctx.reply('Sorry, you are not authorized to use this bot.')
        return
      }

      try {
        // Get the current session ID from persistent store
        const sessionId = this.sessionStore.get(chatId)

        if (sessionId && this.config.client.resetSession) {
          // Reset the session in the OpenWork client
          await this.config.client.resetSession(sessionId)
          console.log('Reset session:', sessionId)
        }

        // Clear the session mapping from both stores
        this.activeSessions.delete(chatId)
        this.sessionStore.delete(chatId)

        // Send confirmation message
        await ctx.reply('🔄 Conversation reset! Starting a fresh session.\n\nAll previous context has been cleared. What would you like to work on?')
      } catch (error) {
        console.error('Error resetting session:', error)
        await ctx.reply('Sorry, an error occurred while resetting the session.')
      }
    })

    // Error handling
    this.bot.catch((err, ctx) => {
      console.error('Telegram bot error:', err)
      ctx.reply('Sorry, an error occurred while processing your message.')
    })
  }

  /**
   * Handle incoming text messages
   */
  private async handleTextMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      return
    }

    const chatId = ctx.chat.id.toString()
    const userId = ctx.from.id.toString()
    const text = ctx.message.text

    // Check if user is allowed
    if (!this.isUserAllowed(userId)) {
      await ctx.reply('Sorry, you are not authorized to use this bot.')
      return
    }

    // Skip commands that were already handled
    if (text.startsWith('/')) {
      return
    }

    try {
      console.log('Received message from user:', { chatId, userId, text: text.substring(0, 50) })

      // Show typing indicator
      await ctx.sendChatAction('typing')

      // Get or create session (check persistent store first)
      let sessionId = this.sessionStore.get(chatId)
      if (!sessionId) {
        // Create new session
        sessionId = `telegram_${chatId}_${Date.now()}`
        this.sessionStore.set(chatId, sessionId)
        this.activeSessions.set(chatId, sessionId) // Also update in-memory for backwards compatibility
        console.log('Created new session:', sessionId)
      } else {
        // Update last active timestamp
        this.sessionStore.touch(chatId)
        this.activeSessions.set(chatId, sessionId) // Sync to in-memory
        console.log('Using existing session:', sessionId)
      }

      // Send message to OpenWork agent
      console.log('Sending message to OpenWork agent...')
      const result = await this.config.client.sendMessage(sessionId, text)
      console.log('Got response from agent, length:', result.response.length, 'preview:', result.response.substring(0, 100))

      // If this is a new session, send a notification message first
      if (result.isNewSession) {
        await ctx.reply('🆕 New conversation started! (Type /reset to clear and start fresh)')
      }

      // Send response back to user
      console.log('Sending response to Telegram...')
      await ctx.reply(result.response)
      console.log('Response sent successfully!')
    } catch (error) {
      console.error('Error processing message:', error)
      await ctx.reply('Sorry, I encountered an error processing your request.')
    }
  }

  /**
   * Handle document uploads (placeholder)
   */
  private async handleDocument(ctx: Context): Promise<void> {
    // TODO: Implement file download and processing
    // This will be expanded in a future step to:
    // 1. Download the file from Telegram servers
    // 2. Save it to a temporary location
    // 3. Pass the file path to the OpenWork agent
    // 4. Process the agent's response
    await ctx.reply('File handling is not yet implemented. Coming soon!')
  }

  /**
   * Handle photo uploads (placeholder)
   */
  private async handlePhoto(ctx: Context): Promise<void> {
    // TODO: Implement photo download and processing
    // This will be expanded in a future step to:
    // 1. Download the photo from Telegram servers
    // 2. Save it to a temporary location
    // 3. Pass the file path to the OpenWork agent
    // 4. Process the agent's response
    await ctx.reply('Photo handling is not yet implemented. Coming soon!')
  }

  /**
   * Check if a user is allowed to use the bot
   */
  private isUserAllowed(userId: string): boolean {
    return this.config.allowedUserIds.includes(userId)
  }

  /**
   * Start the Telegram bot
   */
  async start(): Promise<void> {
    console.log('Starting Telegram bot...')

    // Load persisted sessions before launching the bot
    await this.sessionStore.load()
    console.log(`Loaded ${this.sessionStore.size()} persisted session(s)`)

    // Sync loaded sessions to in-memory map for backwards compatibility
    for (const mapping of this.sessionStore.getAll()) {
      this.activeSessions.set(mapping.externalId, mapping.sessionId)
    }

    await this.bot.launch()
    console.log('Telegram bot started successfully')

    // Send connection notification to allowed users
    const connectionMessage = `✅ OpenWork is online and ready!

I'm here to help you with tasks, research, writing, and more.

Type /help to see what I can do, or just send me a message to get started!`

    // Send to each allowed user (but don't fail if user hasn't started bot yet)
    for (const userId of this.config.allowedUserIds) {
      try {
        await this.bot.telegram.sendMessage(userId, connectionMessage)
        console.log(`Sent connection notification to user: ${userId}`)
      } catch (error) {
        // User probably hasn't started the bot yet, that's OK
        console.log(`Could not send notification to user ${userId} (they may not have started the bot yet)`)
      }
    }
  }

  /**
   * Stop the Telegram bot
   */
  async stop(): Promise<void> {
    console.log('Stopping Telegram bot...')

    // Force save sessions before stopping
    await this.sessionStore.forceSave()
    console.log('Session mappings saved')

    this.bot.stop()
    console.log('Telegram bot stopped')
  }

  /**
   * Send a message to a specific chat
   */
  async sendMessage(chatId: string, text: string): Promise<void> {
    await this.bot.telegram.sendMessage(chatId, text)
  }

  /**
   * Enable graceful shutdown
   */
  enableGracefulShutdown(): void {
    // Enable graceful stop on SIGINT and SIGTERM
    process.once('SIGINT', () => this.stop())
    process.once('SIGTERM', () => this.stop())
  }
}
