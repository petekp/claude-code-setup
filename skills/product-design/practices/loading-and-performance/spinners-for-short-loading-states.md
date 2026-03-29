---
title: Spinners for Short, Simple Loading States
category: Loading & Performance Perception
tags: [loading, button, feedback-loop]
priority: situational
applies_when: "When a brief indeterminate operation (1-4 seconds) needs a loading indicator and a spinner is appropriate for the narrow scope."
---

## Principle
Spinners are appropriate only for brief, indeterminate loading operations (1-4 seconds) where the content area is small and the user expects a quick response — they must not be used as a universal loading solution.

## Why It Matters
Spinners communicate one thing: "the system is working, please wait briefly." They are effective for this narrow use case because their continuous rotation provides motion feedback (the system is not frozen) without setting duration expectations (there is no progress to track). The problem arises when spinners are used for operations that take 10+ seconds — the perpetual rotation provides no progress information, no time estimate, and no reassurance that the operation is advancing rather than stuck. A spinner at 3 seconds is reassuring; a spinner at 30 seconds is anxiety-inducing.

## Application Guidelines
- Use spinners for operations expected to complete in 1-4 seconds: loading a single component, submitting a form, fetching a dropdown's options
- Size the spinner proportionally to the content it replaces: a small inline spinner next to a button for an action result, a medium spinner centered in a card for component-level loads
- Add a brief delay (200-300ms) before showing the spinner — if the operation completes before the delay, no spinner is shown at all, avoiding a distracting flash
- Replace the spinner with an error state or success state immediately upon completion — never leave a spinner visible after the content has arrived
- For operations that exceed 4 seconds, transition from a spinner to a more informative indicator (skeleton screen, progress bar, or message with time estimate)

## Anti-Patterns
- Using a full-page centered spinner for every loading state, regardless of whether 5% or 100% of the page content is loading
- Showing a spinner immediately on click with no delay, causing a visible flash for sub-200ms operations
- Using a spinner for an operation that consistently takes 15+ seconds without any additional progress information or time estimate
- Stacking multiple simultaneous spinners on the same page (one per widget, one per table, one per chart), creating a chaotic spinning visual
