/**
 * @openwork/gateway - Messaging gateway for OpenWork
 *
 * This package provides abstractions and implementations for connecting
 * OpenWork agents to messaging platforms like Telegram, Slack, and Discord.
 */

export * from './core.js'
export * from './telegram.js'
export * from './openwork-client.js'
export * from './session-store.js'

/**
 * Gateway configuration loaded from environment variables
 */
export interface GatewayEnvironmentConfig {
  TELEGRAM_BOT_TOKEN?: string
  ALLOWED_USER_IDS?: string
  ANTHROPIC_API_KEY?: string
  OPENROUTER_API_KEY?: string
  OPENWORK_MODEL?: string
  OPENWORK_WORKING_DIR?: string
  SESSION_TIMEOUT?: string
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): {
  telegram?: { botToken: string; allowedUserIds: string[] }
  llm?: { provider: 'anthropic' | 'openrouter'; model?: string }
  workingDirectory?: string
  sessionTimeout?: number
} {
  const env = process.env as GatewayEnvironmentConfig

  const telegram = env.TELEGRAM_BOT_TOKEN
    ? {
        botToken: env.TELEGRAM_BOT_TOKEN,
        allowedUserIds: env.ALLOWED_USER_IDS ? env.ALLOWED_USER_IDS.split(',').map((id) => id.trim()) : [],
      }
    : undefined

  // Support both Anthropic and OpenRouter API keys
  // OpenRouter takes precedence if both are set (for flexibility)
  const llm = env.OPENROUTER_API_KEY
    ? {
        provider: 'openrouter' as const,
        model: env.OPENWORK_MODEL || 'openrouter/anthropic/claude-sonnet-4-20250514',
      }
    : env.ANTHROPIC_API_KEY
      ? {
          provider: 'anthropic' as const,
          model: env.OPENWORK_MODEL || 'claude-sonnet-4-20250514',
        }
      : undefined

  const workingDirectory = env.OPENWORK_WORKING_DIR
  const sessionTimeout = env.SESSION_TIMEOUT ? parseInt(env.SESSION_TIMEOUT, 10) : undefined

  return {
    telegram,
    llm,
    workingDirectory,
    sessionTimeout,
  }
}

/**
 * Validate required environment variables and provide helpful error messages
 */
function validateConfig(config: ReturnType<typeof loadConfigFromEnv>): void {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for Telegram bot token
  if (!config.telegram) {
    errors.push('TELEGRAM_BOT_TOKEN is not set')
    errors.push('  → Create a bot: Send /newbot to @BotFather on Telegram')
    errors.push('  → Add to .env: TELEGRAM_BOT_TOKEN=your-bot-token-here')
  }

  // Check for LLM API key
  if (!config.llm) {
    errors.push('No LLM API key found')
    errors.push('  → Add ONE of these to .env:')
    errors.push('     ANTHROPIC_API_KEY=sk-ant-your-key-here (recommended)')
    errors.push('     OPENROUTER_API_KEY=sk-or-v1-your-key-here')
    errors.push('     OPENAI_API_KEY=sk-your-key-here')
    errors.push('  → Get Anthropic key: https://console.anthropic.com')
  }

  // Check for allowed user IDs
  if (config.telegram && config.telegram.allowedUserIds.length === 0) {
    warnings.push('ALLOWED_USER_IDS is empty - no users can access the bot')
    warnings.push('  → Find your user ID: Send /start to @userinfobot on Telegram')
    warnings.push('  → Add to .env: ALLOWED_USER_IDS=your-user-id')
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:')
    warnings.forEach((warning) => console.warn(`   ${warning}`))
    console.warn('')
  }

  // Display errors and exit
  if (errors.length > 0) {
    console.error('\n❌ Configuration Error:\n')
    errors.forEach((error) => console.error(`   ${error}`))
    console.error('\n📝 Edit your .env file with the required values.\n')
    console.error('   If .env does not exist, run:')
    console.error('   cp .env.example .env\n')
    process.exit(1)
  }
}

/**
 * Display startup banner
 */
function displayBanner(config: ReturnType<typeof loadConfigFromEnv>): void {
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║       OpenWork Gateway Starting        ║')
  console.log('╚════════════════════════════════════════╝\n')
  console.log(`🤖 Provider: ${config.llm?.provider || 'unknown'}`)
  console.log(`🧠 Model: ${config.llm?.model || 'unknown'}`)
  console.log(`💬 Platform: Telegram`)
  console.log(`👥 Allowed users: ${config.telegram?.allowedUserIds.join(', ') || '(none)'}`)
  console.log(`📁 Working directory: ${config.workingDirectory || '~/business'}`)
  console.log('')
}

/**
 * Start the OpenWork gateway
 * This initializes and starts all configured messaging platforms
 */
export async function startGateway(): Promise<void> {
  // Load configuration from environment
  const config = loadConfigFromEnv()

  // Validate configuration
  validateConfig(config)

  // Display startup banner
  displayBanner(config)

  // Create OpenWork client and wait for initialization
  const { createOpenWorkClient } = await import('./openwork-client.js')
  const client = createOpenWorkClient({
    model: config.llm.model,
    workingDirectory: config.workingDirectory,
  })

  // Wait for the agent to be fully initialized before accepting messages
  console.log('Waiting for OpenWork agent initialization...')
  await (client as any).initializing
  console.log('Agent ready!')

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

  console.log('✅ OpenWork Gateway started successfully!\n')
  console.log('📱 Send a message to your Telegram bot to test.')
  console.log('💡 Try: "Hello, who are you?"\n')
}

// Run the gateway when this script is executed directly
startGateway().catch((error) => {
  console.error('Failed to start gateway:', error)
  process.exit(1)
})
