# OpenClaw Channel Configuration

Channels connect OpenClaw to messaging platforms. Each has its own allowlists, DM policies, group settings, and formatting.

## Common Channel Settings

All channels share these patterns:
- `dmPolicy` — `pairing|allowlist|open|disabled` (default varies)
- `allowFrom` — sender allowlist (format varies by channel)
- `historyLimit` — group message context (default: 50)
- `mediaMaxMb` — inbound media size cap
- `retry.attempts`, `.minDelayMs`, `.maxDelayMs` — outbound retry
- `blockStreaming` — force streaming on/off
- `responsePrefix` — template-based outbound prefix
- `accounts.<id>` — multi-account support

## WhatsApp

```json5
{
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],       // E.164 numbers
      dmPolicy: "pairing",               // pairing|allowlist|open|disabled
      sendReadReceipts: true,
      textChunkLimit: 4000,
      chunkMode: "length",               // length|newline
      mediaMaxMb: 50,
      // Multi-account:
      accounts: {
        personal: { /* config */ },
        work: { /* config */ }
      },
      // Group config:
      groupPolicy: "allowlist",           // allowlist|open|disabled
      groupAllowFrom: ["group-id-1"],
      groups: {
        "group-id": {
          requireMention: true,
          allowFrom: ["+15555550123"]
        }
      }
    }
  }
}
```

Login: `openclaw channels login` (WhatsApp Web QR pairing).
Recommended: Use a separate phone number exclusively for the assistant.

## Telegram

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "${TELEGRAM_BOT_TOKEN}",
      dmPolicy: "allowlist",
      allowFrom: ["username", 123456789],  // username or chat ID
      historyLimit: 50,
      replyToMode: "off",                  // off|first|all
      linkPreview: true,
      streamMode: "partial",               // off|partial|block
      mediaMaxMb: 5,
      configWrites: true,
      // Custom bot menu commands:
      customCommands: [
        { command: "new", description: "Start new session" }
      ],
      // Groups:
      groups: {
        "-1001234567890": {
          requireMention: true,
          allowFrom: ["username"],
          systemPrompt: "Custom prompt for this group",
          skills: ["skill-name"]
        }
      }
    }
  }
}
```

Setup: Create bot via @BotFather, get token, set `botToken`.
Topic format: `-1001234567890:topic:123` or `-1001234567890:123`.

## Discord

```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "${DISCORD_BOT_TOKEN}",
      allowBots: false,
      mediaMaxMb: 8,
      dm: {
        enabled: true,
        policy: "allowlist",
        allowFrom: ["user-id", "username"],
        groupEnabled: false
      },
      // Per-server config:
      guilds: {
        "guild-id": {
          requireMention: true,
          users: ["user-id"],
          channels: {
            "channel-name": {
              requireMention: false,
              systemPrompt: "Custom prompt"
            }
          }
        }
      },
      historyLimit: 20,
      textChunkLimit: 2000,
      maxLinesPerMessage: 17,
      replyToMode: "off",
      reactionNotifications: "off",        // off|own|all|allowlist
      // Tool actions:
      actions: {
        reactions: true,
        messages: true,
        threads: true,
        pins: true
      }
    }
  }
}
```

## Slack

```json5
{
  channels: {
    slack: {
      botToken: "${SLACK_BOT_TOKEN}",
      appToken: "${SLACK_APP_TOKEN}",
      dm: {
        enabled: true,
        policy: "allowlist",
        allowFrom: ["user-id"]
      },
      channels: {
        "channel-id": {
          requireMention: true,
          allowBots: false,
          skills: ["skill-name"],
          systemPrompt: "Custom prompt"
        }
      },
      historyLimit: 50,
      allowBots: false,
      replyToMode: "off",
      thread: {
        historyScope: "thread",            // thread|channel
        inheritParent: false
      },
      textChunkLimit: 4000,
      // Slash command:
      slashCommand: {
        enabled: true,
        name: "openclaw",
        ephemeral: true
      }
    }
  }
}
```

## iMessage

```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "imsg",
      dmPolicy: "allowlist",
      allowFrom: ["+15555550123", "email@icloud.com"],
      historyLimit: 50,
      includeAttachments: false,
      mediaMaxMb: 16,
      service: "auto",                     // auto|icloud|sms
      region: "US"                         // US|CN
    }
  }
}
```

Requires macOS with Messages app access.

## Signal

```json5
{
  channels: {
    signal: {
      reactionNotifications: "off",        // off|own|all|allowlist
      historyLimit: 50
    }
  }
}
```

## Google Chat

```json5
{
  channels: {
    googlechat: {
      serviceAccountFile: "path/to/service-account.json",
      webhookPath: "/googlechat",
      dm: { enabled: true, policy: "allowlist" },
      groups: { "space-id": { /* config */ } },
      mediaMaxMb: 20
    }
  }
}
```

## Microsoft Teams

See docs: `https://docs.openclaw.ai/channels/msteams.md`

## Matrix

See docs: `https://docs.openclaw.ai/channels/matrix.md`

## Mattermost

```json5
{
  channels: {
    mattermost: {
      botToken: "${MATTERMOST_BOT_TOKEN}",
      baseUrl: "https://your-server.com",
      dmPolicy: "allowlist",
      chatmode: "oncall",                  // oncall|onmessage|onchar
      textChunkLimit: 4000
    }
  }
}
```

## Channel Routing (Bindings)

Route messages to specific agents based on channel, account, peer:

```json5
{
  bindings: [
    {
      agentId: "work",
      match: {
        channel: "telegram",
        peer: { kind: "dm", id: "boss-username" }
      }
    },
    {
      agentId: "home",
      match: { channel: "whatsapp", accountId: "personal" }
    }
  ]
}
```

Specificity order: peer > guild > team > account > channel > default.
