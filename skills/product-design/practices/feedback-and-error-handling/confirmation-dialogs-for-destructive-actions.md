---
title: Confirmation Dialogs for Destructive Actions
category: Feedback & Error Handling
tags: [modal, button, error-handling, undo, trust]
priority: core
applies_when: "When implementing delete, remove, or any irreversible action where an accidental click could cause permanent data loss."
---

## Principle
Actions that permanently destroy data, affect other users, or cannot be undone must require an explicit confirmation step that clearly states the consequences.

## Why It Matters
Destructive actions sit at the intersection of high consequence and high likelihood of accidental triggering. Delete buttons live near edit buttons; "Remove all" sits next to "Remove selected." Without a confirmation gate, a single misclick can delete a project, revoke access for an entire team, or purge months of data. The confirmation dialog is the last line of defense between an accidental click and irreversible damage. It must be designed to actually be read, not reflexively dismissed.

## Application Guidelines
- State the specific consequence: "Permanently delete the project 'Apollo' and all 142 associated files? This cannot be undone." rather than "Delete project?"
- Make the safe action (Cancel) the default/pre-focused option; place the destructive action on the right and style it as visually secondary or use a warning color
- For bulk destructive actions, show a count of affected items: "Remove 23 team members from this workspace?"
- For the highest-stakes actions, require typed confirmation of the item name or a specific phrase to prevent reflexive dismissal
- Offer alternatives when they exist: "Move to trash" instead of "Permanently delete" when soft-delete is available
- Never use confirmation dialogs for reversible actions — use undo toasts instead; reserve dialogs for truly irreversible operations

## Anti-Patterns
- Using a single "Delete" button with no confirmation that immediately and permanently removes a record, relying on the assumption that users never misclick and always mean exactly what they press
