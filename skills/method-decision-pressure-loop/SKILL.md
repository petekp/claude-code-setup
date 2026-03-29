---
name: method:decision-pressure-loop
description: >
  Architecture decision workflow for choosing between meaningful architectural or
  protocol options under uncertainty before implementation begins. 8 steps across
  5 phases: Framing -> Reality Mapping -> Option Exploration -> Pressure ->
  Publication. Use when the team needs a defensible decision with explicit
  tradeoffs, reopen conditions, and implementation-facing guidance — not when the
  goal is already code delivery.
---

# Decision-Pressure-Loop Method

An artifact-centric workflow that turns architectural uncertainty into a pressure-tested
decision before code begins. It chains decision framing -> system reality -> serious options
-> explicit weighting -> adversarial pressure -> durable publication. The user steers at
three checkpoints where judgment must become conscious rather than implicit.

## When to Use

- Architectural or protocol decisions with real downside either way
- Work where multiple serious options exist and tradeoffs are not obvious
- Situations where the team needs reopen conditions before implementation starts
- Align work inside `pipeline` when downstream execution depends on a safe architectural call

Do NOT use for code delivery, bug fixes, or tasks where the decision is already settled.

## Glossary

- **Artifact** — A canonical method output file in `${RUN_ROOT}/artifacts/`. These are the
  durable chain. Each step produces exactly one artifact.
- **Worker handoff** — The raw output a Codex worker writes to its relay `handoffs/` directory.
  Worker handoffs are inputs to artifact synthesis, not artifacts themselves.
- **Prompt header** — A self-contained file the orchestrator writes before dispatch. Contains
  the full worker contract: mission, inputs, output path, output schema, success criteria.
- **Synthesis** — When the orchestrator (Claude session) reads prior artifacts and writes a
  new artifact directly, without dispatching a worker.
- **Reopen signal** — Evidence that the current decision should be revisited instead of
  patched around locally.

## Principles

- **Artifacts, not debates.** Every step produces a concrete file. No step exits
  without writing its output artifact.
- **Reality before options.** The current system is mapped before options are generated,
  so the decision responds to real constraints instead of aspiration.
- **Score before pressure.** Comparison logic becomes explicit before the front-runner is
  attacked, which prevents hidden priority drift.
- **User steers priorities, not approvals.** Checkpoints ask the user to choose what to
  optimize and what downside to accept on purpose.
- **Stop before code.** This method ends with a durable decision guide, not an execution
  packet or delivery contract.
- **Skill composition, not redundancy.** `architecture-exploration` and `solution-explorer`
  generate grounded options, `seam-ripper` and `clean-architecture` harden the pressure
  step, and `method:spec-hardening` can follow once the decision is stable.

## Setup

```bash
RUN_SLUG="<decision-slug>"
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

When a step says `<domain-skills>`, pick 1-2 skills matching the affected system:
- Rust core: `rust`
- Swift app: `swift-apps`
- Both: `rust,swift-apps`
- Web frontend: `next-best-practices`

Never exceed 4 total skills per dispatch. If a step already names two base skills
(`solution-explorer` + `architecture-exploration`, or `seam-ripper` + `clean-architecture`),
add at most one domain skill. Do not append interactive skills (like `proposal-review`
or `grill-me`) to autonomous `codex exec` dispatches.

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

## Phase 1: Framing

### Step 1: Decision Frame — `interactive`

**Objective:** Turn a vague "we should rethink this" impulse into a crisp decision question
with explicit stakes and reopen triggers.

**User checkpoint:** The user names the real decision and the qualities that must be protected.

Ask the user (via AskUserQuestion):

> We are opening a decision-pressure loop. Please answer:
> 1. What is the concrete architectural or protocol decision we need to make now?
> 2. What triggered this reconsideration?
> 3. Over what time horizon should this decision hold before we expect to revisit it?
> 4. Which qualities must be protected even if that makes the decision slower or more expensive?
> 5. What is explicitly outside this decision?
> 6. What signals should reopen this decision later?

Write their response to `${RUN_ROOT}/artifacts/decision-brief.md`:

```markdown
# Decision Brief
## Decision Question
## Triggering Context
## Time Horizon
## Must-Protect Qualities
## Non-Decision Space
## Reopen Signals
```

**Gate:** `decision-brief.md` exists with non-empty Decision Question, Must-Protect Qualities,
and Non-Decision Space.

**Failure mode:** The method optimizes a vague aspiration instead of a real decision.

---

## Phase 2: Reality Mapping

### Step 2: Current System Map — `dispatch`

**Objective:** Capture the current architecture, boundary ownership, operational constraints,
and pain points that any serious option must respond to.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-2/handoffs" "${RUN_ROOT}/phases/step-2/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-2/prompt-header.md`):
```markdown
# Step 2: Current System Map

## Mission
Capture the current architecture, boundary ownership, operational constraints, and
pain points that any serious option must respond to.

## Inputs
Full text of `decision-brief.md`

## Output
- **Path:** `${RUN_ROOT}/phases/step-2/current-system-map.md`
- **Schema:** `# Current System Map`, `## System Boundary`,
  `## Existing Responsibilities`, `## Operational Constraints`,
  `## Known Pain Points`, `## Invariants and Contracts`,
  `## Unknowns That Matter`

## Success Criteria
The map is grounded in the current system and includes at least one invariant,
one operational constraint, and one pain point.

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

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-2/prompt-header.md \
  --skills architecture-exploration,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-2 \
  --out ${RUN_ROOT}/phases/step-2/prompt.md

cat ${RUN_ROOT}/phases/step-2/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-2/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-2/current-system-map.md
cp ${RUN_ROOT}/phases/step-2/current-system-map.md ${RUN_ROOT}/artifacts/current-system-map.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `current-system-map.md` manually using the required schema.

**Gate:** `current-system-map.md` is grounded in the current system and includes at least
one invariant, one operational constraint, and one pain point.

**Failure mode:** Option generation happens in the abstract and ignores the real system.

---

## Phase 3: Option Exploration

### Step 3: Generate Serious Options — `dispatch`

**Objective:** Produce distinct options that differ on real dimensions rather than cosmetic
implementation variations.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-3/handoffs" "${RUN_ROOT}/phases/step-3/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-3/prompt-header.md`):
```markdown
# Step 3: Generate Serious Options

## Mission
Produce distinct architectural or protocol options that differ on real dimensions
rather than cosmetic implementation variations.

## Inputs
Full `decision-brief.md` and full `current-system-map.md`

## Output
- **Path:** `${RUN_ROOT}/phases/step-3/decision-options.md`
- **Schema:** `# Decision Options`; for each option include `## Option N`,
  `- Architecture Shape`, `- Ownership Boundary`,
  `- Migration Blast Radius`, `- Failure Surface`,
  `- Operational Profile`, `- Explicit Disqualifiers`;
  repeat for at least three options

## Success Criteria
At least three options exist, and each option differs from the others on at
least two of architecture shape, ownership boundary, migration cost, or failure surface.

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

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-3/prompt-header.md \
  --skills solution-explorer,architecture-exploration,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-3 \
  --out ${RUN_ROOT}/phases/step-3/prompt.md

cat ${RUN_ROOT}/phases/step-3/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-3/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-3/decision-options.md
cp ${RUN_ROOT}/phases/step-3/decision-options.md ${RUN_ROOT}/artifacts/decision-options.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `decision-options.md` manually using the required schema.

**Gate:** At least three options exist, and each option differs from the others on at
least two of architecture shape, ownership boundary, migration cost, or failure surface.

**Failure mode:** The user gets a false choice among slight variants of the same idea.

### Step 4: Score and Compare — `synthesis`

**Objective:** Make the comparison logic explicit before the team falls in love with a
favorite option.

The orchestrator reads `decision-brief.md`, `current-system-map.md`, and
`decision-options.md`, then writes `${RUN_ROOT}/artifacts/decision-scorecard.md`:

```markdown
# Decision Scorecard
## Evaluation Dimensions
## Weights
## Per-Option Scores
## Confidence per Score
## Ties and Sensitivities
## Preliminary Front-Runner
```

Each score must include reasoning and a confidence label (`high`, `medium`, or `low`);
do not write naked numbers without explanation.

**Gate:** `decision-scorecard.md` has weighted dimensions, per-option reasoning, and
confidence labels rather than naked numbers.

**Failure mode:** The recommendation is driven by vibe or recency bias instead of
explicit tradeoffs.

---

## Phase 4: Pressure

### Step 5: Tradeoff Weighting Checkpoint — `interactive`

**Objective:** Let the user consciously choose which quality to optimize now and which
downside to accept on purpose.

**User checkpoint:** The user chooses the tradeoff weighting after the scorecard is visible.

Present `decision-scorecard.md` to the user. Ask (via AskUserQuestion):

> The scorecard is visible. Please answer:
> 1. Rank the evaluation dimensions in the order you want optimized now.
> 2. Which risks or downsides are you willing to accept on purpose if that priority order wins?
> 3. Which costs or regressions are you explicitly rejecting even if they improve another dimension?
> 4. What constraints must not regress under the chosen weighting?

Write their response to `${RUN_ROOT}/artifacts/decision-steer.md`:

```markdown
# Decision Steer
## Chosen Priority Order
## Risks Willingly Accepted
## Costs Explicitly Rejected
## Must-Not-Regress Constraints
```

**Gate:** Priority order and accepted risks are explicit, and they map back to
scorecard dimensions.

**Failure mode:** The pressure test attacks the wrong dimension or the final
recommendation silently optimizes the wrong thing.

### Step 6: Pressure Test the Leading Option — `dispatch`

**Objective:** Attack the front-runner with serious objections, scenario failures,
and runner-up comparison pressure.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-6/handoffs" "${RUN_ROOT}/phases/step-6/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-6/prompt-header.md`):
```markdown
# Step 6: Pressure Test the Leading Option

## Mission
Attack the front-runner with serious objections, scenario failures, boundary-level
criticism, and direct runner-up comparison pressure.

## Inputs
Full `current-system-map.md`, full `decision-options.md`, full `decision-scorecard.md`,
and full `decision-steer.md`

## Output
- **Path:** `${RUN_ROOT}/phases/step-6/pressure-report.md`
- **Schema:** `# Pressure Report`, `## Strongest Objections`,
  `## Scenario Attacks`, `## Boundary Breaks`,
  `## Comparison to Runner-Up`, `## Surviving Thesis`,
  `## Reopen Recommendation`

## Success Criteria
The report includes at least one plausible failure scenario, one boundary-level
objection, and an explicit comparison to the strongest alternative.

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

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-6/prompt-header.md \
  --skills seam-ripper,clean-architecture,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-6 \
  --out ${RUN_ROOT}/phases/step-6/prompt.md

cat ${RUN_ROOT}/phases/step-6/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-6/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-6/pressure-report.md
cp ${RUN_ROOT}/phases/step-6/pressure-report.md ${RUN_ROOT}/artifacts/pressure-report.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `pressure-report.md` manually using the required schema.

**Gate:** The report includes at least one plausible failure scenario, one boundary-level
objection, and an explicit comparison to the strongest alternative.

**Failure mode:** The favored option survives only because nobody attacked its weakest seam.

### Step 7: Decision Commit — `interactive`

**Objective:** Turn the pressure-tested tradeoff into an accountable choice with named
downsides and reopen conditions.

**User checkpoint:** The user commits to a pressure-tested option and explicitly accepts
the downside profile.

Present `decision-scorecard.md` and `pressure-report.md` to the user. Ask (via AskUserQuestion):

> The front-runner has been pressure-tested. Please answer:
> 1. Which option are we choosing?
> 2. Why does this option win now, given the scorecard and pressure report?
> 3. Which downsides are we explicitly accepting?
> 4. Which alternatives are we rejecting, and why not now?
> 5. What conditions should reopen this decision later?

Write their response to `${RUN_ROOT}/artifacts/decision-choice.md`:

```markdown
# Decision Choice
## Chosen Option
## Why This Wins Now
## Accepted Downsides
## Rejected Alternatives
## Conditions That Reopen the Decision
```

**Gate:** `decision-choice.md` exists with non-empty Chosen Option, Accepted Downsides,
and at least one Rejected Alternative.

**Failure mode:** The loop never becomes a decision, so downstream work re-litigates
the same debate.

---

## Phase 5: Publication

### Step 8: Publish ADR and Implementation Guide — `synthesis`

**Objective:** Package the outcome into a durable artifact that downstream implementers
can follow without reopening the decision by accident.

The orchestrator reads `decision-brief.md`, `current-system-map.md`,
`decision-choice.md`, and `pressure-report.md`, then writes
`${RUN_ROOT}/artifacts/decision-guide.md`:

```markdown
# Decision Guide
## ADR Summary
## Current-State Snapshot
## Chosen Direction
## Interface or Ownership Changes
## Migration Guidance
## Risk Watchpoints
## Verification Questions for Implementers
## Reopen Conditions
```

**Gate:** The guide contains both decision rationale and implementation-facing guardrails,
and it preserves the reopen conditions.

**Failure mode:** Future implementers understand the answer but not the reasons, or
understand the reasons but not how to apply them.

---

## Artifact Chain Summary

```text
decision-brief.md                           [user: decision frame]
  -> current-system-map.md
  -> decision-options.md
  -> decision-scorecard.md
  -> decision-steer.md                      [user: tradeoff weighting checkpoint]
  -> pressure-report.md
  -> decision-choice.md                     [user: decision commit]
  -> decision-guide.md
```

## Resume Awareness

If `${RUN_ROOT}/artifacts/` already has files, determine the resume point:

1. Check artifacts in chain order (decision-brief -> current-system-map -> ... -> decision-guide)
2. Find the last complete artifact with passing gate
3. Continue from the next step

This is best-effort — the method has no durable state beyond artifacts on disk and
step-local relay directories. If a session dies mid-step, check the step's relay
directory for worker output before concluding the step failed.

## Circuit Breaker

Escalate to the user when:
- A dispatch step fails twice (no valid output after 2 attempts)
- The current system cannot be mapped with enough evidence to produce a grounded option set
- No option survives pressure without violating Must-Protect Qualities
- The user cannot commit at Step 7 without contradicting the Step 5 priority order
