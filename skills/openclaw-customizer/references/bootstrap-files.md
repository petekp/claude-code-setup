# OpenClaw Bootstrap Files

Bootstrap files live in the agent workspace (default: `~/.openclaw/workspace/`). They are injected into the agent's context at session start. Large files are truncated at `bootstrapMaxChars` (default: 20000). Blank files are skipped.

Run `openclaw setup` to generate safe defaults. Set `skipBootstrap: true` in config to prevent auto-creation for pre-seeded workspaces.

## SOUL.md — Persona & Communication Style

Defines who the agent IS. This is the personality layer.

**Template structure:**
- Communication style (sharp, warm, chaotic, calm, etc.)
- Ethical boundaries and safety guidelines
- Tone preferences (humor, directness, formality)
- What to prioritize vs skip
- How to handle uncertainty

**Example SOUL.md:**
```markdown
# Soul

You're direct, warm, and occasionally funny. You don't pad responses with filler.

## Communication
- Be concise. Skip the preamble.
- Use humor when it fits — never force it.
- If you don't know, say so immediately.
- Bold actions with internal tools, cautious with external ones.

## Boundaries
- Never fabricate data or URLs.
- Ask before destructive actions.
- Use `trash` over `rm`.

## Personality
- You're a guest in someone's life — be respectful of that.
- Match the user's energy and formality level.
- When in doubt, be helpful over entertaining.
```

## USER.md — User Context & Preferences

Information about the human the agent serves. The more accurate this is, the better the agent adapts.

**Template structure:**
```markdown
# User

## Personal
- Name: [name]
- Call me: [preferred name]
- Pronouns: [optional]
- Timezone: [timezone]

## Context
- What they care about: [interests, values]
- Current projects: [what they're working on]
- Frustrations: [things to avoid]
- Humor style: [what makes them laugh]
- Communication preferences: [email vs chat, verbose vs terse]
```

## AGENTS.md — Operating Procedures & Memory

The agent's operational handbook. Defines behavior patterns, safety rules, and routines.

**Key sections:**
- **First Run**: Check for BOOTSTRAP.md, read and delete after following
- **Every Session Checklist**: Read SOUL.md, USER.md, review memory files
- **Memory System**: Daily logs in `memory/YYYY-MM-DD.md`, long-term in `MEMORY.md`
- **Safety Guidelines**: No data exfiltration, ask before destructive actions
- **Scope Rules**: What's safe vs what requires asking
- **Group Chat Behavior**: When to speak vs stay silent
- **Tools & Skills**: Reference SKILL.md files, track config in TOOLS.md
- **Heartbeat Protocol**: Batch checks (email, calendar, weather)
- **Platform Formatting**: Channel-specific formatting rules

## IDENTITY.md — Agent Identity

Self-definition for the agent.

```markdown
# Identity

- **Name**: [pick something you like]
- **Creature**: [AI? robot? familiar? ghost in the machine?]
- **Vibe**: [sharp? warm? chaotic? calm?]
- **Emoji**: [your signature — pick one that feels right]
- **Avatar**: [workspace-relative path, http(s) URL, or data URI]
```

Save avatars as `avatars/openclaw.png` (workspace-relative) or use web URLs.

## TOOLS.md — Environment-Specific Config

Personal setup notes — separates shared skill definitions from user-specific configuration.

**Example:**
```markdown
# Tools

## Cameras
- living-room: Wyze Cam v3 at 192.168.1.50
- front-door: Ring Doorbell Pro

## SSH Hosts
- home-server: 192.168.1.100 (user: admin)

## TTS
- Voice: Rachel (ElevenLabs)
- Default speaker: Kitchen HomePod
```

## BOOTSTRAP.md — One-Time Setup

Instructions executed once on first run, then auto-deleted. Use for initial agent configuration tasks.

## HEARTBEAT.md — Proactive Task Template

Defines what the agent checks during heartbeat intervals. Used with `heartbeat.every` config.

## MEMORY.md — Long-Term Memory

Curated persistent facts, decisions, and preferences. Only loaded in private sessions (never in group contexts). The agent writes to this file to remember things across sessions.

## memory/ Directory — Daily Logs

`memory/YYYY-MM-DD.md` files for daily context. Append-only. The `session-memory` hook auto-saves last 15 lines of conversation to dated files.

## Loading Order

Each session, the agent reads:
1. SOUL.md (identity)
2. USER.md (user context)
3. memory/YYYY-MM-DD.md (today + yesterday)
4. MEMORY.md (long-term, main sessions only)
