# Session JSONL format

## Where sessions live

```
~/.claude/projects/<encoded-project-path>/<session-id>.jsonl
```

The directory name encodes the project's working directory: slashes become hyphens. Example:
- `/Users/petepetrash/Code/claude-code-setup` → `-Users-petepetrash-Code-claude-code-setup`

Each `.jsonl` file is one session. Each **line** is one event, JSON-encoded.

## Event types (the `type` field)

| type                     | meaning                                                                |
|--------------------------|------------------------------------------------------------------------|
| `user`                   | A user turn. Can be a human prompt, a tool result batch, or a wrapped command. |
| `assistant`              | An assistant turn. Contents include text, `thinking`, and `tool_use`. |
| `attachment`             | A hook result or other system-injected attachment.                     |
| `system`                 | System messages (subtypes like `status`, `warning`).                   |
| `file-history-snapshot`  | Internal bookkeeping of file tracking. Skip for analysis.              |
| `last-prompt`            | Marker of the last user prompt in the session.                         |

## Common top-level fields

- `timestamp` — ISO 8601 with millisecond precision and `Z` suffix
- `sessionId`  — stable session UUID
- `cwd`        — working directory for the session
- `gitBranch`  — branch name at the time of the event
- `version`    — Claude Code version
- `parentUuid` — pointer to the previous event in the turn graph
- `uuid`       — this event's UUID

## `user` event

`message.content` may be:

1. **A string** — the user's prompt, or a wrapped command (e.g. `<local-command-...>`, `<command-name>/foo</command-name>`). Real prompts don't start with `<`.
2. **A list of content items**, each with a `type`:
   - `text` — a piece of human text. Check for a `<...>` prefix to distinguish wrapped commands from real prompts.
   - `tool_result` — result from an assistant tool call. Check `is_error` for failures. `content` can be a string or list of `{type: text, text: ...}` items.

## `assistant` event

`message.content` is always a list. Each item has a `type`:

- `thinking` — opaque extended-thinking block. No readable text; ignore for audit.
- `text` — user-visible assistant prose.
- `tool_use` — a tool invocation with `name` and `input` (JSON args).

`message.usage` has token counts: `input_tokens`, `output_tokens`, `cache_*`.
`message.stop_reason` — `end_turn`, `tool_use`, `max_tokens`, etc.

## `attachment` event

`attachment.hookEvent` names the Claude Code hook ("SessionStart", "PostToolUse", etc.). `attachment.hookName` is a user-supplied label like `SessionStart:clear`. `stdout`/`stderr`/`exitCode` capture script output.

## Interrupts and cancellations

When the user interrupts an assistant turn, the next user event contains a text item with the substring `[Request interrupted by user`. Count these as failure signals.

## Practical notes for analysis

- **Tool result batches are user events.** Don't count `is_error: true` tool results as user dissatisfaction — they're tool failures. Track them separately.
- **Slash commands arrive wrapped.** A user running `/circuit:run` produces a `<command-name>...</command-name>` plus possibly a `<command-args>...</command-args>` wrapper. If you want the free-text the user typed after the slash command, use `args`.
- **Session start hooks spam the first few events.** Every session has an opening flurry of `attachment` events from hooks. They're noise for behavioral audit but useful to know what hooks are wired up.
- **Ignore `thinking` blocks.** They're not human-readable and not part of the interaction that matters for workflow audit.
- **Timestamps can back-date.** Some `file-history-snapshot` events carry a later timestamp than surrounding events. Use `first` and `last` over the full scan, not a single heuristic.

## What scripts in this skill already parse for you

- `inventory.py` — per-session metadata without reading content
- `extract.py`  — per-session extraction of prompts, tool sequences, errors, correction markers, outcome hint
- `render.py`   — human-readable transcript (strips thinking/snapshots, clips tool results)

Prefer these over rolling your own parser.
