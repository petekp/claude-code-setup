---
title: Toast Notifications — Transient Confirmation for Completed Actions
category: Component Patterns
tags: [notification, accessibility, undo, feedback-loop]
priority: core
applies_when: "When confirming a completed user action (save, send, copy) with a brief, non-blocking toast that auto-dismisses."
---

## Principle
Toast notifications should provide brief, non-blocking confirmation that a user-initiated action has succeeded, then auto-dismiss without requiring interaction.

## Why It Matters
After performing an action (saving a record, sending a message, copying to clipboard), users need confirmation that it worked. Without feedback, users may repeat the action or feel uncertain. Toasts fill this gap with minimal interruption — they appear, confirm, and disappear. They respect the user's flow by not demanding acknowledgment. However, toasts are inappropriate for errors, warnings, or any message requiring user action, because their transient nature means critical information can be missed.

## Application Guidelines
- Use toasts for success confirmations: "Changes saved," "Email sent," "Item copied to clipboard"
- Auto-dismiss after 3-5 seconds; longer messages may need slightly more time, but never persist indefinitely
- Position toasts consistently (typically bottom-center or top-right) and stack them when multiple appear
- Include an "Undo" action in the toast when the confirmed action is reversible (e.g., "Item archived. Undo")
- Keep toast text to a single line — if the message needs explanation, it is too complex for a toast
- Ensure toasts do not obscure critical interactive elements (especially form submit buttons or navigation)
- For screen readers, announce toasts using an ARIA live region with polite priority so they do not interrupt the current task

## Anti-Patterns
- Using a toast to display an error message that the user needs to read and act upon — errors should persist until addressed
- A toast that requires the user to click "Dismiss" to remove it, adding an unnecessary interaction to an otherwise seamless confirmation
- Toasts that stack up rapidly during batch operations, creating a pile of notifications that obscure the interface
- Displaying a toast for an action the user did not initiate (e.g., a background sync), which feels random and confusing
