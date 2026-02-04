# OpenWork: Fork of OpenCode

This document explains the relationship between OpenWork and OpenCode, detailing what was kept, removed, and added during the fork.

---

## What is OpenWork?

**OpenWork** is a fork of [OpenCode](https://github.com/anomalyco/opencode) by Anomaly Co., customized for business automation and workflow optimization via messaging platforms.

**Key Positioning:**
> OpenWork is to OpenCode what Claude Work is to Claude Code - an accessible AI agent via messaging (Telegram) that runs locally on your machine.

---

## What Was KEPT from OpenCode

### Core Agent System
- **Agent Loop & Reasoning**: The autonomous agent execution loop with multi-step reasoning capabilities
- **Tool System**: Complete tool infrastructure including:
  - Bash command execution
  - File operations (Read, Write, Edit, Glob, Grep)
  - Web search and web fetch capabilities
  - NotebookEdit for Jupyter notebooks
- **Session Management**: Full session lifecycle management and state persistence
- **Permission System**: User permission prompts for sensitive operations
- **Sub-agent Support**: Ability to spawn and manage sub-agents for complex tasks

### LLM Provider Support
- **Vercel AI SDK Integration**: Support for 20+ LLM providers including:
  - Anthropic (Claude Sonnet, Opus)
  - OpenAI (GPT-4, etc.)
  - Google (Gemini)
  - Azure OpenAI
  - Amazon Bedrock
  - GitHub Copilot
  - OpenRouter
  - Groq, Perplexity, Cerebras, and more
- **Provider Configuration**: Dynamic provider selection and configuration

### Plugin & Extension System
- **Plugin Architecture**: Full plugin system from OpenCode
- **MCP (Model Context Protocol)**: Support for MCP servers and integrations
- **Skill System**: Reusable skill definitions
- **Tool Registry**: Dynamic tool loading and management

### SDK & API
- **TypeScript SDK**: Complete SDK for programmatic access
- **OpenAPI Specification**: Full API documentation
- **Server Mode**: HTTP server for remote agent control
- **WebSocket Support**: Real-time communication

### Configuration & Project Management
- **opencode.jsonc**: Configuration file format and loading
- **Project System**: Multi-project support and workspace management
- **Environment Variables**: Flag-based configuration
- **Agent Memory**: agent.md files for persistent context

### Core Infrastructure
- **Bun Runtime**: Uses Bun for fast TypeScript execution
- **File Watching**: Chokidar-based file system monitoring
- **LSP Support**: Language Server Protocol integration
- **PTY Management**: Pseudo-terminal support for shell sessions

---

## What Was REMOVED from OpenCode

### Terminal User Interface (TUI)
- **Removed Entirely**: All TUI-related code from `packages/openwork/src/cli/cmd/tui/`
- **Rationale**: OpenWork uses messaging gateways (Telegram) instead of a terminal interface
- **Impact**: Users interact via Telegram bot rather than a CLI interface

### CLI Interface
- **Reduced**: While the CLI entry point (`src/index.ts`) remains for compatibility, the primary interface is now the messaging gateway
- **Removed Commands**: Some CLI-only commands that don't make sense for messaging-based interaction
- **Preserved**: Core CLI commands for development and debugging remain available

### OpenCode-Specific Branding
- **CLI Name**: Script name remains "opencode" internally for compatibility with file paths and config
- **Documentation**: All user-facing docs updated to OpenWork branding
- **Package Names**: Core packages retain @openwork namespace

### Desktop & Native Features
- **Desktop Apps**: Removed desktop application builds
- **Native UI**: Removed native window management code
- **Clipboard Integration**: Reduced clipboard features (not needed for messaging)
- **Terminal Themes**: TUI themes removed (not applicable to Telegram)

---

## What Was ADDED to Make OpenWork

### Messaging Gateway System
- **New Package**: `packages/gateway/` - Core gateway abstractions
- **Telegram Gateway**: Full Telegram bot implementation with:
  - Session management per chat
  - Message queuing
  - Graceful shutdown handling
  - User authentication (ALLOWED_USER_IDS)
- **Core Abstractions**:
  - `MessagingPlatform` interface for gateway implementations
  - `SessionManager` for chat-to-agent session mapping
  - `MessageQueue` for async message processing
  - `GatewayConfig` for gateway configuration

### Telegram Bot Features
- **Bot Commands**:
  - `/start` - Initialize conversation with the agent
  - `/help` - Show available commands and capabilities
  - `/reset` - Clear session and start fresh
- **Message Streaming**: Real-time response streaming to Telegram
- **Error Handling**: User-friendly error messages in chat
- **Session Persistence**: Conversations persist across bot restarts

### Enhanced Configuration
- **Gateway Configuration**: New environment variables:
  - `TELEGRAM_BOT_TOKEN` - Bot authentication
  - `ALLOWED_USER_IDS` - User access control
  - `OPENWORK_WORKING_DIR` - Default working directory
  - `SESSION_TIMEOUT` - Session expiry settings
- **Startup Validation**:
  - Checks for required environment variables
  - Provides helpful error messages with setup instructions
  - Displays startup banner with configuration summary

### Installation & Setup
- **Install Scripts**:
  - `scripts/install.sh` (Linux/Mac)
  - `scripts/install.ps1` (Windows)
- **Automated Setup**:
  - Dependency checking (Bun installation)
  - Package installation
  - Environment file creation from template
  - Directory structure creation

### Documentation
- **User-Focused Docs**:
  - `docs/PUBLIC.md` - Public version feature list and limitations
  - `docs/TROUBLESHOOTING.md` - Common issues and solutions
  - `docs/LLM_PROVIDERS.md` - LLM provider configuration guide
  - `docs/SECURITY_CHECKLIST.md` - Security best practices
  - `docs/deployment.md` - Local deployment guide
  - `docs/examples/` - Example agent.md configurations
- **README Updates**: Simplified README focused on Telegram bot setup

### Docker Support
- **Gateway Dockerfile**: `packages/gateway/Dockerfile` for containerized deployment
- **Optimized Image**: Alpine-based, includes ripgrep and git
- **Volume Support**: Mounts for business data and configuration

### agent.md Memory System
- **Enhanced**: While agent.md existed in OpenCode, OpenWork emphasizes it as the primary memory mechanism
- **Persistent Preferences**: Agent automatically learns and stores user preferences
- **Business Context**: Templates for business-specific agent configurations

### Session Management Improvements
- **Cross-Restart Persistence**: Sessions survive gateway restarts
- **Chat-Based Sessions**: One agent session per Telegram chat
- **Activity Tracking**: Automatic session timeout for idle conversations
- **Session Store**: Persistent session storage on disk

---

## Architecture Changes

### From: Terminal-Centric
```
User → Terminal (TUI) → OpenCode Agent → Tools
```

### To: Messaging-Centric
```
User → Telegram → Gateway → OpenWork Agent → Tools
         ↓
    (Phone/Desktop)
```

---

## Package Structure Comparison

### OpenCode Structure
```
packages/
  opencode/          # Core agent + TUI
  sdk/               # SDK
  plugin/            # Plugins
  util/              # Utilities
```

### OpenWork Structure
```
packages/
  openwork/          # Core agent (TUI removed)
  gateway/           # NEW: Messaging gateway abstractions
  discord-gateway.pro-only/  # Pro: Discord gateway (not in public)
  sdk/               # SDK (kept)
  plugin/            # Plugins (kept)
  util/              # Utilities (kept)
  script/            # Build scripts (kept)
```

---

## Remaining OpenCode References

For compatibility with the upstream OpenCode codebase, some internal references remain:

1. **Script Name**: `packages/openwork/src/index.ts:44` - `.scriptName("opencode")` for CLI compatibility
2. **Config Directories**:
   - `packages/openwork/src/config/config.ts:40-44` - Uses "opencode" in system paths
   - `packages/gateway/Dockerfile:9` - Ripgrep symlink at `/root/.local/share/opencode/bin/rg`
3. **SDK Examples**: `packages/sdk/openapi.json` - Contains `@opencode-ai/sdk` examples (internal)
4. **.opencode Directory**: Development tools and custom configurations at `.opencode/`

**Impact**: These are internal-only and do not affect end users. The `.opencode` directory is in `.gitignore` and used for development customizations.

---

## Pro Features (Not in Public Fork)

The following features are reserved for OpenWork Pro:

- **Discord Gateway**: `packages/discord-gateway.pro-only/` - Team/server messaging
- **WhatsApp/Zalo Gateways**: Business messaging channels
- **Google Drive MCP**: Cloud document access (`docs/google-drive-setup.md` describes Pro setup)
- **Gmail/Calendar MCP**: Email and scheduling automation
- **Autotasks**: `packages/openwork/src/scheduler/` - Scheduled autonomous execution
- **Multi-user Support**: Multiple people using one agent instance
- **VPS Deployment**: 24/7 operation without local PC
- **Multi-tenant**: Serve multiple clients from one deployment

---

## Development Philosophy

### OpenCode
- **Focus**: Developer productivity via terminal
- **Interface**: TUI (Terminal User Interface)
- **Use Case**: Local coding assistant
- **Execution**: Always local

### OpenWork
- **Focus**: Business automation via messaging
- **Interface**: Telegram (primary), Discord/WhatsApp (Pro)
- **Use Case**: Personal/business assistant accessible from phone
- **Execution**: Local (Public) or VPS (Pro)

---

## Upstream Sync Strategy

**OpenWork is a fork, not a downstream:**
- We do not automatically sync changes from OpenCode
- Core agent improvements may be manually ported if relevant
- OpenWork prioritizes messaging-based features over terminal features
- The two projects serve different use cases and may diverge significantly

---

## Contributing

If you want to contribute to:
- **Core agent features**: Consider contributing to upstream OpenCode
- **Messaging gateway features**: Contribute to OpenWork
- **Business automation tools**: Contribute to OpenWork

---

## Resources

- **OpenCode (Upstream)**: https://github.com/anomalyco/opencode
- **OpenCode Website**: https://opencode.ai
- **OpenWork Repository**: https://github.com/aissential-pro/openwork
- **Vercel AI SDK**: https://sdk.vercel.ai
- **Model Context Protocol**: https://modelcontextprotocol.io

---

## License

OpenWork inherits the MIT license from OpenCode. See LICENSE file for details.

---

**Last Updated**: 2025-02-04
