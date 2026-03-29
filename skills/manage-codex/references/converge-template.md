# Convergence Assessment

Final quality gate. Do not modify source. Decide only `COMPLETE AND HARDENED` or
`ISSUES REMAIN`.

Original mission:
{charter_or_task_description}

Completed slices:
{FOR each slice IN completed_slices}
### {slice.id}: {slice.task}
- Type: {slice.type}
- Attempts: impl={slice.impl_attempts}, verify_fails={slice.verify_failures}, review_rejects={slice.review_rejections}
- Verification: {slice.verification}
- Review: {slice.review}
- Files changed: {slice.files_changed}
{ENDFOR}

Independently:
- review the full diff: `git diff {base_branch}...HEAD`
- rerun the union of verification commands listed in the header
- confirm completeness, residue cleanup, consistent terms and patterns, adequate tests,
  and clean diff hygiene

Treat permission, bind, and sandbox failures as `SANDBOX_LIMITED`; note them separately.
They do not block a hardened verdict by themselves.

If issues remain, list slice candidates in this format:

```markdown
- **Issue**: [description]
  **Scope**: [files or directories]
  **Severity**: [must-fix | should-fix | nice-to-have]
  **Suggested approach**: [how to address it]
```

Write `{relay_root}/handoffs/handoff-converge.md` with:

### Files Changed
None - assessment only.

### Tests Run
Exact command, pass or fail count, failures; mark sandbox-caused failures
`SANDBOX_LIMITED`.

### Verification
If `./scripts/verify/verify.sh` ran, report the result. Otherwise say not run.

### Verdict
`COMPLETE AND HARDENED` or `ISSUES REMAIN`

### Completion Claim
`COMPLETE`, `PARTIAL`, or `BLOCKED`

### Issues Found
Anything that blocks a hardened verdict or still looks risky.

### Next Steps
If the verdict is not hardened, name the next concrete action.
