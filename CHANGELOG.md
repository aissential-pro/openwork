# Changelog

All notable changes to OpenWork will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-04

### Added

**Installation & Setup**
- Automated installation scripts for Linux/Mac (`install.sh`) and Windows (`install.ps1`)
- Simplified `.env.example` with only 3 required variables
- Configuration validation on gateway startup with helpful error messages
- Startup banner showing current configuration
- Default `agent.md` template with best practices
- Root-level `bun run start` command for easy launching

**User Experience**
- Comprehensive `/start` command with capabilities overview
- Detailed `/help` command with example prompts and tips
- Improved `/reset` command with clear feedback
- Connection status notifications to users when bot starts
- Better error messages for missing configuration

**Documentation**
- Comprehensive troubleshooting guide (`TROUBLESHOOTING.md`)
- LLM provider comparison guide (`LLM_PROVIDERS.md`)
- Security checklist for contributors (`SECURITY_CHECKLIST.md`)
- 4 example `agent.md` configurations:
  - Personal assistant
  - Developer assistant
  - Writer assistant
  - Research assistant
- Examples README with usage guide

**Development**
- GitHub Actions CI workflow
- Security checks for secrets in commits
- Build and typecheck automation

**Security & Cleanup**
- Removed all VPS IP addresses (replaced with placeholders)
- Removed all real API keys and tokens (replaced with placeholders)
- Moved internal documentation to `docs/internal/`
- Removed Pro-only features (Discord gateway)
- Created security checklist for contributors

### Changed
- Simplified README with focus on quick start
- Updated repository URL to `github.com/aissential-pro/openwork`
- Changed bot messages from French to English
- Restructured documentation for better navigation

### Removed
- Discord gateway package (Pro-only feature)
- VPS deployment details (Pro-only, see docs for local setup)
- Internal strategy documents (moved to `docs/internal/`)

### Fixed
- Configuration validation now provides helpful error messages
- Bot token validation improved
- Session persistence working correctly

---

## Release Notes

### What is OpenWork?

OpenWork is a free, open-source AI assistant that runs locally on your computer and is accessible via Telegram. It features:

- Local execution (your data stays on your machine)
- Telegram interface (chat from phone or desktop)
- Autonomous agent with multi-step reasoning
- Web search capabilities
- File operations (read, write, edit)
- Persistent memory via `agent.md`

### Quick Start

```bash
git clone https://github.com/aissential-pro/openwork.git
cd openwork
./scripts/install.sh  # or install.ps1 on Windows
# Edit .env with your API keys
bun run start
```

### Requirements

- Bun 1.x or higher
- Anthropic API key (or OpenAI, Google, etc.)
- Telegram bot token
- Your Telegram user ID

### Documentation

- [README](README.md) - Quick start guide
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues
- [LLM Providers](docs/LLM_PROVIDERS.md) - Provider setup
- [Examples](docs/examples/) - Agent configurations
- [Security](docs/SECURITY_CHECKLIST.md) - Security best practices

### Support

- GitHub Issues: https://github.com/aissential-pro/openwork/issues
- Documentation: See `/docs`

### License

MIT License - See [LICENSE](LICENSE) for details

---

*OpenWork is a fork of [OpenCode](https://github.com/anomalyco/opencode) by Anomaly Co.*
