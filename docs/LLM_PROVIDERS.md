# LLM Provider Configuration

OpenWork supports multiple LLM providers. This guide shows how to configure each one.

---

## Quick Start

**Step 1:** Choose a provider and get an API key

**Step 2:** Add to your `.env` file:
```bash
# Set your API key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optionally specify a model (or use the default)
OPENWORK_MODEL=claude-sonnet-4-20250514
```

**Step 3:** Restart OpenWork:
```bash
bun run start
```

---

## How It Works

1. **API Key** determines the provider - set ONE of these:
   - `ANTHROPIC_API_KEY` → Anthropic
   - `OPENAI_API_KEY` → OpenAI
   - `GOOGLE_API_KEY` → Google Gemini
   - `OPENROUTER_API_KEY` → OpenRouter

2. **Model** (optional) specifies which model to use:
   - `OPENWORK_MODEL=claude-sonnet-4-20250514`
   - If not set, a default model is used for your provider

---

## Supported Providers

- [Anthropic (Claude)](#anthropic-claude)
- [OpenAI (GPT)](#openai-gpt)
- [Google (Gemini)](#google-gemini)
- [OpenRouter (100+ models)](#openrouter)

---

## Anthropic Claude

### Get API Key

1. Visit https://console.anthropic.com
2. Create account or sign in
3. Navigate to "API Keys"
4. Create new key

### Configure .env

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
OPENWORK_MODEL=claude-sonnet-4-20250514
```

### Available Models

```bash
OPENWORK_MODEL=claude-opus-4-20250514
OPENWORK_MODEL=claude-sonnet-4-20250514
OPENWORK_MODEL=claude-haiku-4-20250514
```

### Pricing

See https://www.anthropic.com/pricing

---

## OpenAI GPT

### Get API Key

1. Visit https://platform.openai.com/api-keys
2. Create account
3. Generate API key

### Configure .env

```bash
OPENAI_API_KEY=sk-proj-your-key-here
OPENWORK_MODEL=gpt-4o
```

### Available Models

```bash
OPENWORK_MODEL=gpt-4o
OPENWORK_MODEL=gpt-4o-mini
OPENWORK_MODEL=gpt-4-turbo
```

### Pricing

See https://openai.com/pricing

---

## Google Gemini

### Get API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with Google account
3. Generate API key

### Configure .env

```bash
GOOGLE_API_KEY=your-google-api-key
OPENWORK_MODEL=gemini-2.0-flash-001
```

### Available Models

```bash
OPENWORK_MODEL=gemini-2.0-flash-001
OPENWORK_MODEL=gemini-2.0-pro-001
```

### Pricing

See https://ai.google.dev/pricing (free tier available)

---

## OpenRouter

OpenRouter provides access to 100+ models from various providers with a single API key.

### Get API Key

1. Visit https://openrouter.ai/keys
2. Create account
3. Generate API key

### Configure .env

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENWORK_MODEL=openrouter/anthropic/claude-sonnet-4-20250514
```

### Available Models

```bash
# Anthropic
OPENWORK_MODEL=openrouter/anthropic/claude-sonnet-4-20250514
OPENWORK_MODEL=openrouter/anthropic/claude-opus-4-20250514

# OpenAI
OPENWORK_MODEL=openrouter/openai/gpt-4o
OPENWORK_MODEL=openrouter/openai/gpt-4o-mini

# Google
OPENWORK_MODEL=openrouter/google/gemini-2.0-flash-001

# Meta
OPENWORK_MODEL=openrouter/meta-llama/llama-3.3-70b-instruct

# Others
OPENWORK_MODEL=openrouter/deepseek/deepseek-chat
OPENWORK_MODEL=openrouter/mistralai/mistral-large-2411
```

Browse all models: https://openrouter.ai/models

### Pricing

See https://openrouter.ai/models for per-model pricing.

---

## Switching Providers

To switch providers:

1. Edit `.env`:
```bash
# Comment out old provider
# ANTHROPIC_API_KEY=sk-ant-...

# Add new provider
OPENAI_API_KEY=sk-proj-...
OPENWORK_MODEL=gpt-4o
```

2. Restart:
```bash
bun run start
```

---

## Verifying Configuration

When OpenWork starts, it shows your configuration:

```
┌─────────────────────────────────────────┐
│           OpenWork Gateway              │
├─────────────────────────────────────────┤
│ 🤖 Provider: anthropic                  │
│ 🧠 Model: claude-sonnet-4-20250514      │
│ 📱 Telegram: Connected                  │
└─────────────────────────────────────────┘
```

If you see errors, check:
- API key is correct and has credits
- Model name is spelled correctly
- See [Troubleshooting](TROUBLESHOOTING.md)

---

## FAQ

### Can I use multiple providers?

Not simultaneously. Set one API key and restart to switch.

### What if I don't set OPENWORK_MODEL?

A default model is used based on your API key:
- Anthropic → `claude-sonnet-4-20250514`
- OpenRouter → `openrouter/anthropic/claude-sonnet-4-20250514`

### Can I use local models (Ollama)?

Not currently. OpenWork requires API-based providers.
