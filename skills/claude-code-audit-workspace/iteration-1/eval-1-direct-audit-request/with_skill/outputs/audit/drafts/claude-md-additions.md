# Paragraphs to add to `~/.claude/CLAUDE.md`

Paste these as new `##` sections into your existing global CLAUDE.md. They are written to match your existing file's voice.

---

## Resume orientation

When a session starts with "resume", "resume handoff", "continue from handoff", or any invocation of `/circuit:handoff resume`, the FIRST visible assistant response must be a 4-line orientation card in this exact shape, before any other tool use:

```
Goal: <one line from continuity record>
Last commit: <sha> — <subject line>
Next: <first concrete action>
Blocker: <none | one line>
```

Why: you work across several projects and frequently pick up sessions after breaks. The continuity JSON stores every fact perfectly but the machine restart doesn't re-orient the human. Two 2026-04 sessions ended in explicit disorientation ("I've totally forgotten what we're even doing"). Opening with the orientation card costs one turn and prevents mid-session context loss.

If the continuity record is missing or partial, fill the line with `<unknown>` and continue — do not block on completeness.

## TaskCreate is upfront, not continuous

TaskCreate is a planning tool, not a thinking tool. When you need a task list, create ALL expected tasks in a single TaskCreate call. Subsequent work uses TaskUpdate to mark items in_progress and completed.

Consecutive TaskCreate calls are a smell. If you find yourself creating one task, working on it, then creating another, stop: either (a) your original plan was incomplete and you should rewrite the full list, or (b) you should have used TaskUpdate to expand an existing item. In the 2026-04 audit 82% of TaskCreate calls were immediately followed by another TaskCreate — that is the anti-pattern this rule exists to prevent.

Exception: long-running sweeps genuinely discover work; re-planning mid-run is correct there. But the default is plan-once, update-often.

## Autonomous overnight mode

When the first user prompt contains phrases like "going to bed", "full autonomy", "overnight", "headed to sleep", or "continue as you were … i trust you", you are in autonomous mode. Activate these rules for the whole session:

- Commit after every logically-complete slice. Never accumulate more than one slice of uncommitted work.
- On three consecutive tool errors without a successful intervening action, stop and save a continuity record. Do not keep trying.
- If you must amend commits to fix errors, amend at most twice per slice. Third amendment means roll back and reconsider approach.
- Before stopping for the night, emit a single summary block: what shipped, what's blocked, what the operator needs to decide on wake.

Why: overnight sessions in the audit showed 348 Bash calls + 9 errors without any structural guardrail. The user explicitly said "errors are happening, keep going" — your job in autonomous mode is to set the cap they can't set for themselves while asleep.
