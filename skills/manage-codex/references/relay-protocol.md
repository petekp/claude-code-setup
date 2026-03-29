# Relay Protocol

Canonical reference. Templates inline this now. `compose-prompt.sh` appends this file only
for legacy templates that do not already contain handoff sections.

Write handoff files here:
- implement and review: `{relay_root}/handoffs/handoff-{slice_id}.md`
- converge: `{relay_root}/handoffs/handoff-converge.md`
- fallback: `{relay_root}/handoffs/handoff.md`

Required sections:
- `### Files Changed`
- `### Tests Run` - exact command, pass or fail count, failures; mark sandbox-caused
  failures `SANDBOX_LIMITED`
- `### Verification` - verifier result or `not run`
- `### Verdict`
  - review: `CLEAN` or `ISSUES FOUND`
  - converge: `COMPLETE AND HARDENED` or `ISSUES REMAIN`
  - implement: `N/A - implementation handoff`
- `### Completion Claim` - `COMPLETE`, `PARTIAL`, or `BLOCKED`
- `### Issues Found`
- `### Next Steps` - required for `PARTIAL` or `BLOCKED`

The canonical review verdict still lives in `{relay_root}/review-findings/review-findings-{slice_id}.md`. Echo it
in the handoff so the orchestrator can cross-check artifacts.
