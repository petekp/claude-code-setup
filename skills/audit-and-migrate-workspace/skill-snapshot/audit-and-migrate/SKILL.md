---
name: audit-and-migrate
description: |
  Slice-based, evidence-driven framework for systematically auditing and migrating codebases with accumulated technical debt. Use whenever facing a large refactoring effort, codebase consolidation, tech debt paydown, test suite overhaul, dependency standardization, architecture cleanup, or any multi-session migration. Also use when asked to "audit the codebase", "migrate from X to Y", "pay down tech debt", "consolidate duplicated code", "standardize on one approach", "systematic refactoring", or when a migration effort will span multiple sessions and needs protection against agent drift, vestigial code accumulation, or unverified correctness claims. If someone mentions ratchets, slices, migration playbook, or anti-vestigial discipline, this is definitely the skill they want.
---

# Systematic Codebase Audit & Migration

A structured methodology for tackling codebases with accumulated technical debt. Works in two phases — **audit** (understand and freeze the problem) then **migrate** (pay it down slice by slice with proof).

## Why This Methodology Exists

Agents without structure fail at three things during large refactors:

1. **Drift** — forgetting what's been done, redoing completed work, or leaving things half-finished across sessions. This wastes time and introduces conflicts.
2. **Vestigial code** — adding new implementations without deleting what they replace. The codebase grows when it should be shrinking.
3. **Intuition-driven confidence** — saying "this should work" instead of proving it. When an agent can't point to a deterministic check that passed, its confidence is unfounded.

Every rule in this methodology prevents one of these three failures. When a rule feels heavy, that's the justification.

---

## Session Protocol

**Do this at the start of every session.** This is what makes the methodology survive context compaction and session switches.

### Starting a Session

1. Check if control plane artifacts exist (look in `.claude/migration/` or wherever the project stores them):
   - `CHARTER.md`, `DECISIONS.md`, `SLICES.yaml`, `MAP.csv`
2. If they **don't exist** → you're starting fresh. Begin with Phase 1 (Audit).
3. If they **do exist** → read them in this order:
   a. `CHARTER.md` — re-absorb the mission and invariants
   b. `DECISIONS.md` — understand what's been decided and why
   c. All `in_progress` slices in `SLICES.yaml` — this is your current work
   d. Run the guard script to see current status

### Ending a Session

Write a `HANDOFF.md` file (or append to the most recent commit message if the handoff is small). Four parts, no exceptions:

1. **What changed** — files modified, slices advanced, decisions made
2. **What is now true** — new invariants, completed slices, updated budgets
3. **What remains** — incomplete slices, known risks, blocking issues
4. **Exact next steps** — the specific command or test sequence to run next

Example:
```markdown
## Handoff — 2026-03-01
### Changed
- Completed slice-003 (user routes auth migration)
- Ratchet budget for jwt.verify decreased from 8 → 5

### Now True
- All user route auth goes through withAuth() middleware
- Behavioral tests cover user routes at 100%

### Remains
- slice-004 (data routes) ready to start
- slice-005 (admin routes) blocked on Decision 4 re: webhook auth

### Next Steps
1. Run `./guard.sh --status` to confirm baseline
2. Start slice-004: mark in_progress in SLICES.yaml
3. Write behavioral tests for src/api/posts.ts and src/api/comments.ts
```

This format survives context compaction. The next session (or a different agent) can pick up without information loss.

---

## Phase 1: Audit

The audit phase is about understanding the problem space before changing production code. Measuring first creates the foundation that makes migration safe.

### Step 1: Create the Charter

Create `CHARTER.md` using the template in [references/templates/CHARTER.md](references/templates/CHARTER.md). This defines:

- **Mission** — one sentence: what are you migrating and why
- **Invariants** — things that must remain true throughout (e.g., "all existing tests pass", "no user-facing behavior changes")
- **Non-goals** — things you're explicitly NOT doing (prevents scope creep)
- **Guardrails** — process rules

The charter is the constitution. When in doubt about scope, check the charter.

### Step 2: Inventory the Problem Space

Catalog everything in the target domain — code, tests, scripts, docs, configuration, tooling. For each item, classify by leverage:

- **High** — keep and expand. Good code the migration builds on.
- **Medium** — keep but refactor. Structurally sound but needs updating.
- **Low** — replace. This is the debt you're paying down.

Be exhaustive. Anything missed here risks becoming vestigial code later.

### Step 3: Measure Anti-Patterns

Use grep/ripgrep to count specific weak patterns. The goal is concrete numbers, not vibes.

For each pattern, record:
- The grep pattern used to find it
- The current count
- Why it's problematic

**Examples** (adapt to your codebase):
```
Pattern: source\.contains\(        Count: 43    Problem: Tests code shape, not behavior
Pattern: Task\.sleep\(             Count: 17    Problem: Non-deterministic timing
Pattern: struct Scenario           Count: 22    Problem: Duplicated test scaffolding
Pattern: require\(.*/utils/old-    Count: 8     Problem: Imports from deprecated module
```

### Step 4: Freeze with CI Ratchets

For each measured anti-pattern, create a ratchet that enforces a maximum budget equal to the current count. See [The CI Ratchet Pattern](#the-ci-ratchet-pattern) for the technique.

This is the most important step. Once ratchets are in place, debt can only decrease. No one — human or agent — can accidentally reintroduce eliminated patterns.

### Step 5: Write the Audit Document

Create a comprehensive audit doc. Include:
- Method used (how you inventoried and measured)
- Current metrics (all anti-pattern counts)
- Leverage assessment (what's high/medium/low)
- Hard conclusions (what needs to change — be direct)
- Guardrails added (what CI checks are now in place)
- Proposed slices (your initial plan for Phase 2)

### Step 5b: Produce Practical Reference Material

Alongside the control plane artifacts, produce domain-specific reference material that will accelerate the actual migration work:

- **Translation guide** — a lookup table mapping old patterns to their new equivalents (e.g., raw SQL queries → ORM calls, Redux patterns → Zustand patterns). This saves every slice from reinventing translations.
- **Edge cases and gotchas** — document known pitfalls when converting between the old and new approaches. Things that look like straightforward translations but have subtle behavioral differences.
- **Code pattern examples** — concrete before/after code samples for the most common migration scenarios.

This material pays for itself many times over — without it, every slice (and every agent session) independently rediscovers the same conversion patterns. With it, the knowledge is captured once and reused throughout.

### Step 6: Create Remaining Artifacts

Using templates in [references/templates/](references/templates/):
- `DECISIONS.md` — seed with any architecture decisions from the audit
- `SLICES.yaml` — populate with proposed slices from the audit doc
- `MAP.csv` — populate with all files from the inventory

---

## Phase 2: Migration

Migration is slice-by-slice debt paydown. Each slice is a vertical, outcome-based unit of work that can be independently verified.

### Calibrate Before Starting

If the audit was done without full codebase access (e.g., based on a description or partial exploration), the first action in Phase 2 is calibrating the ratchet budgets against reality. Run every grep pattern from the audit document and update the guard script budgets with actual counts. This is a quick, high-value step — incorrect budgets produce either false failures (budget too low) or silent regression (budget too high).

Also run the guard script with a `--status` flag (if you added one) to confirm a clean green baseline before starting any slice work.

### Picking the Next Slice

Review `SLICES.yaml` for the highest-leverage unblocked slice:
1. Check dependencies — don't start a slice whose dependencies aren't `done`
2. Prefer high-leverage slices (ones that eliminate the most anti-pattern instances or unblock other slices)
3. Prefer smaller blast radius when leverage is equal

### The Slice Lifecycle

Every slice follows four stages.

#### A. Start
1. Mark the slice `in_progress` in `SLICES.yaml`
2. Ensure all files this slice will touch are listed in `MAP.csv`
3. Define `deletion_targets` in `SLICES.yaml` before writing any code
4. Run the guard script to get a clean baseline

#### B. Build (TDD-first)

1. **Write tests that fail without the new behavior.** These tests define "done" for this slice. Test behavior through public interfaces, not implementation details.
2. **Implement the canonical path.** The new, correct way of doing the thing.
3. **Migrate call sites.** Update everything that uses the old path to use the new one.
4. **Delete the replaced code in this same slice.** This is a hard rule. The reasoning: agents that defer deletion forget. Old code becomes vestigial. By the time anyone notices, call sites have drifted back to using it. Deleting in the same change makes the migration atomic.

#### C. Verify

Run all applicable checks:
1. Guard script passes — no unmapped files, no denylist violations
2. Test suites pass — both new tests and all existing tests
3. Replay/smoke scenarios pass — if defined in `SLICES.yaml`, run them
4. Charter invariants hold — re-check against `CHARTER.md`

#### D. Close

1. Confirm all `deletion_targets` are physically removed (not commented out, not behind a flag — gone)
2. Update `MAP.csv` — mark migrated files, remove deleted files
3. Update `SLICES.yaml` — mark slice `done`, record what was accomplished
4. Add denylist patterns for removed names/paths
5. Decrement CI ratchet budget if this slice eliminated anti-pattern instances
6. Record any new decisions in `DECISIONS.md`

---

## The CI Ratchet Pattern

The methodology's signature technique. Instead of eliminating all instances of a bad pattern at once:

1. **Count** the pattern (e.g., 43 `source.contains` assertions)
2. **Set the budget** — CI maximum equals current count (43)
3. **Decrement** — each slice that eliminates instances reduces the budget
4. **Enforce** — CI fails if the count exceeds the budget
5. **Reach zero** — budget eventually hits 0, pattern fully eliminated
6. **Keep the guard** — maintain the check at 0 as a permanent regression guard

**Why this works so well for agents:** It provides a clear, mechanical pass/fail signal. No judgment about whether a few instances are "OK." The ratchet answers definitively. Progress is visible: 43 → 38 → 29 → 15 → 7 → 0 is a concrete trajectory.

**Implementation:** Typically a shell script that greps for the pattern, counts matches, compares against the budget, and exits non-zero if count exceeds budget. See [references/guard-script-pattern.md](references/guard-script-pattern.md) for the pattern. Wire it into CI or pre-commit hooks.

---

## Anti-Vestigial Discipline

Vestigial code — old code replaced but never deleted — is the biggest source of codebase bloat in agent-assisted development. Agents optimize for "does the new thing work?" without asking "did I remove the old thing?"

For every slice:

1. **Define `deletion_targets` before implementation.** Write them into `SLICES.yaml` before building. This creates accountability — you can't "forget" to delete something when it's pre-defined.

2. **Add denylist patterns for removed names/paths.** After deleting code, add a grep pattern to the guard script that fails if the name reappears. Stronger than test coverage because it catches reintroduction anywhere in the codebase.

3. **Delete docs describing removed architecture.** Stale docs about removed systems actively mislead future agents and developers.

4. **Remove obsolete scripts, config, and env fallbacks.** Configuration for removed features is invisible debt.

5. **No "temporary" adapters without:** an owning slice ID, an expiry condition, and an explicit deletion target. Adapters without a planned death live forever.

---

## Slice Design Rules

Each slice must be:

- **Vertical and outcome-based** — a complete capability, not a horizontal sweep like "rename all files" or "update all imports." Vertical slices are independently meaningful.
- **Decision-complete** — ownership of logic is explicit. No shared ownership with unclear boundaries.
- **Independently verifiable** — has deterministic checks. If you can't write a guard or test that confirms correctness, the slice is too vague.
- **Bounded in blast radius** — small enough to review and revert cleanly. If reverting means untangling 40 files, split it.

---

## Confidence Model

When verifying slice correctness, use layered evidence in priority order:

1. **Deterministic replay** (highest confidence) — re-run inputs and diff outputs against known-good baselines
2. **Automated smoke tests** — exercise critical user-facing workflows end-to-end
3. **Full test suites** — run all tests across the codebase
4. **Manual checks** (lowest confidence) — only for high-risk UX changes

If evidence sources conflict, deterministic replay wins. "Tests pass but the replay diff differs" means something is wrong — investigate, don't dismiss.

---

## The Control Plane

Five artifacts govern the migration. Templates are in [references/templates/](references/templates/).

| Artifact | Purpose | Update Frequency |
|---|---|---|
| `CHARTER.md` | Mission, invariants, non-goals, guardrails | Rarely (scope changes only) |
| `DECISIONS.md` | Append-only architecture decisions | Each decision-making slice |
| `SLICES.yaml` | Machine-readable slice ledger | Start and close of each slice |
| `MAP.csv` | Source-of-truth path mapping | Start and close of each slice |
| Guard script | CI-enforced invariant checks | When adding/removing ratchets |

### DECISIONS.md Protocol
- **Append-only.** Never edit past entries.
- **Reversals are new entries.** Changing your mind about decision #3? Add decision #7 that says "Supersedes #3" and explains why.
- **No silent rewrites.** Decision history matters for understanding the codebase's evolution.

### SLICES.yaml Fields
Each slice tracks: `id`, `name`, `status` (proposed → in_progress → done), `dependencies`, `touched_paths`, `contracts` (added/changed/removed), `denylist_patterns`, `deletion_targets`, `replay_scenarios`, `smoke_scenarios`, `risks`, `notes`.

### MAP.csv Columns
`slice_id, capability, current_path, target_path, status, delete_in_pr, notes`

Every file touched by the migration must appear. This prevents files from falling through the cracks.

---

## Agent Coordination

When using multiple agents or parallel sessions:

1. **Keep parallel work on truly independent file sets.** Two agents committing to the same branch can silently displace each other's work. Slice boundaries should map to non-overlapping files.

2. **CI ratchets are the most agent-friendly guardrail.** Mechanical pass/fail beats requiring judgment about whether a change is "safe."

3. **Denylist patterns prevent regression more reliably than tests.** A regex CI check saying "this function name must not appear in this directory" is stronger than hoping test coverage catches reintroduction.

4. **The handoff contract is non-negotiable.** Without it, context compaction causes agents to redo completed work or skip remaining work.

---

## Beyond Code

This methodology works for non-code domains too — scripts, docs, tooling, configuration. The cycle is the same: inventory → measure → freeze → pay down. The "delete in the same change" discipline and anti-vestigial sweeps are just as valuable when consolidating documentation or eliminating redundant scripts.
