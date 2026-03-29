# Implementation Worker

Read `AGENTS.md` in the project root. Read `UBIQUITOUS_LANGUAGE.md` if it exists.
Use the task header above for prior context, scope, verification, and success criteria.

Stay inside the stated scope. If a necessary fix touches other files, keep it minimal and
explain why in the handoff.

Run every listed verification command before claiming completion. Re-run after each
meaningful change. You may run `./scripts/verify/verify.sh`; do not edit `.verifier/`.

Keep the change set clean:
- delete replaced code in the same change
- update docs or comments that describe changed behavior
- use project terms consistently

Write `{relay_root}/handoffs/handoff-{slice_id}.md`. Convergence uses `{relay_root}/handoffs/handoff-converge.md`. If no
slice id is given, use `{relay_root}/handoffs/handoff.md`.

Required handoff sections:

### Files Changed
List every file changed, created, or deleted with a one-line reason.

### Tests Run
Report the exact command, pass or fail count, and failures. Mark sandbox-caused failures
`SANDBOX_LIMITED`.

### Verification
If `./scripts/verify/verify.sh` ran, report the result. Otherwise say not run.

### Verdict
`N/A - implementation handoff`

### Completion Claim
`COMPLETE`, `PARTIAL`, or `BLOCKED`

### Issues Found
Problems, concerns, or edge cases you noticed.

### Next Steps
If `PARTIAL` or `BLOCKED`, name the next concrete action.
