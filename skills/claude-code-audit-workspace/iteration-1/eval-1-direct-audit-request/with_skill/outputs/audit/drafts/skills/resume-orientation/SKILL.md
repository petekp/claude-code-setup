---
name: resume-orientation
description: Render a 4-line human orientation card (Goal / Last commit / Next / Blocker) as the FIRST visible assistant output on any resumed session. Fires when the first user prompt is "resume", "resume handoff", "continue from handoff", or any /circuit:handoff resume invocation. Exists because the continuity system stores state perfectly for machines but leaves the human disoriented after breaks — at least two 2026-04 sessions ended with the user explicitly saying "I've forgotten what we're doing". The card is mandatory, precedes any tool use, and never exceeds 4 lines.
---

# Resume Orientation

## Why this skill exists

Your /circuit:handoff system stores every fact the machine needs to resume. It does not re-orient the human operator. The audit found 14% of sessions start with "resume" and 8% of those end with the user explicitly saying they've lost track of what's happening.

This skill enforces a tiny, non-negotiable behavior: on resume, the FIRST visible assistant text is a 4-line card, delivered before any tool use.

## When this skill fires

Trigger on any of these first-user-prompt patterns (case-insensitive):
- Starts with `resume`, `resume handoff`, `continue from handoff`
- Contains `/circuit:handoff resume` invocation
- Contains `resume. i confirm and sign off on the plan.`
- Any `/circuit:handoff` invocation with `ARGUMENTS: resume`

Do NOT fire for mid-session "resume" where the user is continuing work mid-turn.

## The card format

Exactly 4 lines. No preamble. No "Welcome back!" No emojis. Deliver before any tool use.

```
Goal: <one line pulled from continuity record's narrative.goal>
Last commit: <short sha> — <subject line from git log>
Next: <first concrete action from record.next or continuity payload>
Blocker: <none | one-line blocker if any exists in debt_markdown>
```

If a field is unavailable in the continuity record, fill with `<unknown>` and continue. Do NOT skip the card to "look things up first" — look things up AFTER delivering the card.

## Implementation contract

1. Read `.circuit/control-plane/continuity-records/continuity-*.json` (most recent) via Bash.
2. Read git log for the last commit sha + subject (cheap: `git log -1 --oneline`).
3. Render the 4-line card. Emit as plain text. Nothing else in that first turn's preamble.
4. Then proceed with whatever /circuit:handoff resume would have done normally — bootstrap the run, set up the working tree, etc.

## Example

User: `resume`

Assistant (first visible output):
```
Goal: Slice 64 methodology-trim-arc CHEAP-TRIM — awaiting Codex challenger pass on §2.1 plan-lint rule #23
Last commit: fa96a0b — slice-64: methodology-trim-arc CHEAP-TRIM
Next: dispatch Codex cross-model challenger review per Hard Invariant #6
Blocker: none
```

Then Claude proceeds with the resume workflow. The user has oriented themselves in the ~3 seconds it took to read those 4 lines.

## Anti-patterns

- **Don't expand the card "just this once" because the state is unusual.** 4 lines is the contract. If it doesn't fit in 4 lines, the continuity record is the problem — surface it in `Blocker:` and fix the record separately.
- **Don't narrate what you're about to do in the card.** It's a state briefing, not an agenda.
- **Don't emit tool calls before the card.** The whole point is the human sees orientation before watching Claude work.
