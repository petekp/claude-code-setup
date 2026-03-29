---
name: method:spec-hardening
description: >
  Artifact-driven method for turning a rough RFC, design spec, PRD, or method
  schema into a canonical amended spec, a build-ready execution packet, and a
  reviewed implementation plan without crossing into code. 10 steps across 6
  phases: Intake -> Multi-Angle Review -> Amendment -> Contracting -> Planning
  -> Validation. Use when an existing draft exists but is not yet safe to build
  from.
---

# Spec-Hardening Method

An artifact-centric workflow that chains draft -> digest -> critique -> amendment
-> contract -> plan. Each phase produces a named artifact that becomes the next
phase's input. The user steers at three checkpoints where audience, caveat
disposition, and reopen decisions matter most.

## When to Use

- Existing RFCs, design specs, PRDs, or method schemas that are promising but not
  yet safe to implement from directly
- Drafts where buildability, system fit, or prior art still need pressure before
  rewrite
- Work that needs a canonical amended spec plus a separate execution packet and
  implementation plan
- Situations where the team should stop before code and harden the documents first

Do NOT use for unformed ideas, bug fixes, or specs that are already implementation-ready.

This method sits between review and execution: `proposal-review` helps collect
structured reactions, but this method turns critique into canonical amended
artifacts and a build plan. `pipeline` can host it during align work. It is a
natural downstream step after a decision loop and an upstream step before
`method:research-to-implementation` or `manage-codex`.

## Glossary

- **Artifact** - A canonical method output file in `${RUN_ROOT}/artifacts/`. These
  are the durable chain. Each step produces exactly one artifact.
- **Source draft** - The starting RFC, design spec, PRD, or method schema under
  review. It is an external input, not a method artifact.
- **Review pass** - One of the three independent critique lenses: implementer,
  systems, or comparative.
- **Prompt header** - A self-contained file the orchestrator writes before
  dispatch. Contains the full worker contract: mission, inputs, output path,
  output schema, success criteria, and handoff instructions.
- **Synthesis** - When the orchestrator (Claude session) reads prior artifacts and
  writes a new artifact directly, without dispatching a worker.

## Principles

- **Artifacts, not commentary.** Every step produces a concrete file. No step exits
  without writing its output artifact.
- **Three lenses before rewrite.** Buildability, system fit, and comparative
  pressure all happen before the canonical amendment is written.
- **One amended draft, not comment accretion.** Review output is input to
  `caveat-resolution.md`, not a substitute for `amended-spec.md`.
- **Contracts and plans are different artifacts.** `execution-packet.md` hardens
  constraints and verification obligations. `implementation-plan.md` sequences the
  work without reinterpreting the contract.
- **Self-contained headers.** Dispatch steps do NOT use `--template`. The prompt
  header carries the full worker contract and the standard handoff headings.
- **Stop before code.** This method hardens documents only. There is no
  `manage-codex` delegation step and no implementation phase.

## Setup

```bash
SOURCE_DRAFT="<path-to-source-draft>"
RUN_SLUG="<spec-slug>"
RUN_ROOT=".relay/method-runs/${RUN_SLUG}"
mkdir -p "${RUN_ROOT}/artifacts"
```

Record `SOURCE_DRAFT` and `RUN_ROOT` - all paths below are relative to `RUN_ROOT`.

**Per-step scaffolding** - before each dispatch step, create:
```bash
step_dir="${RUN_ROOT}/phases/<step-name>"
mkdir -p "${step_dir}/handoffs" "${step_dir}/last-messages"
```

## Domain Skill Selection

When a step says `<domain-skills>`, pick only the remaining skill budget after
counting the fixed skills already required by that step:
- Rust core: `rust`
- Swift app: `swift-apps`
- Web or React or Next: `next-best-practices`
- API or service design: `api-design-patterns`
- Matching or optimization systems: `hierarchical-matching-systems`

Never exceed 3 total skills per dispatch. Steps 4 and 10 already spend two fixed
skills, so add at most 1 domain skill there. Do not append interactive skills
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

## Phase 1: Intake

### Step 1: Spec Intake - `interactive`

**Objective:** Establish what draft is in scope, who the document must serve, and
what the build-vs-debate boundary is.

Ask the user (via AskUserQuestion):

> Share the draft you want hardened. Then answer:
> 1. Who is the primary audience for this document?
> 2. What intended outcome must the hardened spec enable?
> 3. What is explicitly out of scope?
> 4. What open questions still matter?
> 5. Which decisions are required before build begins?

Write their response to `${RUN_ROOT}/artifacts/spec-brief.md`:

```markdown
# Spec Brief
## Source Document
## Intended Outcome
## Primary Audience
## Non-Goals
## Open Questions
## Decisions Required Before Build
```

**Gate:** `spec-brief.md` exists with non-empty Source Document, Intended Outcome,
and Non-Goals sections.

**Failure mode:** Reviewers optimize for different audiences or solve different
documents.

---

## Phase 2: Multi-Angle Review

### Step 2: Draft Digest - `synthesis`

**Objective:** Normalize the draft into a concise substrate so every review pass
critiques the same thing.

The orchestrator reads `SOURCE_DRAFT` and `artifacts/spec-brief.md` and writes
`${RUN_ROOT}/artifacts/draft-digest.md`:

```markdown
# Draft Digest
## Core Claims
## Proposed Mechanism
## Dependencies
## Assumptions
## Ambiguities
## Missing Artifacts
```

Do not invent new design decisions while writing the digest. Capture the current
mechanism, assumptions, and ambiguities as they exist in the draft.

**Gate:** `draft-digest.md` captures the mechanism, assumptions, and ambiguities
without inventing new design decisions.

**Failure mode:** Parallel reviews respond to different interpretations of the draft.

Steps 3, 4, and 5 all consume `draft-digest.md` and can be dispatched in parallel
once Step 2 is complete.

### Step 3: Implementer Review - `dispatch`

**Objective:** Evaluate whether the draft can actually be built, tested, and
sequenced by implementers.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-3/handoffs" "${RUN_ROOT}/phases/step-3/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-3/prompt-header.md`):
Use the canonical header schema with:
- Mission: Evaluate the draft for buildability, missing seams, testability, and
  sequencing hazards from an implementer point of view
- Inputs: Full `draft-digest.md`
- Output path: `${RUN_ROOT}/phases/step-3/implementer-review.md`
- Output schema:
  ```markdown
  # Implementer Review
  ## Buildability Risks
  ## Missing Interfaces or Contracts
  ## Testability Concerns
  ## Sequencing Hazards
  ## Required Clarifications
  ```
- Success criteria: The review names concrete build seams or explicitly says why
  the draft already looks buildable
- Handoff: The standard handoff block from the canonical header schema, written to
  `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-3/prompt-header.md \
  --skills clean-architecture,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-3 \
  --out ${RUN_ROOT}/phases/step-3/prompt.md

cat ${RUN_ROOT}/phases/step-3/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-3/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-3/implementer-review.md
cp ${RUN_ROOT}/phases/step-3/implementer-review.md ${RUN_ROOT}/artifacts/implementer-review.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `implementer-review.md` manually using the required schema.

**Gate:** The review names concrete build seams or explicitly says why the draft
already looks buildable.

**Failure mode:** The document reads well but collapses when someone tries to
implement it.

### Step 4: Systems Review - `dispatch`

**Objective:** Pressure the draft from the perspective of boundaries, operations,
failure modes, and long-term system shape.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-4/handoffs" "${RUN_ROOT}/phases/step-4/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-4/prompt-header.md`):
Use the canonical header schema with:
- Mission: Pressure the draft for architectural boundary issues, runtime risks,
  failure handling gaps, concurrency concerns, and operational blind spots
- Inputs: Full `draft-digest.md`
- Output path: `${RUN_ROOT}/phases/step-4/systems-review.md`
- Output schema:
  ```markdown
  # Systems Review
  ## Boundary Risks
  ## Operational Concerns
  ## Failure Modes
  ## State and Concurrency Concerns
  ## Migration or Observability Gaps
  ```
- Success criteria: The review covers both architecture and runtime or operational
  concerns
- Handoff: The standard handoff block from the canonical header schema, written to
  `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-4/prompt-header.md \
  --skills architecture-exploration,clean-architecture,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-4 \
  --out ${RUN_ROOT}/phases/step-4/prompt.md

cat ${RUN_ROOT}/phases/step-4/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-4/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-4/systems-review.md
cp ${RUN_ROOT}/phases/step-4/systems-review.md ${RUN_ROOT}/artifacts/systems-review.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `systems-review.md` manually using the required schema.

**Gate:** The review covers both architecture and runtime or operational concerns.

**Failure mode:** The draft is locally coherent but systemically unsafe.

### Step 5: Comparative Review - `dispatch`

**Objective:** Compare the draft to serious adjacent patterns or prior art so the
amended spec reflects deliberate choices instead of isolated local taste.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-5/handoffs" "${RUN_ROOT}/phases/step-5/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-5/prompt-header.md`):
Use the canonical header schema with:
- Mission: Compare the draft to serious adjacent patterns or prior art and turn
  those comparisons into adopt-or-avoid guidance
- Inputs: Full `draft-digest.md`
- Output path: `${RUN_ROOT}/phases/step-5/comparative-review.md`
- Output schema:
  ```markdown
  # Comparative Review
  ## Comparable Patterns
  ## Tradeoffs vs Draft
  ## Where the Draft is Stronger
  ## Where the Draft is Weaker
  ## Adopt or Avoid Recommendations
  ```
- Success criteria: The review includes at least two meaningful comparisons or
  explicitly records that relevant prior art was not found
- Handoff: The standard handoff block from the canonical header schema, written to
  `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-5/prompt-header.md \
  --skills deep-research,architecture-exploration \
  --root ${RUN_ROOT}/phases/step-5 \
  --out ${RUN_ROOT}/phases/step-5/prompt.md

cat ${RUN_ROOT}/phases/step-5/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-5/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-5/comparative-review.md
cp ${RUN_ROOT}/phases/step-5/comparative-review.md ${RUN_ROOT}/artifacts/comparative-review.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `comparative-review.md` manually using the required schema.

**Gate:** The review includes at least two meaningful comparisons or explicitly
records that relevant prior art was not found.

**Failure mode:** The draft bakes in arbitrary decisions that looked reasonable
only because nothing was compared.

---

## Phase 3: Amendment

### Step 6: Caveat Resolution - `interactive`

**Objective:** Turn three critique streams into explicit decisions about what to
amend now, what to defer, and what to reject.

Present the three review artifacts to the user. Ask (via AskUserQuestion):

> Here are the implementer, systems, and comparative review caveats.
>
> 1. Which caveats should become amendments now?
> 2. Which caveats are you explicitly rejecting?
> 3. Which risks are real but deferred instead of fixed in this pass?
> 4. What scope cuts, if any, should we make before rewriting the draft?

Write their response to `${RUN_ROOT}/artifacts/caveat-resolution.md`:

```markdown
# Caveat Resolution
## Accepted Caveats
## Rejected Caveats
## Deferred Risks
## Priority Amendments
## Scope Cuts
```

**Gate:** Accepted Caveats exist or an explicit no-change rationale is recorded,
and Deferred Risks are named.

**Failure mode:** The rewrite hand-waves conflicts and no one can tell which
critique actually changed the design.

### Step 7: Amended Draft - `synthesis`

**Objective:** Publish one canonical revised spec that incorporates accepted
caveats and makes remaining risk explicit.

The orchestrator reads `SOURCE_DRAFT`, `artifacts/draft-digest.md`, and
`artifacts/caveat-resolution.md` and writes `${RUN_ROOT}/artifacts/amended-spec.md`:

```markdown
# Amended Spec
## Problem and Goal
## Proposed Design
## Interfaces and Boundaries
## Invariants
## Failure Handling
## Open Risks
## Non-Goals
```

Every accepted caveat must be reflected in the amended draft, and every deferred
risk must remain visible.

**Gate:** Every accepted caveat is reflected in the amended draft, and every
deferred risk remains visible.

**Failure mode:** Review comments accumulate, but implementers still do not have a
canonical document to trust.

---

## Phase 4: Contracting

### Step 8: Execution Packet - `synthesis`

**Objective:** Convert the amended spec into a build-ready contract with
constraints, invariants, and verification obligations.

The orchestrator reads `artifacts/amended-spec.md`, `artifacts/systems-review.md`,
and `artifacts/caveat-resolution.md` and writes
`${RUN_ROOT}/artifacts/execution-packet.md`:

```markdown
# Execution Packet
## Invariants
## Interfaces to Implement
## Constraints
## Verification Strategy
## Required Artifacts
## Rollback or Reopen Triggers
```

**Gate:** Invariants, Verification Strategy, and Rollback or Reopen Triggers are
non-empty.

**Failure mode:** The spec sounds sharper but still is not machine-checkable or
execution-safe.

---

## Phase 5: Planning

### Step 9: Implementation Plan - `synthesis`

**Objective:** Sequence the work into slices that can be implemented and reviewed
without reinterpreting the execution packet.

The orchestrator reads `artifacts/amended-spec.md` and
`artifacts/execution-packet.md` and writes
`${RUN_ROOT}/artifacts/implementation-plan.md`:

```markdown
# Implementation Plan
## Slice Order
## Dependencies
## Layer or Owner per Slice
## Test Obligations per Slice
## Review Points
## Done Criteria
```

Every slice must reference at least one execution-packet obligation and carry an
associated test or verification responsibility.

**Gate:** Every slice references an execution-packet obligation and has an
associated test or verification responsibility.

**Failure mode:** Execution begins with a document but no safe sequence.

---

## Phase 6: Validation

### Step 10: Plan Review - `dispatch`

**Objective:** Adversarially review the implementation plan before anyone starts
coding from it.

This step is assessment only - the worker does NOT modify source code or revise the
artifacts directly.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-10/handoffs" "${RUN_ROOT}/phases/step-10/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-10/prompt-header.md`):
Use the canonical header schema with:
- Mission: Adversarially review the implementation plan against the execution
  packet, identify blocking gaps, and issue a READY or REVISE verdict with a clear
  reopen target when needed
- Inputs: Full `execution-packet.md` and full `implementation-plan.md`
- Output path: `${RUN_ROOT}/phases/step-10/plan-review.md`
- Output schema:
  ```markdown
  # Plan Review
  ## Plan Strengths
  ## Blocking Gaps
  ## Sequence Risks
  ## Missing Verification
  ## Approval Conditions
  ## Verdict: READY / REVISE
  ```
- Success criteria: `READY` appears only when Blocking Gaps are empty. `REVISE`
  names whether to reopen `caveat-resolution.md`, `amended-spec.md`, or
  `implementation-plan.md`
- Handoff: The standard handoff block from the canonical header schema, written to
  `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-10/prompt-header.md \
  --skills seam-ripper,clean-architecture,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-10 \
  --out ${RUN_ROOT}/phases/step-10/prompt.md

cat ${RUN_ROOT}/phases/step-10/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-10/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-10/plan-review.md
cp ${RUN_ROOT}/phases/step-10/plan-review.md ${RUN_ROOT}/artifacts/plan-review.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `plan-review.md` manually using the required schema.

**Gate with reopen:** Read the plan review verdict.
- `READY` -> method complete
- `REVISE` -> present `plan-review.md` to the user and ask (via AskUserQuestion):
  > The plan review verdict is REVISE.
  >
  > 1. Do you want to reopen `caveat-resolution.md`, reopen `amended-spec.md`,
  >    revise only `execution-packet.md` plus `implementation-plan.md`, or pause
  >    for a new decision loop upstream?
  > 2. What specific issue should govern the reopen or revision?

**Failure mode:** The team starts implementation from a plan that looked organized
but cannot survive contact with the actual system.

---

## Artifact Chain Summary

```text
spec-brief.md
  -> draft-digest.md
  -> implementer-review.md + systems-review.md + comparative-review.md
  -> caveat-resolution.md
  -> amended-spec.md
  -> execution-packet.md
  -> implementation-plan.md
  -> plan-review.md
```

## Resume Awareness

If `${RUN_ROOT}/artifacts/` already has files, determine the resume point:

1. Check artifacts in chain order (spec-brief -> draft-digest -> implementer-review,
   systems-review, comparative-review -> caveat-resolution -> amended-spec ->
   execution-packet -> implementation-plan -> plan-review)
2. Treat the multi-angle review phase as complete only when all three review
   artifacts exist and satisfy their gates
3. Find the last complete artifact with a passing gate
4. Continue from the next step

If `plan-review.md` exists with a `REVISE` verdict, resume from the user-selected
reopen point rather than blindly repeating Step 10.

This is best-effort - the method has no durable state beyond artifacts on disk and
step-local relay directories. If a session dies mid-step, check the step's relay
directory for worker output before concluding the step failed.

## Circuit Breaker

Escalate to the user when:
- A dispatch step fails twice (no valid output after 2 attempts)
- Caveat resolution cannot produce explicit accepted, rejected, and deferred buckets
- Plan review returns `REVISE` twice for the same unresolved gap
- The user chooses to pause for a new decision loop upstream
