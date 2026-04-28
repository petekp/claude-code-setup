# Claude Code Audit — 2026-04-23

Sampled **25 sessions** across **4 projects** (circuit-next, capacitor, ever/arc-design-studio, circuit), covering **2026-03-29 → 2026-04-23**. Total: 175 user prompts, 3,631 tool uses, 92 tool errors, 188.5 session-hours. Mean session: 7 prompts, 145 tool uses, 452 minutes.

## TL;DR

1. **You live in "resume" mode and it's the biggest context-drift tax you're paying.** 15/25 sampled sessions (60%) open with `resume`, `resume handoff`, or a raw `/circuit:handoff resume` command — yet there is no global skill ensuring the first thing Claude does is show you a 5-line situational summary. You forget what you're doing inside single long sessions too ("i actually forget what we've been focused on" — `68295abb`; "help me understand why this effort has taken SO long" — `81151565`). Fix: a global `reorient` skill + CLAUDE.md rule that forces Claude to produce a 5-line situational summary on every resume and on demand.
2. **Your overnight-autonomy workflow is a distinct, repeating first-class pattern — but it has no skill and no safety rails.** 4+ sessions open with "hey claude, i'm headed to bed"-style prompts that describe the same invariants (full autonomy, TaskList discipline, amend-commit-to-fix-errors, root-cause analysis, morning log). This is a skill, not a prompt. Fix: a new `overnight-autonomy` skill with explicit contract + a SessionStart hook that detects overnight mode and injects a guardrail header.
3. **Your circuit:handoff Stop hook nags on every turn where HEAD has advanced, generating the single largest source of injected text in your session log.** 9+ of the 52 "correction" hits in the aggregate are Stop-hook guard messages, not real user corrections. This is cognitive noise and token burn that trains Claude to save continuity on every turn even when the user has sub-minute edits. Fix: a cooldown wrapper around the continuity guard.

Each recommendation has a drafted implementation under `drafts/`.

---

## The top recommendations

### 1. Global "reorient in 5 lines" skill + CLAUDE.md rule
**Category:** Capability mismatch + context drift
**Evidence:** 15/25 sessions (60%) open with `resume` / `resume handoff` / `/circuit:handoff resume`. Sessions: `03422d07`, `0a876ff5`, `2b691fa5`, `32905b6f`, `50db8177`, `57173ff0`, `68295abb`, `7bba5176`, `81151565`, `8ba9caad`, `91fce543`, `a0c8538e`, `cc3f5848`, `f33baece`, `f3f8afbb`, `f81f89e2`. Mid-session forgetting: `68295abb` ("oh, perhaps, i actually forget what we've been focused on in this session. i think things might have gotten tangled a bit"), `81151565` ("Help me understand why this effort has taken SO long. I've totally forgotten what we're even doing.").
**Cost:** In long autonomy sessions (avg 452 min, 145 tool uses), you pay 30+ sec per resume of Claude choosing what to say, and often a full mid-session "wait, where are we?" re-summary costing 5–15k tokens to reconstruct. 15 resumes × 30 sec = 7.5 min of reorientation friction per week minimum; usually far more.
**Fix:** A global skill `reorient` that triggers on "where are we", "what were we doing", "resume", "status", "remind me", and is referenced from CLAUDE.md as the first thing to run on SessionStart:resume. Output is a strict 5-line format: Goal / Last action / Current state / Next step / Open questions. Integrates with circuit:handoff continuity when present but does not require it.
**Draft:** `drafts/skills/reorient/SKILL.md` + `drafts/claude-md-additions.md`

The pattern: your `circuit:handoff` skill saves enormous state blobs (2–8 KB of markdown per continuity record), but on resume Claude tends to dump all of it back at you (`81151565` resume response is ~800 words of "Suggestion: Fork (a) — migrate `runtime_stats.rs`..."). You don't need 800 words — you need 5 lines. The overwhelming blob IS the problem: it hides the three things you actually want to know (goal / next step / any blockers) inside a wall of context you already had. A `reorient` skill inverts this: always 5 lines, always the same shape, always answerable in under a second.

Secondary benefit: you have a CLAUDE.md rule "Provide context — help me out by reminding me of our progress and next steps" (line 29–31) but it's never actually invoked because there's no trigger phrase or hook tying it to resume. The drafted skill gives the doctrine teeth.

### 2. `overnight-autonomy` skill + SessionStart hook
**Category:** Repeated workflow (no skill), session lifecycle
**Evidence:** Sessions `32905b6f` ("hey claude, i'm headed to bed. as we did last night, i need you to go into full autonomy mode"), `2b691fa5` ("claude, i have to go back to sleep. please continue as you were... any error, even small, could propogate and multiply in subsequent slices. we need to identify and address the root cause"), `f3f8afbb` ("Claude, I'm going to sleep. I need you to resume the handoff and autonomously follow everything through to the end."). All three repeat the same rules — full autonomy, TaskList discipline, no escalation, amend-commit-to-fix-errors, morning log. These prompts are 150–250 words of re-typed doctrine every time.
**Cost:** You retype ~200 words × at least 4 sessions in the sample = 800 words of pure reinvention. Worse: each session interprets the doctrine slightly differently, so outcomes are inconsistent. Session `32905b6f` has 590 tool uses and 9 errors; `2b691fa5` has 341 tool uses and 7 errors. Error rate in overnight sessions is notably higher than the mean (3.7/session overall; overnight sessions trend 7–10).
**Fix:** A skill `overnight-autonomy` that fires on phrases like "I'm going to sleep", "headed to bed", "go full autonomy", "drive this forward overnight". The skill encodes your standard overnight contract (TaskList upfront, root-cause on errors, amend-commit loop, per-phase morning log written to a standard path, no Codex-assist escalation beyond configured budget). Paired with a SessionStart hook that detects an in-progress overnight run and re-injects the contract on resume.
**Draft:** `drafts/skills/overnight-autonomy/SKILL.md` + `drafts/hooks/overnight-guard.sh`

Why this is step-change and not marginal: overnight runs are *the* high-leverage usage mode for you — they're the one place Claude can compound work while you sleep. A 10% improvement in reliability there beats a 50% improvement anywhere else. Current state: you write the contract in prose every time, Claude interprets it, outcomes vary. A skill locks the contract.

### 3. Throttle the circuit:handoff Stop hook
**Category:** Tool / hook friction
**Evidence:** In the 25-session sample, 9+ distinct "Stop hook feedback: Auto-continuity guard" injections appear in the correction stream. Examples: `91fce543` fires the guard 3× in one session (`05:02:05`, `05:06:53`, `05:10:26` — roughly 5-minute intervals). `2b691fa5`, `57173ff0`, `7bba5176`, `8ba9caad` all show the same pattern. Each firing is ~500 tokens of nag text.
**Cost:** ~500 tokens × 9 firings in 25 sessions = ~4,500 tokens of pure nag, not counting Claude's responses to the nag. Worse: the guard fires even on trivial single-commit edits, training Claude to treat every commit boundary as a continuity checkpoint. This creates a tool-use attractor where Claude keeps reaching for `circuit:handoff save` instead of doing the work.
**Fix:** Wrap the Stop hook's continuity guard with a cooldown: only nag if (a) HEAD has advanced more than N commits, OR (b) more than M minutes have passed since last continuity record, OR (c) this is a named-branch-merge point. Drop the single-commit-advance trigger — it's noise at the granularity you work at.
**Draft:** `drafts/hooks/circuit-handoff-cooldown.sh` + `drafts/settings-diff.md`

The audit deliberately tested whether this was just "hook doing its job" — it isn't. In `91fce543` the user's final prompt begins "1. Absolutely the meta-arc. It's alarming that we're this late in the game and we're still discovering major issues..." — the meta-thread is frustration about discovery latency, and the Stop hook firing three times in the same hour is adding to that load, not relieving it.

---

## Quantitative snapshot

| metric                    | value |
|---------------------------|-------|
| Sessions analyzed         | 25 |
| Projects represented      | 4 |
| User prompts              | 175 |
| Tool uses                 | 3,631 |
| Tool errors               | 92 (3.68/session) |
| Interruptions             | 3 |
| Avg session duration      | 452 min |
| Top tool                  | Bash (1,666) |
| Top slash command         | `/circuit:handoff` (91) |
| Sessions likely abandoned | 4 (16%) |

**Top tools:** Bash 1,666 · Edit 512 · Read 501 · TaskUpdate 329 · Write 174 · TaskCreate 173 · Grep 132 · Skill 41
**Top slash commands:** `/circuit:handoff` 91 · `/circuit:run` 34 · `/codex` 11 · `/circuit:explore` 4
**Hooks firing most:** `SessionStart:clear` 66 · `UserPromptSubmit` 26 · `Stop` 13 · `SessionStart:resume` 11

---

## Secondary findings (tier 2)

- **`Bash→Bash` bigram is 877 — 24% of all tool transitions.** Worth spot-checking whether some recurring verification patterns could be scripts, but Bash is also the natural language of your circuit engine. Not a step change in isolation. — `32905b6f`, `2b691fa5`
- **Task list is heavily used but rarely shown to you.** `TaskUpdate` is 329 calls vs `TaskList` only 3. Claude is tracking progress internally but you're flying blind on what's queued. A post-phase-completion summary would help. — all long sessions
- **`f33baece` and `cc3f5848` both start with bare `resume` despite existing `circuit:handoff` state.** Handoff skill works but resume ergonomics assume Claude will reformat — it doesn't, it dumps. Covered by recommendation 1.
- **Sensei doctrine is dormant.** CLAUDE.md says "proactively look for opportunities to help me become a stronger engineer" — no sampled session showed this firing. Not a step change, but flag for a future iteration: the rule needs a trigger, not a wish.

---

## Negative space — what the audit looked for and didn't find

Looked for and ruled out as non-issues: recurring `is_error: true` patterns pointing to a permissions gap (errors were distributed, not clustered around specific commands); a skill-dead-code pattern in your ~60 installed skills (your skills are visibly firing — `Skill` tool has 41 invocations in 25 sessions); the "test afterward" correction loop common in other audits (you use `tdd` discipline correctly, when tests matter). What pushed these out of the top-3 was leverage: the resume + overnight patterns hit every week, every project, and compound with session length. The Stop-hook nag compounds because it trains a bad attractor. The other candidates don't scale the same way.

One thing the audit did not sample well: non-circuit projects. 21/25 sampled sessions are in circuit-family projects. If your ever/arc-design-studio workflow is meaningfully different, a second-pass audit should stratify by project type.

---

## Drafts

All drafted implementations live under `drafts/`:

- `drafts/skills/reorient/SKILL.md` — global "situational summary in 5 lines" skill
- `drafts/skills/overnight-autonomy/SKILL.md` — encoded overnight-autonomy contract
- `drafts/claude-md-additions.md` — two additions: (a) resume-reorient doctrine, (b) overnight trigger doctrine
- `drafts/hooks/overnight-guard.sh` — SessionStart hook re-injecting overnight contract on resume
- `drafts/hooks/circuit-handoff-cooldown.sh` — wrapper that suppresses the Stop hook nag unless real change threshold is met
- `drafts/settings-diff.md` — how to wire the cooldown into `~/.claude/settings.json`

---

## What to do next

1. Paste `drafts/claude-md-additions.md` into `~/.claude/CLAUDE.md`.
2. Copy `drafts/skills/reorient/` into `~/.claude/skills/reorient/`.
3. Copy `drafts/skills/overnight-autonomy/` into `~/.claude/skills/overnight-autonomy/`.
4. Install `drafts/hooks/circuit-handoff-cooldown.sh` and patch your Stop hook per `drafts/settings-diff.md` — this one change is likely the highest-leverage single edit in this report.
5. (Optional) wire `drafts/hooks/overnight-guard.sh` into SessionStart:resume so resumed overnight runs re-inject the contract.
6. Re-run `claude-code-audit` in 14 days. Sanity-check: the `resume` first-prompt rate should drop from 60% to <20% (replaced by actual goal-stated prompts), and the Stop-hook nag count should be 0 below threshold.
