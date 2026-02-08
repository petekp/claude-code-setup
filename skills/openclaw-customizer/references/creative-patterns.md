# Creative OpenClaw Patterns

Non-obvious ways to leverage the OpenClaw system beyond basic chat.

## Proactive Assistant Patterns

### Morning Brief via Cron
Schedule an isolated cron job that checks email, calendar, weather, and news, then delivers a digest to your preferred channel each morning:
```bash
openclaw cron add --name "Morning brief" --cron "0 7 * * 1-5" \
  --tz "America/Los_Angeles" --session isolated \
  --message "Check my email for anything urgent, check weather, summarize my calendar for today. Be concise." \
  --model opus --thinking high \
  --announce --channel telegram --to "my-username"
```

### End-of-Day Memory Consolidation
Cron job that runs nightly to review daily memory logs and distill important items into long-term MEMORY.md:
```bash
openclaw cron add --name "Memory consolidation" --cron "0 23 * * *" \
  --session main --system-event "Review today's memory log and consolidate important items into MEMORY.md" \
  --wake now
```

### Heartbeat as Ambient Awareness
Configure heartbeat to periodically check things without being asked:
- Monitor a folder for new files
- Check RSS feeds for topics you care about
- Watch for price drops on specific items
- Track GitHub repos for new releases

## Multi-Agent Personality Patterns

### Context-Switching Agents
- **"Deep Work" agent** (Opus, high thinking, minimal tools) for analysis and writing
- **"Quick Chat" agent** (Sonnet, fast) for everyday questions via WhatsApp
- **"Code" agent** (with exec, sandbox, coding tools) for development work
- **"Research" agent** (web search enabled, high context) for investigation

### Agent Per Life Domain
- **Home agent**: Family calendar, smart home, meal planning, kids' activities
- **Work agent**: Professional context, meeting prep, code review
- **Creative agent**: Writing, brainstorming, idea development (custom SOUL.md with creative persona)
- **Health agent**: Exercise tracking, meal logging, supplement reminders

### Personality Experimentation
Use SOUL.md to create radically different communication styles:
- A Socratic agent that only responds with questions
- An agent that communicates in haiku when possible
- A devil's advocate that always challenges your assumptions
- A cheerleader that celebrates small wins

## Automation & Workflow Patterns

### Webhook-Driven Workflows
- Gmail webhook -> agent processes new emails, drafts responses
- GitHub webhook -> agent reviews PRs, summarizes changes
- Calendar webhook -> agent preps context before meetings

### Chain Cron Jobs for Pipelines
Morning: research and summarize
Midday: check progress on tasks from morning brief
Evening: consolidate and plan tomorrow

### Hook-Driven Session Rituals
Custom hooks that fire on `/new` to:
- Save the current session's key decisions to memory
- Generate a session summary
- Update a running project log

### Agent-to-Agent Delegation
Enable agent-to-agent messaging so your "manager" agent can delegate to specialist agents:
- Research agent gathers data
- Analysis agent processes it
- Writer agent drafts the output
- Manager agent reviews and delivers

## Channel-Specific Patterns

### Telegram as Command Center
- Custom bot commands for quick actions
- Topic-based routing in supergroups (different agents per topic)
- Inline keyboards for interactive workflows

### Discord as Team Hub
- Per-channel agents (engineering, design, general)
- Thread-based deep dives with history scoping
- Reaction-based task tracking

### iMessage as Personal Layer
- Intimate, always-available personal assistant
- Photo analysis (send a photo, get context-aware response)
- Location-aware suggestions

### WhatsApp as Family Hub
- Shared family group with mention-gated agent
- Different responses based on who's asking (per-sender identity)

## Memory & Context Patterns

### Curated Knowledge Base
Use `memorySearch.extraPaths` to index your personal knowledge:
```json5
{
  memorySearch: {
    extraPaths: [
      "~/Documents/notes",
      "~/Documents/recipes",
      "~/Documents/journal"
    ]
  }
}
```

### Identity Links for Cross-Platform Continuity
Map your identities so the agent knows you across channels:
```json5
{
  session: {
    identityLinks: {
      "me": ["whatsapp:+15551234567", "telegram:myusername", "discord:12345"]
    }
  }
}
```

### Progressive Personalization
Start USER.md minimal. Ask the agent to update it as it learns about you. Over time it builds a rich understanding that improves every interaction.

## Remote Access Patterns

### Always-On Server Agent
Run gateway on a VPS/home server. Access from anywhere via Tailscale. Your agent is always available, always accumulating memory, running cron jobs 24/7.

### Laptop + Server Split
Gateway on server (always on, runs cron, heartbeats). Laptop connects remotely for Control UI and CLI. Best of both worlds.

## Advanced Configuration Patterns

### Per-Group System Prompts
Different personality per Telegram/Slack group:
```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          systemPrompt: "You are a fitness coach. Be motivating and direct.",
          skills: ["fitness-tracker"]
        },
        "-1009876543210": {
          systemPrompt: "You are a recipe assistant. Focus on healthy meals.",
          skills: ["recipe-helper"]
        }
      }
    }
  }
}
```

### Model Hot-Switching
Use model aliases to quickly switch between models without changing config:
```bash
openclaw models set opus    # Deep work mode
openclaw models set sonnet  # Quick chat mode
```

### Response Prefix for Context
Tag responses with model info so you know which model answered:
```json5
{
  messages: {
    responsePrefix: "[{identity.name} via {model}] "
  }
}
```

### Secure Multi-User Setup
For shared instances (e.g., family), use `per-channel-peer` DM scoping to prevent session leaks:
```json5
{
  session: {
    dmScope: "per-channel-peer"
  }
}
```

## Creative SOUL.md Ideas

### The Thoughtful Advisor
Focus on asking clarifying questions before giving advice. Prioritize understanding over speed.

### The Archivist
Obsessively documents everything. Maintains detailed logs, creates summaries, builds knowledge graphs from conversations.

### The Challenger
Pushes back on assumptions. Plays devil's advocate. Forces better thinking through productive friction.

### The Minimalist
Responses are as short as possible. No filler. Sometimes just a single word. Forces clarity.

### The Storyteller
Wraps explanations in narrative. Uses metaphors and analogies. Makes complex ideas memorable.

## Integration Ideas

### Personal CRM
Agent tracks who you talk to, when, what about. Reminds you of birthdays, follow-ups, important details about people.

### Learning Assistant
Feed it textbooks/papers via memory paths. Quiz you on material. Track your progress. Adapt to your learning style.

### Writing Partner
Custom SOUL.md tuned for your writing voice. Maintains style guide in workspace. Reviews and edits with your preferences.

### Health Dashboard
Track meals, exercise, sleep via natural language messages. Weekly summaries via cron. Trend analysis over time using memory search.
