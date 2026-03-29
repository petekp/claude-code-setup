---
title: Undo Feedback Toast
category: Feedback & Error Handling
tags: [notification, button, undo, feedback-loop]
priority: situational
applies_when: "When a user performs a reversible action like delete, archive, or move and you want to offer an immediate undo window instead of a pre-action confirmation dialog."
---

## Principle
When a user performs a reversible action, show a brief toast notification that confirms the action and offers an immediate undo option before it becomes permanent.

## Why It Matters
Undo toasts transform potentially anxiety-inducing actions into low-risk operations. Instead of asking "Are you sure?" before every delete, archive, or move action (which interrupts flow), the system executes the action immediately and gives the user a short window to reverse it. This pattern respects the user's intent while providing a safety net, resulting in faster workflows and fewer interruptions than pre-action confirmation dialogs.

## Application Guidelines
- Show the toast immediately upon action execution, positioned consistently (typically bottom-center or bottom-left) so users always know where to look
- Include a clear "Undo" button within the toast — not just a close/dismiss button
- Keep the undo window open for 5-10 seconds; show a countdown or progress indicator so users know how much time remains
- Describe the action in the toast: "3 emails archived — Undo" rather than just "Action completed"
- Queue multiple toasts if rapid successive actions occur, and support undoing individual actions from the queue
- Soft-delete the item during the undo window period; only hard-execute the action after the toast is dismissed or expires

## Anti-Patterns
- Showing a confirmation toast that says "Item deleted" with no undo option and no way to recover the item, providing awareness of what happened but no recourse to fix an accidental action
