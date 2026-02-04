# OpenWork Deployment Guide

OpenWork Public is designed to run **locally on your computer**. For local installation instructions, please see the main [README.md](../README.md).

## Local Deployment (Recommended for Public Version)

OpenWork Public runs on your local machine, keeping your data private and secure.

### Quick Start

1. **Install Bun** (JavaScript runtime): https://bun.sh

2. **Clone and install:**
   ```bash
   git clone https://github.com/aissential-pro/openwork.git
   cd openwork
   bun install
   bun run build
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the gateway:**
   ```bash
   cd packages/gateway
   bun run src/index.ts
   ```

See [README.md](../README.md) for detailed instructions.

## What About 24/7 Operation?

The Public version is designed for local use. If you need:

- 24/7 availability (agent works even when your PC is off)
- Multiple team members using the same agent
- Cloud integrations (Google Drive, Gmail, Calendar)
- Scheduled autonomous tasks (cron/autotasks)
- Discord, WhatsApp, or Zalo gateways

Consider **OpenWork Pro** - the commercial version with VPS deployment, multi-tenant support, and advanced features.

## System Requirements

### Local Deployment

- **Operating System:** Windows, macOS, or Linux
- **Runtime:** Bun 1.x or higher
- **Memory:** 2GB RAM minimum, 4GB recommended
- **Storage:** 500MB for application
- **Internet:** Required for API calls to LLM providers

### API Keys Required

- **Anthropic API key** (or OpenAI, Google, etc.) - Get from https://console.anthropic.com
- **Telegram Bot Token** - Create via @BotFather on Telegram

## Security Considerations

### Local Deployment

When running locally:

1. **Protect your .env file:**
   ```bash
   chmod 600 .env  # Linux/Mac
   ```

2. **Never commit .env to git** - it's already in .gitignore

3. **Restrict Telegram access** - Set `ALLOWED_USER_IDS` to your Telegram ID only

4. **Keep dependencies updated:**
   ```bash
   bun update
   ```

## Troubleshooting

### Bot Not Responding

1. Check environment variables: `cat .env`
2. Verify API key is valid
3. Check logs for errors
4. Ensure Telegram bot token is correct
5. Verify your user ID is in `ALLOWED_USER_IDS`

### Out of Memory

- Close other applications to free up RAM
- Restart the gateway process

### API Rate Limits

- Monitor API usage in your provider's console
- Consider using lower-tier models for sub-agents
- OpenRouter provides access to multiple providers with automatic failover

## Getting Help

- **GitHub Issues:** https://github.com/aissential-pro/openwork/issues
- **Documentation:** Check other files in `/docs`
- **Community:** GitHub Discussions

## Professional Deployment

For production deployments with VPS, Docker, multi-tenant support, and business features, contact us about **OpenWork Pro**.

---

*OpenWork is a fork of [OpenCode](https://github.com/anomalyco/opencode) by Anomaly Co.*
