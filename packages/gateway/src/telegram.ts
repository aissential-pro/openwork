/**
 * Telegram bot implementation for OpenWork gateway
 */

import { Telegraf, Context } from 'telegraf'
import { Message } from 'telegraf/types'
import type { MessagingPlatform, GatewayConfig } from './core.js'
import type { OpenWorkClient } from './openwork-client.js'

export interface TelegramConfig {
  botToken: string
  allowedUserIds: string[]
  client: OpenWorkClient
}

/**
 * Telegram bot implementation of the MessagingPlatform interface
 */
export class TelegramBot implements MessagingPlatform {
  private bot: Telegraf
  private config: TelegramConfig
  private activeSessions: Map<string, string> = new Map() // chatId -> sessionId

  constructor(config: TelegramConfig) {
    this.config = config
    this.bot = new Telegraf(config.botToken)
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
      await ctx.reply('Welcome to OpenWork! Send me a message to get started.')
    })

    // Handle /reset command to reset the session
    this.bot.command('reset', async (ctx) => {
      const chatId = ctx.chat.id.toString()
      this.activeSessions.delete(chatId)
      await ctx.reply('Session reset. Starting fresh!')
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
      // Show typing indicator
      await ctx.sendChatAction('typing')

      // Get or create session
      let sessionId = this.activeSessions.get(chatId)
      if (!sessionId) {
        sessionId = `telegram_${chatId}_${Date.now()}`
        this.activeSessions.set(chatId, sessionId)
      }

      // Send message to OpenWork agent
      const response = await this.config.client.sendMessage(sessionId, text)

      // Send response back to user
      await ctx.reply(response)
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
    await this.bot.launch()
    console.log('Telegram bot started successfully')
  }

  /**
   * Stop the Telegram bot
   */
  async stop(): Promise<void> {
    console.log('Stopping Telegram bot...')
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
