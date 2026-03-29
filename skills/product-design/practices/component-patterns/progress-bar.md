---
title: Progress Bar — Determinate and Indeterminate Patterns
category: Component Patterns
tags: [loading, accessibility, feedback-loop, trust]
priority: core
applies_when: "When displaying progress for file uploads, batch operations, or any long-running process and choosing between determinate and indeterminate indicators."
---

## Principle
Use determinate progress bars when the completion percentage can be calculated, and indeterminate indicators only when the duration is truly unknown — always prefer determinate when possible.

## Why It Matters
Progress feedback is one of the most important trust signals in an interface. A determinate progress bar tells users three critical things: the system is working, how far along it is, and approximately how long they should wait. This transforms an anxiety-producing wait into a predictable, manageable pause. Indeterminate indicators (spinners, pulsing bars) only communicate that the system is working, leaving users uncertain about duration. Using an indeterminate indicator when a determinate one is possible wastes an opportunity to build user confidence.

## Application Guidelines
- Use determinate progress bars for file uploads, multi-step imports, batch operations, and any process where percentage completion can be calculated
- Show a percentage label or fraction alongside the bar (e.g., "67%" or "34 of 50 items") for precise feedback
- For operations expected to take more than a few seconds, include an estimated time remaining
- Use indeterminate indicators (spinners, skeleton screens, pulsing bars) only for operations where duration truly cannot be predicted (e.g., API calls, initial page loads)
- For skeleton screens during page load, match the skeleton shapes to the actual content layout to reduce perceived load time
- Ensure progress bars animate smoothly — jumpy or stalled progress is worse than no progress indicator because it suggests instability
- Provide a cancel option for long-running operations so users are not trapped waiting

## Anti-Patterns
- Using a spinner for a file upload when the upload percentage is readily available from the API
- A progress bar that reaches 99% and then sits there for an extended period, undermining the reliability of the progress indication
- No loading feedback at all — a blank screen or frozen interface during a multi-second operation
- An indeterminate spinner for an operation that consistently takes 30+ seconds, giving users no indication of whether they should continue waiting
