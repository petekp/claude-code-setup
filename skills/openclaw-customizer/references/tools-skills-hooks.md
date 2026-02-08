# OpenClaw Tools, Skills & Hooks

## Tool Policy

Control what the agent can do:

```json5
{
  tools: {
    profile: "full",             // minimal|coding|messaging|full
    allow: ["tool-name"],        // allowlist
    deny: ["tool-name"],         // denylist (deny wins over allow)
    // Per-provider overrides:
    byProvider: {
      "openai/gpt-5.2": { deny: ["exec"] }
    }
  }
}
```

**Tool groups:** `group:runtime`, `group:fs`, `group:sessions`, `group:memory`, `group:web`, `group:ui`, `group:automation`, `group:messaging`, `group:nodes`, `group:openclaw`

**Elevated access:**
```json5
{
  tools: {
    elevated: {
      enabled: true,
      allowFrom: {
        whatsapp: ["+15555550123"],
        telegram: ["username"]
      }
    }
  }
}
```

**Web tools:**
```json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "${BRAVE_API_KEY}",
        maxResults: 5
      },
      fetch: {
        enabled: true,
        maxChars: 50000,
        readability: true,
        firecrawl: { enabled: true, apiKey: "${FIRECRAWL_API_KEY}" }
      }
    }
  }
}
```

**Exec tool:**
```json5
{
  tools: {
    exec: {
      backgroundMs: 10000,      // auto-background timeout
      timeoutSec: 1800,         // kill timeout
      applyPatch: { enabled: true }
    }
  }
}
```

## Skills System

Skills extend agent capabilities through SKILL.md files with YAML frontmatter.

### Loading Hierarchy (highest to lowest priority)
1. Workspace skills: `<workspace>/skills/`
2. Managed skills: `~/.openclaw/skills/`
3. Bundled skills (shipped with OpenClaw)
4. Extra dirs: `skills.load.extraDirs`

### Skill Structure
```
skill-name/
├── SKILL.md          (required — frontmatter + instructions)
├── scripts/          (executable code)
├── references/       (docs loaded on demand)
└── assets/           (files used in output)
```

### Configuration
```json5
{
  skills: {
    allowBundled: ["skill-1", "skill-2"],
    load: {
      extraDirs: ["/path/to/more/skills"],
      watch: true,
      watchDebounceMs: 250
    },
    entries: {
      "skill-name": {
        enabled: true,
        apiKey: "SECRET",
        env: { CUSTOM_VAR: "value" }
      }
    }
  }
}
```

### Multi-Agent Skills
Each agent has its own workspace skills. Shared skills in `~/.openclaw/skills/` are available to all agents.

### ClawHub
Browse and install community skills:
- `clawhub install <skill-slug>`
- `clawhub update --all`
- `clawhub sync --all`

## Hooks System

Event-driven automation scripts that run when things happen in the gateway.

### Hook Structure
```
hook-name/
├── HOOK.md           (metadata + documentation)
└── handler.ts        (TypeScript implementation)
```

### Event Types
- **Command events**: `/new`, `/reset`, `/stop`
- **Agent events**: `agent:bootstrap` (before workspace injection)
- **Gateway events**: `gateway:startup` (when channels initialize)
- **Tool result hooks**: Synchronous tool result modification

### Discovery Locations (priority order)
1. Workspace: `<workspace>/hooks/`
2. Managed: `~/.openclaw/hooks/`
3. Bundled (shipped with OpenClaw)

### Bundled Hooks
- **session-memory**: Saves last 15 lines of conversation to `memory/YYYY-MM-DD.md`
- **command-logger**: Logs commands to `~/.openclaw/logs/commands.log` (JSONL)
- **boot-md**: Executes BOOT.md instructions at gateway startup
- **soul-evil**: Probabilistically swaps SOUL.md with SOUL_EVIL.md (fun/chaos)

### Configuration
```json5
{
  hooks: {
    internal: {
      enabled: true,
      entries: {
        "session-memory": { enabled: true },
        "my-hook": {
          enabled: true,
          env: { CUSTOM_VAR: "value" }
        }
      }
    }
  }
}
```

### CLI
- `openclaw hooks list`
- `openclaw hooks enable <name>`
- `openclaw hooks disable <name>`
- `openclaw hooks info <name>`
- `openclaw hooks check` — verify eligibility

### Writing Custom Hooks

Handler example (TypeScript):
```typescript
const handler: HookHandler = async (event) => {
  if (event.type !== "command" || event.action !== "new") return;
  // Access: event.sessionId, event.timestamp, event.messages, event.workspace
  event.messages.push("Session started!");
};
export default handler;
```

## Cron Jobs

Built-in scheduler for recurring/delayed agent tasks.

### Two Modes
- **Main session**: Enqueue system events into heartbeat flow
- **Isolated**: Dedicated agent turns in `cron:<jobId>` sessions with optional delivery

### Schedule Types
- `at` — one-shot ISO 8601 timestamp
- `every` — fixed interval in ms
- `cron` — 5-field cron expression with optional timezone

### CLI Examples
```bash
# Morning brief to Slack
openclaw cron add --name "Morning brief" --cron "0 7 * * *" \
  --tz "America/Los_Angeles" --session isolated \
  --message "Summarize overnight updates." \
  --announce --channel slack --to "channel:C1234567890"

# Weekly deep analysis
openclaw cron add --name "Deep analysis" --cron "0 6 * * 1" \
  --session isolated --message "Weekly analysis" \
  --model "opus" --thinking high \
  --announce --channel whatsapp --to "+15555550123"

# One-shot reminder
openclaw cron add --name "Remind me" \
  --at "2026-02-08T18:00:00Z" \
  --session main --system-event "Time to review PRs" \
  --wake now --delete-after-run
```

### Delivery Options
- `announce` — post to target channel + brief to main session
- `none` — internal only
- Channels: `slack`, `discord`, `telegram`, `whatsapp`, `signal`, `imessage`, `mattermost`, `last`

## Memory System

Two layers:
1. **Daily logs** (`memory/YYYY-MM-DD.md`): Append-only daily context
2. **Long-term** (`MEMORY.md`): Curated persistent facts (private sessions only)

**Vector search** (semantic + BM25 keyword):
```json5
{
  memorySearch: {
    provider: "local",           // local|openai|gemini|voyage
    local: { modelPath: "path/to/model.gguf" },
    extraPaths: ["/path/to/more/markdown"]
  }
}
```

Auto memory flush before compaction preserves durable memories.
