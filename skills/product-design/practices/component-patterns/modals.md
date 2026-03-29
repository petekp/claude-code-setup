---
title: Modals — Reserve for Critical Focus-Required Interactions
category: Component Patterns
tags: [modal, keyboard, accessibility, cognitive-load]
priority: core
applies_when: "When deciding whether to use a modal dialog and ensuring modals are reserved for destructive confirmations, critical sub-tasks, or focused creation flows."
---

## Principle
Modals forcibly interrupt the user's current context and should be reserved exclusively for interactions that genuinely require focused attention and an explicit decision before proceeding.

## Why It Matters
A modal is the most aggressive UI pattern available — it blocks all other interaction, demands immediate attention, and forces a context switch. When used appropriately (confirming a destructive action, completing a critical sub-task), modals protect users from costly mistakes. When overused (showing announcements, collecting optional feedback, displaying information that could be inline), they train users to dismiss without reading, which defeats their purpose and erodes trust. Every unnecessary modal teaches users that modals are noise.

## Application Guidelines
- Use modals for destructive confirmations ("Delete this project? This cannot be undone"), critical authentication prompts, and focused creation flows that must be completed atomically
- Keep modal content focused on a single task or decision — if a modal needs tabs or scrolling, it should probably be a full page
- Always provide a clear escape: visible close button, Escape key, and clicking the backdrop should all dismiss the modal (unless data loss would occur)
- Include a clear primary action and a secondary cancel/close action with obvious visual hierarchy between them
- Prevent interaction with the background content while the modal is open (proper backdrop overlay)
- Size modals to their content — avoid full-screen modals for simple confirmations and avoid tiny modals for complex forms
- Trap focus within the modal for keyboard accessibility and return focus to the trigger element on close

## Anti-Patterns
- Using a modal to display a "What's new" announcement that could be a dismissible banner or notification
- Stacking modals on top of modals, creating a confusing layered experience
- A modal that requires scrolling through extensive content, indicating the interaction is too complex for the modal pattern
- Using a modal for a task the user performs frequently (e.g., adding a quick note), where the interruption cost outweighs the focus benefit
