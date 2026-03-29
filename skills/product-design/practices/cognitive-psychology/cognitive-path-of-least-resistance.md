---
title: Cognitive Path of Least Resistance — Make the Intended Path Easiest
category: Cognitive Psychology
tags: [form, button, navigation, cognitive-load, affordance]
priority: situational
applies_when: "When designing a workflow where the most common or correct user path should also be the easiest path, to prevent workarounds and data quality issues."
---

## Principle
Users will consistently follow whichever path requires the least cognitive and physical effort, so the intended happy path must also be the easiest path.

## Why It Matters
If the shortcut, workaround, or incorrect path is easier than the correct one, users will take it every time — not out of laziness, but because human cognition is wired to conserve effort. This leads to data quality problems, support tickets, and cascading errors downstream. When the intended workflow is genuinely the lowest-friction option, users naturally fall into correct behavior without needing documentation, training, or error messages to redirect them.

## Application Guidelines
- Map the most common user goal for each screen and ensure it requires the fewest clicks, least scrolling, and least reading to accomplish
- Pre-fill form fields with intelligent defaults derived from user history, organizational settings, or statistical frequency
- Position the primary action in the most visually prominent and physically accessible location (e.g., bottom-right in LTR layouts for modal confirmations)
- Remove unnecessary confirmation dialogs on low-risk actions — each extra step tempts users to find workarounds
- Make the correct data format obvious through input masks, placeholder text, and inline validation rather than relying on post-submission error messages
- When multiple paths exist to the same outcome, invest design effort in the one you want most users to take

## Anti-Patterns
- Burying the most common action behind a hamburger menu while giving prominent placement to rarely-used features
- Requiring users to navigate through three screens to accomplish a task that competitors handle in one, causing users to find unofficial shortcuts
- Making the "Skip" option more visually prominent than the "Complete Profile" action when profile completion is a business goal
