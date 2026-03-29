---
name: method:dry-run
description: >
  Validate a Claude Code method skill for mechanical soundness by dry-running a
  concrete feature through every step. Use when you need to dry run, validate a
  method, trace a method skill, check mechanical soundness, or verify that a
  method's setup, paths, commands, artifact chains, headers, templates, gates,
  and topology are wired correctly. Invoke this after authoring or editing any
  method skill, and before trusting it for real work.
---

# Method Dry Run

Validate a method skill by instantiating it with one concrete feature, then
symbolically executing every step. Each step gets a fixed 10-dimension checklist
AND a full simulation of its prompt assembly and worker output. Failures emerge
from both the systematic checklist and the execution trace.

This is an interactive, single-session skill for the orchestrator. Do not dispatch
it to Codex workers. The goal is mechanical soundness, not product quality.

## Core Model

Think of the dry run as symbolic execution for workflow text:

- The target `SKILL.md` is the executable behavior
- The target `method.yaml` is the declared topology
- `compose-prompt.sh` and any other referenced scripts are the runtime library
- The test feature is the concrete input
- The dry-run trace is the execution log

`SKILL.md` says what the orchestrator actually does. `method.yaml` only says what
the method claims its phases, actions, and artifacts are. Mechanical drift between
them is the workflow equivalent of type signatures diverging from implementation.

## When to Use

- "Dry run this method skill"
- "Validate this method"
- "Trace this method with a concrete feature"
- "Check this method for mechanical soundness"
- After authoring or editing any method skill
- Before trusting a method skill for real work on a feature

Do NOT use for architecture critique, feature design, or product judgment.
This skill only answers: "Can this method execute cleanly as written?"

## Inputs

- `METHOD_ROOT` — absolute path to the target method skill directory
- `TEST_FEATURE` — concrete feature description (specific enough to generate real slugs, paths, and likely worker outputs)
- `REPO_ROOT` — repo where the method would execute
- `DOMAIN_SKILLS` — comma-separated domain skills relevant to the feature (or "none")

Prefer a feature that touches the method's hardest seam. Good dry runs use a feature
that forces the method to exercise its adapters and artifact chain honestly.

Read these source files before tracing:

- `METHOD_SKILL="${METHOD_ROOT}/SKILL.md"` — required
- `METHOD_TOPOLOGY="${METHOD_ROOT}/method.yaml"` — if present
- The prompt assembler the method uses (usually `${REPO_ROOT}/scripts/relay/compose-prompt.sh`)
- **Every template, adapter, and script the method explicitly invokes.** Scan `SKILL.md`
  for `--template`, `--skills`, adapter references (like `manage-codex`), and any script
  paths. Read each one so you can trace their real behavior, not guess from names.

If `method.yaml` is missing, record that and keep going. If the method uses a prompt
assembler other than `compose-prompt.sh`, read that assembler's source and trace its
real interface instead. If the method uses no assembler at all (e.g., it writes prompts
directly), skip the prompt-assembly simulation and note the alternate approach. Do not
false-fail methods for using a different assembly mechanism.

## Output Location

Write the dry-run under a dedicated trace root, separate from the target method's
own artifact space:

```bash
METHOD_ID="$(basename "${METHOD_ROOT}")"
FEATURE_SLUG="<slug-from-test-feature>"
TRACE_ROOT="${REPO_ROOT}/.relay/method-dry-run/${METHOD_ID}-${FEATURE_SLUG}"
mkdir -p "${TRACE_ROOT}"
```

Artifacts produced:

- `${TRACE_ROOT}/validation-scope.md`
- `${TRACE_ROOT}/resolved-constants.md`
- `${TRACE_ROOT}/step-inventory.md`
- `${TRACE_ROOT}/dry-run-trace.md` — **primary output**

## Citation Discipline

Before tracing, create line-numbered copies so every failure can cite exact locations:

```bash
nl -ba "${METHOD_SKILL}" > "${TRACE_ROOT}/skill-lines.txt"
if [[ -f "${METHOD_TOPOLOGY}" ]]; then
  nl -ba "${METHOD_TOPOLOGY}" > "${TRACE_ROOT}/method-lines.txt"
fi
if [[ -f "${COMPOSE_SCRIPT}" ]]; then
  nl -ba "${COMPOSE_SCRIPT}" > "${TRACE_ROOT}/compose-lines.txt"
fi
```

Cite failures as `[SKILL.md:L142]`, `[SKILL.md:L142-L168]`, or `[method.yaml:L31-L46]`.

## Source-of-Truth Rule

Treat `SKILL.md` as the runtime source of truth. It defines commands, prompt-header
contracts, file paths, and gates.

Treat `method.yaml` as topology-only metadata. It must agree with `SKILL.md`, but it
does not define runtime behavior. When they disagree, cite both files and fail the
`method.yaml topology match` dimension.

## Fixed Checklist (10 Dimensions)

Run all 10 for every step, in order. Do not stop after the first failure. The point
is to surface the full mechanical failure set.

| # | Dimension | What to inspect | PASS condition |
|---|-----------|-----------------|----------------|
| 1 | Setup completeness | Directories created in setup vs every parent directory needed by prompt headers, outputs, handoffs, `--out`, `codex exec -o` | Every required parent directory is created before that step needs it |
| 2 | Path resolution | Every file path and variable reference in setup, action, headers, gates, commands | Every path can exist after concrete substitution; assumptions are recorded |
| 3 | Command validity | All `compose-prompt.sh` and `codex exec` invocations; interactive/synthesis instructions | Flags match the real script interface; output parent directories exist |
| 4 | Artifact chain closure | `consumes` and `produces` across step boundaries | Every consumed artifact has a prior producer with the exact name. Every produced artifact is either consumed by a later step or explicitly terminal. No orphaned byproducts (e.g., template-emitted files that nothing reads) |
| 5 | Canonical header compliance | Dispatch step prompt header contract | Header includes `## Mission`, `## Inputs`, `## Output` (with Path + Schema), `## Success Criteria`, `## Handoff Instructions` with `### Files Changed`, `### Tests Run`, `### Completion Claim` |
| 6 | Template contamination | `--template` use and the template's implied output contract | No template used, OR any template is proven to match the step's expected artifact |
| 7 | Placeholder leak | Unresolved `{...}` tokens after simulated prompt assembly | No unresolved placeholders remain in the final worker prompt |
| 8 | Action-type consistency | Match between declared action and actual behavior | Interactive → user prompt; dispatch → `codex exec --full-auto`; synthesis → orchestrator writes. No interactive skills in autonomous dispatches |
| 9 | Gate validity | Gate text vs the output schema actually promised by the step | Every gate references concrete sections the schema contains AND every gate outcome maps cleanly to the method's next action (continue, reopen, escalate). Loops like "re-run on failure" must have a concrete artifact path and execution contract |
| 10 | method.yaml topology match | Step ids, titles, actions, consumes, produces, parallel markers, execution mode, gate shape | Every runtime step has a matching topology entry with agreeing metadata on ALL fields. Title drift counts as a failure |

**N/A handling:** Some dimensions don't apply to all step types. Mark as `N/A` with a
one-word reason (e.g., "interactive step" for Template contamination). N/A does not
count as a failure.

## Workflow

### Step 1: Collect Inputs and Source Files — `interactive`

Ask for any missing inputs, then write `validation-scope.md`:

```markdown
# Validation Scope
## Target Method
## Concrete Test Feature
## Repo Root
## Domain Skills
## Source Files
## Citation Plan
## Missing Sources
```

If the target method lacks `method.yaml`, record that in `## Missing Sources` and keep going.

**Gate:** Target Method, Test Feature, Repo Root, and Source Files are non-empty.

### Step 2: Resolve Constants — `synthesis`

Write `resolved-constants.md`:

```markdown
# Resolved Constants
| Symbol | Concrete Value | Source | Confidence |
|--------|----------------|--------|------------|
## Path Expansions
## Undefined Symbols
## Assumptions
```

Resolve in two passes:
1. Extract symbols from the target method's setup section (`RUN_ROOT`, `IMPL_ROOT`, `step_dir`, etc.)
2. Add symbols that appear later in commands or paths. If a symbol is used but never defined, record it under `## Undefined Symbols` as a failure and bind a minimal placeholder so the trace can continue.

For each symbol record: concrete value, source, and confidence (`fact` or `assumption`).

Under `## Path Expansions`, expand every mechanically relevant path: prompt headers,
prompt outputs, worker outputs, handoff destinations, `last-messages/` files,
artifact promotion targets, gate file paths.

**Gate:** At least one symbol resolved. Path Expansions, Undefined Symbols, and Assumptions sections present.

### Step 3: Inventory Steps and Contracts — `synthesis`

Write `step-inventory.md`:

```markdown
# Step Inventory
## Steps
| Step | Phase | Action | Consumes | Produces | Parallelism |
|------|-------|--------|----------|----------|-------------|
## Worker Records
## Topology Mismatches
```

Build one record per runtime step from `SKILL.md`, using `method.yaml` only as the
topology cross-check. For each step: number, title, phase, action type, setup commands,
dispatch commands, artifacts consumed/produced, gate text, parallel workers.

For parallel dispatches, keep one parent step record and add worker details under
`## Worker Records`.

Under `## Topology Mismatches`, list: steps present in only one file, mismatched action
types, mismatched `consumes`/`produces`, missing parallel markers.

**Gate:** Steps table covers every step from SKILL.md. Topology Mismatches section present.

### Step 4: Simulate and Trace — `synthesis`

Write `dry-run-trace.md`. This is the core of the dry run.

For each step in runtime order, execute this simulation loop:

#### 4a. Resolve the step's concrete paths
Expand every variable to a concrete path. If a parent directory doesn't exist, record
the failure immediately.

#### 4b. Execute setup mentally
Write the exact setup commands with resolved paths. Compare what they create against what
the later action needs. Look for: missing `handoffs/`, missing `last-messages/`, missing
parent for `prompt-header.md`, `codex exec -o` parents never created.

#### 4c. Write the concrete prompt header
For dispatch steps, write out the actual header text the orchestrator would place into
`prompt-header.md`, including digested artifact content from prior steps. Check against
the canonical header schema. Verify the three relay-safe headings
(`### Files Changed`, `### Tests Run`, `### Completion Claim`) are present.

#### 4d. Assemble the prompt mentally
If the method uses `compose-prompt.sh`, simulate its real assembly order:

1. Copy header into output
2. Append each domain skill's SKILL.md
3. If `--template` is `review`, `ship-review`, or `converge`: append `review-preamble.md`
   first (this injects task-shape and audit-objective framing that can contaminate
   non-review steps)
4. Append the named template file (`${TEMPLATE}-template.md`)
5. Append `relay-protocol.md` if `### Files Changed`, `### Tests Run`, and
   `### Completion Claim` are missing from the assembled output
6. Replace `{relay_root}` if `--root` supplied
7. Fail if unresolved `{relay_root}` remains

If the method uses a different assembler, trace that assembler's real behavior instead.

Check: valid flags, no `--template` in self-contained methods, no relay-protocol
contamination, no review-preamble contamination for non-review steps, no unresolved
`{slice_id}` / `{charter_or_task_description}` / etc.

#### 4e. Simulate the worker's minimal valid output
Write the artifact a competent worker would produce. Record: exact output path, exact
headings, companion handoff path, whether filename matches what the orchestrator later
verifies or promotes.

#### 4f. Verify and promote
Simulate `test -f`, `cp`, fallback synthesis. Does the checked path exist? Does the `cp`
source match what the worker wrote? Does the promoted artifact land with the name the
next step expects?

#### 4g. Check the gate
A gate is valid only if it references sections that exist in the produced artifact and
the check is mechanically verifiable.

#### 4h. Trace the chain forward
Update the live artifact map. Does the next step's `consumes` match what's now in
`artifacts/`? Does `method.yaml` claim the same edge?

After the simulation loop, fill the 10-row checklist table for the step:

```markdown
#### Checklist Results
| Dimension | Status | Evidence |
|-----------|--------|----------|
| Setup completeness | PASS/FAIL/N/A | ... |
| Path resolution | PASS/FAIL/N/A | ... |
| Command validity | PASS/FAIL/N/A | ... |
| Artifact chain closure | PASS/FAIL/N/A | ... |
| Canonical header compliance | PASS/FAIL/N/A | ... |
| Template contamination | PASS/FAIL/N/A | ... |
| Placeholder leak | PASS/FAIL/N/A | ... |
| Action-type consistency | PASS/FAIL/N/A | ... |
| Gate validity | PASS/FAIL/N/A | ... |
| method.yaml topology match | PASS/FAIL/N/A | ... |
```

### Special Step Types

#### Interactive Steps
Trace the user prompt the method would show. Verify the method writes the resulting
artifact directly, with concrete headings satisfying the later gate. Fail if the step
dispatches instead of asking the user, or if `method.yaml` marks it interactive but
`SKILL.md` dispatches it.

#### Synthesis Steps
Verify the orchestrator writes the artifact directly from specified source inputs and
output schema. Fail if the method secretly dispatches or if the output schema is
underspecified for deterministic writing.

#### Adapter Steps
If a step delegates to another skill (like manage-codex), trace the adapter boundary
as a contract surface:

- What workspace is created?
- What files are copied in (e.g., CHARTER.md from execution-packet.md)?
- What file is the adapter's primary output?
- How does the orchestrator convert that output back into the method's artifact chain?

Adapter bugs are often semantic, not just path-based. Example: promoting a convergence
assessment as though it were an implementation handoff.

## Targeted Closure Pass

After the end-to-end simulation, do one short sweep for issues that hide between steps:

1. Compare `SKILL.md` and `method.yaml` step-by-step for any drift the per-step trace missed
2. Re-scan every mentally assembled prompt for unresolved `{...}` tokens
3. Verify every consumed artifact has exactly one upstream producer
4. If the method uses external templates or scripts, verify flags and output names match the real interface

This is a safety net, not a second audit. Keep it brief.

## Failure Logging

Every failure must include:

- **Category:** `Path`, `Command`, `Chain`, `Contamination`, `Placeholder`, `Action`, `Schema`, `Gate`, `Topology`, or `Adapter`
- **Citation:** exact file location, line-numbered
- **Evidence:** the concrete failing path, command, or artifact name
- **Reason:** why the trace breaks mechanically
- **Consequence:** what downstream step or behavior is affected

Format:

```markdown
1. [Path][SKILL.md:L142-L151] Step 2A writes
   `${RUN_ROOT}/phases/step-2a/last-messages/last-message.txt`,
   but setup never creates `${RUN_ROOT}/phases/step-2a/last-messages/`.
   `codex exec -o` would fail before the worker can complete.
```

For drift bugs between files, cite both:

```markdown
2. [Topology][SKILL.md:L310-L336][method.yaml:L31-L46]
   SKILL.md promotes `internal-digest.md`, but method.yaml does not declare it as produced.
```

## Output Schema

`dry-run-trace.md` must use this structure:

```markdown
# Dry Run Trace: <test feature>

## Resolved Constants
[All variables resolved to concrete values]

## Step-by-Step Trace
### Step N: <name>
#### Setup Commands
#### Action
#### Expected Artifacts Produced
#### Artifacts Consumed by Next Step
#### Checklist Results
| Dimension | Status | Evidence |
|-----------|--------|----------|
| Setup completeness | PASS/FAIL/N/A | ... |
| ... | ... | ... |
#### Failures Found
[Categorized failures with citations, or "None discovered in this step"]

## Artifact Chain (verified)
[Full chain with closure status for each link]

## Mechanical Failures Found
[Deduplicated, numbered list of all failures across all steps]

## VERDICT
MECHANICALLY SOUND / HAS FAILURES (N)
```

The verdict is binary. Any unresolved failure means `HAS FAILURES (N)`.

## Finish Condition

The dry run is complete only when:

- Every step has been traced with concrete paths and artifact names
- Every dispatch step has a fully simulated prompt assembly (4a-4h)
- Every step has a filled 10-row checklist table
- Every gate was checked against a real output schema
- The artifact chain closes from first artifact to last
- `method.yaml` and `SKILL.md` agree on topology, or every disagreement is logged
- The trace artifact is written to the durable trace path
- The verdict is binary and justified by the failure list

## Practical Notes

- Prefer evidence over interpretation. Quote the path, command, or schema name.
- Keep failures mechanical. "This seems confusing" is not a dry-run failure.
- If the method mixes valid and invalid mechanics in the same step, finish all 10 checks.
- If a target method is mid-migration, do not paper over inconsistencies. Record them.
- For parallel branches, trace each worker under its own `##### Worker: <name>` subheading
  within the parent step. Each worker gets its own simulation (4a-4h) and its own checklist
  table. A parallel step only passes if every worker passes its own mechanical checks.
