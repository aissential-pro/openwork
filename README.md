<p align="center">
  <h1 align="center">OpenWork</h1>
</p>
<p align="center">Your own AI assistant on Telegram, running locally on your computer.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/aissential-pro/openwork/actions"><img src="https://img.shields.io/github/actions/workflow/status/aissential-pro/openwork/ci.yml?branch=main" alt="Build Status"></a>
  <a href="https://github.com/aissential-pro/openwork"><img src="https://img.shields.io/badge/bun-1.3.5-orange" alt="Bun"></a>
  <a href="https://github.com/aissential-pro/openwork"><img src="https://img.shields.io/badge/typescript-5.8-blue" alt="TypeScript"></a>
</p>

---

## What is OpenWork?

OpenWork is a **free, open-source AI agent** that you chat with via Telegram. It runs on your machine, keeps your data private, and learns your preferences over time.

**Think of it as:** ChatGPT + memory + file access + web search, all running locally and accessible from your phone.

---

## Quick Start (5 minutes)

### 1. Create a Telegram Bot

1. Open Telegram, search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy your bot token

### 2. Install OpenWork

**Linux/Mac:**
```bash
git clone https://github.com/aissential-pro/openwork.git
cd openwork
./scripts/install.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/aissential-pro/openwork.git
cd openwork
.\scripts\install.ps1
```

### 3. Configure

Edit `.env` with your values:
```bash
# Required: API key for your chosen LLM provider
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Required: Telegram bot token from @BotFather
TELEGRAM_BOT_TOKEN=your-bot-token

# Required: Your Telegram user ID (get it from @userinfobot)
ALLOWED_USER_IDS=your-telegram-user-id

# Optional: Choose a specific model (defaults to claude-sonnet-4-20250514)
# OPENWORK_MODEL=claude-sonnet-4-20250514
```

### 4. Run

```bash
bun run start
```

### 5. Chat

Open Telegram and message your bot!

---

## Choosing an LLM Provider

OpenWork supports multiple LLM providers. Set the appropriate API key in your `.env` file:

| Provider | API Key Variable | Example Model |
|----------|------------------|---------------|
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o` |
| Google | `GOOGLE_API_KEY` | `gemini-2.0-flash-001` |
| OpenRouter | `OPENROUTER_API_KEY` | `openrouter/anthropic/claude-sonnet-4-20250514` |

To use a different model, set `OPENWORK_MODEL` in your `.env`:
```bash
OPENWORK_MODEL=gpt-4o
```

See [LLM Providers Guide](docs/LLM_PROVIDERS.md) for detailed setup instructions.

---

## What Can It Do?

| Task | Example |
|------|---------|
| **Research** | "Find the top 5 project management tools and compare them" |
| **Writing** | "Write a professional follow-up email for this client" |
| **Files** | "Organize these files by date" |
| **Coding** | "Create a Python script to rename all files in this folder" |
| **Learning** | "Remember that I prefer bullet points" (saved to agent.md) |

---

## Features

- **Telegram Interface** - Chat from your phone or desktop
- **Local Execution** - Your data stays on your machine
- **Autonomous Agent** - Multi-step reasoning, not just Q&A
- **Web Search** - Search and analyze web content
- **File Operations** - Read, write, edit files
- **Persistent Memory** - Agent remembers your preferences via `agent.md`

---

## Documentation

- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[LLM Providers](docs/LLM_PROVIDERS.md)** - Configure different AI providers
- **[Deployment](docs/deployment.md)** - Local deployment guide
- **[Examples](docs/examples/)** - Sample agent.md configurations
- **[Fork Notes](docs/FORK_NOTES.md)** - Relationship to OpenCode

---

## OpenWork Pro

Need more? **OpenWork Pro** adds:

- Discord & WhatsApp gateways
- Google Drive, Gmail, Calendar integrations
- Scheduled tasks (autotasks)
- 24/7 VPS deployment
- Multi-user support
- Approval workflows

[Contact us](mailto:contact@aissential.pro) for Pro access.

---

## About

OpenWork is a fork of [OpenCode](https://github.com/anomalyco/opencode) focused on messaging-based AI agents. See [Fork Notes](docs/FORK_NOTES.md) for details on what was changed.

**License:** MIT - See LICENSE file for details.
