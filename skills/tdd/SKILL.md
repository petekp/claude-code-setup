---
name: tdd
description: >
  Test-driven development for features, bug fixes, regressions, and safe refactors
  using a failing-test-first workflow. Use when Codex needs to add or change
  behavior with proof, reproduce a bug in a test, write regression or
  characterization tests, make a refactor safer, or respond to prompts like
  "use TDD", "red-green-refactor", "write the test first", "add a regression
  test", "reproduce this in a test", "prove the fix", "cover this change with
  tests", or "make this safe to refactor". Prefer this skill when confidence
  should come from executable evidence instead of reasoning alone.
---

# Test-Driven Development

Treat executable evidence as the source of truth. Use this workflow to prevent
five common agent failures:

- guessing instead of proving
- writing many tests before learning anything
- testing shapes or internals instead of behavior
- over-mocking code under your control
- letting the feedback loop get so slow that TDD stops working

## Start the Session

Before editing code:

1. Read repo-local instructions such as `AGENTS.md`, `CLAUDE.md`, and package or
   test scripts.
2. Inspect nearby production code and nearby tests to infer naming, seams,
   fixtures, and the fastest targeted command.
3. Identify two commands up front:
   - the fastest command that runs the single target test
   - the broader command that validates the changed boundary before finishing
4. Choose the smallest public or near-public seam that can prove the behavior.
   See [seams.md](seams.md).
5. Ask the user only when the public contract, intended behavior, or required
   coverage scope is materially ambiguous.

Follow repo-local instructions if they are stricter than this skill.

## Work Vertically

Do not batch all tests first and all implementation later.

```text
Wrong:
  RED:   test1, test2, test3
  GREEN: impl1, impl2, impl3

Right:
  RED -> GREEN -> REFACTOR: test1 -> impl1
  RED -> GREEN -> REFACTOR: test2 -> impl2
  RED -> GREEN -> REFACTOR: test3 -> impl3
```

Write one failing test. Make it pass with the smallest sensible change.
Refactor only on green. Repeat.

## Choose the Entry Path

### New feature

1. Start with the smallest user-visible or caller-visible behavior worth
   shipping.
2. Write one tracer-bullet test at the chosen seam.
3. Make it fail for the right reason.
4. Implement the thinnest slice that turns the test green.
5. Add the next behavior only after the current one is proven.

### Bug fix or regression

1. List 2-3 plausible hypotheses before changing code.
2. Reproduce the bug with the smallest failing regression test that would have
   caught it.
3. Narrow the reproduction with logs, assertions, or a lower seam if the first
   repro is noisy.
4. Fix the code under that failing test.
5. Add one neighboring test only if it proves the fix is specific rather than
   accidental.

See [bugfixes.md](bugfixes.md) for the detailed mini-loop.

### Legacy code or refactor

1. Freeze current behavior with a characterization test before reshaping
   internals.
2. Refactor behind that safety rail until the design exposes a better seam.
3. Replace overly broad characterization coverage with tighter behavioral tests
   when the seam improves.
4. Use the green state to deepen modules and simplify interfaces.

See [seams.md](seams.md), [deep-modules.md](deep-modules.md), and
[refactoring.md](refactoring.md).

## Run the Core Loop

For each cycle:

1. `RED`: Write or tighten one test that proves one behavior. Confirm it fails.
2. `GREEN`: Write the minimum production change that makes only that behavior
   pass.
3. `REFACTOR`: Clean up duplication, naming, and structure while staying green.
4. Re-run the smallest relevant command first, then widen verification as
   confidence grows.

If the test cannot fail, the loop is invalid. Break it on purpose, lower the
seam, or add the missing observability before trusting it.

## Keep Feedback Fast

Use this ladder:

1. Run the single target test while iterating.
2. Run the surrounding file, package, or focused suite after a small cluster of
   green cycles.
3. Run broader verification before finishing: the relevant integration suite,
   typecheck, lint, or full tests for the touched boundary.
4. Call out any verification gap explicitly if time, tooling, or environment
   prevents broader checks.

If the loop feels slow, the seam is probably too high. Move down a level unless
the behavior truly lives in the browser or across system boundaries.

## Choose Assertions That Survive Refactors

- Assert observable outcomes, not helper calls.
- Prefer public interfaces over internal collaborators.
- Mock only system boundaries you do not control. See [mocking.md](mocking.md).
- Treat tests as specifications for behavior, not snapshots of implementation
  shape.
- Keep each test about one behavior, even if that behavior needs more than one
  assertion.

See [tests.md](tests.md) for examples and rewrites.

## Use Subagents Carefully

When other agents help:

- Keep ownership of the failing test, the red/green loop, and final verification
  in the main thread.
- Let workers explore implementation ideas or refactors under the existing
  failing test.
- Reject fixes that only pass by weakening the test unless the test was proving
  the wrong behavior.

## Avoid These Anti-Patterns

- Editing production code for the target behavior before seeing a meaningful
  failing test
- Writing the whole test plan up front
- Solving multiple behaviors in one red/green cycle
- Using browser or end-to-end tests for logic that could be proven faster
  elsewhere
- Mocking modules you own just to make the test convenient
- Leaving debug scaffolding, speculative branches, or unverified refactors
  behind

## Finish with Proof

Consider the task done only when:

- the changed behavior is covered by a test that failed before the change
- the targeted tests pass
- the relevant broader verification command has run, or the gap is documented
  clearly
- refactors happened only while green
- the final summary states what behavior is now proven and what still relies on
  manual verification

## Read More Only As Needed

- [tests.md](tests.md) for durable behavior-level assertions and bad-to-better
  rewrites
- [mocking.md](mocking.md) for boundary-only mocking rules
- [seams.md](seams.md) for seam selection, test levels, and fast feedback
- [bugfixes.md](bugfixes.md) for regression-test-first debugging
- [interface-design.md](interface-design.md) for testable interfaces
- [deep-modules.md](deep-modules.md) for hiding complexity behind small APIs
- [refactoring.md](refactoring.md) for green-only cleanup targets
