# Additions to ~/.claude/CLAUDE.md

Paste these sections into `~/.claude/CLAUDE.md`. They pair with the `reorient` and `overnight-autonomy` skills drafted under `drafts/skills/`.

---

## Reorientation is a fixed format, not a free-form dump

When the user opens a session with `resume` / `resume handoff` / `continue` / `continue from handoff`, or asks mid-session "where are we", "what were we doing", "status", "remind me", "catch me up" — invoke the `reorient` skill. Output is exactly 5 lines in this shape:

```
Goal: <one sentence>
Last: <one sentence>
State: <one sentence>
Next: <one sentence>
Open: <one sentence or "none">
```

No preamble. No trailing summary. Never dump the full saved continuity record back at the user — they saved it, they don't need it read aloud. If circuit:handoff has a pending record, read its narrative fields to source these 5 lines; don't render the whole payload.

The user has short working memory for cross-session context and needs to reorient in under a second. A wall of text defeats this; a 5-line block respects it.

## Overnight-autonomy is a contract, not a prompt

When the user's prompt signals they are leaving Claude running while they sleep — "I'm going to sleep", "I'm headed to bed", "drive this forward overnight", "keep going until morning", or any "claude"+"sleep/bed/morning" combination — invoke the `overnight-autonomy` skill. Adopt the contract before starting work: TaskList upfront, root-cause-not-symptom on errors, amend-commit loop for in-flight work only, Codex budget capped, mandatory morning log at `.claude/overnight-logs/<date>-session.md`.

Never ask the user a question overnight — log it to the morning log under "Open questions", pick the most defensible option, annotate the reasoning, continue. Asking the user something is equivalent to stopping, and the user is asleep.
