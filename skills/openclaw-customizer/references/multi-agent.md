# OpenClaw Multi-Agent Routing

## Core Concept

An agent is a fully isolated AI persona with its own workspace, state directory, sessions, and auth. Multiple agents run in a single Gateway instance — different personalities, models, and capabilities.

## What Each Agent Gets

| Component | Default Path |
|-----------|-------------|
| Workspace | `~/.openclaw/workspace-<agentId>` |
| State dir | `~/.openclaw/agents/<agentId>/agent` |
| Sessions | `~/.openclaw/agents/<agentId>/sessions/` |
| Auth | `~/.openclaw/agents/<agentId>/agent/auth-profiles.json` |

Credentials are NEVER shared between agents. Never reuse `agentDir` across agents.

## Configuration

```json5
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        name: "Home Assistant",
        workspace: "~/.openclaw/workspace-home",
        model: "anthropic/claude-sonnet-4-5",
        identity: { name: "Luna", emoji: "moon", theme: "soft" }
      },
      {
        id: "work",
        name: "Work Agent",
        workspace: "~/.openclaw/workspace-work",
        model: "anthropic/claude-opus-4-6",
        identity: { name: "Atlas", emoji: "globe", theme: "pro" },
        sandbox: { mode: "all" },
        tools: { deny: ["exec"] }
      }
    ]
  }
}
```

## Routing Bindings

Deterministic message routing based on specificity (most specific wins):

```json5
{
  bindings: [
    // Peer-specific (highest priority)
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        peer: { kind: "dm", id: "+15551234567" }
      }
    },
    // Account-level
    {
      agentId: "home",
      match: { channel: "whatsapp", accountId: "personal" }
    },
    // Channel-level (lowest priority)
    {
      agentId: "work",
      match: { channel: "telegram" }
    }
  ]
}
```

**Specificity order:** peer > guild > team > account > channel > default agent

## Use Case Patterns

### Two WhatsApp Accounts, Two Agents
Personal number -> "home" agent, business number -> "work" agent.

### Cross-Channel Model Split
WhatsApp -> fast model (Sonnet) for everyday chat.
Telegram -> deep model (Opus) for complex work.

### Single Peer Override
One specific person in a channel-wide binding routes to a different agent.

### Group Chat Mentions
```json5
{
  agents: {
    list: [{
      id: "family",
      groupChat: {
        mentionPatterns: ["@family", "@familybot"]
      }
    }]
  }
}
```

## Per-Agent Sandbox & Tools

```json5
{
  agents: {
    list: [{
      id: "restricted",
      sandbox: { mode: "all", scope: "agent" },
      tools: {
        allow: ["read", "memory_search"],
        deny: ["exec", "write", "edit", "apply_patch"]
      }
    }]
  }
}
```

Note: `tools.elevated` is global/sender-based, not per-agent. Use tool denial for per-agent boundaries.

## Agent-to-Agent Communication

Disabled by default. Enable explicitly:
```json5
{
  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["agent-id-1", "agent-id-2"]
    }
  }
}
```

## CLI

```bash
openclaw agents add work
openclaw agents list --bindings
```

## Sub-Agents

Agents can spawn sub-agents:
```json5
{
  subagents: {
    model: "anthropic/claude-sonnet-4-5",
    maxConcurrent: 1,
    archiveAfterMinutes: 60
  }
}
```

Per-agent sub-agent permissions: `subagents.allowAgents` in agent list entries.
