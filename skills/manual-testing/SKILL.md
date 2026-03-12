---
name: manual-testing
description: Guide users through targeted manual verification after code changes. Use when asked to "test this", "verify it works", "QA this", "walk me through testing", "smoke test", "sanity check", "regression test", "acceptance test", or after implementing a feature or bug fix that still needs human validation. Favor this skill for focused verification of the current change; use a broader exploratory-testing skill for open-ended bug hunting across an entire app.
---

# Manual Testing

Finish work with a tight verification loop: prove everything possible with tools first, then ask the user to verify only what requires human eyes, hands, devices, or judgment.

Do not make the user invent the test plan. Lead them through it.

## Quality Bar

Before asking the user to do anything, know:

- What changed
- What the expected behavior is
- What can be verified automatically
- What still needs a human check
- What nearby behavior could have regressed

Never ask the user to "poke around" or "let me know if it works." Give concrete actions, a specific screen or command, the expected result, and a short set of likely outcomes to reply with.

## Workflow

### 1. Build a Verification Matrix

Translate the change into a short verification plan before running anything.

For each changed behavior, capture:

- Primary success path
- Most likely failure or edge case
- One nearby regression check
- Verification owner: tool or user

Use a simple internal checklist like:

| Behavior | Happy path | Edge/regression | Verified by |
|----------|------------|-----------------|-------------|
| Save settings | Form saves | Validation error still works | Tool + user |

Keep the matrix small and focused on the current change.

### 2. Run Tool-Verifiable Checks First

Exhaust automated verification before involving the user.

Prefer to verify these yourself:

- Build, compile, typecheck, lint, test
- API responses and status codes
- File output, database state, logs, and side effects
- CLI behavior, exit codes, and generated artifacts
- Browser automation, screenshots, DOM text, or network behavior when tools can prove it

Only hand work to the user when the result depends on:

- Visual correctness
- Motion, timing, or feel
- Real-device behavior
- Cross-browser differences
- Screen reader behavior
- Third-party flows that require human interaction

If an automated check fails, stop and address it before asking for manual verification.

### 3. Prepare the User Path

Set the user up so they can perform the check with minimal effort.

Provide:

- Exact route, URL, screen, or command
- Any required setup state
- The single action to take
- The expected result
- What to reply with

If the user needs an already-running app, point them to the exact place to open. If you can safely prepare state, data, or fixtures first, do that yourself.

### 4. Lead the User Through Atomic Steps

Run manual verification as a guided sequence, not a dump of vague instructions.

Prefer one atomic step at a time. For a tiny smoke test, bundle at most 2-3 closely related checks.

Use this structure:

```text
Testing: [feature or fix]
Progress: Step N of M

Action: [exact thing to click, type, or inspect]
Expected: [what should happen]
Reply with one:
1. [expected outcome]
2. [common failure mode]
3. [second common failure mode]
4. Other
```

If structured question tools are available, convert those reply options into a structured prompt. Otherwise ask the question in plain text with the options inline.

Example:

```text
Testing: profile photo upload
Progress: Step 2 of 3

Action: Open `/settings/profile`, upload a PNG under 2 MB, and wait for the save state to finish.
Expected: The new avatar appears in the header and no error message is shown.
Reply with one:
1. Upload worked and the new avatar is visible
2. Upload finished but the avatar did not update
3. I saw an error message or spinner got stuck
4. Other
```

### 5. Cover the Right Surface Area

Always test the changed path first, then cover the most likely place it could fail.

Use these prompts as a calibration checklist.

**For UI changes:**

- Check initial render
- Check loading, empty, error, disabled, and success states when relevant
- Check keyboard/focus path for interactive controls
- Check mobile or narrow-width layout if the change is layout-sensitive
- Check copy, spacing, and obvious visual regressions

**For bug fixes:**

- Reproduce the original bug path
- Verify the bug no longer occurs
- Verify a nearby path still behaves correctly

**For API or backend changes:**

- Verify happy-path response
- Verify invalid-input or failure-path behavior
- Verify the persisted side effect or downstream state change
- Verify logs or errors do not show new breakage

**For CLI or local-tool changes:**

- Verify the success path
- Verify a common failure path and exit code
- Verify output files, stdout/stderr, and help text when relevant

### 6. Handle Failures Like a Debugger

When the user reports a problem:

- Capture the exact step that failed
- Record expected versus actual behavior
- Note any visible error text, logs, or screenshots available
- Decide whether to stop and investigate immediately or finish the remaining checks only if that still adds value

Before changing code, generate 2-3 plausible hypotheses for the failure so the next debugging step is deliberate instead of guess-driven.

If the failure blocks confidence in the change, stop the manual test and switch into diagnosis.

### 7. Summarize With Confidence and Gaps

Close with a short verification summary that separates what is proven from what is still assumed.

Include:

- Automated checks run and their results
- Manual steps completed and their results
- Bugs or regressions found
- Remaining unverified areas
- Recommended next action

## Guidelines

- Minimize user effort; maximize agent effort
- Keep the user in one context at a time
- Prefer concrete reply options over open-ended questions
- Check one happy path, one failure path, and one nearby regression when practical
- Use tools aggressively before asking for human verification
- Keep the running narrative clear so the user remembers what is being tested and what has already passed
