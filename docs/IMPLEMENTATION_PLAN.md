# OpenWork Implementation Plan

## Overview

**Phases covered:** 1 (Trim) → 2 (Rename) → 3 (agent.md) → 4 (Business Config) → 5 (Messaging Gateway) → 6 (Deploy)

**Git strategy:** One commit per logical group of steps (noted in plan)

**Rename strategy:** Minimal - package names and user-facing strings only, internal code stays as-is for easier maintenance

---

## Phase 1: Trim OpenCode

### Step 1.1 — Create baseline commit
- **Action:** Commit any uncommitted changes, create a `pre-trim` tag
- **Files:** None (git operation)
- **Success:** `git tag pre-trim` exists
- **Commit:** Yes

### Step 1.2 — Remove translated READMEs
- **Action:** Delete all `README.*.md` files (16 files), keep only `README.md`
- **Files:** Root directory `README.*.md`
- **Success:** Only `README.md` remains
- **Commit:** No (batch with 1.3-1.5)

### Step 1.3 — Remove Nix files
- **Action:** Delete `flake.nix`, `flake.lock`, `nix/` directory
- **Files:** `flake.nix`, `flake.lock`, `nix/`
- **Success:** No Nix-related files remain
- **Commit:** No

### Step 1.4 — Remove infrastructure files
- **Action:** Delete `infra/`, `sst.config.ts`, `sst-env.d.ts`
- **Files:** Listed above
- **Success:** No SST/infra files remain
- **Commit:** No

### Step 1.5 — Remove themes directory
- **Action:** Delete `themes/` (TUI themes not needed)
- **Files:** `themes/`
- **Success:** Directory removed
- **Commit:** Yes — "chore: remove non-essential root files"

### Step 1.6 — Remove packages/ui
- **Action:** Delete entire `packages/ui` directory (40MB)
- **Files:** `packages/ui/`
- **Verify first:** Confirm opencode package does NOT import from `@opencode-ai/ui`
- **Success:** Directory removed, no broken imports in opencode
- **Commit:** No (batch with 1.7-1.12)

### Step 1.7 — Remove packages/console
- **Action:** Delete entire `packages/console` directory (31MB)
- **Files:** `packages/console/`
- **Success:** Directory removed
- **Commit:** No

### Step 1.8 — Remove packages/desktop
- **Action:** Delete entire `packages/desktop` directory (6.6MB)
- **Files:** `packages/desktop/`
- **Success:** Directory removed
- **Commit:** No

### Step 1.9 — Remove packages/web
- **Action:** Delete entire `packages/web` directory (5.6MB)
- **Files:** `packages/web/`
- **Success:** Directory removed
- **Commit:** No

### Step 1.10 — Remove packages/app
- **Action:** Delete entire `packages/app` directory (1.9MB)
- **Files:** `packages/app/`
- **Success:** Directory removed
- **Commit:** No

### Step 1.11 — Remove packages/docs
- **Action:** Delete `packages/docs` if it exists
- **Files:** `packages/docs/`
- **Success:** Directory removed or confirmed non-existent
- **Commit:** No

### Step 1.12 — Remove remaining non-essential packages
- **Action:** Delete `packages/enterprise`, `packages/extensions`, `packages/function`, `packages/identity`, `packages/containers`, `packages/slack`
- **Files:** Listed directories
- **Success:** Only `opencode`, `sdk`, `plugin`, `util`, `script` remain in packages/
- **Commit:** Yes — "chore: remove non-essential packages"

### Step 1.13 — Update root package.json workspaces
- **Action:** Edit `package.json` to remove references to deleted packages from workspaces array
- **Files:** `package.json`
- **Success:** Workspaces only lists remaining packages
- **Commit:** No (batch with 1.14)

### Step 1.14 — Update turbo.json
- **Action:** Remove any pipeline entries for deleted packages
- **Files:** `turbo.json`
- **Success:** No references to removed packages
- **Commit:** Yes — "chore: update workspace configuration"

### Step 1.15 — Clean GitHub workflows
- **Action:** Review `.github/workflows/`, remove workflows for deleted packages (desktop releases, web deploys, etc.), keep essential ones (CI, tests)
- **Files:** `.github/workflows/*.yml`
- **Success:** Only relevant workflows remain
- **Commit:** Yes — "chore: clean up GitHub workflows"

### Step 1.16 — Install dependencies and verify build
- **Action:** Run `bun install` then `bun run build` (or equivalent)
- **Files:** None (command)
- **Success:** Build completes without errors
- **Commit:** No

### Step 1.17 — Run tests
- **Action:** Run test suite for remaining packages
- **Files:** None (command)
- **Success:** Tests pass (or document known failures)
- **Commit:** No

### Step 1.18 — Smoke test
- **Action:** Start the agent CLI, run a simple task (e.g., "What files are in this directory?")
- **Files:** None (manual test)
- **Success:** Agent responds correctly
- **Commit:** Yes — Tag `phase-1-complete`

---

## Phase 2: Rename & Rebrand

### Step 2.1 — Rename packages/opencode directory
- **Action:** Rename `packages/opencode` → `packages/openwork`
- **Files:** Directory rename
- **Success:** Directory renamed
- **Commit:** No

### Step 2.2 — Update packages/openwork/package.json
- **Action:** Change package name from `@opencode-ai/opencode` to `@openwork/core` (or similar), update description
- **Files:** `packages/openwork/package.json`
- **Success:** Package name updated
- **Commit:** No

### Step 2.3 — Update other package.json files
- **Action:** Update `packages/sdk/package.json`, `packages/plugin/package.json`, `packages/util/package.json` - change org from `@opencode-ai` to `@openwork`
- **Files:** Listed package.json files
- **Success:** All package names use new org
- **Commit:** No

### Step 2.4 — Update internal imports
- **Action:** Find and replace `@opencode-ai/` with `@openwork/` in all TypeScript/JavaScript files
- **Files:** All `.ts`, `.tsx`, `.js` files in remaining packages
- **Success:** No imports reference old org name
- **Commit:** No

### Step 2.5 — Update root package.json
- **Action:** Update name, description, repository URL
- **Files:** `package.json`
- **Success:** Root package reflects new identity
- **Commit:** No

### Step 2.6 — Update CLI binary name
- **Action:** Find where CLI binary name is defined (likely in package.json bin field or build config), change from `opencode` to `openwork`
- **Files:** `packages/openwork/package.json` (bin field), possibly build scripts
- **Success:** Running `openwork` invokes the CLI
- **Commit:** No

### Step 2.7 — Update user-facing strings
- **Action:** Search for "OpenCode" (case-insensitive) in prompt files and user-facing messages, replace with "OpenWork"
- **Files:** `packages/openwork/src/session/prompt/*.txt`, error messages, help text
- **Success:** User sees "OpenWork" in CLI output
- **Commit:** Yes — "feat: rename to OpenWork"

### Step 2.8 — Update README.md
- **Action:** Rewrite README.md for OpenWork - new description, installation, usage
- **Files:** `README.md`
- **Success:** README reflects new project
- **Commit:** Yes — "docs: update README for OpenWork"

### Step 2.9 — Verify build and tests
- **Action:** Run `bun install`, `bun run build`, run tests
- **Files:** None (commands)
- **Success:** Build passes, tests pass
- **Commit:** Yes — Tag `phase-2-complete`

---

## Phase 3: Add agent.md System

### Step 3.1 — Create agent.md template
- **Action:** Create `agent.md` file at repository root with template structure (identity, rules, preferences, business context, memory sections)
- **Files:** `agent.md` (new file)
- **Success:** Template file exists with documented sections
- **Commit:** No

### Step 3.2 — Create agent.md loader module
- **Action:** Create new module `packages/openwork/src/agent/agent-memory.ts` that:
  - Defines path to agent.md (configurable, default `~/.openwork/agent.md`)
  - Exports function to read and parse agent.md
  - Handles file not found gracefully
- **Files:** `packages/openwork/src/agent/agent-memory.ts` (new)
- **Success:** Module exports `loadAgentMemory()` function
- **Commit:** No

### Step 3.3 — Identify system prompt injection point
- **Action:** Read `packages/openwork/src/session/system.ts` to understand where system prompt is assembled, identify exact location to inject agent.md content
- **Files:** `packages/openwork/src/session/system.ts` (read only)
- **Success:** Document the injection point (line number, function name)
- **Commit:** No (research step)

### Step 3.4 — Inject agent.md into system prompt
- **Action:** Modify `system.ts` to:
  - Import agent-memory module
  - Call `loadAgentMemory()` during prompt assembly
  - Append agent.md content as a dedicated section in system prompt
- **Files:** `packages/openwork/src/session/system.ts`
- **Dependencies:** Step 3.2, 3.3
- **Success:** System prompt includes agent.md content
- **Commit:** No

### Step 3.5 — Create agent.md write capability
- **Action:** Create function in `agent-memory.ts` to update agent.md file (for memory/learning feature)
- **Files:** `packages/openwork/src/agent/agent-memory.ts`
- **Success:** `updateAgentMemory(section, content)` function exists
- **Commit:** No

### Step 3.6 — Create UpdateMemory tool
- **Action:** Create new tool `packages/openwork/src/tool/update-memory.ts` that allows agent to append to the "Memory" section of agent.md
- **Files:** `packages/openwork/src/tool/update-memory.ts` (new)
- **Success:** Tool registered and callable
- **Commit:** No

### Step 3.7 — Register UpdateMemory tool
- **Action:** Add UpdateMemory tool to tool registry (find where tools are registered, add import and registration)
- **Files:** Tool registry file (likely `packages/openwork/src/tool/index.ts` or similar)
- **Dependencies:** Step 3.6
- **Success:** Tool appears in available tools
- **Commit:** Yes — "feat: add agent.md memory system"

### Step 3.8 — Test agent.md loading
- **Action:** Create test agent.md, start CLI, verify agent acknowledges content from agent.md in responses
- **Files:** None (manual test)
- **Success:** Agent behavior reflects agent.md rules
- **Commit:** No

### Step 3.9 — Test memory updates
- **Action:** Ask agent to remember something, verify agent.md file is updated
- **Files:** None (manual test)
- **Success:** agent.md contains new memory entry
- **Commit:** Yes — Tag `phase-3-complete`

---

## Phase 4: Configure for Business Use

### Step 4.1 — Create business folder structure
- **Action:** Create directory template: `business/templates/`, `business/plans/`, `business/clients/`, `business/marketing/`, `business/finance/`
- **Files:** New directories (can be in repo or documented for user setup)
- **Success:** Structure documented/created
- **Commit:** No

### Step 4.2 — Create business document templates
- **Action:** Create starter templates in `business/templates/`:
  - `business-plan-template.md`
  - `marketing-plan-template.md`
  - `client-brief-template.md`
  - `report-template.md`
- **Files:** Template markdown files
- **Success:** Templates exist with placeholder sections
- **Commit:** Yes — "feat: add business document templates"

### Step 4.3 — Create default agent.md for business use
- **Action:** Populate `agent.md` with sensible business defaults (document locations, common rules, preference placeholders)
- **Files:** `agent.md`
- **Success:** agent.md ready for business use
- **Commit:** No

### Step 4.4 — Configure default model settings
- **Action:** Set default model to Claude Sonnet 4 for main agent, document how to switch to Opus
- **Files:** Config files or documentation
- **Success:** Default model is cost-effective
- **Commit:** Yes — "feat: configure business defaults"

### Step 4.5 — Document MCP setup for Google Drive
- **Action:** Create `docs/google-drive-setup.md` explaining how to set up MCP server for Google Drive integration
- **Files:** `docs/google-drive-setup.md` (new)
- **Success:** Step-by-step guide exists
- **Commit:** Yes — "docs: add Google Drive MCP setup guide" + Tag `phase-4-complete`

---

## Phase 5: Add Messaging Gateway

### Step 5.1 — Create gateway package structure
- **Action:** Create `packages/gateway/` with `package.json`, `tsconfig.json`, `src/` directory
- **Files:** New package structure
- **Success:** Package initializes correctly
- **Commit:** No

### Step 5.2 — Add gateway to workspace
- **Action:** Update root `package.json` workspaces to include `packages/gateway`
- **Files:** `package.json`
- **Success:** `bun install` recognizes new package
- **Commit:** No

### Step 5.3 — Create gateway core module
- **Action:** Create `packages/gateway/src/core.ts` with:
  - Interface for messaging platforms
  - Session management (map chat ID → agent session)
  - Message queue for long-running tasks
- **Files:** `packages/gateway/src/core.ts`
- **Success:** Core abstractions defined
- **Commit:** No

### Step 5.4 — Create Telegram bot module
- **Action:** Create `packages/gateway/src/telegram.ts`:
  - Use `telegraf` or `node-telegram-bot-api` library
  - Implement message handler
  - Handle text and file attachments
  - Stream responses back (chunked for long messages)
- **Files:** `packages/gateway/src/telegram.ts`, update `package.json` with dependency
- **Success:** Telegram module exports bot class
- **Commit:** No

### Step 5.5 — Create OpenWork client integration
- **Action:** Create `packages/gateway/src/openwork-client.ts`:
  - Use SDK to communicate with OpenWork agent
  - Handle session creation/resumption
  - Stream responses from agent
- **Files:** `packages/gateway/src/openwork-client.ts`
- **Success:** Can send message to agent and receive response
- **Commit:** No

### Step 5.6 — Create gateway entry point
- **Action:** Create `packages/gateway/src/index.ts`:
  - Load configuration (bot tokens, API keys)
  - Initialize Telegram bot
  - Connect to OpenWork
  - Start listening
- **Files:** `packages/gateway/src/index.ts`
- **Success:** `bun run packages/gateway/src/index.ts` starts bot
- **Commit:** Yes — "feat: add Telegram messaging gateway"

### Step 5.7 — Handle long-running tasks
- **Action:** Implement "thinking" indicator and periodic status updates for tasks that take >30 seconds
- **Files:** `packages/gateway/src/telegram.ts`
- **Success:** User sees progress during long tasks
- **Commit:** No

### Step 5.8 — Handle file attachments
- **Action:** Implement file download from Telegram, save to temp location, pass path to agent
- **Files:** `packages/gateway/src/telegram.ts`
- **Success:** User can send files to agent
- **Commit:** No

### Step 5.9 — Add authentication
- **Action:** Implement allowlist of authorized Telegram user IDs in config
- **Files:** `packages/gateway/src/core.ts`, config files
- **Success:** Only authorized users can interact
- **Commit:** Yes — "feat: add gateway authentication and file handling"

### Step 5.10 — Create WhatsApp module (optional)
- **Action:** Create `packages/gateway/src/whatsapp.ts` using WhatsApp Business API or Baileys
- **Files:** `packages/gateway/src/whatsapp.ts`
- **Success:** WhatsApp integration works
- **Commit:** Yes — "feat: add WhatsApp gateway support" + Tag `phase-5-complete`

---

## Phase 6: Deploy to VPS

### Step 6.1 — Create deployment documentation
- **Action:** Create `docs/deployment.md` with:
  - System requirements (Node/Bun version, memory)
  - Environment variables needed
  - Step-by-step deployment instructions
- **Files:** `docs/deployment.md`
- **Success:** Documentation complete
- **Commit:** No

### Step 6.2 — Create environment template
- **Action:** Create `.env.example` with all required environment variables (API keys, bot tokens, paths)
- **Files:** `.env.example`
- **Success:** All variables documented
- **Commit:** No

### Step 6.3 — Create PM2 ecosystem file
- **Action:** Create `ecosystem.config.js` for PM2 process management:
  - OpenWork server process
  - Gateway process
  - Auto-restart configuration
  - Log configuration
- **Files:** `ecosystem.config.js`
- **Success:** `pm2 start ecosystem.config.js` works
- **Commit:** Yes — "feat: add deployment configuration"

### Step 6.4 — Create setup script
- **Action:** Create `scripts/setup.sh`:
  - Install dependencies
  - Create required directories
  - Copy template files
  - Prompt for configuration
- **Files:** `scripts/setup.sh`
- **Success:** Script runs on fresh VPS
- **Commit:** No

### Step 6.5 — Create backup script
- **Action:** Create `scripts/backup.sh`:
  - Backup agent.md
  - Backup business/ directory
  - Backup session data
  - Optional: push to git
- **Files:** `scripts/backup.sh`
- **Success:** Backups created successfully
- **Commit:** Yes — "feat: add setup and backup scripts"

### Step 6.6 — Test deployment
- **Action:** Deploy to VPS (72.60.104.129), verify all components run
- **Files:** None (deployment action)
- **Success:** Bot responds on Telegram
- **Commit:** Yes — Tag `phase-6-complete`, Tag `v0.1.0`

---

## Summary

| Phase | Steps | Key Deliverable |
|-------|-------|-----------------|
| 1. Trim | 1.1–1.18 | Minimal codebase (~8.5MB) |
| 2. Rename | 2.1–2.9 | OpenWork branding |
| 3. agent.md | 3.1–3.9 | Memory/rules system |
| 4. Business | 4.1–4.5 | Business templates & config |
| 5. Gateway | 5.1–5.10 | Telegram/WhatsApp integration |
| 6. Deploy | 6.1–6.6 | Running on VPS |

**Total steps:** 52

---

## Step Size Guidelines for Sub-Agents

Each step is designed to be completable by a Sonnet 4.5 sub-agent without exceeding context limits:

- **Single-package focus:** Each step typically touches files in one package only
- **Limited file count:** Most steps involve 1-5 files
- **Clear boundaries:** Each step has explicit success criteria
- **No cascading changes:** Steps are ordered to avoid needing to fix things in later steps

When assigning steps to sub-agents:
- Provide the step number, action, files, and success criteria
- Include relevant context from previous steps if there are dependencies
- Ask sub-agent to report back with files changed and verification of success criteria
