# Choosing Seams and Test Levels

Start with the cheapest seam that would fail if the target behavior regressed.

## Pick the Lowest-Cost Proof

- Pure logic or data transformation: use a unit test.
- Behavior at a module, service, route, or command boundary: use an integration
  test through that API.
- Behavior that depends on rendering, wiring, or framework lifecycle: use a
  component or UI test.
- Behavior that only exists across multiple real systems or a user journey: use
  an end-to-end test.

Do not assume higher-level tests are automatically better. Prefer the lowest
level that still proves the behavior.

## Prefer Stable Seams

Prefer seams that are:

- public or near-public
- deterministic
- cheap to execute
- already used by neighboring tests

Avoid seams that require mocking large parts of the system just to run.

## Create a Better Seam When Needed

If time, randomness, network, filesystem, or framework globals block
deterministic tests:

- inject a clock, random source, or client
- wrap third-party APIs in a thin adapter
- return useful data instead of only producing side effects
- move logic out of controllers or components into testable modules

See [interface-design.md](interface-design.md) for interface patterns that make
this easier.

## Use Characterization Tests in Legacy Code

When the design is hostile to direct testing:

1. Capture current observable behavior at the nearest stable seam.
2. Refactor until a better seam exists.
3. Add tighter tests at the new seam if they buy clarity or speed.

Characterization tests protect behavior. They do not bless the current design
forever.

## Use the Fast-Feedback Ladder

- Run the single target test while red or green.
- Run the focused file, package, or suite after a small cluster of changes.
- Run broader boundary checks before finishing.

If the loop is slow:

- drop to a lower seam
- shrink fixture setup
- replace mock pyramids with a fake or real lightweight dependency
- split unrelated behavior into separate cycles
