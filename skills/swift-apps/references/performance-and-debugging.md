# Performance And Debugging

Use this reference when a Swift or SwiftUI feature is slow, glitchy, visually unstable, or behaving incorrectly.

## Work The Problem In Order

1. Reproduce the issue clearly.
2. Write a failing test first when a realistic test harness exists.
3. Enumerate 2-3 plausible hypotheses before changing code.
4. Inspect the code path for obvious state-flow or rendering problems.
5. Profile with Instruments when code review is inconclusive.
6. Apply the smallest fix that removes the root cause.
7. Re-run the same verification flow and compare results.

## Start With High-Value Hypotheses

Check these first:

- Broad observable state changes are invalidating too much UI.
- List or `ForEach` identity is unstable.
- Heavy work is happening in `body` or a frequently recomputed property.
- Layout is thrashing because of deep nested stacks, `GeometryReader`, or preference chains.
- Images are decoding or resizing on the main thread.
- Animations are attached to a much larger subtree than intended.

## Hunt Common SwiftUI Smells

Avoid these patterns:

- Sorting, filtering, formatting, or allocating formatters in `body`
- `UUID()` generated during rendering
- `id: \.self` on unstable values
- Inline filtering inside `ForEach`
- Large reference models observed by many unrelated subviews
- `UIImage(data:)` or other decode work on the main thread
- “Just animate everything” modifiers attached high in the tree

Prefer these moves:

- Precompute derived collections when inputs change.
- Cache expensive formatters and mappers.
- Narrow state so updates touch fewer leaves.
- Stabilize identifiers at the model level.
- Decode and downsample images off the main thread.
- Apply animations at the smallest subtree that needs motion.

## Profile With Instruments

Use the SwiftUI template and Time Profiler in a release build.
Apple's performance analysis guidance is especially useful when you need to confirm long `body` updates, frequent view invalidations, hitches, or hangs before rewriting architecture.
Capture the exact interaction that feels slow: scrolling, navigation, animation, typing, or data refresh.

Ask for or collect:

- Device and OS version
- Release or debug build info
- SwiftUI timeline screenshots or trace export
- Time Profiler call tree around the slow interaction

## Report Findings With Evidence

Summarize:

- The top root-cause candidates
- The evidence that supports or weakens each hypothesis
- The chosen fix and why it targets the root cause
- Before and after metrics when available

## Verify The Fix

- Re-run the same interaction and compare hitches, CPU, memory, or frame pacing.
- Re-run the failing test or reproducer.
- Confirm accessibility and reduced-motion behavior did not regress.
- Re-check in a release build on representative hardware, because previews and debug builds are for iteration, not trustworthy performance baselines.
- Call out any remaining unknowns that still require user-run profiling or device checks.
