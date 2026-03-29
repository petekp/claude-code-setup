---
title: Skippable, Optional Product Tours
category: Onboarding & Empty States
tags: [onboarding, tooltip, accessibility, cognitive-load]
priority: situational
applies_when: "When implementing product tours or feature walkthroughs that must be optional, skippable at any step, and resumable later."
---

## Principle
Product tours must always be optional, skippable at any step, and resumable later — forced tours create resentment and are rarely retained.

## Why It Matters
Forced product tours violate user autonomy. Many users arrive at a new product with a specific task in mind and are immediately blocked by a multi-step walkthrough they did not request. Research shows that information presented before the user has context for it (pre-task instruction) has very low retention. A product tour that interrupts the first session teaches the user to click "Next" as fast as possible to dismiss it, retaining almost nothing. Optional, contextually triggered tours respect the user's intent and are far more likely to be engaged with meaningfully.

## Application Guidelines
- Always provide a visible "Skip" or "Dismiss" button on every step of a product tour — never hide it or delay its appearance
- Offer tours at the moment of relevance rather than on first login: trigger a feature tour the first time a user navigates to that feature, not during global onboarding
- Make tours resumable: if a user skips, provide a way to restart the tour from a help menu or settings page
- Keep tours short (3-5 steps maximum) and focused on a single feature area rather than attempting a comprehensive product walkthrough
- Use coach marks (spotlight overlays highlighting a specific UI element) rather than modal dialogs that obscure the interface the tour is trying to explain

## Anti-Patterns
- Launching a mandatory 12-step product tour on first login that cannot be dismissed until completed
- Using modal dialogs for tour steps that completely block the interface, preventing the user from interacting with the elements being explained
- Showing the same product tour on every login until the user completes it, rather than respecting a single dismissal
- Making the "Skip tour" option small, low-contrast, or positioned where it is easily missed, effectively coercing participation
