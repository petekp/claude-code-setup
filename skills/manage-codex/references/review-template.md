# Adversarial Review

Inspect the implementation diff with `git diff --stat` and `git diff`.

Original task:
{slice.task}

Success criteria: {slice.success_criteria}

Worker claim:
{handoff_summary}

Rerun every verification command from the header. If a command the worker claimed passed
does not pass for you, verdict = `ISSUES FOUND`.

Write `{relay_root}/review-findings/review-findings-{slice_id}.md`:

```markdown
## Review: {slice.task}

### ISSUES
### CONCERNS
### POSITIVE
### VERDICT
CLEAN or ISSUES FOUND
```

Write `{relay_root}/handoffs/handoff-{slice_id}.md` with:

### Files Changed
None - review only.

### Tests Run
Exact command, pass or fail count, failures; mark sandbox-caused failures
`SANDBOX_LIMITED`.

### Verification
If `./scripts/verify/verify.sh` ran, report the result. Otherwise say not run.

### Verdict
`CLEAN` or `ISSUES FOUND`

### Completion Claim
`COMPLETE`, `PARTIAL`, or `BLOCKED`

### Issues Found
Concrete problems or unresolved concerns.

### Next Steps
If `PARTIAL` or `BLOCKED`, name the next concrete action.
