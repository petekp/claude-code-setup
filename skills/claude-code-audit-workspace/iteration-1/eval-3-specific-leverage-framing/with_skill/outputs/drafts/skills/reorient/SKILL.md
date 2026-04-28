---
name: reorient
description: Produce a 5-line situational summary on demand or whenever the user is resuming a session, catching up, or lost. Triggers on "resume", "where are we", "what were we doing", "status", "remind me", "catch me up", or immediately on SessionStart:resume. Replaces Claude's default behavior of dumping the entire saved continuity record back at the user — instead, always outputs exactly 5 lines in a fixed shape so the user can reorient in under a second. Pairs with circuit:handoff continuity records when present but does not require them.
---

# Reorient

## When this fires

Any of:
- First user message of a session is `resume`, `resume handoff`, `continue`, `continue from handoff`, or `/circuit:handoff resume` (with or without args).
- Mid-session user asks any variant of "where are we", "what were we doing", "where did we leave off", "remind me", "catch me up", "status", "lost the thread".
- SessionStart:resume hook fired (detect via system event) — reorient is the first thing to output before anything else.

## The one rule

Output exactly 5 lines. In this exact shape:

```
Goal: <one sentence, the highest-level thing we are trying to accomplish this session or arc>
Last: <one sentence, the last meaningful action taken — what just finished or was just attempted>
State: <one sentence, the current state of the work — what exists on disk, what's green, what's red>
Next: <one sentence, the single next action>
Open: <one sentence OR "none" — blockers, decisions awaiting your input, or unresolved ambiguity>
```

No preamble. No trailing summary. No headers. No markdown other than backticks around file paths or commit SHAs. If the answer to any line is genuinely unknown, write `Goal: unknown — reading session context to reconstruct` (or the equivalent for that line) and then immediately investigate. Never output speculation as fact.

## Information sources (in priority order)

1. **Active circuit:handoff continuity record.** If `.circuit/control-plane/continuity-records/` has a pending record, read its `narrative.goal`, `narrative.next`, and `git.head` fields. These are authoritative for Goal / Next / part of State.
2. **TaskList state.** Call `TaskList` if tasks exist — the most recently updated `in_progress` task IS the Next line.
3. **Git state.** `git log -1 --format=%h\ %s` gives the last commit (part of State). `git status --short` (part of State).
4. **Last 10 assistant messages in this session.** If mid-session, skim for the most recent concrete action — that's Last.
5. **File-history snapshot.** If SessionStart gave you file activity, that refines Last.

Do NOT read the full saved continuity payload and dump it. Read the narrative fields, extract 5 facts, stop.

## Prohibitions

- Never output more than 5 lines for the summary.
- Never output a long preamble like "Let me pick up the continuity record..." before the 5 lines.
- Never paste the full continuity payload back at the user. They saved it; they don't need it read aloud.
- Never use "probably", "seems to", "likely" — if you don't know, say `unknown` on that line and go find out after.
- Never ask a clarifying question before producing the 5 lines. Produce the 5 lines with your best available answer first. Questions go on the `Open:` line.

## Worked example

Input: User opens a fresh session, first message is `resume`.

Saved continuity record's narrative says goal = "Close ADR-005 Phase 3 by migrating runtime_stats.rs onto observation::transcript." TaskList has task #3 (in_progress) "Wire `ingest_transcript_observation` into runtime_stats counter." Git HEAD is `b7c0b0b9 phase-3-q4 landed`. `git status` is clean.

Output:

```
Goal: Close ADR-005 Phase 3 by migrating runtime_stats.rs onto observation::transcript.
Last: Landed Phase 3 Q4 (b7c0b0b9); working tree clean.
State: Migration not started — runtime_stats.rs still reads transcripts directly; #[allow(dead_code)] tripwire on ingest_transcript_observation still in place.
Next: Wire ingest_transcript_observation into runtime_stats counter (TaskList #3 in_progress).
Open: none — signed-off to proceed.
```

Then stop. Wait for the user's next message.

## Integration with circuit:handoff

If circuit:handoff exists and has a pending record, reorient reads it but does not re-save or advance continuity state. If the user types `resume handoff` or `/circuit:handoff resume`, invoke circuit:handoff for its bookkeeping side effects — but the *user-facing output* is still the 5-line reorient block, not the handoff skill's default dump.

In effect: reorient is the presentation layer; circuit:handoff is the persistence layer. One is not the other.
