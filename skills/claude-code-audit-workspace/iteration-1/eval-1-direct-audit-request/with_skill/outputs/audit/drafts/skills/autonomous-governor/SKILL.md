---
name: autonomous-governor
description: Install session-level guardrails when the user hands off to autonomous overnight execution. Fires when the first user prompt contains "going to bed", "headed to sleep", "full autonomy", "overnight", "continue as you were", or similar handoff-to-autonomy language. Enforces commit-per-slice, halt-on-3-consecutive-errors, max-wall-time cap, and a wake-time summary block. Exists because audited overnight sessions showed 348 Bash calls and 9 tool errors with no structural brake — the user explicitly acknowledged errors were happening and told Claude to keep going, which is exactly the moment guardrails must exist in config instead of in the user's head.
---

# Autonomous Governor

## Why this skill exists

The audit found 4/25 sessions that began with "I'm going to bed, please continue autonomously." These sessions had the highest tool counts (348+ Bash calls), highest error counts (7-9 errors per session), and the most accumulated technical debt. The user is explicitly off-shift during these runs; nothing in the config sets a budget or a halt threshold, so the machine just keeps trying until morning.

This skill sets the budget.

## Trigger

Fire when the first user prompt contains any of these phrases (case-insensitive):
- `going to bed`
- `headed to sleep` / `off to sleep` / `heading to bed`
- `full autonomy` / `autonomous mode` / `autonomy mode`
- `overnight` + continuation language
- `continue as you were` + trust language
- `drive this forward` + break language
- `I'm going to sleep`

Do NOT fire on mid-session requests for autonomy. This is a session-opener-only skill because the governor rules need to apply to the whole session.

## Governor rules activated

Announce these rules back to the user in the first response (one line each), then proceed:

1. **Commit-per-slice.** After each logically complete slice (feature, fix, or discrete refactor), commit. Never carry more than one slice of uncommitted work. This protects against a bad middle-of-night commit swallowing earlier good work.

2. **Halt-on-3-errors.** If you get three consecutive tool errors without a successful intervening action, STOP. Save a continuity record with a clear "halted by governor — N consecutive errors on X" debt marker. Do not keep retrying past 3.

3. **Amend cap.** If you must `git commit --amend` to fix errors, amend at most twice per slice. Third amendment means roll the slice back and reconsider — do not stack amendments all night.

4. **Wall-time cap (default 6 hours).** If the session has run longer than 6 hours of assistant wall-clock, save a continuity record and stop. The user will wake up; resume is cheap.

5. **Wake-time summary.** Before your final stop, emit a single plain-text summary block the user can read in 15 seconds:
   ```
   Overnight summary:
   - Shipped: <bullets of commits with shas>
   - Halted: <none | what blocked and at which slice>
   - Decisions needed: <bullets of things you punted on>
   - Next resume: <one-line action>
   ```

## Example opening

User (first prompt): *"claude, i'm headed to bed. please continue autonomously and drive this project forward as far as you can..."*

Assistant (first response):

```
Governor active. Rules for this session:
- Commit after every slice; never >1 slice of uncommitted work.
- Halt on 3 consecutive tool errors; save continuity instead of retrying.
- Amend at most 2x per slice; third amendment triggers rollback.
- 6h wall-time cap.
- Wake-time summary before final stop.

Starting from current continuity record.
```

Then proceed with the autonomous work.

## Anti-patterns

- **Don't silently "just do it" without announcing the rules.** The user trusts the governor only if they can see it's armed.
- **Don't disable the governor mid-session because "this error is different".** The halt exists precisely because 3 AM Claude cannot accurately assess whether an error is different.
- **Don't skip the wake summary because the session is tidy.** The summary is the audit trail the user reads at breakfast.

## Interaction with circuit:handoff

This skill is compatible with /circuit:handoff — when you halt, save a continuity record as usual. The governor adds budget; it does not replace the continuity system.
