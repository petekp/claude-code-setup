---
title: Eliminate Excise — Remove Non-Goal-Serving Work
category: Interaction Patterns
tags: [navigation, form, cognitive-load, mental-model]
priority: core
applies_when: "When auditing or designing a user flow and questioning whether each click, page load, and form field genuinely serves the user's goal or only the system's needs."
---

## Principle
Identify and eliminate every interaction, navigation step, confirmation, and data entry that does not directly serve the user's goal — this unnecessary overhead is "excise" that the system imposes on users.

## Why It Matters
Excise is any work the user must do that serves the system's needs rather than their own: logging in repeatedly, navigating through multiple screens to reach a frequently used feature, re-entering information the system already has, or clicking through unnecessary confirmation dialogs. Each instance is small, but they compound across sessions into significant friction. Reducing excise is often the highest-leverage improvement a product team can make, because it improves every user's experience on every visit.

## Application Guidelines
- Audit key user flows and count every click, page load, and form field — then challenge each one: does this serve the user's goal or the system's needs?
- Reduce navigation depth for frequent tasks: the most-used features should be reachable in one or two clicks from any screen
- Remember user preferences and apply them automatically: last-used view, default sort order, preferred export format, most recent project
- Pre-fill forms with data the system already has; never ask users to re-enter information
- Eliminate redundant confirmations: do not ask "Are you sure?" for easily reversible actions; use undo instead
- Combine multi-step workflows into single screens when the steps are simple enough: create-and-assign rather than create-then-navigate-to-item-then-assign

## Anti-Patterns
- Requiring users to navigate through Home > Projects > Active Projects > Project X > Settings > Team > Permissions to change a team member's role, when a direct "Manage team" link on the project header could reduce six clicks to one
