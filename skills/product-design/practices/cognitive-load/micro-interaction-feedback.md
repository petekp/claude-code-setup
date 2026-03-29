---
title: "Micro-Interaction Feedback: Close the Gulf of Evaluation Instantly"
category: Cognitive Load
tags: [button, animation, feedback-loop, cognitive-load]
priority: core
applies_when: "When designing any interactive element that changes state on click, tap, or submit and needs to communicate the result to the user."
---

## Principle
Every user action should produce immediate, perceivable feedback so users never have to wonder whether the system registered their input.

## Why It Matters
When users click a button, toggle a switch, or submit a form and nothing visibly changes, they experience the "gulf of evaluation" — the gap between performing an action and understanding its effect. This uncertainty forces users to hold the pending action in working memory while scanning for confirmation, dramatically increasing cognitive load. Instant micro-interactions (animations, state changes, haptic responses) close this gap and keep users in flow.

## Application Guidelines
- Provide visual feedback within 100ms of any user action (button depress states, hover effects, loading spinners)
- Use animation to show causality — e.g., a deleted item should animate out rather than simply disappear
- Match feedback intensity to action significance: a minor toggle gets a subtle color shift; a destructive action gets a more prominent confirmation
- For operations that take longer than 1 second, show a progress indicator; for those longer than 10 seconds, show estimated time remaining
- Use optimistic UI updates for low-risk actions (e.g., liking a post) to eliminate perceived latency

## Anti-Patterns
- Silent failures where an action completes (or fails) with no visible change
- Identical feedback for success and failure states
- Delayed feedback that arrives after the user has already moved on or repeated the action
- Over-animating trivial interactions, which creates visual noise and slows users down
