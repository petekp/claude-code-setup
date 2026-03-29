---
name: pipeline
description: >
  Modular development pipeline orchestrator. Use for "/pipeline", "pipeline init",
  "pipeline resume", "pipeline status", or phased triage → align → execute workflows.
---

# Pipeline

Orchestrate triage → align → execute phases with machine-validated gates and artifact-based
resume. Each phase narrows scope until a constraint contract is tight enough for autonomous
execution.

## Principles

- Forward-only phase progression: triage → align → execute. No phase type can repeat
  in the same position without superseding the prior one.
- `state.json` is a thin cached projection (<2KB). `events.ndjson` is the authoritative ledger.
- All paths are repo-root-relative. Never store absolute paths.
- The pipeline orchestrator owns `.pipeline/` state. manage-codex owns relay child state.
- Execute output artifacts are owned by the pipeline orchestrator, not the child workflow.

## Filesystem Contract

```
.pipeline/
  state.json              # thin active index (<2KB)
  events.ndjson           # append-only mutation ledger
  mission/                # mission documents
  constraints/sets/       # promoted constraint sets
  phases/
    <phase-id>/
      artifacts/          # phase output artifacts + resume.md
      runtime/            # execute phases only
        relay/            # child workflow state (manage-codex relay root)
        adapter-status.json
        adapter-lock.json
```

## Setup & Resume

```bash
# Initialize a new pipeline
./scripts/pipeline/update-pipeline.sh --event init_pipeline --mission-id <id>

# Resume: read state.json, then check adapter-status.json for active execute phases
cat .pipeline/state.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin), indent=2))"
```

Resume protocol:
1. Read `state.json` — check `status`, `current_phase_id`, `latest_resume`
2. If an execute phase has `child_workflow`, read `adapter-status.json` at the
   phase's `adapter.status_path`
3. If adapter-status is fresher, run `child_checkpoint` to reconcile forward
4. If adapter-status is stale (>30min) and non-terminal, surface to user
5. If `automatic_resume.blocked` is true, surface the drift to user before continuing
6. Never dispatch a new child workflow if `adapter-lock.json` exists and status is non-terminal

## Triage

Interactive phase. The orchestrator explores the problem space with the user.

```bash
./scripts/pipeline/update-pipeline.sh --event phase_added --phase-id phase-001-triage --phase-type triage --skill-version v1
./scripts/pipeline/update-pipeline.sh --event phase_started --phase-id phase-001-triage
# ... interactive work produces mission document ...
./scripts/pipeline/update-pipeline.sh --event mission_activated --mission-path .pipeline/mission/mission-v001.md
./scripts/pipeline/update-pipeline.sh --event phase_completed --phase-id phase-001-triage
```

## Align

Interactive phase. Narrows scope into a machine-checkable constraint contract.

Required output artifacts (gate-checked): `execution-spec.md`, `constraints.json`,
`verification-plan.md`. Recommended (not gate-checked in v1): `decision-log.md` for traceability.

```bash
./scripts/pipeline/update-pipeline.sh --event phase_added --phase-id phase-002-align --phase-type align --skill-version v1
./scripts/pipeline/update-pipeline.sh --event phase_started --phase-id phase-002-align
# ... interactive work produces artifacts ...
./scripts/pipeline/update-pipeline.sh --event artifact_recorded --phase-id phase-002-align --artifact-id execution-spec --artifact-path .pipeline/phases/phase-002-align/artifacts/execution-spec.md --artifact-role output
./scripts/pipeline/update-pipeline.sh --event artifact_recorded --phase-id phase-002-align --artifact-id constraints --artifact-path .pipeline/phases/phase-002-align/artifacts/constraints.json --artifact-role output
./scripts/pipeline/update-pipeline.sh --event constraint_set_activated --constraint-path .pipeline/phases/phase-002-align/artifacts/constraints.json
./scripts/pipeline/update-pipeline.sh --event phase_completed --phase-id phase-002-align
```

## Execution Readiness Gate

Machine-validated gate between align and execute. Cannot be bypassed by prose.

```bash
./scripts/pipeline/update-pipeline.sh --event gate_passed --phase-id phase-002-align --summary "Execution readiness confirmed"
./scripts/pipeline/update-pipeline.sh --event gate_failed --phase-id phase-002-align --summary "open_questions nonzero"
```

Gate checks (all must pass):
- `constraints.json` exists and is valid JSON
- `allowed_paths` is a non-empty array with no wildcards
- `interface_changes` field exists
- `verification_commands` is non-empty
- `non_goals` is non-empty
- `open_questions` is empty (`[]`)

A failed gate blocks execute. Add a new align phase to address the gaps.

## Execute

Autonomous phase. Dispatches manage-codex with an explicit `--root` pointing at the
phase's relay directory.

```bash
# Add execute phase (requires adapter metadata)
./scripts/pipeline/update-pipeline.sh --event phase_added --phase-id phase-003-execute --phase-type execute --skill-version v1 --adapter-id manage-codex-relay --adapter-version v1

# Start (blocked unless predecessor gate passed)
./scripts/pipeline/update-pipeline.sh --event phase_started --phase-id phase-003-execute

# Pipeline orchestrator creates the task header before dispatch
# artifacts/manage-codex-header.md — owned by pipeline orchestrator

# Dispatch manage-codex with explicit relay root
cat .pipeline/phases/phase-003-execute/runtime/relay/prompt.md | codex exec --full-auto -o .pipeline/phases/phase-003-execute/runtime/relay/last-messages/last-message-{slice_id}.txt -

# Monitor child workflow
./scripts/pipeline/update-pipeline.sh --event child_checkpoint --phase-id phase-003-execute

# After child workflow completes, orchestrator creates output artifacts:
# artifacts/output.md — owned by pipeline orchestrator
# artifacts/gate-report.json — owned by pipeline orchestrator

./scripts/pipeline/update-pipeline.sh --event phase_completed --phase-id phase-003-execute
./scripts/pipeline/update-pipeline.sh --event pipeline_completed
```

Execute output artifact ownership:
- `artifacts/manage-codex-header.md` — created by pipeline orchestrator **before** dispatch
- `artifacts/output.md` — created by pipeline orchestrator **after** child completes
- `artifacts/gate-report.json` — created by pipeline orchestrator **after** child completes

## Forward-Only Rule

Phase progression is forward-only. If a gate fails or constraints change:
1. Supersede the current phase: `--event superseded --phase-id <id> --summary <reason>`
2. Add a new phase of the same or earlier type
3. `active_epoch_id` increments on supersession

## Circuit Breakers

Escalate to the user when:
- Adapter-status is stale (>30 minutes, non-terminal)
- Artifact drift detected on a locked phase
- `automatic_resume.blocked` is true in state

## User Briefing

- `pipeline status`: read-only view of `state.json` — current phase, child workflow status,
  resume pointer, automatic resume state
- `pipeline resume`: start from `state.json`, reconcile adapter-status, then continue
- `pipeline init`: create `.pipeline/`, write initial `state.json`, prompt for mission
