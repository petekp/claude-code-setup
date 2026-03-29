---
name: method:flow-audit-and-repair
description: >
  Forensic debugging workflow for broken end-to-end flows.
  8 steps across 5 phases: Failure Framing → Forensics → Repair Design →
  Layered Repair → Reaudit. Use when an existing flow is broken, flaky, or
  operationally unsafe and the team needs a path from observed failure to
  verified repair — not for greenfield features or speculative design work.
---

# Flow-Audit-and-Repair Method

An artifact-centric workflow that chains observed failure → live audit → layered
causality → regression contract → ordered repair → live re-audit. Each phase
produces a named artifact that becomes the next phase's input. The user steers
at three checkpoints where behavioral priority, scope cuts, and close-vs-reopen
judgment matter most.

## When to Use

- Existing end-to-end flows that are broken, flaky, or operationally unsafe
- Bugs that likely cross boundaries (UI, service, storage, process, runtime, network)
- Failures where anecdotal reports are not enough and the team needs forensic evidence
- Corrective work that must end in a verified repair, not just plausible code edits

Do NOT use for feature ideation, greenfield implementation, or tasks where no
real broken flow needs to be reproduced.

## Glossary

- **Artifact** — A canonical method output file in `${RUN_ROOT}/artifacts/`. These are the
  durable chain. Each step produces exactly one artifact.
- **Worker handoff** — The raw output a Codex worker writes to its relay `handoffs/` directory.
  Worker handoffs are inputs to artifact synthesis, not artifacts themselves.
- **Prompt header** — A self-contained file the orchestrator writes before dispatch. Contains
  the full worker contract: mission, inputs, output path, output schema, success criteria.
- **Regression contract** — The executable proof obligation for the prioritized failure:
  failing tests, probes, or an explicit instrumentation-based fallback when tests are impossible.
- **Synthesis** — When the orchestrator (Claude session) reads prior artifacts and writes a
  new artifact directly, without dispatching a worker.

## Principles

- **Artifacts, not activities.** Every step produces a concrete file. No step exits
  without writing its output artifact.
- **Self-contained headers.** Dispatch steps do NOT use `--template`. The prompt header
  carries the full worker contract: mission, inputs, output schema, success criteria,
  and handoff instructions.
- **Start from observed failure.** This method begins with broken behavior in the real flow,
  not product intent, design preference, or speculative cleanup.
- **Audit before repair.** `exhaustive-systems-analysis` supplies audit rigor, but this
  method forces the live-flow evidence pass before repair slicing starts.
- **Prove repair with executable obligations.** `tdd` is not optional here; it is the
  mechanism that turns symptoms into durable regression obligations.
- **Repair by layer, then re-audit the real flow.** `manage-codex` executes slices only
  after a repair packet exists, and closure requires a live re-audit rather than a test pass.
- **Existing skills are components, not the method.** `pipeline` can host this loop, but
  this method defines the domain-specific choreography from failure evidence to reopen decision.

## Setup

```bash
RUN_SLUG="<flow-slug>"
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
- Rust core, services, CLI, or adapters: `rust`
- Swift app or native UI orchestration: `swift-apps`
- Cross-boundary repairs spanning both: `rust,swift-apps`

Never exceed 3 total skills per dispatch. For Step 7, because `manage-codex` and
`tdd` are already required, pick only 1 domain skill.

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

## Phase 1: Failure Framing

### Step 1: Failure Brief — `interactive`

**Objective:** Define the broken behavior precisely enough that later audit and repair
work can stay anchored to observable reality.

Ask the user (via AskUserQuestion):

> Describe the broken flow you want repaired. Then answer:
> 1. What should happen when the flow works?
> 2. What actually happens instead?
> 3. What exact path reproduces it most reliably?
> 4. Who is affected, and what is the user or operator impact?
> 5. What evidence sources do we already have: logs, traces, screenshots, transcripts, metrics, or bug reports?
> 6. What scope cuts are allowed for this repair pass?
> 7. What exact result lets us say the repair is done?

Write their response to `${RUN_ROOT}/artifacts/failure-brief.md`:

```markdown
# Failure Brief
## Expected Behavior
## Actual Behavior
## Reproduction Path
## User/Operator Impact
## Evidence Sources
## Allowed Scope Cuts
## Done Signal
```

**Gate:** `failure-brief.md` exists with non-empty Expected Behavior, Actual Behavior,
Reproduction Path, and Done Signal.

**Failure mode:** The team repairs symptoms, over-expands scope, or argues about success
after code changes land.

---

## Phase 2: Forensics

### Step 2: Live Flow Audit — `dispatch`

**Objective:** Reproduce the failure in the live or closest-available runtime path and
capture the evidence trail across boundaries.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-2/handoffs" "${RUN_ROOT}/phases/step-2/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-2/prompt-header.md`):
Include the canonical header schema with:
- Mission: Reproduce the broken flow in the live or nearest runtime path, capture
  the timeline across boundaries, and separate direct observations from speculation
- Inputs: Full `failure-brief.md`
- Output path: `${RUN_ROOT}/phases/step-2/audit-trace.md`
- Output schema:
  ```markdown
  # Audit Trace
  ## Reproduction Result
  ## Timeline of Events
  ## Boundary Observations
  ## Logs and State Evidence
  ## Suspected Breakpoints
  ## Unknowns
  ```
- Success criteria: The artifact contains either a reproduced failure or an explicit
  non-reproduction result, plus enough evidence to explain what was observed
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-2/prompt-header.md \
  --skills exhaustive-systems-analysis,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-2 \
  --out ${RUN_ROOT}/phases/step-2/prompt.md

cat ${RUN_ROOT}/phases/step-2/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-2/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-2/audit-trace.md
cp ${RUN_ROOT}/phases/step-2/audit-trace.md ${RUN_ROOT}/artifacts/audit-trace.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `audit-trace.md` manually using the audit trace schema.

**Gate:** `audit-trace.md` records either a reproduced failure or an explicit
non-reproduction result, plus enough evidence to explain what was observed.

**Failure mode:** Repair work starts from anecdote instead of observed system behavior.

### Step 3: Layered Causal Map — `synthesis`

**Objective:** Convert the audit evidence into a layer-aware root-cause map that
separates confirmed causes from plausible hypotheses.

The orchestrator reads `artifacts/failure-brief.md` and `artifacts/audit-trace.md`
and writes `${RUN_ROOT}/artifacts/causal-map.md`:

```markdown
# Causal Map
## Symptom Inventory
## Layer Breakdown
## Confirmed Causes [fact]
## Candidate Causes [hypothesis]
## Cross-Layer Dependencies
## Highest-Confidence Repair Edges
```

Map every major symptom to at least one layer. Within the causes sections, preserve
the distinction between directly evidenced facts and hypotheses inferred from the audit.

**Gate:** Every major symptom is mapped to at least one layer with an evidence label,
and the artifact distinguishes facts from hypotheses.

**Failure mode:** Multiple layers get edited at once without a causal model, causing
thrash and accidental regressions.

---

## Phase 3: Repair Design

### Step 4: Repair Focus Checkpoint — `interactive`

**Objective:** Let the user choose which failure matters most, which tradeoff is
acceptable, and where the method should draw the line on v1 repair scope.

Present `causal-map.md` to the user. Ask (via AskUserQuestion):

> Here is the layered causal map for the broken flow.
>
> 1. Which single failure or degraded behavior should we prioritize first?
> 2. Which behaviors must stay intact while we repair it?
> 3. What tradeoffs are acceptable in this pass?
> 4. What scope cuts are explicitly allowed?
> 5. What conditions should force escalation instead of more local fixes?

Write their response to `${RUN_ROOT}/artifacts/repair-steer.md`:

```markdown
# Repair Steer
## Priority Failure
## Must-Keep Behaviors
## Acceptable Tradeoffs
## Allowed Scope Cuts
## Escalation Triggers
```

**Gate:** `repair-steer.md` exists with explicit Priority Failure and Must-Keep Behaviors,
and any scope cuts are named rather than implied.

**Failure mode:** The loop optimizes the wrong part of the flow or quietly drops behavior
the user cared about.

### Step 5: Regression Contract — `dispatch`

**Objective:** Turn the prioritized failure into executable proof obligations before
repair begins.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-5/handoffs" "${RUN_ROOT}/phases/step-5/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-5/prompt-header.md`):
Include the canonical header schema with:
- Mission: Convert the prioritized failure into failing tests or probes before repair
  starts. Prefer executable regression tests. If that is impossible, state why and
  define an explicit instrumentation-based proof contract instead.
- Inputs: Full `failure-brief.md`, full `causal-map.md`, and full `repair-steer.md`
- Output path: `${RUN_ROOT}/phases/step-5/regression-contract.md`
- Output schema:
  ```markdown
  # Regression Contract
  ## Target Behaviors
  ## Reproduction Harness
  ## Failing Tests or Probes Added
  ## Coverage Gaps
  ## Evidence of Failure
  ```
- Success criteria: The primary failure has at least one executable failing test or
  probe. If not possible, the artifact explicitly explains why and defines an
  instrumentation-based proof contract
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-5/prompt-header.md \
  --skills tdd,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-5 \
  --out ${RUN_ROOT}/phases/step-5/prompt.md

cat ${RUN_ROOT}/phases/step-5/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-5/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-5/regression-contract.md
cp ${RUN_ROOT}/phases/step-5/regression-contract.md ${RUN_ROOT}/artifacts/regression-contract.md
```

If the worker only wrote `handoffs/handoff.md`, the orchestrator reads it and
synthesizes `regression-contract.md` manually, then confirms that the failing test,
probe, or instrumentation contract described there actually exists.

**Gate:** The primary failure has at least one executable failing test or probe. If not
possible, the artifact states why and defines an explicit instrumentation-based proof contract.

**Failure mode:** The repair cannot prove that the original bug was closed or that the
same flow will stay closed.

### Step 6: Repair Packet — `synthesis`

**Objective:** Translate the causal map and regression contract into a layer-ordered
repair plan with clear ownership and reopen conditions.

The orchestrator reads `artifacts/causal-map.md`, `artifacts/repair-steer.md`, and
`artifacts/regression-contract.md` and writes `${RUN_ROOT}/artifacts/repair-packet.md`:

```markdown
# Repair Packet
## Ordered Repair Slices
## Layer Ownership per Slice
## Invariants
## Interfaces to Preserve or Change
## Verification Commands
## Regression Obligations
## Reopen Conditions
```

Order slices by dependency direction so upstream enabling work happens before downstream
repair work. Each slice should carry its owning layer and at least one regression obligation.

**Gate:** Every slice has a named layer owner and at least one regression obligation,
and the slice order reflects dependency direction.

**Failure mode:** Fixes collide across boundaries, regressions are left unowned, or the
team cannot tell when to reopen the audit.

---

## Phase 4: Layered Repair

### Step 7: Layered Repair — `dispatch` (via manage-codex)

**Objective:** Implement the repair slices in dependency order and converge on a coherent
fix set.

This step delegates to the `manage-codex` skill for the full implement → review →
converge cycle. The orchestrator must create the manage-codex workspace explicitly.

**Adapter contract:**

```bash
REPAIR_ROOT="${RUN_ROOT}/phases/step-7"
mkdir -p "${REPAIR_ROOT}/archive" "${REPAIR_ROOT}/handoffs" \
  "${REPAIR_ROOT}/last-messages" "${REPAIR_ROOT}/review-findings"

{
  cat "${RUN_ROOT}/artifacts/repair-packet.md"
  printf '\n\n'
  cat "${RUN_ROOT}/artifacts/regression-contract.md"
} > "${REPAIR_ROOT}/CHARTER.md"
```

1. **Create CHARTER.md** from the repair packet plus regression contract:
   The `CHARTER.md` written above becomes the single implementation contract for the
   manage-codex loop.

2. **Write the manage-codex prompt header** at `${REPAIR_ROOT}/prompt-header.md`:
   Use the canonical header schema with:
   - Mission: Implement the repair slices described in `CHARTER.md` using the
     manage-codex implement → review → converge cycle. Respect slice order,
     boundary ownership, and regression obligations.
   - Inputs: Full text of `repair-packet.md` and `regression-contract.md`
     (already combined into `CHARTER.md`)
   - Output path: `${REPAIR_ROOT}/handoffs/handoff-converge.md`
   - Output schema: manage-codex convergence handoff format
   - Success criteria: The primary regression harness passes, every repair slice is
     completed or explicitly deferred, and the convergence handoff names residual risks
   - Handoff: Standard relay handoff headings (`### Files Changed`, `### Tests Run`,
     `### Completion Claim`) to prevent relay-protocol.md contamination
   - Also reference: one domain skill and the verification commands from `repair-packet.md`

3. **Compose and dispatch:**
   ```bash
   ./scripts/relay/compose-prompt.sh \
     --header ${REPAIR_ROOT}/prompt-header.md \
     --skills manage-codex,tdd,<domain-skills> \
     --root ${REPAIR_ROOT} \
     --out ${REPAIR_ROOT}/prompt.md

   cat ${REPAIR_ROOT}/prompt.md | \
     codex exec --full-auto \
     -o ${REPAIR_ROOT}/last-messages/last-message-manage-codex.txt -
   ```

4. **After manage-codex completes**, the orchestrator synthesizes `repair-handoff.md`:

   **Source artifacts (read in this order):**
   - `${REPAIR_ROOT}/handoffs/handoff-converge.md` — the convergence verdict (primary source)
   - `${REPAIR_ROOT}/batch.json` — slice metadata showing what was built
   - The last implementation slice handoff at `${REPAIR_ROOT}/handoffs/handoff-<last-slice-id>.md`
     (find the slice id from `batch.json`)

   Note: manage-codex review workers may overwrite per-slice handoff files. If a slice
   handoff is missing or appears to be a review artifact, use `batch.json` slice metadata
   and the convergence handoff to reconstruct what was built.

   **Write** `${RUN_ROOT}/artifacts/repair-handoff.md` with:
   ```markdown
   # Repair Handoff
   ## Slices Implemented
   ## Files and Boundaries Touched
   ## Tests Added or Updated
   ## Verification Run
   ## Residual Risks
   ## Verdict: REPAIRED / PARTIAL / BLOCKED
   ```

   **Gate:** The primary regression harness passes, every repair slice is either
   completed or explicitly deferred, and the handoff names residual risks. If
   convergence says `ISSUES REMAIN`, the manage-codex loop should have addressed them —
   escalate to the user if it did not.

**Verify:**
```bash
test -f ${REPAIR_ROOT}/handoffs/handoff-converge.md
test -f ${RUN_ROOT}/artifacts/repair-handoff.md
```

**Failure mode:** A partial fix lands with hidden residue, unproven behavior, or no
accountability for what remains.

---

## Phase 5: Reaudit

### Step 8: Flow Reaudit — `dispatch`

**Objective:** Re-run the real flow after repair and judge whether live behavior now
matches the original failure brief.

**Setup:**
```bash
mkdir -p "${RUN_ROOT}/phases/step-8/handoffs" "${RUN_ROOT}/phases/step-8/last-messages"
```

**Header** (`${RUN_ROOT}/phases/step-8/prompt-header.md`):
Include the canonical header schema with:
- Mission: Re-run the real flow after repair, compare current behavior to the original
  failure brief and prior audit trace, and issue a close-or-reopen verdict. Do not stop
  at test results; inspect the runtime path itself.
- Inputs: Full `failure-brief.md`, full `audit-trace.md`, and full `repair-handoff.md`
- Output path: `${RUN_ROOT}/phases/step-8/flow-verdict.md`
- Output schema:
  ```markdown
  # Flow Verdict
  ## Reaudit Result
  ## Expected vs Actual
  ## Regression Pack Status
  ## Remaining Breakpoints
  ## Operational Follow-Ups
  ## Verdict: CLOSED / PARTIAL / REOPEN
  ```
- Success criteria: `CLOSED` is used only when the live flow and regression pack agree.
  If the result is `PARTIAL` or `REOPEN`, the exact failing boundary is named.
- Handoff: `handoffs/handoff.md`

**Dispatch (no --template):**
```bash
./scripts/relay/compose-prompt.sh \
  --header ${RUN_ROOT}/phases/step-8/prompt-header.md \
  --skills exhaustive-systems-analysis,<domain-skills> \
  --root ${RUN_ROOT}/phases/step-8 \
  --out ${RUN_ROOT}/phases/step-8/prompt.md

cat ${RUN_ROOT}/phases/step-8/prompt.md | \
  codex exec --full-auto \
  -o ${RUN_ROOT}/phases/step-8/last-messages/last-message.txt -
```

**Verify and promote:**
```bash
test -f ${RUN_ROOT}/phases/step-8/flow-verdict.md
cp ${RUN_ROOT}/phases/step-8/flow-verdict.md ${RUN_ROOT}/artifacts/flow-verdict.md
```

**Gate:** `CLOSED` is allowed only when the live flow and the regression pack agree.
`PARTIAL` or `REOPEN` must identify the exact boundary that failed.

**User checkpoint (only if verdict is `PARTIAL` or `REOPEN`):**
Ask the user (via AskUserQuestion):

> The re-audit verdict is [PARTIAL/REOPEN].
>
> 1. Do you want to narrow scope to the repaired subset, reopen the loop from the causal map, or accept an explicit partial operational patch?
> 2. If narrowing scope, what user-visible behavior is now out of scope?
> 3. If accepting a partial patch, what operator follow-up, monitoring, or caveat is required?

- Narrow scope → update `failure-brief.md` and `repair-steer.md`, then return to Step 5
  for a new regression contract on the narrowed target.
- Reopen → return to Step 3 with `flow-verdict.md` as additional evidence.
- Accept partial patch → keep `flow-verdict.md` as the final operational record.

**Failure mode:** Passing tests mask a still-broken real flow, or manual flow success
hides missing regression protection.

---

## Artifact Chain Summary

```text
failure-brief.md
  -> audit-trace.md
  -> causal-map.md
  -> repair-steer.md
  -> regression-contract.md
  -> repair-packet.md
  -> repair-handoff.md
  -> flow-verdict.md
```

## Resume Awareness

If `${RUN_ROOT}/artifacts/` already has files, determine the resume point:

1. Check artifacts in chain order (failure-brief → audit-trace → causal-map → repair-steer
   → regression-contract → repair-packet → repair-handoff → flow-verdict)
2. Find the last complete artifact with a passing gate
3. For Step 7 specifically: check `${RUN_ROOT}/phases/step-7/batch.json` for manage-codex
   resume state before restarting layered repair
4. Continue from the next step

This is best-effort — the method has no durable state beyond artifacts on disk and
step-local relay directories. If a session dies mid-step, check the step's relay
directory for worker output before concluding the step failed.

## Circuit Breaker

Escalate to the user when:
- A dispatch step fails twice (no valid output after 2 attempts)
- Step 7 converges to `BLOCKED` and no smaller scope cut or dependency-first slice is available
- Step 8 returns `REOPEN` and the user chooses to reopen rather than accept a narrowed
  or explicitly partial patch
