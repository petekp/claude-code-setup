---
title: Opt-Out Confirmation for High-Consequence Actions
category: Feedback & Error Handling
tags: [modal, button, error-handling, trust]
priority: situational
applies_when: "When designing confirmation flows for high-stakes actions like account deletion, mass email sends, or production deployments that need friction to prevent accidental execution."
---

## Principle
Actions with significant or irreversible consequences should require explicit confirmation that forces the user to acknowledge what will happen, with the safe option as the default.

## Why It Matters
Accidental clicks happen constantly — muscle memory, misclicks, touchscreen imprecision, and distraction all lead to unintended actions. For low-stakes actions, this is a minor annoyance. For high-stakes actions like deleting accounts, sending mass emails, or deploying to production, an accidental trigger can cause serious harm. Confirmation dialogs serve as a speed bump that forces conscious acknowledgment, but they must be designed carefully to avoid becoming reflexive "click OK" dismissals.

## Application Guidelines
- Default the confirmation dialog to the safe option (e.g., "Cancel" is pre-focused, not "Delete") so that pressing Enter does not execute the dangerous action
- Describe the specific consequence in the confirmation dialog: "This will permanently delete 47 files" rather than "Are you sure?"
- For the most critical actions, require a typed confirmation (e.g., type the project name to delete it) to prevent reflexive dismissal
- Use visual weight and color to distinguish the destructive action button from the cancel button — the destructive option should be visually distinct (e.g., red) but not the most prominent button
- Do not use confirmation dialogs for reversible or low-impact actions — overuse trains users to dismiss them without reading

## Anti-Patterns
- Showing a generic "Are you sure?" dialog with "OK" pre-focused for every action in the application, training users to reflexively press Enter — so that when a genuinely dangerous action appears with the same pattern, they dismiss it without reading
