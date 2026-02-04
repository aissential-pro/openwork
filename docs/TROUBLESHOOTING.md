# OpenWork Troubleshooting Guide

Common issues and how to resolve them.

## Installation Issues

### "Bun is not installed"

**Problem:** Installation script fails with "command not found: bun"

**Solution:**

Install Bun first:

**Linux/Mac:**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
# Restart PowerShell after installation
```

Verify installation:
```bash
bun --version
```

### "Permission denied" when running install.sh

**Problem:** `./scripts/install.sh: Permission denied`

**Solution:**
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Dependencies fail to install

**Problem:** `bun install` fails with errors

**Solutions:**

1. **Clear Bun cache:**
   ```bash
   rm -rf ~/.bun/install/cache
   bun install
   ```

2. **Update Bun:**
   ```bash
   bun upgrade
   ```

3. **Check disk space:**
   ```bash
   df -h
   ```

## Configuration Issues

### Bot not responding to messages

**Problem:** Send message to bot, nothing happens

**Checklist:**

1. **Verify bot is running:**
   - Look for "OpenWork Gateway started successfully" in terminal
   - No error messages in console

2. **Check .env configuration:**
   ```bash
   cat .env
   ```

   Verify all required fields:
   - `ANTHROPIC_API_KEY` is set
   - `TELEGRAM_BOT_TOKEN` is set
   - `ALLOWED_USER_IDS` includes your user ID

3. **Verify your Telegram user ID:**
   - Send `/start` to `@userinfobot` on Telegram
   - Compare with `ALLOWED_USER_IDS` in .env

4. **Check Telegram bot token:**
   - Token format: `123456789:ABCdef-GHIjklMNOpqrsTUVwxyz`
   - Test with: Send message to your bot
   - If unauthorized, recreate bot with `@BotFather`

5. **Restart the gateway:**
   ```bash
   # Press Ctrl+C to stop
   bun run start
   ```

### "ANTHROPIC_API_KEY is not set"

**Problem:** Gateway fails to start with API key error

**Solution:**

1. **Create .env if missing:**
   ```bash
   cp .env.example .env
   ```

2. **Get Anthropic API key:**
   - Visit https://console.anthropic.com
   - Create account / sign in
   - Navigate to API Keys
   - Create new key

3. **Add to .env:**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ```

4. **Restart gateway:**
   ```bash
   bun run start
   ```

### "ALLOWED_USER_IDS is empty"

**Problem:** Warning about no allowed users

**Solution:**

1. **Find your Telegram user ID:**
   - Open Telegram
   - Search for `@userinfobot`
   - Send `/start`
   - Bot will reply with your user ID (e.g., `123456789`)

2. **Add to .env:**
   ```bash
   ALLOWED_USER_IDS=123456789
   ```

3. **For multiple users:**
   ```bash
   ALLOWED_USER_IDS=123456789,987654321,555444333
   ```

## Runtime Issues

### "Sorry, you are not authorized to use this bot"

**Problem:** Bot responds but denies access

**Solution:**

Your Telegram user ID is not in `ALLOWED_USER_IDS`.

1. **Get your user ID** (see above)
2. **Add to .env:**
   ```bash
   ALLOWED_USER_IDS=your-actual-user-id
   ```
3. **Restart gateway**

### Bot responds slowly or times out

**Possible causes:**

1. **Large requests:**
   - Long prompts or file operations take time
   - This is normal for complex tasks

2. **API rate limits:**
   - Check Anthropic console for rate limits
   - Upgrade API tier if needed

3. **Network issues:**
   - Check internet connection
   - Test API access: `curl https://api.anthropic.com`

4. **Resource constraints:**
   - Check RAM usage: `top` or Task Manager
   - Close other applications
   - Consider using lighter model (Haiku instead of Opus)

### "Error processing message"

**Problem:** Bot returns generic error

**Debugging steps:**

1. **Check terminal logs:**
   - Look for error stack traces
   - Note the specific error message

2. **Common errors:**

   **"API key invalid":**
   - Regenerate key at console.anthropic.com
   - Update .env with new key

   **"Insufficient credits":**
   - Add credits to Anthropic account
   - Check billing at console.anthropic.com

   **"Rate limit exceeded":**
   - Wait a few minutes
   - Reduce request frequency
   - Upgrade API tier

3. **Restart with debug logging:**
   ```bash
   LOG_LEVEL=debug bun run start
   ```

### Agent forgets context / doesn't remember preferences

**Problem:** Agent doesn't retain information from agent.md

**Solutions:**

1. **Verify agent.md exists:**
   ```bash
   ls -la agent.md
   ```

2. **Check agent.md location:**
   - Should be in root directory OR
   - In `OPENWORK_WORKING_DIR` if set

3. **Verify agent.md format:**
   - Should be valid Markdown
   - Check for syntax errors

4. **Test with simple agent.md:**
   ```markdown
   # My Agent

   ## Rules
   - Always respond in ALL CAPS
   ```

   If this works, your original agent.md has an issue.

## File Operation Issues

### "Permission denied" when reading/writing files

**Problem:** Agent can't access files

**Solutions:**

1. **Check working directory:**
   ```bash
   echo $OPENWORK_WORKING_DIR  # should be set
   ```

2. **Verify permissions:**
   ```bash
   ls -la ~/business/
   ```

3. **Create directory if missing:**
   ```bash
   mkdir -p ~/business
   chmod 755 ~/business
   ```

4. **Windows users:**
   - Ensure path uses forward slashes
   - Example: `C:/Users/YourName/business` not `C:\Users\YourName\business`

### Files not found in working directory

**Problem:** Agent says "file not found"

**Check:**

1. **Current working directory:**
   - Default: `~/business/`
   - Override with `OPENWORK_WORKING_DIR` in .env

2. **File paths:**
   - Use relative paths: `plans/marketing.md`
   - Or absolute paths: `/home/user/business/plans/marketing.md`

3. **Case sensitivity (Linux/Mac):**
   - `File.txt` ≠ `file.txt`

## Performance Issues

### High CPU usage

**Causes:**

1. **Agent is processing a complex task** (normal)
2. **Multiple concurrent sessions**
3. **Memory leak** (rare)

**Solutions:**

1. **Wait for task to complete**
2. **Restart gateway:**
   ```bash
   # Ctrl+C then
   bun run start
   ```
3. **Monitor resource usage:**
   ```bash
   top  # Linux/Mac
   # Task Manager on Windows
   ```

### Out of memory errors

**Solutions:**

1. **Close other applications**
2. **Increase system RAM** (if possible)
3. **Use lighter model:**
   ```bash
   # .env
   OPENWORK_MODEL=claude-haiku-4-20250514
   ```

## Telegram-Specific Issues

### Bot doesn't receive messages

**Check:**

1. **Bot is started:**
   - Send `/start` to your bot first
   - Then send a regular message

2. **Bot privacy mode:**
   - By default, bots receive all messages
   - Check with @BotFather: `/mybots` → Select bot → Bot Settings → Group Privacy

3. **Network/firewall:**
   - Telegram servers must be accessible
   - Check firewall settings

### Bot sends partial responses

**Problem:** Response cuts off mid-sentence

**Cause:** Telegram message length limit (4096 characters)

**Current behavior:** Gateway should split long responses automatically

**Workaround:**
- Ask agent for shorter responses
- Request summaries instead of full content

## Getting More Help

### Enable debug logging

```bash
# Linux/Mac
LOG_LEVEL=debug bun run start

# Windows
$env:LOG_LEVEL="debug"; bun run start
```

### Check logs

Logs appear in terminal where you ran `bun run start`

### Report an issue

If you've tried the above and still have problems:

1. **Gather information:**
   - Operating system and version
   - Bun version (`bun --version`)
   - Error messages (full text)
   - Steps to reproduce

2. **Search existing issues:**
   https://github.com/aissential-pro/openwork/issues

3. **Create new issue:**
   - Include all gathered information
   - Redact any API keys or secrets
   - Describe expected vs actual behavior

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `TELEGRAM_BOT_TOKEN is required` | Missing bot token | Add token to .env |
| `ANTHROPIC_API_KEY is required` | Missing API key | Add key to .env |
| `Sorry, you are not authorized` | User ID not allowed | Add your user ID to ALLOWED_USER_IDS |
| `API key invalid` | Wrong or expired key | Get new key from console.anthropic.com |
| `Rate limit exceeded` | Too many requests | Wait and retry, or upgrade tier |
| `Insufficient credits` | Account has no credits | Add credits at console.anthropic.com |
| `ECONNREFUSED` | Cannot connect to API | Check internet, firewall |
| `Cannot find module` | Missing dependencies | Run `bun install` |

## Still Stuck?

Ask for help:
- GitHub Issues: https://github.com/aissential-pro/openwork/issues
- Include: OS, Bun version, error messages, steps to reproduce
- Redact all secrets before posting

---

*Last updated: 2026-02-04*
