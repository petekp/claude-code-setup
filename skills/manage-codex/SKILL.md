---
name: manage-codex
description: >
  Autonomous batch orchestrator for dispatching workers. Use for "/manage-codex",
  "manage codex", "use codex", "dispatch to codex", or long-running worker-dispatched
  work. Workers run via Codex CLI when installed, or via Agent fallback.
---

# Manage Codex

You are the orchestrator. Workers implement, review, and converge. Delegate the
work unless a tiny orchestration-only fix is lower risk than dispatching a worker.

Loop:
- `plan -> implement -> review -> converge`
- `review reject -> re-implement -> re-review`

Done only when the convergence worker says `COMPLETE AND HARDENED`.

## Principles

- Orchestrator owns planning, dispatch, artifact reads, and `{relay_root}/batch.json`
- Workers never edit `batch.json`
- Implementation and review always run in separate sessions
- Review and convergence workers diagnose only; they do not fix code
- Use `./scripts/relay/update-batch.sh --root {relay_root}`; never hand-edit relay state
- All relay paths thread through `--root`; standalone default is `--root .relay`
- Spot-check at least one claimed command before trusting a worker handoff
- Preserve `--skills`, repeated `--verification`, and `--criteria` on follow-up slices

## Dispatch Backend

Workers run via either **Codex CLI** or **Claude Code Agent**. The backend is
auto-detected: if `codex` is on PATH, use Codex; otherwise, fall back to Agent.

**Codex backend:** `cat {relay_root}/prompt.md | codex exec --full-auto -o {relay_root}/last-messages/last-message-{slice_id}.txt -`

**Agent backend:** Use the Agent tool with the assembled prompt as the task and `isolation: "worktree"`:
`Agent(task=<contents of {relay_root}/prompt.md>, isolation="worktree")`

Or use the dispatch helper which auto-detects:
`./scripts/relay/dispatch.sh --prompt {relay_root}/prompt.md --output {relay_root}/last-messages/last-message-{slice_id}.txt`

The implement/review/converge loop, artifact chain, gates, and handoff format are
**identical** regardless of backend.

## Setup

- Detect dispatch backend: `command -v codex >/dev/null 2>&1` (codex if found, agent otherwise)
- If codex is found: `codex --version`
- Determine relay root: use `--root` from caller if provided, otherwise `.relay`
- `mkdir -p {relay_root}/archive {relay_root}/handoffs {relay_root}/last-messages {relay_root}/review-findings`
- If `AGENTS.md` is missing, create it from `references/agents-md-template.md`

## Plan

Read the task, `CHARTER.md`, and `SLICES.yaml` if present. Write `{relay_root}/batch.json`
with:

- batch fields: `batch_id`, `charter`, `branch`, `head_at_plan`,
  `max_attempts_per_slice`, `max_total_attempts_per_slice`,
  `max_convergence_attempts`, `convergence_attempts`
- one record per slice: `id`, `type`, `task`, `file_scope`, `domain_skills`,
  `verification_commands`, `success_criteria`, `status`, `impl_attempts`,
  `review_rejections`

Slice types:
- `implement`: worker writes code, then review
- `review`: audit existing code, then create fix slices if needed
- `converge`: final assessment

Write state to disk on every phase transition. The orchestrator is the only writer.

## Prompt Assembly

Write only the task-specific header. Use
`scripts/relay/compose-prompt.sh --header ... --skills ... --template ... --root {relay_root} --out ...`
to append domain skills, the selected template, and substitute relay root paths.

- `implement` slices: `--template implement`
- worker review: `--template review`
- `review` slices: `--template ship-review`
- convergence: `--template converge`

Templates own worker instructions and handoff format.

## Implement

Skip this phase for `review` slices.

1. Compose the prompt and dispatch:
   `./scripts/relay/dispatch.sh --prompt {relay_root}/prompt.md --output {relay_root}/last-messages/last-message-{slice_id}.txt`
2. Verify output exists using explicit checks — never zsh globs or `||` chains:
   `test -f {relay_root}/handoffs/handoff-{slice_id}.md && wc -l {relay_root}/handoffs/handoff-{slice_id}.md`
   If the file is missing, check the worker output trace for `file update` diffs before
   concluding the worker failed. The trace is the definitive record.
3. Read `{relay_root}/handoffs/handoff-{slice_id}.md`; fall back to
   `{relay_root}/last-messages/last-message-{slice_id}.txt`
4. Spot-check one critical claimed command
5. Record `impl_dispatched` with `update-batch.sh --root {relay_root}`, the handoff path,
   and a one-line summary
6. Move to review

## Review

1. Compose the review prompt and dispatch
2. Verify outputs exist using explicit checks:
   `test -f {relay_root}/review-findings/review-findings-{slice_id}.md && wc -l {relay_root}/review-findings/review-findings-{slice_id}.md`
   If missing, check the worker output trace for `file update` diffs before re-dispatching.
3. Read `{relay_root}/review-findings/review-findings-{slice_id}.md` and parse `### VERDICT`
4. Cross-check that `{relay_root}/handoffs/handoff-{slice_id}.md` echoes the same verdict
5. Use:
   - `review_clean` for `CLEAN`
   - `review_rejected` for `ISSUES FOUND` on `implement` slices
6. For `review` slices with `ISSUES FOUND`, add one or more fix slices with full
   metadata: `--skills`, repeated `--verification`, `--criteria`
7. Enforce slice attempt limits and circuit breakers before looping

## Converge

Enter only when all non-converge slices are done.

1. Compose the convergence prompt with the mission, slice summaries, and union of
   verification commands
2. Dispatch and read `{relay_root}/handoffs/handoff-converge.md`
3. If verdict is `COMPLETE AND HARDENED`, record `converge_complete`
4. If verdict is `ISSUES REMAIN`, record `converge_failed`, add fix slices with full
   metadata, and loop unless the convergence max is exceeded
5. If the handoff marks items `SANDBOX_LIMITED`, rerun those commands outside the
   sandbox before giving the user a final verdict

## Sandbox Notes

- Expect permission failures around TCP or UDP bind, `sandbox-exec`, and some manifest or
  filesystem access
- Mark these `SANDBOX_LIMITED`; do not confuse them with real product failures
- Real failures still block review and convergence

## Direct Resolution Events

Use only via `./scripts/relay/update-batch.sh`.

- `analytically_resolved`: closed by inspection; no code change needed. Put the evidence
  in `--summary`
- `orchestrator_direct`: orchestrator makes a narrow low-risk fix directly. Run relevant
  verification and summarize what changed in `--summary`

Never use these to skip review, hide failed attempts, or avoid verification.

## Circuit Breaker

Escalate to the user when any slice hits `impl_attempts > 3` or
`impl_attempts + review_rejections > 5`. Include: counter values, failure output, the
failure pattern, and options (adjust scope, skip, raise limit, abort).

## Resume

If `{relay_root}/batch.json` exists, compare `head_at_plan` with `git rev-parse HEAD`.
Match → resume from the first pending slice. Mismatch → warn the user.
Run `./scripts/relay/update-batch.sh --root {relay_root} --validate` after resuming.
Never restart completed slices.

## User Briefing

One-line status between phases. Full briefing only for escalations or batch completion.

## Verification Boundary

Workers may run `./scripts/verify/verify.sh`. Workers must never modify `.verifier/` files.
Offer verification evolution only after human approval of the converged batch.
