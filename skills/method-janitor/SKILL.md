---
name: method:janitor
description: >
  Artifact-centric method for systematic codebase cleanup — dead code, stale
  docs, orphaned artifacts, vestigial comments, and redundant abstractions. 8
  steps across 5 phases: Survey -> Triage -> Prove -> Clean -> Verify. Dual-mode:
  interactive (user checkpoints) or autonomous (evidence-gated with deferred
  review). Use when asked to clean up dead code, do a janitor sweep, improve
  context hygiene for agents, remove stale docs, or find and remove unused code.
  Do not use for refactoring with behavior changes, architecture decisions,
  feature work, one-off deletions, dependency upgrades, or formatting cleanup.
---

# Janitor

Systematic codebase cleanup with false-positive protection at every gate.
Every removal must be backed by evidence, not intuition.

The method operates in two modes:

- **Interactive (default):** User checkpoints at triage review and before each
  cleanup batch. Human judgment decides borderline cases.
- **Autonomous:** All checkpoints are replaced by evidence-based auto-approval
  gates. Only high-confidence, low-risk items are removed. Borderline findings
  are logged to `deferred-review.md` for async human review.

## When to Use

- Clean up dead code, unused exports, orphaned files
- Remove stale documentation that confuses agents or developers
- Sweep orphaned test fixtures, config for removed features, vestigial comments
- Reduce codebase noise to improve coding-agent context quality
- Systematic cleanup after a major refactor or migration
- `/method:janitor` for interactive mode
- `/method:janitor --auto` or `/method:janitor autonomous` for autonomous mode

See frontmatter for full negative scope.

## Glossary

- **Artifact** — Durable method output under `${RUN_ROOT}/artifacts/`.
- **Detritus** — Dead code, stale docs, orphaned artifacts, vestigial comments,
  or redundant abstractions — anything that pollutes a codebase without carrying
  load.
- **Confidence** — How certain we are that an item is dead. High: zero
  references, no dynamic dispatch path. Low: might be used via reflection, FFI,
  string lookup, or external consumers.
- **Risk** — Impact of a false positive. Low: removing a comment. High:
  removing a public API or exported type.
- **Batch** — An ordered group of removals executed and verified together.
- **Deferred item** — A finding that was too ambiguous to remove autonomously,
  logged for later human review.

## Principles

- **Codex executes, Claude orchestrates.** All `dispatch` steps run via
  `codex exec --full-auto`, never via Claude subagents. Claude writes prompt
  headers, composes prompts with `compose-prompt.sh`, dispatches to Codex, and
  reads back results. Claude performs `synthesis` and `interactive` steps
  directly. This is non-negotiable — the relay/Codex execution model is the
  method's core assumption.
- **False-positive aversion.** Better to leave something suspicious than to
  remove something load-bearing. "I couldn't find any references" is evidence;
  "it looks unused" is not.
- **Artifacts, not commentary.** Every step exits with a durable file. Progress
  is visible from the artifact chain on disk.
- **Evidence-based removal.** Every deletion has a stated reason with cited
  evidence. The triage-report and evidence-log are the audit trail.
- **Batch + verify.** Never remove everything at once. Ordered batches with
  build/test verification catch mistakes early.
- **Agent-context priority.** Stale docs are often worse than dead code because
  agents trust documentation. Prioritize removing things that actively mislead.

## Setup

```bash
RUN_SLUG="<target-slug>"
RUN_ROOT=".relay/method-runs/${RUN_SLUG}-janitor"
mkdir -p "${RUN_ROOT}/artifacts" "${RUN_ROOT}/phases"
```

Step 1 captures all runtime inputs (`TARGET_ROOT`, `MODE`, `BUILD_CMD`, etc.)
into `cleanup-scope.md`.

## Canonical Header Schema

Every dispatch header must include: `## Mission`, `## Inputs`, `## Output`
(with path and schema), `## Success Criteria`, and `## Handoff Instructions`.

Handoff instructions must include exact relay headings `### Files Changed`,
`### Tests Run`, and `### Completion Claim` so `compose-prompt.sh` does not
append `relay-protocol.md`.

## Phase 1: Survey

### Step 1: Cleanup Scope — `interactive`

**Objective:** Freeze the runtime inputs before any scanning starts.

Ask the user (or derive from arguments in autonomous mode):

> 1. What directory should be scanned? (defaults to repo root)
> 2. Interactive or autonomous mode?
> 3. What is the build command? (e.g., `cargo build`, `npm run build`)
> 4. What is the test command? (e.g., `cargo test`, `npm test`)
> 5. Is there a project-specific verification command? (optional)
> 6. Are there paths or patterns to exclude from scanning?
> 7. Are there known external consumers of this codebase?
> 8. What are the high-risk boundaries? (public APIs, FFI exports, published packages, or "None")

Write `${RUN_ROOT}/artifacts/cleanup-scope.md`:

```markdown
# Cleanup Scope

## Target Root
## Mode
## Build Command
## Test Command
## Optional Verify Command
## Scope Exclusions
## Known External Consumers
## High-Risk Boundaries
```

**Gate:** `cleanup-scope.md` exists with non-empty Target Root, Mode, Build
Command, and Test Command. At least one high-risk boundary named or explicit
"None".

### Step 2: Category Survey Fanout — `dispatch`, parallel

**Objective:** Scan the target codebase for detritus candidates across 5
independent categories.

Write 5 parallel worker prompt headers to
`${RUN_ROOT}/phases/step-2/prompt-header-<category>.md`.

Each worker scans for exactly one detritus category:

#### Worker: dead-code

Scan for unreachable functions, unused exports, orphaned files, dead branches
in conditionals, and never-called internal APIs.

- Search for functions/methods with zero callers
- Check exports that no module imports
- Find files that no other file references
- Look for conditional branches guarded by always-false conditions
- Flag but do not remove: items behind feature flags, platform-conditional
  compilation, or test-only code

#### Worker: stale-docs

Scan for documentation that references renamed, removed, or substantially
changed APIs, outdated architecture descriptions, and broken internal links.

- Check README, doc comments, and markdown files against actual code
- Verify architecture docs match current module structure
- Find broken internal links (file paths, anchor references)
- Flag docs that describe deprecated workflows still in use elsewhere
- Cross-reference document paths against CI scripts and test fixtures — a doc
  with zero code references may still be asserted by a CI ratchet check or
  read as a test fixture

#### Worker: orphaned-artifacts

Scan for test fixtures with no corresponding test, config files for removed
features, migration files for completed migrations, and build artifacts checked
into source.

- Cross-reference test fixture filenames against test file imports
- Cross-reference artifact paths against CI helper scripts and shell test
  fixtures (`scripts/ci/`, `tests/**/*.bats`) — artifacts may be consumed as
  string arguments to shell functions, not as imports
- Check config files against the features they configure
- Find migration files older than the schema they target
- Look for compiled artifacts, generated code, or vendored copies with stale
  upstream

#### Worker: vestigial-comments

Scan for TODO/FIXME referencing resolved issues, commented-out code blocks,
"removed" or "deprecated" markers for code that was never actually removed, and
placeholder comments.

- Check TODO/FIXME against issue trackers (if accessible) or git history
- Find commented-out code blocks longer than 3 lines
- Locate "removed", "deprecated", "legacy", "old" markers
- Flag single-line TODOs only if they reference a closed issue or are older
  than 6 months by git blame

#### Worker: redundant-abstractions

Scan for wrappers around single callsites, unused interfaces/protocols/traits,
over-abstracted helpers with one consumer, and delegation chains that add no
value.

- Find functions called from exactly one site where inlining is cleaner
- Check interfaces/protocols/traits with zero or one implementor
- Look for "pass-through" functions that add no logic
- Flag but do not remove: abstractions at module boundaries or FFI seams

Each worker writes to `${RUN_ROOT}/phases/step-2/<category>-findings.md` with
this schema:

```markdown
# <Category> Findings

## Summary
[Count of candidates, confidence distribution]

## Candidates
| # | Path | Line/Anchor | Description | Confidence | Uncertainty Note |
|---|------|------------|-------------|------------|-----------------|
```

Assemble and dispatch each worker:

```bash
for category in dead-code stale-docs orphaned-artifacts vestigial-comments redundant-abstractions; do
  ./scripts/relay/compose-prompt.sh \
    --header "${RUN_ROOT}/phases/step-2/prompt-header-${category}.md" \
    --template implement \
    --root "${RUN_ROOT}" \
    --out "${RUN_ROOT}/phases/step-2/prompt-${category}.md"

  cat "${RUN_ROOT}/phases/step-2/prompt-${category}.md" | \
    codex exec --full-auto \
    -o "${RUN_ROOT}/last-messages/last-message-survey-${category}.txt" - &
done
wait
```

**Gate:** All 5 category findings files exist. Each includes candidate paths
and an uncertainty note per candidate.

### Step 3: Survey Consolidation — `synthesis`

**Objective:** Normalize all category findings into one canonical inventory.

Read all 5 findings files plus `cleanup-scope.md`. Write
`${RUN_ROOT}/artifacts/survey-inventory.md`:

```markdown
# Survey Inventory

## Summary
[Total candidates by category, cross-category overlap count]

## Inventory
| # | Category | Path | Line/Anchor | Description | Rationale | Confidence | Ambiguity Flag | Notes |
|---|----------|------|------------|-------------|-----------|------------|---------------|-------|
```

Consolidation rules:

- Deduplicate items that appear in multiple categories (e.g., an orphaned file
  that is also dead code). Keep the higher-confidence categorization.
- Preserve the original category label for traceability.
- Add an ambiguity flag for items near scope exclusions or high-risk boundaries.
- Sort by category, then by confidence (low-confidence first — they need more
  attention downstream).

**Gate:** `survey-inventory.md` exists with deduplicated candidates. Every
candidate has category, path, rationale, and ambiguity flag.

## Phase 2: Triage

### Step 4: Triage Classification — `synthesis`

**Objective:** Classify each survey finding by confidence × risk and assign an
action.

Read `survey-inventory.md` and `cleanup-scope.md`. Write
`${RUN_ROOT}/artifacts/triage-report.md`:

```markdown
# Triage Report

## Mode
[interactive or autonomous]

## Triage Decision Table

| Confidence | Risk | Action (Interactive) | Action (Autonomous) |
|-----------|------|---------------------|---------------------|
| High | Low | REMOVE | REMOVE |
| High | High | REMOVE (user confirms) | PROVE then REMOVE if confirmed |
| Low | Low | PROVE | PROVE |
| Low | High | PROVE | DEFER |

## Classification
| # | Path | Category | Confidence | Risk | Action | Rationale |
|---|------|----------|-----------|------|--------|-----------|

## Approval Status
[Interactive: "Pending user review" or "Approved by user at <timestamp>"]
[Autonomous: "Auto-approved per triage decision table. N items REMOVE, M items PROVE, K items DEFER."]

## Deferred Items (autonomous only)
[Items deferred due to low-confidence + high-risk, with reasons]
```

**Mode-conditional behavior:**

- `MODE=interactive`: After writing the draft triage-report, present the
  classification summary to the user. Ask: "Review the triage report at
  `${RUN_ROOT}/artifacts/triage-report.md`. Approve, adjust, or discuss?"
  Do not proceed until the user confirms. Record the approval.
- `MODE=autonomous`: Auto-approve using the triage decision table. Log deferred
  items. No pause.

**Gate:** Every survey item has confidence, risk, action, and rationale.
Interactive mode: approval recorded. Autonomous mode: auto-approval rule and
deferred counts recorded.

## Phase 3: Prove

### Step 5: Evidence Adjudication — `dispatch`

**Objective:** Gather evidence for items marked PROVE. Produce a verdict per
item: CONFIRMED-DEAD or KEEP.

Write a prompt header to `${RUN_ROOT}/phases/step-5/prompt-header-evidence.md`:

```markdown
# Step 5: Evidence Adjudication

## Mission
For every item marked PROVE in the triage report, gather concrete evidence of
liveness or deadness. Produce a verdict per item.

## Inputs
- `${RUN_ROOT}/artifacts/triage-report.md` — items marked PROVE
- `${RUN_ROOT}/artifacts/cleanup-scope.md` — target root, exclusions, external
  consumers, high-risk boundaries

## Dynamic Usage Proof Checklist

For each PROVE item, check ALL of the following before marking CONFIRMED-DEAD:

1. **grep/search** — Zero references across the full repo (not just the target
   directory). Include test files, scripts, and config.
2. **git blame recency** — Was the item touched in the last 90 days? Recent
   activity suggests active use.
3. **Reflection/dynamic dispatch** — Is the symbol name constructed at runtime
   via string interpolation, reflection, or dynamic dispatch?
4. **FFI boundary** — Is the item exposed across an FFI boundary (UniFFI,
   JNI, ctypes, wasm-bindgen)?
5. **Code generation** — Is the item referenced by a code generator, macro, or
   build script?
6. **Plugin/registration system** — Is the item registered via a plugin system,
   service locator, or dependency injection container?
7. **External consumers** — Does any known external consumer reference this
   item? If KNOWN_EXTERNAL_CONSUMERS is "unknown", treat as low-confidence.
8. **Conditional compilation** — Is the item behind a feature flag, platform
   gate, or build configuration?
9. **CI scripts and test fixtures** — Is the item referenced in CI workflow
   files (`.github/workflows/`), CI helper scripts (`scripts/ci/`,
   `scripts/verify/`), or shell test fixtures (`tests/**/*.bats`,
   `tests/**/*.sh`)? These references appear as string arguments to shell
   functions (e.g., `check_file_contains "name" "path"`, `cat "$path"` in
   Bats tests) and are invisible to standard import-tracing tools. Search
   with `rg <filename> -- scripts/ tests/ .github/` to catch them.

Verdict rules:
- All 9 checks clear → CONFIRMED-DEAD
- Any check positive → KEEP with cited evidence
- Any check inconclusive → KEEP with "inconclusive: <which check>" note
- If evidence changes the risk classification, note the adjustment for triage
  reopen

## Output
- **Path:** `${RUN_ROOT}/artifacts/evidence-log.md`
- **Schema:**
  ## Evidence Log
  | # | Path | Triage Action | Evidence Summary | Checklist Results | Verdict | Triage Adjustment |
  |---|------|--------------|-----------------|-------------------|---------|-------------------|

## Success Criteria
- Every PROVE item has a verdict
- Every CONFIRMED-DEAD verdict cites specific evidence
- Every KEEP verdict names the check that blocked it
- Triage adjustments are flagged for reopen if they change risk classification
```

Compose and dispatch using the standard recipe: `compose-prompt.sh --header .../prompt-header-evidence.md --template implement --root ${RUN_ROOT} --out .../prompt-evidence.md` then `codex exec --full-auto`.

**Gate (evidence-reopen):**

- `evidence_sufficient` → continue to Clean
- `queue_adjustment_required` → update `triage-report.md` with new risk/confidence
  classifications from evidence, then resume at Step 5 for any newly-PROVE items
- `risk_boundary_invalidated` → interactive reopen. Present findings to user:
  "Evidence invalidated a high-risk boundary assumption. Which items should be
  reclassified?" Name the governing item.

## Phase 4: Clean

### Step 6: Cleanup Batch Execution — `dispatch` via `manage-codex`

**Objective:** Remove confirmed-dead items in ordered batches with build/test
verification after each batch.

Compute ordered batches from `triage-report.md` and `evidence-log.md`:

1. **Batch ordering:** Lowest-risk first.
   - Batch A: Vestigial comments, dead imports
   - Batch B: Orphaned test fixtures, stale doc sections
   - Batch C: Orphaned files, unused internal functions
   - Batch D: Unused exports, redundant abstractions
   - Batch E: Public API removals (if any, and only if confirmed-dead)

2. **Eligibility filter:**
   - Interactive mode: All items with action REMOVE or verdict CONFIRMED-DEAD.
     User approves each batch before dispatch.
   - Autonomous mode: Only items that are low-risk AND (high-confidence from
     triage OR CONFIRMED-DEAD from evidence). High-risk items are deferred even
     if CONFIRMED-DEAD unless the user pre-approved them in cleanup-scope.

3. **Per-batch execution** using `manage-codex`:

This step delegates to the `manage-codex` skill for the full implement →
review → converge cycle. The orchestrator creates the manage-codex workspace
explicitly for each batch.

**Retry contract:** Up to 3 attempts per batch. An attempt is one full
manage-codex dispatch (implement → review → converge). Retry triggers:
convergence says `ISSUES REMAIN` and the issues are fixable (not a
fundamental misclassification). After 3 failed attempts, mark the batch as
REVERTED and move to the next batch.

**Adapter contract per batch:**

```bash
BATCH_ID="batch-a"  # or batch-b, etc.
BATCH_ROOT="${RUN_ROOT}/phases/step-6/batches/${BATCH_ID}"
mkdir -p "${BATCH_ROOT}/archive" "${BATCH_ROOT}/handoffs" \
  "${BATCH_ROOT}/last-messages" "${BATCH_ROOT}/review-findings"
```

**a) Create `${BATCH_ROOT}/CHARTER.md`** with required sections:
`## Batch Items`, `## Evidence References`, `## Allowed File Scope`,
`## Verification Commands` (build/test/verify), `## Revert Rule` (revert ALL
on any verification failure — no partial reverts).

**b) Write `${BATCH_ROOT}/prompt-header.md`** telling manage-codex to remove
items per CHARTER, run verification after each slice, write convergence to
`${BATCH_ROOT}/handoffs/handoff-converge.md`, and revert the whole batch if
verification fails. Include standard relay handoff headings.

**c) Compose and dispatch:**

```bash
./scripts/relay/compose-prompt.sh \
  --header "${BATCH_ROOT}/prompt-header.md" \
  --skills manage-codex \
  --root "${BATCH_ROOT}" \
  --out "${BATCH_ROOT}/prompt.md"

cat "${BATCH_ROOT}/prompt.md" | \
  codex exec --full-auto \
  -o "${BATCH_ROOT}/last-messages/last-message-manage-codex.txt" -
```

**d) After manage-codex completes**, read back in this order:

1. `${BATCH_ROOT}/handoffs/handoff-converge.md` — convergence verdict (primary)
2. `${BATCH_ROOT}/batch.json` — slice metadata showing what was removed
3. The last implementation slice handoff at
   `${BATCH_ROOT}/handoffs/handoff-<last-slice-id>.md` (find slice id from
   `batch.json`)

Note: manage-codex review workers may overwrite per-slice handoff files. If a
slice handoff is missing or appears to be a review artifact, use `batch.json`
slice metadata and the convergence handoff to reconstruct what was removed.

**Mode-conditional behavior:**

- `MODE=interactive`: Before dispatching each batch, present the batch manifest
  to the user. Ask: "Batch <id> will remove N items. Review at
  `${BATCH_ROOT}/CHARTER.md`. Approve or skip?" Skipped batches are logged as
  DEFERRED.
- `MODE=autonomous`: Dispatch all eligible batches sequentially. No pause.

**Outer synthesis:** After each batch, append a normalized entry into
`${RUN_ROOT}/artifacts/cleanup-batches.md`:

```markdown
## Batch: <batch-id>

### Items
| # | Path | Action | Evidence Ref | Result |
|---|------|--------|-------------|--------|

### Verification
- Build: [PASS/FAIL]
- Test: [PASS/FAIL]
- Verify: [PASS/FAIL/SKIPPED]

### Disposition
[REMOVED / REVERTED / DEFERRED]
```

If convergence says `ISSUES REMAIN`, do NOT pretend the batch succeeded.
Escalate: log the issue, mark the batch as REVERTED, and continue to the next
batch.

**Gate:** `cleanup-batches.md` exists with ordered batches, terminal
disposition per batch, verification results, and explicit revert evidence for
failed batches.

## Phase 5: Verify

### Step 7: Verification Audit — `dispatch`

**Objective:** Independent assessment of the cleanup (diagnose-only — see
contract below).

Write a prompt header to `${RUN_ROOT}/phases/step-7/prompt-header-audit.md`:

```markdown
# Step 7: Verification Audit

## Mission
Independently verify that the cleanup is sound. Do NOT modify any source code.

## Inputs
- `${RUN_ROOT}/artifacts/cleanup-batches.md` — what was removed
- `${RUN_ROOT}/artifacts/triage-report.md` — why it was triaged for removal
- `${RUN_ROOT}/artifacts/evidence-log.md` — evidence supporting removal
- `${RUN_ROOT}/artifacts/cleanup-scope.md` — build/test/verify commands

## Assessment Checklist
1. Run build command and record result
2. Run test command and record result
3. Run verify command (if provided) and record result
4. Warning delta: if the build or test output includes warning counts, compare
   before vs after. If warnings are not measurable, record
   `Warning Delta: NOT MEASURABLE` (this is a valid gate-satisfying value)
5. Diff review: for each removed item, verify it was genuinely dead based on
   the evidence log (spot-check at minimum, full review preferred)
6. Cross-check: every item in cleanup-batches.md marked REMOVED should have a
   corresponding CONFIRMED-DEAD or high-confidence REMOVE entry

## Output
- **Path:** `${RUN_ROOT}/artifacts/verification-audit.md`
- **Schema:**
  ## Build Result
  ## Test Result
  ## Verify Result
  ## Warning Delta
  [Count delta or NOT MEASURABLE — both are valid]
  ## Diff Sanity Check
  ## Manifest Cross-Check
  ## Candidate Verdict
  [CLEAN / ISSUES FOUND with specifics]

## This step is assessment only
The worker does NOT modify source code. If issues are found, remediation
happens by reopening Clean (Step 6) or Prove (Step 5), not by letting this
audit worker fix code.

## Handoff Instructions
Write your primary output to the path above. Also write a standard handoff to
`handoffs/handoff.md` with these exact section headings:

### Files Changed
### Tests Run
### Verification
### Verdict
### Completion Claim
### Issues Found
### Next Steps
```

Compose and dispatch using the standard recipe: `compose-prompt.sh --header .../prompt-header-audit.md --root ${RUN_ROOT} --out .../prompt-audit.md` then `codex exec --full-auto`.

**Gate:** `verification-audit.md` exists with build/test results, warning
delta (or NOT MEASURABLE), diff sanity findings, manifest cross-check, and a
candidate verdict.

### Step 8: Verification Synthesis — `synthesis`

**Objective:** Publish the terminal verdict and deferred-review surface.

Read all upstream artifacts:

- `cleanup-batches.md`
- `verification-audit.md`
- `triage-report.md`
- `evidence-log.md`

Write `${RUN_ROOT}/artifacts/verification-report.md`:

```markdown
# Verification Report

## Terminal Verdict
[CLEAN / PARTIAL / REOPEN]

## Removal Manifest
| # | Path | Category | Evidence | Batch | Status |
|---|------|----------|---------|-------|--------|

## Verification Summary
- Build: [PASS/FAIL]
- Test: [PASS/FAIL]
- Verify: [PASS/FAIL/SKIPPED]
- Warning delta: [+N/-N/unchanged]
- Diff sanity: [PASS/findings]

## Reopen Target (if REOPEN)
[Named failing boundary and reopen target: cleanup-batches.md, evidence-log.md,
or triage-report.md]
```

When `MODE=autonomous`, also write
`${RUN_ROOT}/artifacts/deferred-review.md`:

```markdown
# Deferred Review

## Summary
[N items deferred for human review]

## Deferred Items
| # | Path | Category | Confidence | Risk | Reason Deferred | Evidence So Far | Suggested Next Question |
|---|------|----------|-----------|------|-----------------|-----------------|------------------------|
```

Sources for deferred items:
- Items with action DEFER in `triage-report.md`
- Items with verdict KEEP (inconclusive) in `evidence-log.md`
- Items in batches marked REVERTED in `cleanup-batches.md`
- Items flagged by the verification audit

**Gate (verdict-consistency):**

- `clean` — All executed removals verified, no unresolved failing boundary,
  removal manifest and verification checks agree.
- `partial` — Executed removals verified, but deferred items remain. Every
  unresolved item appears in deferred-review. No failing executed batch.
- `reopen` — At least one executed removal or proof boundary failed
  verification. Must name the exact failing boundary and the reopen target
  (`cleanup-batches.md`, `evidence-log.md`, or `triage-report.md`).

## Artifact Chain Summary

```text
cleanup-scope.md             [Step 1, interactive]
  -> survey-inventory.md     [Step 3, synthesis, from 5 category findings]
  -> triage-report.md        [Step 4, synthesis, mode-conditional approval]
  -> evidence-log.md         [Step 5, dispatch]
  -> cleanup-batches.md      [Step 6, manage-codex, per-batch execution]
  -> verification-report.md  [Step 8, synthesis]
  -> deferred-review.md      [Step 8, synthesis, autonomous only]
```

Non-canonical intermediate outputs:
- Step 2: 5 category finding files (consumed by Step 3, not canonical chain)
- Step 7: `verification-audit.md` (consumed by Step 8, not canonical chain)
- Step 6: per-batch `manage-codex` handoffs (relay state, not canonical)

## Resume Awareness

Resume should be relay-first, then artifact-first:

1. Check the current step's relay directory for in-flight worker output
2. Validate any step-local promoted artifact against its gate
3. Resume from the first step whose artifact is missing or fails its gate

### Step-specific resume notes

- **Step 2:** Inspect each worker output separately. Rerun only missing or
  gate-failing categories. Do not restart all 5 workers if 3 already completed.
- **Step 4:** If `triage-report.md` exists but interactive approval is absent
  (interactive mode), resume inside Step 4 rather than restarting Survey.
- **Step 5:** If some proved items have verdicts and others do not, rerun proof
  only for unresolved items. Do not re-prove already-adjudicated items.
- **Step 6:** Before re-dispatching any batch:
  1. Inspect the batch child root's `batch.json`
  2. Then `handoffs/handoff-converge.md`
  3. Then the last slice handoff
  Never rerun a converged batch.
- **Step 7:** If `verification-audit.md` exists and passes its gate, resume at
  Step 8. Do not re-audit.

### Reopen routing

- Reopen to `triage-report.md` when evidence changes item classification or
  reveals wrong risk labels.
- Reopen to `evidence-log.md` when verification says a removed item lacked
  sufficient proof.
- Reopen to `cleanup-batches.md` when a verification failure is caused by a
  concrete executed batch.
- Reopen to `cleanup-scope.md` only when build/test/verify commands or
  target-root assumptions were wrong.

## Circuit Breaker

Stop and recommend a different path when:

- The codebase has fewer than 5 candidate findings — the overhead of a
  multi-phase method is not justified for a handful of known deletions
- The target is a single file or a known specific item — use direct deletion
  instead
- The cleanup requires behavior changes (refactoring, API migration) — use
  `method:research-to-implementation` instead
- The user wants architecture simplification, not detritus removal — use
  `method:decision-pressure-loop` or `improve-codebase-architecture` instead
- Build/test infrastructure does not exist or is broken — fix that first
