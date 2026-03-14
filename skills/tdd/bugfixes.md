# Bug-Fix TDD

Use this mini-loop for regressions and debugging work.

## Reproduce Before Fixing

1. Write down 2-3 plausible causes.
2. Choose the smallest seam that can prove the reported failure.
3. Write a regression test that fails before the fix.
4. Confirm the test can fail for the right reason.

Do not edit production code for the target behavior until the regression is
reproduced or you have explicitly decided to create the seam needed to reproduce
it.

## Narrow the Failure

If the first repro is noisy or expensive:

- move to a lower seam
- add temporary logs or assertions to isolate the branch that differs
- control time, randomness, network, or file IO
- replace a browser repro with a service or module repro if the bug does not
  truly live in the UI

Remove temporary debugging scaffolding once the regression test is stable.

## Fix Under the Failing Test

After the failure is reproduced:

1. Implement the smallest code change that turns the regression green.
2. Add one neighboring test if it proves the fix is specific rather than a
   hardcoded coincidence.
3. Refactor only after the regression and neighboring tests are green.

## If You Cannot Get a Trustworthy Failing Test

- Break the code on purpose and make sure the test notices.
- Lower the seam again.
- Add observability and re-run the repro.
- Freeze current behavior with a characterization test, then refactor toward a
  better seam.

If none of these work, say so clearly instead of pretending the fix is proven.
