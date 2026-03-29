---
title: "Similarity Anti-Pattern: Inconsistent Button Styling Breaking Affordance Expectations"
category: Gestalt Principles
tags: [button, layout, gestalt, consistency, affordance]
priority: situational
applies_when: "When auditing or building an interface and buttons of the same hierarchy level have inconsistent visual styling."
---

## Principle
All interactive elements that perform the same class of action must share consistent visual attributes; inconsistent button styling within a single interface destroys the affordance cues users depend on.

## Why It Matters
Users build a mental model of "what a button looks like" within the first few seconds of using an interface. When that model is violated — a primary action styled as a link in one place and a filled button in another — users hesitate, misclick, or miss actions entirely. This is especially damaging for users relying on visual pattern recognition to navigate quickly.

## Application Guidelines
- Establish a strict button hierarchy (primary, secondary, tertiary, destructive) and enforce it through a design system with no one-off overrides
- Ensure every button at the same hierarchy level uses the same fill, border, border-radius, font weight, and padding — Similarity must be pixel-consistent
- When a design calls for a visually distinct CTA, differentiate it through size or placement, not by inventing a new button style that breaks the established vocabulary
- Audit every screen for "orphan" interactive elements that look different from their functional peers (e.g., a text link that triggers the same action as a button elsewhere)

## Anti-Patterns
- Mixing ghost buttons, filled buttons, and text links for actions at the same hierarchy level on the same screen
- Allowing individual teams or pages to define their own button styles outside the design system
- Using color alone to differentiate button hierarchy without maintaining consistent shape and size, so the buttons look like unrelated elements rather than a ranked set
