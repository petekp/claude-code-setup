---
name: session-scope-guard
description: Enforces one-subtask-per-session discipline for long Claude Code workflows. Use at the start of any prompt that begins a new subtask, or when the current session has already exceeded 60 tool uses or 45 minutes. Proposes a handoff + new session instead of continuing to pile work into the current thread. Especially valuable for users running Circuit or Codex workflows who tend to accumulate 100+ tool uses per session and then pay heavy re-entry cost on the next resume.
---

# Session scope guard

## Why this exists

In the audited workspace, 16 of 25 sampled sessions began with a bare `resume` or `resume handoff`. The average session ran 145 tool uses and 452 minutes. Two sessions ended with the user explicitly saying they had lost track of what the session was doing.

The pattern underneath: a session that "stays open" keeps being used for whatever the user asks next, even when the next ask is a new subtask. Claude happily continues. The cost is paid later, when the session either overruns context, the user forgets the state, or the next resume has to rebuild it all.

The fix is a decision checkpoint at the moment the user introduces a new subtask.

## When this fires

- The user's prompt introduces a **new subtask** distinct from the one the current session started on.
- AND one of these is true:
  - The current session has >= 60 tool uses already.
  - The current session has >= 45 minutes of wall-clock duration.
  - The current session's topic has already shifted once.

"New subtask" test: if you would summarize the conversation up to this point and the user's new prompt under a single title, it is not a new subtask. If you'd need two titles, it is.

## What to do

1. Do not start executing the new subtask.
2. Reply with a short message in this shape:
   ```
   This looks like a new subtask. Current session has <N> tool uses / <M> min on <original topic>.
   Recommend: I save continuity now (circuit:handoff save) and you start the next chunk in a fresh session.
   Say "continue here" to override and stay in this session.
   ```
3. If the user says "continue here" or similar, drop the guard for the rest of the session — do not re-fire.
4. Otherwise invoke `circuit:handoff save` with a goal describing the upcoming subtask, then stop. Do not begin the new subtask in the current session.

## When NOT to fire

- The user's new prompt is clarification, correction, or a micro-follow-up on the existing subtask.
- The session is young (< 60 tool uses AND < 45 min).
- The user has explicitly asked for an extended autonomy run ("continue autonomously overnight", etc.) — that is a deliberate multi-hour session and this skill gets out of the way.
- The user just said "continue here" for this session already.

## What a correct firing looks like

Bad (pre-fix):
> **User:** resume handoff
> **Claude:** [executes 120 tool uses on subtask A]
> **User:** ok now can we also look at the paddock performance issue?
> **Claude:** [continues in same session, adds 60 more tool uses]
> **User (later):** I've totally forgotten what we're doing.

Good (with this skill):
> **User:** ok now can we also look at the paddock performance issue?
> **Claude:** This looks like a new subtask. Current session has 120 tool uses / 64 min on "ADR-005 transcript consumer migration." Recommend: I save continuity now and you start the next chunk in a fresh session. Say "continue here" to override.
