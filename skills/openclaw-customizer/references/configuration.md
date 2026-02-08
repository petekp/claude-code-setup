# OpenClaw Configuration Reference

Config file: `~/.openclaw/openclaw.json` (JSON5 — comments and trailing commas OK).
Validation is strict; gateway refuses to start on errors. Run `openclaw doctor` to diagnose.

## Config Operations

- `config.apply` — validate, write, restart gateway
- `config.patch` — merge partial changes without overwriting other keys
- `$include` directive — include other JSON5 files (nest up to 10 levels)

## Environment Variables

Loading order:
1. Parent process env
2. `.env` in current working directory
3. `~/.openclaw/.env` (fallback)
4. Inline `env` config (non-overriding)

Use `${VAR_NAME}` substitution in config strings. Escape with `$${VAR}`.
Opt into shell env: `env.shellEnv.enabled: true` with `timeoutMs`.

## Agent Configuration

### Multi-Agent (`agents.list[]`)

| Field | Purpose |
|-------|---------|
| `id` | Stable identifier (required) |
| `default` | Marks primary agent |
| `name` | Display name |
| `workspace` | File ops directory (default: `~/.openclaw/workspace-<agentId>`) |
| `agentDir` | Auth/session storage (default: `~/.openclaw/agents/<agentId>/agent`) |
| `model` | Per-agent model override (`"provider/model"` or `{primary, fallbacks}`) |
| `identity` | Name, theme, emoji, avatar URL/path |
| `groupChat.mentionPatterns` | Regex array for text mentions |
| `sandbox` | Per-agent isolation |
| `subagents` | Spawning permissions via `allowAgents` |
| `tools` | Per-agent tool restrictions |

### Agent Defaults (`agents.defaults`)

**Model:**
- `model.primary` — e.g. `anthropic/claude-opus-4-6`
- `model.fallbacks` — backup models
- `imageModel` — separate model for image tasks
- `models.<provider/model>` — catalog with `alias` and `params` (temperature, maxTokens)

**Runtime:**
- `timeoutSeconds` — max execution (default: 600)
- `maxConcurrent` — parallel agent runs (default: 1)
- `mediaMaxMb` — inbound media cap (default: 5)
- `thinkingDefault` — `low|high|off` (default: off)
- `verboseDefault` — `on|off`
- `elevatedDefault` — `on|off`
- `contextTokens` — estimated context window (default: 200000)

**Workspace:**
- `workspace` — default: `~/.openclaw/workspace`
- `repoRoot` — repo root for system prompt (auto-detected)
- `skipBootstrap` — disable auto-creation of AGENTS.md, SOUL.md, etc.
- `bootstrapMaxChars` — max file length before truncation (default: 20000)
- `userTimezone` — timezone for system prompt
- `timeFormat` — `auto|12|24`

**Heartbeat:**
- `every` — interval (e.g. `30m`)
- `target` — delivery channel (`last|whatsapp|telegram|discord|slack|none`)
- `to` — recipient override
- `model` — optional fallback model
- `ackMaxChars` — max output (default: 300)

**Compaction:**
- `mode` — `default|safeguard`
- `reserveTokensFloor` — minimum reserve (default: 20000)
- `memoryFlush.enabled` — silent turn to store memories (default: true)
- `memoryFlush.softThresholdTokens` — trigger point (default: 4000)

**Context Pruning:**
- `mode` — `off|adaptive|aggressive`
- `keepLastAssistants` — protected messages (default: 3)
- `softTrimRatio` — oversized tool-result threshold (default: 0.3)
- `hardClearRatio` — full replacement threshold (default: 0.5)

**Sandbox:**
- `mode` — `off|non-main|all`
- `scope` — `session|agent|shared`
- `workspaceAccess` — `none|ro|rw`
- `docker.image`, `docker.network`, `docker.user`, `docker.memory`, `docker.cpus`
- `docker.setupCommand` — initial install script
- `browser.enabled` — sandboxed Chromium

**Sub-agents:**
- `model` — fallback model
- `maxConcurrent` — parallel limit (default: 1)
- `archiveAfterMinutes` — auto-cleanup (default: 60)

**Streaming:**
- `blockStreamingDefault` — `on|off`
- `humanDelay` — pause between block replies (`mode: off|natural|custom`)

## Messages Configuration

- `responsePrefix` — supports `{model}`, `{provider}`, `{identity.name}`, `{thinkingLevel}` templates
- `ackReaction` — emoji (default: `eyes`)
- `ackReactionScope` — `group-mentions|group-all|direct|all`
- `queue.mode` — `steer|followup|collect|interrupt` (default: collect)
- `queue.debounceMs` — batch delay (default: 1000)
- `inbound.debounceMs` — same-sender batch delay (default: 2000)

## Session Configuration

- `scope` — `per-sender|per-channel` (default: per-sender)
- `dmScope` — `main|per-peer|per-channel-peer|per-account-channel-peer` (default: main)
- `reset.mode` — `daily|idle`
- `reset.atHour` — reset time 0-23 (default: 4)
- `reset.idleMinutes` — sliding idle window
- `resetTriggers` — command list (default: `["/new", "/reset"]`)
- `identityLinks` — map canonical IDs to provider-prefixed peers (cross-channel identity)

## Tool Configuration

- `tools.profile` — base allowlist (`minimal|coding|messaging|full`)
- `tools.allow` / `tools.deny` — allowlist/denylist (deny wins)
- `tools.elevated.enabled` — allow elevated mode (default: true)
- `tools.web.search.enabled`, `.apiKey`, `.maxResults`
- `tools.web.fetch.enabled`, `.maxChars`, `.readability`
- `tools.exec.backgroundMs`, `.timeoutSec`
- `tools.agentToAgent.enabled` — inter-agent messaging (default: false)

## Gateway Settings

- `gateway.port` — listen port (default: 18789)
- `gateway.auth.token` — API auth token
- `gateway.cors` — CORS policy

## Logging

- `logging.level` — threshold (default: info)
- `logging.file` — path (default: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`)
- `logging.redactSensitive` — `off|tools`

## File Paths

| Component | Default Path |
|-----------|-------------|
| Config | `~/.openclaw/openclaw.json` |
| Workspace | `~/.openclaw/workspace` or `~/.openclaw/workspace-<agentId>` |
| Agent dir | `~/.openclaw/agents/<agentId>/agent` |
| Sessions | `~/.openclaw/agents/<agentId>/sessions/` |
| Auth | `~/.openclaw/agents/<agentId>/agent/auth-profiles.json` |
| Logs | `/tmp/openclaw/openclaw-YYYY-MM-DD.log` |
| Cron | `~/.openclaw/cron/jobs.json` |
| Skills | `~/.openclaw/skills` |
| Sandboxes | `~/.openclaw/sandboxes` |

## Built-in Model Aliases

- `opus` = `anthropic/claude-opus-4-6`
- `sonnet` = `anthropic/claude-sonnet-4-5`
- `gpt` = `openai/gpt-5.2`
- `gpt-mini` = `openai/gpt-5-mini`
- `gemini` = `google/gemini-3-pro-preview`
- `gemini-flash` = `google/gemini-3-flash-preview`

## Diagnostics

- `openclaw doctor` — identify issues
- `openclaw doctor --fix` — auto-repair
- `openclaw health` — health check
- `openclaw status` / `openclaw status --all` — service status
- `openclaw logs` — view logs
