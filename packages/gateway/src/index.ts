/**
 * @openwork/gateway - Messaging gateway for OpenWork
 *
 * This package provides abstractions and implementations for connecting
 * OpenWork agents to messaging platforms like Telegram, Slack, and Discord.
 */

export * from './core.js'
export * from './telegram.js'
export * from './openwork-client.js'

/**
 * Gateway configuration loaded from environment variables
 */
export interface GatewayEnvironmentConfig {
  TELEGRAM_BOT_TOKEN?: string
  ALLOWED_USER_IDS?: string
  ANTHROPIC_API_KEY?: string
  OPENWORK_MODEL?: string
  OPENWORK_BASE_URL?: string
  SESSION_TIMEOUT?: string
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): {
  telegram?: { botToken: string; allowedUserIds: string[] }
  anthropic?: { apiKey: string; model?: string }
  baseUrl?: string
  sessionTimeout?: number
} {
  const env = process.env as GatewayEnvironmentConfig

  const telegram = env.TELEGRAM_BOT_TOKEN
    ? {
        botToken: env.TELEGRAM_BOT_TOKEN,
        allowedUserIds: env.ALLOWED_USER_IDS ? env.ALLOWED_USER_IDS.split(',').map((id) => id.trim()) : [],
      }
    : undefined

  const anthropic = env.ANTHROPIC_API_KEY
    ? {
        apiKey: env.ANTHROPIC_API_KEY,
        model: env.OPENWORK_MODEL,
      }
    : undefined

  const baseUrl = env.OPENWORK_BASE_URL
  const sessionTimeout = env.SESSION_TIMEOUT ? parseInt(env.SESSION_TIMEOUT, 10) : undefined

  return {
    telegram,
    anthropic,
    baseUrl,
    sessionTimeout,
  }
}

/**
 * Start the OpenWork gateway
 * This initializes and starts all configured messaging platforms
 */
export async function startGateway(): Promise<void> {
  console.log('Starting OpenWork Gateway...')

  // Load configuration from environment
  const config = loadConfigFromEnv()

  // Validate configuration
  if (!config.telegram) {
    throw new Error('TELEGRAM_BOT_TOKEN is required')
  }

  if (!config.anthropic) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  if (config.telegram.allowedUserIds.length === 0) {
    console.warn('Warning: ALLOWED_USER_IDS is empty. No users will be able to access the bot.')
  }

  // Create OpenWork client
  const { createOpenWorkClient } = await import('./openwork-client.js')
  const client = createOpenWorkClient({
    apiKey: config.anthropic.apiKey,
    model: config.anthropic.model,
    baseUrl: config.baseUrl,
  })

  // Initialize Telegram bot
  const { TelegramBot } = await import('./telegram.js')
  const telegramBot = new TelegramBot({
    botToken: config.telegram.botToken,
    allowedUserIds: config.telegram.allowedUserIds,
    client,
  })

  // Enable graceful shutdown
  telegramBot.enableGracefulShutdown()

  // Start the bot
  await telegramBot.start()

  console.log('OpenWork Gateway started successfully')
  console.log(`Allowed user IDs: ${config.telegram.allowedUserIds.join(', ')}`)
  console.log(`Model: ${config.anthropic.model || 'default'}`)
}
