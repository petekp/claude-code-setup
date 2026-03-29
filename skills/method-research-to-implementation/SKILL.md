---
name: method:research-to-implementation
description: >
  Artifact-driven method for taking a significant feature from idea to shipped code.
  10 steps across 5 phases: Alignment → Evidence → Decision → Preflight → Delivery.
  Use when the user describes a non-trivial feature that needs research, design, and
  implementation — not for bug fixes, single-file changes, or quick wiring tasks.
---

# Research-to-Implementation Method

An artifact-centric workflow that chains intent → constraints → decision → contract → code.
Each phase produces a named artifact that becomes the next phase's input. The user steers
at three checkpoints where product judgment matters most.

## When to Use

- Feature additions that span multiple files or domains
- Cross-domain work (Rust + Swift, frontend + backend)
- Problems where the implementation approach isn't obvious
- Work where research should precede implementation

Do NOT use for bug fixes, config changes, or tasks where the approach is already clear.

## Glossary

- **Artifact** — A canonical method output file in `${RUN_ROOT}/artifacts/`. These are the
  durable chain. Each step produces exactly one artifact.
- **Worker handoff** — The raw output a Codex worker writes to its relay `handoffs/` directory.
  Worker handoffs are inputs to artifact synthesis, not artifacts themselves.
- **Prompt header** — A self-contained file the orchestrator writes before dispatch. Contains
  the full worker contract: mission, inputs, output path, output schema, success criteria.
- **Synthesis** — When the orchestrator (Claude session) reads prior artifacts and writes a
  new artifact directly, without dispatching a worker.

## Principles

- **Artifacts, not activities.** Every step produces a concrete file. No step exits
  without writing its output artifact.
- **Self-contained headers.** Dispatch steps do NOT use `--template`. The prompt header
  carries the full worker contract: mission, inputs, output schema, success criteria,
  and handoff instructions.
- **User steers tradeoffs, not approvals.** Checkpoints ask the user to choose between
  competing priorities, not rubber-stamp a recommendation.
- **Digest chaining.** The orchestrator reads prior artifacts and writes a compact digest
  into the next step's prompt header. No strict named-output contracts.
- **Prove before you build.** The hardest seam gets a thin slice or failing test before
  the full implementation pipeline commits.

## Setup

```bash
RUN_SLUG="<feature-slug>"
RUN_ROOT=".relay/method-runs/${RUN_SLUG}"
mkdir -p "${RUN_ROOT}/artifacts"
```

Record `RUN_ROOT` — all paths below are relative to it.

**Per-step scaffolding** — before each dispatch step, create:
```bash
step_dir="${RUN_ROOT}/phases/<step-name>"
mkdir -p "${step_dir}/handoffs" "${step_dir}/last-messages"
```

## Domain Skill Selection

When a step says `<domain-skills>`, pick 1-2 skills matching the affected code:
- Rust core: `rust`
- Swift app: `swift-apps`
- Both: `rust,swift-apps`

Never exceed 3 total skills per dispatch. Do not append interactive skills
(like `proposal-review` or `grill-me`) to autonomous `codex exec` dispatches.

## Canonical Header Schema

Every dispatch step's prompt header MUST include these fields:

```markdown
# Step N: <title>

## Mission
[What the worker must accomplish]

## Inputs
[Full text or digest of consumed artifacts]

## Output
- **Path:** [exact path where the worker must write its primary artifact]
- **Schema:** [required sections/headings in the output]

## Success Criteria
[What "done" looks like for this step]

## Handoff Instructions
Write your primary output to the path above. Also write a standard handoff to
`handoffs/handoff.md` with these exact section headings:

### Files Changed
[List files modified or created]

### Tests Run
[List test commands and results, or "None" if no tests]

### Verification
[How the output was verified]

### Verdict
[CLEAN / ISSUES FOUND]

### Completion Claim
[COMPLETE / PARTIAL]

### Issues Found
[List any issues, or "None"]

### Next Steps
[What the next phase should focus on]
```

**Why these headings matter:** `compose-prompt.sh` checks for `### Files Changed`,
`### Tests Run`, and `### Completion Claim` in the assembled prompt. If missing, it
appends `relay-protocol.md` which contains unresolved `{slice_id}` placeholders.
Including these headings in the header prevents that contamination.

---

## Phase 1: Alignment

### Step 1: Intent Lock — `interactive`

**Objective:** Define what success looks like before any research starts.

Ask the user (via AskUserQuestion):

> Describe the feature you want to build. Then answer:
> 1. If we can only get two things right in v1, what are they?
> 2. What would make this feature feel wrong even if it technically ships?
> 3. What is explicitly out of scope?

Write their response to `${RUN_ROOT}/artifacts/intent-brief.md`:

```markdown
# Intent Brief: <feature>
## Ranked Outcomes
## Non-Goals
## Kill Criteria
## Unresolved Questions
## Domain and File Scope
```

**Gate:** `intent-brief.md` exists with non-empty Ranked Outcomes and Non-Goals.

---

## Phase 2: Evidence

### Step 2: Parallel Evidence Probes — `dispatch`

**Objective:** Gather external patterns and internal system surface in parallel.

Dispatch two Codex workers. Each header is self-contained (no `--template`).

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-2a/handoffs" "${RUN_ROOT}/phases/step-2a/last-messages"
mkdir -p "${RUN_ROOT}/phases/step-2b/handoffs" "${RUN_ROOT}/phases/step-2b/last-messages"
```

**Worker A header** (`${RUN_ROOT}/phases/step-2a/prompt-header.md`):
Include the canonical header schema with:
- Mission: Research external patterns, prior art, and recording/playback approaches in similar systems
- Inputs: Full text of `intent-brief.md`
- Output path: `${RUN_ROOT}/phases/step-2a/external-digest.md`
- Output schema: the evidence digest schema (below)
- Success criteria: Digest covers facts, inferences, unknowns with source confidence
- Handoff: `handoffs/handoff.md`

**Worker B header** (`${RUN_ROOT}/phases/step-2b/prompt-header.md`):
Include the canonical header schema with:
- Mission: Trace the internal system surface relevant to this feature
- Inputs: Full text of `intent-brief.md`
- Output path: `${RUN_ROOT}/phases/step-2b/internal-digest.md`
- Output schema: the evidence digest schema (below)
- Success criteria: Digest covers all relevant internal seams with certainty labels
- Handoff: `handoffs/handoff.md`

**Evidence digest schema (required for both workers):**
```markdown
# Evidence Digest: <topic>
## Facts (confirmed, high confidence)
## Inferences (derived, medium confidence)
## Unknowns (gaps that matter for decisions)
## Implications for This Feature
## Source Confidence
```

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-2a/prompt-header.md \
  --skills deep-research \
  --root ${RUN_ROOT}/phases/step-2a \
  --out ${RUN_ROOT}/phases/step-2a/prompt.md

cat ${RUN_ROOT}/phases/step-2a/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-2a/last-messages/last-message.txt -
```

```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-2b/prompt-header.md \
  --skills <domain-skills> \
  --root ${RUN_ROOT}/phases/step-2b \
  --out ${RUN_ROOT}/phases/step-2b/prompt.md

cat ${RUN_ROOT}/phases/step-2b/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-2b/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-2a/external-digest.md
test -f ${RUN_ROOT}/phases/step-2b/internal-digest.md
```

If the worker wrote the primary artifact at the specified path, copy it directly:
```bash
cp ${RUN_ROOT}/phases/step-2a/external-digest.md ${RUN_ROOT}/artifacts/external-digest.md
cp ${RUN_ROOT}/phases/step-2b/internal-digest.md ${RUN_ROOT}/artifacts/internal-digest.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes the digest artifact manually using the evidence digest schema.

### Step 3: Constraints Synthesis — `synthesis`

**Objective:** Merge parallel research into decision-grade substrate.

The orchestrator reads `artifacts/external-digest.md` and `artifacts/internal-digest.md`
and writes `${RUN_ROOT}/artifacts/constraints.md`:

```markdown
# Constraints: <feature>
## Hard Invariants (must not violate)
## Seams and Integration Points
## Contradictions Between Sources
## Open Questions (ranked by decision impact)
## Performance and Operational Constraints
```

Label every item by certainty: `[fact]`, `[inference]`, or `[assumption]`.

**Gate:** `constraints.md` has at least one hard invariant, at least one seam, and
ranked open questions. Every item has a certainty label.

---

## Phase 3: Decision

### Step 4: Generate Distinct Candidates — `dispatch`

**Objective:** Produce 3-5 approaches that differ on real dimensions.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-4/handoffs" "${RUN_ROOT}/phases/step-4/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-4/prompt-header.md`):
- Mission: Generate 3-5 genuinely distinct implementation approaches
- Inputs: Digested `intent-brief.md` (ranked outcomes + non-goals) and full `constraints.md`
- Output path: `${RUN_ROOT}/phases/step-4/options.md`
- Output schema:
  ```markdown
  # Implementation Options: <feature>
  ## Option 1: <name>
  - Architecture shape
  - Key seam
  - Failure surface
  - Prerequisite changes
  - Rollback cost
  - Explicit disqualifiers (if any)
  ## Option 2: <name>
  ...
  ```
- Success criteria: Each option differs on at least 2 of: architecture shape, ownership
  boundary, failure surface, data model. At least 3 options.
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-4/prompt-header.md \
  --skills <domain-skills> \
  --root ${RUN_ROOT}/phases/step-4 \
  --out ${RUN_ROOT}/phases/step-4/prompt.md

cat ${RUN_ROOT}/phases/step-4/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-4/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-4/options.md
cp ${RUN_ROOT}/phases/step-4/options.md ${RUN_ROOT}/artifacts/options.md
```

If the worker only wrote `handoffs/handoff.md`, synthesize `options.md` from the handoff.

### Step 5: Adversarial Evaluation + Decision Packet — `dispatch`

**Objective:** Red-team each option AND synthesize into a decision packet.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-5/handoffs" "${RUN_ROOT}/phases/step-5/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-5/prompt-header.md`):
- Mission: Attack each option's weakest seam, then synthesize a decision packet with matrix
- Inputs: Full `constraints.md` and full `options.md`
- Output path: `${RUN_ROOT}/phases/step-5/decision-packet.md`
- Output schema:
  ```markdown
  # Decision Packet: <feature>
  ## Per-Option Risk Assessment
  ## Decision Matrix
  ## Recommendation and Rationale
  ## Unresolved Risks
  ## Reopen Conditions
  ```
- Success criteria: At least one option materially weakened by critique. Matrix includes
  risk dimensions, not just feature comparison.
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-5/prompt-header.md \
  --skills <domain-skills> \
  --root ${RUN_ROOT}/phases/step-5 \
  --out ${RUN_ROOT}/phases/step-5/prompt.md

cat ${RUN_ROOT}/phases/step-5/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-5/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-5/decision-packet.md
cp ${RUN_ROOT}/phases/step-5/decision-packet.md ${RUN_ROOT}/artifacts/decision-packet.md
```

### Step 6: Tradeoff Decision — `interactive`

**Objective:** User chooses based on tradeoffs, not generic approval.

Present `decision-packet.md` to the user. Ask (via AskUserQuestion):

> Here's the decision packet with [N] options evaluated. The recommendation is [X].
>
> 1. Which tradeoff are you choosing on purpose: correctness margin, UX smoothness,
>    implementation speed, extensibility, or operational simplicity?
> 2. What risks from the packet are you accepting?
> 3. Any scope cuts you want to make now?

Write their response to `${RUN_ROOT}/artifacts/adr.md`:

```markdown
# ADR: <feature> — <chosen approach>
## Decision
## Rationale (user's tradeoff reasoning)
## Accepted Risks
## Rejected Alternatives (and why)
## Scope Cuts
## Non-Goals (carried from intent brief)
## Reopen Conditions
```

**Gate:** `adr.md` exists with non-empty Decision, Accepted Risks, and at least one
Rejected Alternative that maps back to `options.md`.

---

## Phase 4: Preflight

### Step 7: Implementation Contract — `synthesis`

**Objective:** Convert the ADR into an executable build packet.

The orchestrator reads `adr.md`, `constraints.md`, AND `intent-brief.md` and writes
`${RUN_ROOT}/artifacts/execution-packet.md`:

```markdown
# Execution Packet: <feature>
## Invariants (from constraints + ADR)
## Interface Boundaries (what changes, what must not)
## Slice Order (implementation sequence)
## Test Obligations (what must be tested and how)
## Artifact Expectations (what the implementer must produce)
## Rollback Triggers (when to stop and escalate)
## Non-Goals (from intent brief and ADR)
## Verification Commands
```

**Gate:** `execution-packet.md` has non-empty Invariants, Slice Order, and Test Obligations.

### Step 8: Prove the Hardest Seam — `dispatch`

**Objective:** Write a thin slice or failing tests on the highest-risk boundary.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-8/handoffs" "${RUN_ROOT}/phases/step-8/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-8/prompt-header.md`):
- Mission: Identify the single riskiest seam in the execution packet and prove it with
  code — write failing tests, a thin spike, or a minimal integration that exercises the
  boundary. This is proof, not analysis.
- Inputs: Full `execution-packet.md`
- Output path: `${RUN_ROOT}/phases/step-8/seam-proof.md`
- Output schema:
  ```markdown
  # Seam Proof: <seam name>
  ## Seam Identified
  ## What Was Built/Tested
  ## Evidence (test results, spike output)
  ## Design Validity
  ## Verdict: DESIGN HOLDS / DESIGN INVALIDATED / NEEDS ADJUSTMENT
  ```
- Success criteria: Code was written and run. Evidence is from execution, not reasoning.
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-8/prompt-header.md \
  --skills <domain-skills> \
  --root ${RUN_ROOT}/phases/step-8 \
  --out ${RUN_ROOT}/phases/step-8/prompt.md

cat ${RUN_ROOT}/phases/step-8/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-8/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-8/seam-proof.md
cp ${RUN_ROOT}/phases/step-8/seam-proof.md ${RUN_ROOT}/artifacts/seam-proof.md
```

**Gate with reopen:** Read the seam proof verdict.
- `DESIGN HOLDS` → continue to Step 9
- `NEEDS ADJUSTMENT` → update `execution-packet.md` with adjustments, continue
- `DESIGN INVALIDATED` → present to user, ask:
  "The seam proof found [X]. Narrow scope, adjust approach, or reopen decision?"
  - Reopen → return to Step 4 with updated constraints
  - Adjust → update execution packet, continue
  - Narrow → update scope in execution packet, continue

---

## Phase 5: Delivery

### Step 9: Implement — `dispatch` (via manage-codex)

**Objective:** Build against the execution packet with traceability.

This step delegates to the manage-codex skill for the full implement → review → converge
cycle. The orchestrator must create the manage-codex workspace explicitly.

**Adapter contract:**

```bash
IMPL_ROOT="${RUN_ROOT}/phases/step-9"
mkdir -p "${IMPL_ROOT}/archive" "${IMPL_ROOT}/handoffs" \
  "${IMPL_ROOT}/last-messages" "${IMPL_ROOT}/review-findings"
```

1. **Create CHARTER.md** from the execution packet:
   ```bash
   cp ${RUN_ROOT}/artifacts/execution-packet.md ${IMPL_ROOT}/CHARTER.md
   ```

2. **Write the manage-codex prompt header** at `${IMPL_ROOT}/prompt-header.md`:
   Use the canonical header schema with:
   - Mission: Implement the feature described in CHARTER.md using the manage-codex
     implement → review → converge cycle
   - Inputs: Full text of `execution-packet.md` (already copied as CHARTER.md)
   - Output path: `${IMPL_ROOT}/handoffs/handoff-converge.md`
   - Output schema: manage-codex convergence handoff format
   - Success criteria: All slices converged with `COMPLETE AND HARDENED` verdict
   - Handoff: Standard relay handoff headings (### Files Changed, ### Tests Run,
     ### Completion Claim) to prevent relay-protocol.md contamination
   - Also reference: domain skills and verification commands from the execution packet

3. **Compose and dispatch:**
   ```bash
   ./scripts/relay/compose-prompt.sh \
     --header ${IMPL_ROOT}/prompt-header.md \
     --skills manage-codex,<domain-skills> \
     --root ${IMPL_ROOT} \
     --out ${IMPL_ROOT}/prompt.md

   cat ${IMPL_ROOT}/prompt.md | \
     codex exec --full-auto \
     -o ${IMPL_ROOT}/last-messages/last-message-manage-codex.txt -
   ```

4. **After manage-codex completes**, the orchestrator synthesizes `implementation-handoff.md`:

   **Source artifacts (read in this order):**
   - `${IMPL_ROOT}/handoffs/handoff-converge.md` — the convergence verdict (primary source)
   - `${IMPL_ROOT}/batch.json` — slice metadata showing what was built
   - The last implementation slice handoff at `${IMPL_ROOT}/handoffs/handoff-<last-slice-id>.md`
     (find the slice id from `batch.json`)

   Note: manage-codex review workers may overwrite per-slice handoff files. If a slice
   handoff is missing or appears to be a review artifact, use `batch.json` slice metadata
   and the convergence handoff to reconstruct what was built.

   **Write** `${RUN_ROOT}/artifacts/implementation-handoff.md` with:
   ```markdown
   # Implementation Handoff: <feature>
   ## What Was Built (from batch slices and convergence)
   ## Tests Run and Verification Results
   ## Convergence Verdict
   ## Open Issues (from convergence findings, if any)
   ```

   **Gate:** `implementation-handoff.md` exists AND convergence verdict is
   `COMPLETE AND HARDENED`. If convergence says `ISSUES REMAIN`, the manage-codex
   loop should have addressed them — escalate to user if it didn't.

**Verify:**
```bash
test -f ${IMPL_ROOT}/handoffs/handoff-converge.md
test -f ${RUN_ROOT}/artifacts/implementation-handoff.md
```

### Step 10: Final Ship Review — `dispatch`

**Objective:** Independent assessment of the shipped work against the execution packet.

This step is assessment only — the worker does NOT modify source code. If issues are
found, the orchestrator handles remediation separately before re-running this step.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-10/handoffs" "${RUN_ROOT}/phases/step-10/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-10/prompt-header.md`):
- Mission: Audit the implementation against the execution packet and original intent.
  Check for contract drift, correctness bugs, naming issues, dead code, missing tests,
  and residue. Do NOT modify source code — diagnose only.
- Inputs: Full `execution-packet.md`, full `implementation-handoff.md`,
  digested `intent-brief.md` (ranked outcomes + non-goals), current repo state
- Output path: `${RUN_ROOT}/phases/step-10/ship-review.md`
- Output schema:
  ```markdown
  # Ship Review: <feature>
  ## Contract Compliance (execution packet vs actual)
  ## Findings
  ### Critical (must fix before ship)
  ### High (should fix)
  ### Low (acceptable debt)
  ## Intentional Debt (deferred with rationale)
  ## Fit-to-Intent Assessment (compare to intent-brief.md)
  ## Verdict: SHIP-READY / ISSUES FOUND
  ```
- Success criteria: Every finding references a contract section or intent-brief item.
  Findings are categorized by severity, not listed as a flat list.
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-10/prompt-header.md \
  --skills <domain-skills> \
  --root ${RUN_ROOT}/phases/step-10 \
  --out ${RUN_ROOT}/phases/step-10/prompt.md

cat ${RUN_ROOT}/phases/step-10/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-10/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-10/ship-review.md
cp ${RUN_ROOT}/phases/step-10/ship-review.md ${RUN_ROOT}/artifacts/ship-review.md
```

**If verdict is `ISSUES FOUND` with critical findings:**
1. The orchestrator addresses critical findings (directly or via a targeted Codex worker)
2. Re-runs Step 10 (max 2 total attempts)
3. If still `ISSUES FOUND` after 2 attempts → escalate to user

**If verdict is `SHIP-READY`:** Method complete.

---

## Artifact Chain Summary

```
intent-brief.md                              [user: intent lock]
  → external-digest.md ∥ internal-digest.md
  → constraints.md
  → options.md
  → decision-packet.md
  → adr.md                                   [user: tradeoff choice]
  → execution-packet.md
  → seam-proof.md                            [user: reopen if invalidated]
  → implementation-handoff.md
  → ship-review.md
```

## Resume Awareness

If `${RUN_ROOT}/artifacts/` already has files, determine the resume point:

1. Check artifacts in chain order (intent-brief → external-digest → ... → ship-review)
2. Find the last complete artifact with passing gate
3. For Step 9 specifically: check `${RUN_ROOT}/phases/step-9/batch.json` for manage-codex
   resume state before restarting implementation
4. Continue from the next step

This is best-effort — the method has no durable state beyond artifacts on disk and
step-local relay directories. If a session dies mid-step, check the step's relay
directory for worker output before concluding the step failed.

## Circuit Breaker

Escalate to the user when:
- A dispatch step fails twice (no valid output after 2 attempts)
- The seam proof returns `DESIGN INVALIDATED` (Step 8 gate)
- Ship review says `ISSUES FOUND` after 2 attempts (Step 10)
