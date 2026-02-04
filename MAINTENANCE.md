# OpenWork Maintenance Guide

> **For maintainers:** This document contains instructions for periodic maintenance of OpenWork, including syncing improvements from upstream OpenCode.

---

## Quick Start (For AI-Assisted Maintenance)

When starting a maintenance session with an AI coding assistant, use this prompt:

```
Read MAINTENANCE.md and help me perform the quarterly maintenance check for OpenWork.
Check what's new in upstream OpenCode and recommend what we should sync.
```

---

## Repository Overview

| Item | Value |
|------|-------|
| **This repo** | OpenWork (public) - Telegram-based AI assistant |
| **Upstream** | [OpenCode](https://github.com/anomalyco/opencode) by Anomaly Co |
| **Relationship** | OpenWork is a fork focused on messaging gateways |
| **Maintenance frequency** | Every 2-3 months, or when critical updates released |

### Remotes Configuration

```bash
# Verify remotes are set up
git remote -v

# Expected:
# public   git@github-aissential:aissential-pro/openwork.git (push)
# upstream https://github.com/anomalyco/opencode.git (fetch)
```

If upstream is missing:
```bash
git remote add upstream https://github.com/anomalyco/opencode.git
```

---

## What OpenWork Uses from OpenCode

### Core Components (SYNC these)

| Component | Path | Description |
|-----------|------|-------------|
| Agent core | `packages/openwork/src/agent/` | Agent loop, reasoning |
| Tools | `packages/openwork/src/tool/` | Bash, file ops, web search |
| Session | `packages/openwork/src/session/` | Session management |
| Providers | `packages/openwork/src/provider/` | LLM provider integrations |
| Config | `packages/openwork/src/config/` | Configuration system |
| MCP | `packages/openwork/src/mcp/` | Model Context Protocol |

### Components OpenWork Added (DON'T overwrite)

| Component | Path | Description |
|-----------|------|-------------|
| Gateway | `packages/gateway/` | Telegram bot integration |
| Install scripts | `scripts/` | install.sh, install.ps1 |
| Documentation | `docs/` | OpenWork-specific docs |
| Branding | `README.md`, etc. | OpenWork branding |

### Components OpenWork Doesn't Use (SKIP these)

| Component | Reason |
|-----------|--------|
| TUI (`src/cli/cmd/tui/`) | OpenWork uses Telegram, not terminal UI |
| Desktop features | Not applicable to messaging gateway |
| VSCode extension | Removed from public repo |

---

## Maintenance Checklist

### Step 1: Fetch Upstream Changes

```bash
git fetch upstream
```

### Step 2: Check Upstream Releases

```bash
# See recent commits
git log upstream/main --oneline -30

# See releases/tags
git tag -l | tail -20
```

Or check GitHub directly: https://github.com/anomalyco/opencode/releases

### Step 3: Compare Core Package Changes

```bash
# See what changed in the core agent package
git diff main upstream/main -- packages/openwork/src/agent/
git diff main upstream/main -- packages/openwork/src/tool/
git diff main upstream/main -- packages/openwork/src/provider/
git diff main upstream/main -- packages/openwork/src/session/
git diff main upstream/main -- packages/openwork/src/mcp/

# Summary of changed files
git diff main upstream/main --stat -- packages/openwork/src/
```

### Step 4: Review and Decide

For each significant change, decide:

| Decision | When to use |
|----------|-------------|
| **SYNC** | Bug fixes, security patches, provider updates |
| **SKIP** | TUI changes, features we don't use, branding |
| **ADAPT** | Good features that need modification for gateway use |

### Step 5: Apply Changes (Cherry-pick Method)

```bash
# Cherry-pick specific commits
git cherry-pick <commit-hash>

# Or cherry-pick without auto-commit (to review first)
git cherry-pick <commit-hash> --no-commit
git diff --cached  # Review changes
git commit -m "sync: <description> from upstream"
```

### Step 6: Test

```bash
# Install dependencies (in case they changed)
bun install

# Type check
bun run typecheck

# Run tests
bun test

# Manual test: start the gateway
bun run start
```

### Step 7: Push to Public

```bash
git push public main --no-verify
```

---

## Common Scenarios

### Scenario: Security Patch in Upstream

**Priority:** HIGH - Apply immediately

```bash
git fetch upstream
git log upstream/main --oneline --grep="security" -10
git cherry-pick <security-commit-hash>
git push public main --no-verify
```

### Scenario: New LLM Provider Support

**Priority:** MEDIUM - Apply when convenient

```bash
# Check provider changes
git diff main upstream/main -- packages/openwork/src/provider/

# Cherry-pick the provider addition
git cherry-pick <provider-commit-hash>
```

### Scenario: Major Version Upgrade

**Priority:** LOW - Evaluate carefully

1. Read the release notes thoroughly
2. Check for breaking changes
3. Test in a separate branch first:
   ```bash
   git checkout -b test-upstream-sync
   git merge upstream/main --no-commit
   # Resolve conflicts, test thoroughly
   ```

### Scenario: Dependency Updates

```bash
# Check if upstream updated dependencies
git diff main upstream/main -- package.json bun.lock

# If significant, review and apply
git checkout upstream/main -- package.json
bun install
bun test
```

---

## Conflict Resolution

### Files That Will Likely Conflict

| File | Resolution |
|------|------------|
| `README.md` | Keep ours (OpenWork branding) |
| `package.json` | Merge carefully (keep our scripts, take their deps) |
| `docs/*` | Keep ours |
| `.env.example` | Keep ours |
| `SECURITY.md` | Keep ours |
| `LICENSE` | Keep ours |

### Resolving Conflicts

```bash
# If merge conflict occurs
git status  # See conflicted files

# For files we want to keep ours
git checkout --ours <file>

# For files we want upstream version
git checkout --theirs <file>

# For files needing manual merge
# Edit the file, then:
git add <file>
```

---

## Version Tracking

Keep track of what upstream version we're based on:

| Date | Upstream Commit | Notes |
|------|-----------------|-------|
| 2025-02-04 | Initial fork | Based on OpenCode, cleaned for public |
| | | |
| | | |

Update this table after each sync.

---

## Troubleshooting

### "Divergent branches" error

```bash
git pull upstream main --rebase
# Or if needed:
git pull upstream main --allow-unrelated-histories
```

### Upstream renamed files/directories

If OpenCode renames `packages/openwork` to something else:
1. Note the new name
2. Update this document
3. Adjust sync commands accordingly

### Tests failing after sync

```bash
# Check what tests exist
find . -name "*.test.ts" | head -20

# Run specific test
bun test packages/openwork/test/<specific-test>.ts

# Check if it's a known upstream issue
# Visit: https://github.com/anomalyco/opencode/issues
```

---

## Contacts & Resources

| Resource | Link |
|----------|------|
| OpenCode GitHub | https://github.com/anomalyco/opencode |
| OpenCode Releases | https://github.com/anomalyco/opencode/releases |
| OpenWork Public | https://github.com/aissential-pro/openwork |
| OpenWork Issues | https://github.com/aissential-pro/openwork/issues |

---

## Notes for Future Maintainers

1. **Don't try to stay perfectly in sync** - Cherry-pick what matters
2. **Prioritize security patches** - Apply these quickly
3. **Test before pushing** - Always run `bun test` after syncing
4. **Keep this document updated** - Add notes after each maintenance session
5. **OpenWork-specific code is in `packages/gateway/`** - Don't overwrite this

---

*Last maintenance: 2025-02-04 - Initial public release*
