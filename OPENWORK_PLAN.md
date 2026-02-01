# OpenWork: Autonomous Business Agent Platform

## Vision

Transform OpenCode into **OpenWork** - a lightweight, autonomous AI agent that helps manage business operations through natural conversation via messaging apps.

---

## What I Want to Build

### Core Concept

A **single powerful main agent** that I can chat with via Telegram/WhatsApp, which will:

1. **Autonomously decide** when to launch sub-agents for complex tasks
2. **Create and manage sub-agents** dynamically based on what the task requires
3. **Edit and manage files** across my VPS and cloud storage (Google Drive)
4. **Strictly follow rules** defined in an `agent.md` memory file
5. **Produce excellent business deliverables** (business plans, marketing strategies, product sheets, reports, etc.)
6. **Act as a full team** - the main agent can spawn specialists (CEO-thinker, analyst, researcher, writer, operations) as needed

### Key Principle

I don't want to pre-define agents or crews. I want **one intelligent main agent** that decides:
- When a task is complex enough to need help
- What kind of specialist to spawn (defined by prompt at spawn time)
- How to orchestrate multiple sub-agents
- When to do things itself vs. delegate

### Example Interaction

```
Me: "Update my marketing plan for 2026"

Main Agent thinks:
  "This is complex. I need to:
   1. Research current market trends → spawn a researcher
   2. Analyze our 2025 performance → spawn an analyst
   3. Check our budget constraints → spawn a financial analyst
   4. Write the new plan → spawn a writer
   5. Review and finalize → do this myself"

Main Agent:
  → Spawns researcher sub-agent (role defined by prompt)
  → Spawns analyst sub-agent (role defined by prompt)
  → Spawns financial analyst sub-agent (role defined by prompt)
  → Waits for all to report back
  → Spawns writer with compiled research
  → Reviews output, makes final edits
  → Saves to ~/business/plans/marketing-2026.md
  → Reports back to me with summary
```

---

## Why OpenCode as Starting Point

After evaluating 18+ frameworks (Claude Agent SDK, CrewAI, LangGraph, Google ADK, etc.), OpenCode was chosen because:

| Requirement | OpenCode Capability |
|-------------|---------------------|
| Dynamic sub-agent spawning | ✅ Task tool - agent decides when to spawn |
| Main agent decides everything | ✅ Built-in autonomous loop |
| File editing | ✅ Best-in-class (9 fuzzy matching strategies) |
| Session management | ✅ Session trees with parent-child relationships |
| Proven architecture | ✅ Powers Claude Code, battle-tested |
| Self-hostable | ✅ Can run on VPS |

### Why Not Other Frameworks

| Framework | Issue for This Use Case |
|-----------|------------------------|
| Claude Agent SDK | Good but less mature sub-agent orchestration |
| CrewAI | Pre-defined crews, not dynamic spawning |
| LangGraph | Pre-defined graph nodes, not dynamic |
| Google ADK | Weak file operations |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MESSAGING GATEWAY                         │
│                 (Telegram / WhatsApp)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     MAIN AGENT                               │
│                                                              │
│  • Powered by Claude (Sonnet/Opus)                           │
│  • Loads agent.md on EVERY interaction                       │
│  • Decides when sub-agents are needed                        │
│  • Creates sub-agents with specific roles via prompts        │
│  • Orchestrates and synthesizes results                      │
│  • Makes final decisions                                     │
│                                                              │
│  Tools:                                                      │
│  ├── Task (spawn sub-agents dynamically)                     │
│  ├── Read, Write, Edit (file operations)                     │
│  ├── Glob, Grep (file search)                                │
│  ├── WebSearch, WebFetch (research)                          │
│  └── MCP tools (Google Drive, databases, etc.)               │
└─────────────────────────────┬───────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  Sub-agent   │   │  Sub-agent   │   │  Sub-agent   │
   │              │   │              │   │              │
   │  Role given  │   │  Role given  │   │  Role given  │
   │  at spawn    │   │  at spawn    │   │  at spawn    │
   │  time via    │   │  time via    │   │  time via    │
   │  prompt      │   │  prompt      │   │  prompt      │
   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## The agent.md System

A file that serves as the agent's **memory, rules, and context**:

```markdown
# Agent Operating Manual

## Identity
You are my executive AI assistant for [Business Name].
You have the power to spawn specialized sub-agents whenever needed.

## STRICT RULES (Never Break)
1. Always ask before spending money or external commitments
2. Never delete files without explicit approval
3. Always save drafts before finalizing documents
4. Check existing files before creating new ones
5. Update this file when you learn important preferences

## My Preferences
- Concise documents (max 5 pages for plans)
- Bullet points over long paragraphs
- Always include actionable next steps
- [Agent adds learned preferences over time]

## Business Context
- Industry: [your industry]
- Current priorities: [your priorities]
- Key clients: [your clients]

## Document Locations
- Business plans: ~/business/plans/
- Client files: ~/business/clients/
- Marketing: ~/business/marketing/
- Financial: ~/business/finance/
- Google Drive: [via MCP integration]

## How to Spawn Sub-Agents
When spawning a sub-agent, provide:
1. Clear role (researcher, analyst, writer, etc.)
2. Specific instructions for this task
3. Access to relevant files
4. Clear deliverable expectations

## Memory: What I've Learned
- [Agent adds observations here]
- Example: "User prefers morning updates"
- Example: "Always CC john@company.com on client matters"
```

---

## Implementation Plan

### Phase 1: Trim OpenCode (Current)

**Goal:** Reduce from ~93MB to ~8.5MB by removing unnecessary packages.

#### Keep (Essential)
| Package | Size | Purpose |
|---------|------|---------|
| `packages/opencode` | 7.5MB | Core agent, tools, sessions |
| `packages/sdk` | 811KB | Client SDK for API |
| `packages/plugin` | 32KB | Custom tool system |
| `packages/util` | 43KB | Utilities |

#### Remove
| Package | Size | Reason |
|---------|------|--------|
| `packages/ui` | 40MB | UI components (not needed) |
| `packages/console` | 31MB | TUI interface (not needed) |
| `packages/desktop` | 6.6MB | Desktop app (not needed) |
| `packages/web` | 5.6MB | Website (not needed) |
| `packages/app` | 1.9MB | Web frontend (optional) |
| `packages/docs` | 502KB | Docs site (not needed) |
| `packages/enterprise` | 130KB | Enterprise features |
| `packages/extensions` | 6KB | IDE extensions |
| `packages/function` | 30KB | Serverless functions |
| `packages/identity` | 10KB | Identity management |
| `packages/containers` | 21KB | Docker files |
| `packages/slack` | 21KB | Slack integration |
| `packages/script` | 11KB | Build scripts |

#### Also Remove from Root
- Translated READMEs (`README.*.md`)
- Infrastructure (`infra/`, `sst.config.ts`, `sst-env.d.ts`)
- Nix files (`flake.*`, `nix/`)
- Unnecessary GitHub workflows
- `themes/` (TUI themes)
- `specs/` (if not needed)

### Phase 2: Rename & Rebrand

- Rename all `opencode` references to `openwork`
- Update package.json files
- Update import paths
- Create new README.md

### Phase 3: Add agent.md System

- Implement agent.md loader
- Inject into system prompt before every LLM call
- Allow agent to update agent.md (memory)

### Phase 4: Configure for Business Use

- Set up business folder structure
- Configure default tools
- Create business document templates
- Set up MCP for Google Drive

### Phase 5: Add Messaging Gateway

- Create Telegram bot integration
- Map chat sessions to agent sessions
- Handle file attachments
- Stream responses back

### Phase 6: Deploy to VPS

- Set up on VPS (72.60.104.129)
- Configure API keys
- Set up process management (PM2/systemd)
- Configure backups

---

## Technical Decisions

### Model Usage
- **Main agent:** Claude Opus 4 or Sonnet 4 (configurable)
- **Sub-agents:** Claude Sonnet 4 (cost-effective)
- **Simple tasks:** Could use cheaper models later

### Storage
- **Local files:** `~/business/` on VPS
- **Cloud storage:** Google Drive via MCP
- **Session data:** SQLite or file-based (from OpenCode)

### API
- Keep OpenCode's HTTP API for flexibility
- Add WebSocket for real-time updates to messaging gateway

---

## File Structure After Trimming

```
openwork/
├── packages/
│   ├── openwork/          # Renamed from opencode
│   │   └── src/
│   │       ├── agent/     # Agent definitions
│   │       ├── session/   # Session management
│   │       ├── tool/      # Built-in tools
│   │       ├── server/    # HTTP API
│   │       └── ...
│   ├── sdk/               # Client SDK
│   ├── plugin/            # Plugin system
│   └── util/              # Utilities
├── gateway/               # NEW: Messaging gateway
│   ├── telegram.ts
│   └── whatsapp.ts
├── business/              # NEW: Business templates
│   └── templates/
├── agent.md               # NEW: Agent memory/rules
├── package.json
├── README.md
└── ...
```

---

## Success Criteria

1. **Autonomous:** Agent decides when to spawn sub-agents without being told
2. **Rule-following:** Agent always checks agent.md before taking actions
3. **Quality output:** Business documents are professional and actionable
4. **Responsive:** Can handle complex requests via simple chat messages
5. **Reliable:** Runs 24/7 on VPS without supervision
6. **Learnable:** Agent improves over time by updating agent.md

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API costs spiral | Set budget limits, use Sonnet for sub-agents |
| Agent ignores rules | Strong system prompt, always inject agent.md |
| Sub-agents go off track | Clear role definitions, main agent reviews output |
| Data loss | Regular backups, Git for document versioning |
| VPS downtime | Monitoring, auto-restart with PM2 |

---

## Next Steps

1. ✅ Fork OpenCode to aissential-pro/openwork
2. ✅ Set up local development environment
3. ⏳ Trim unnecessary packages
4. ⏳ Rename to OpenWork
5. ⏳ Implement agent.md system
6. ⏳ Add messaging gateway
7. ⏳ Deploy to VPS
8. ⏳ Test with real business tasks

---

## Repository

- **GitHub:** https://github.com/aissential-pro/openwork
- **Branch:** `main` (development)
- **Upstream:** https://github.com/anomalyco/opencode (for updates)
