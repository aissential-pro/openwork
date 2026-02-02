# OpenWork Deployment Guide

This guide covers deploying OpenWork to a VPS for production use.

## System Requirements

### Software
- **Node.js**: 22.x or higher
- **Bun**: 1.x or higher (recommended runtime)
- **Git**: For cloning and updates
- **PM2**: For process management (optional but recommended)

### Hardware
- **CPU**: 2+ cores recommended
- **RAM**: Minimum 2GB, 4GB+ recommended
- **Storage**: 10GB+ for application and logs
- **Network**: Stable internet connection for API calls

### Operating System
- Ubuntu 22.04 LTS or higher
- Debian 11 or higher
- Any Linux distribution with Node 22+ support

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required
```bash
# Anthropic API Key (required for Claude models)
ANTHROPIC_API_KEY=sk-ant-...

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
ALLOWED_USER_IDS=123456789,987654321

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

### Optional
```bash
# OpenAI API Key (if using OpenAI models)
OPENAI_API_KEY=sk-...

# Google API Key (if using Google models)
GOOGLE_API_KEY=...

# Other API Keys
PERPLEXITY_API_KEY=...
GROQ_API_KEY=...

# Session Storage
SESSION_STORAGE_PATH=/home/user/openwork/sessions

# Business Files Location
BUSINESS_FILES_PATH=/home/user/business

# Log Level
LOG_LEVEL=info

# Backup Configuration
BACKUP_PATH=/home/user/backups
```

See `.env.example` for a complete template.

## Pre-Deployment Checklist

- [ ] Server has Node.js 22+ installed
- [ ] Bun runtime is installed
- [ ] All required environment variables are set
- [ ] API keys are valid and have sufficient credits
- [ ] Firewall allows inbound traffic on your chosen port (if exposing HTTP API)
- [ ] Telegram bot is created and token is obtained

## Deployment Steps

### 1. Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

Add Bun to your PATH (usually added automatically to `~/.bashrc` or `~/.zshrc`):

```bash
export PATH="$HOME/.bun/bin:$PATH"
source ~/.bashrc  # or ~/.zshrc
```

Verify installation:

```bash
bun --version
```

### 2. Clone the Repository

```bash
cd /home/user
git clone https://github.com/aissential-pro/openwork.git
cd openwork
```

### 3. Run Setup Script

The setup script will install dependencies and prepare the environment:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- Check for Bun installation
- Install all dependencies
- Create necessary directories
- Copy `.env.example` to `.env` if it doesn't exist

### 4. Configure Environment Variables

Edit the `.env` file with your actual values:

```bash
nano .env
```

**Important**: Set at least these required variables:
- `ANTHROPIC_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `ALLOWED_USER_IDS`

### 5. Create Business Directory Structure

```bash
mkdir -p ~/business/{plans,clients,marketing,finance,templates,reports}
```

### 6. Create agent.md Configuration

Create your agent memory file:

```bash
nano ~/business/agent.md
```

See the main README for an example `agent.md` structure.

### 7. Test the Application

Run the application in development mode to verify everything works:

```bash
bun run dev
```

If using the gateway:

```bash
cd packages/gateway
bun src/index.ts
```

### 8. Install PM2 (Optional but Recommended)

PM2 provides process management, auto-restart, and log management:

```bash
# Install PM2 globally
npm install -g pm2

# Or with Bun
bun add -g pm2
```

### 9. Start with PM2

Use the included PM2 ecosystem file:

```bash
pm2 start ecosystem.config.cjs
```

### 10. Configure PM2 to Start on Boot

```bash
pm2 startup
# Follow the instructions printed by the command

pm2 save
```

### 11. Verify Deployment

Check PM2 status:

```bash
pm2 status
pm2 logs openwork-gateway
```

Test the Telegram bot by sending it a message.

## Process Management

### Using PM2

```bash
# Start all processes
pm2 start ecosystem.config.cjs

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all

# View logs
pm2 logs

# View specific process logs
pm2 logs openwork-gateway

# Monitor processes
pm2 monit

# View detailed process info
pm2 show openwork-gateway
```

### Using systemd (Alternative to PM2)

If you prefer systemd, create a service file at `/etc/systemd/system/openwork.service`:

```ini
[Unit]
Description=OpenWork Gateway
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/user/openwork/packages/gateway
Environment=NODE_ENV=production
ExecStart=/home/user/.bun/bin/bun src/index.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable openwork
sudo systemctl start openwork
sudo systemctl status openwork
```

## Updating OpenWork

### Pull Latest Changes

```bash
cd /home/user/openwork
git pull origin main
```

### Install New Dependencies

```bash
bun install
```

### Restart Services

```bash
pm2 restart all
# or
sudo systemctl restart openwork
```

## Backup and Recovery

### Manual Backup

```bash
cd /home/user/openwork
./scripts/backup.sh
```

This creates a timestamped backup in `/home/user/backups/`.

### Automated Backups with Cron

Add to crontab (`crontab -e`):

```bash
# Backup every day at 2 AM
0 2 * * * /home/user/openwork/scripts/backup.sh

# Backup every 6 hours
0 */6 * * * /home/user/openwork/scripts/backup.sh
```

### Restore from Backup

```bash
cd /home/user
tar -xzf backups/openwork-backup-YYYYMMDD-HHMMSS.tar.gz
```

## Security Considerations

### 1. Protect Your .env File

```bash
chmod 600 .env
```

Never commit `.env` to version control.

### 2. Restrict User Access

Only allow specific Telegram user IDs in `ALLOWED_USER_IDS`.

### 3. Use HTTPS

If exposing the HTTP API, use a reverse proxy (nginx/Apache) with SSL/TLS.

### 4. Firewall Configuration

Use UFW or iptables to restrict access:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow your application port (if needed)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 5. Keep Dependencies Updated

Regularly update dependencies:

```bash
bun update
```

## Monitoring

### View Logs

```bash
# PM2 logs
pm2 logs openwork-gateway

# System logs (if using systemd)
sudo journalctl -u openwork -f
```

### Monitor Resource Usage

```bash
# PM2 monitoring
pm2 monit

# System monitoring
htop
# or
top
```

### Set Up Alerts

Configure PM2 Plus or other monitoring services for production alerts.

## Troubleshooting

### Gateway Won't Start

1. Check environment variables: `cat .env`
2. Verify API keys are valid
3. Check logs: `pm2 logs openwork-gateway`
4. Ensure Telegram bot token is correct

### Out of Memory Errors

- Increase VPS RAM
- Set PM2 max memory restart: `pm2 restart openwork-gateway --max-memory-restart 1G`

### API Rate Limits

- Monitor API usage in Anthropic console
- Implement rate limiting in your code
- Consider using lower-tier models for sub-agents

### Session Storage Issues

- Check `SESSION_STORAGE_PATH` permissions
- Ensure enough disk space: `df -h`

## Performance Optimization

### 1. Use Bun Instead of Node

Bun is faster and more memory-efficient than Node.js. Always prefer:

```bash
bun src/index.ts
```

Over:

```bash
node src/index.ts
```

### 2. Limit Concurrent Sessions

Configure maximum concurrent sessions to prevent memory issues.

### 3. Clean Up Old Sessions

Periodically archive or delete old session data.

### 4. Use Sonnet for Sub-Agents

Configure sub-agents to use Claude Sonnet instead of Opus to reduce costs.

## Support

For issues and questions:
- GitHub Issues: https://github.com/aissential-pro/openwork/issues
- Documentation: See project README.md

## Next Steps

After deployment:
1. Send a test message to your Telegram bot
2. Verify the agent responds correctly
3. Set up automated backups
4. Configure monitoring
5. Test agent.md rules are being followed
6. Deploy any MCP integrations (Google Drive, etc.)
