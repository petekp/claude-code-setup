# claude-code-audit — iteration 1 results

**Date:** 2026-04-23
**Skill under test:** `/Users/petepetrash/.claude/skills/claude-code-audit/`
**Workspace:** `/Users/petepetrash/.claude/skills/claude-code-audit-workspace/iteration-1/`

## TL;DR

The skill ships. It cleanly forces the output from "observation" to "implementation" — every with-skill run produced 5–6 ready-to-install drafts; only the baseline whose prompt explicitly demanded drafts produced any.

| | with-skill | baseline |
|---|---|---|
| Mean machine pass rate | **1.0** | 0.5 |
| Reports with drafts | **3 / 3** | 1 / 3 |
| Reports citing session ids | **3 / 3** | 2 / 3 |
| Cross-run convergence on real patterns | **strong** | strong |

## Per-eval machine assertions

| Eval | with-skill | baseline | Δ |
|------|-----------:|---------:|--:|
| 1 — direct audit request | **1.00** | 0.60 | +0.40 |
| 2 — casual phrasing | **1.00** | 0.40 | +0.60 |
| 3 — explicitly demanded drafts | **1.00** | 0.50 | +0.50 |

**Baseline failures (consistent across all 3):**
- `has_drafts` failed for 2/3 baselines (the only baseline that produced drafts was eval-3, where the prompt explicitly demanded them).
- `sampled_many` failed for all 3 baselines — partly an artifact of the grader (it checks for the skill's `sample.json`/`extracted/` artifacts; baselines used custom Python scripts and didn't produce those files). Each baseline did sample 25–30 sessions, just via different machinery.
- `cites_session_ids` failed for eval-2 baseline only (used qualitative descriptions instead of session IDs).

## Cross-run convergence — the real signal in your workflow data

Five of six independent audits (across with-skill and baseline) converged on the same top patterns. That cross-validation matters more than any single report:

1. **`resume` is the most-typed user prompt.** 14–26 occurrences per sample. The current `inject-handoff-on-restart.sh` hook surfaces handoff context as information, not as a structured directive Claude must act on. Multiple agents independently drafted a `reorient`/`resume-orientation` skill + a CLAUDE.md rule that forces a 4-5 line orientation card before tool use.

2. **Stop-hook "auto-continuity guard" nag loop.** 28–44 guard injections in 30 days. Sessions show 3–5 consecutive nags within an hour, which Claude obediently follows into a save/stale/save cycle. Multiple agents drafted debounced versions (cooldown-on-time, autonomous-mode bypass, nag-cap).

3. **Skill graveyard.** 36–90 skills installed, ~6 actually fire in your sample. Both signal noise (large skill-list reminder every turn) and trigger competition (right skill loses to similarly-described wrong skill).

4. **Autonomous-overnight mode has no circuit breaker.** Sessions that open with "going to bed, full autonomy" produce 348 Bash calls and 9 errors with no halt rule. With-skill agents drafted an `autonomous-governor` skill (commit-per-slice, halt-on-3-errors, amend-cap, 6h wall, wake-summary).

5. **`/effort` setting silently clamps.** User set `effortLevel: "max"` (invalid value); harness silently clamped to `"low"`. Discovered by eval-1 baseline.

## Where the skill specifically helped

- **Forced drafts from passive prompts** (evals 1 & 2). Without the skill, Claude wrote prose ("you should consider…"); with the skill, Claude wrote the actual SKILL.md / CLAUDE.md paragraph / hook script.
- **Structured paper trail.** With-skill runs left `inventory.json`, `sample.json`, `extracted/<session>.json`, `aggregate.json`, `batch-N-findings.json` — verifiable. Baselines left freeform Python scripts.
- **Negative-space sections.** With-skill runs explicitly named patterns they checked for and ruled out; baselines didn't.

## Where the skill helped less

- **Eval 3** (prompt explicitly said "draft the actual implementations"). Both runs produced drafts; quality is comparable. The skill's "you draft the fix" non-negotiable is redundant when the user's prompt already says it. This is fine — the skill still wins on structure (reference docs, batch-findings.json) but the gap is narrower.

## Decision

**Ship iteration 1.** No iteration 2 needed. The skill produces exactly the output shape it was designed to force. The late `$SKILL_DIR`/`$AUDIT_DIR` path fix is in for real-world use.

## What you can do right now

1. **Try the skill.** Type "audit my Claude Code sessions" — the skill should auto-trigger.
2. **Install the drafts that are converged across runs.** Three patterns showed up in multiple independent audits and are real. The strongest drafted artifacts for each:
   - **Resume orientation:** `iteration-1/eval-3-.../with_skill/outputs/drafts/skills/reorient/SKILL.md`
   - **Stop-hook debouncer:** `iteration-1/eval-1-.../with_skill/outputs/audit/drafts/hooks/auto-continuity-guard-debounced.sh`
   - **Autonomous governor:** `iteration-1/eval-1-.../with_skill/outputs/audit/drafts/skills/autonomous-governor/SKILL.md`
3. **Optional second-iteration upside:** if you want even tighter triggering accuracy, the skill-creator's description-optimization loop can run on the current SKILL.md (`run_loop.py`). Not needed for shipping.
