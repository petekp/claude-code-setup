---
title: Keyboard-Accessible Drag and Drop
category: Accessibility
tags: [drag-drop, list, keyboard, accessibility]
priority: situational
applies_when: "When implementing drag-and-drop reordering and you need a fully functional keyboard alternative that achieves the same result."
---

## Principle
Every drag-and-drop interaction must have a fully functional keyboard alternative that achieves the same result without requiring a mouse.

## Why It Matters
Drag and drop is an inherently pointer-based interaction that is inaccessible to keyboard-only users, many screen reader users, and users with motor impairments that prevent precise cursor control. Since drag-and-drop is commonly used for high-value interactions — reordering lists, organizing boards, moving files, rearranging layouts — the lack of a keyboard alternative can block core functionality entirely. Providing a keyboard equivalent is not optional when drag-and-drop is the primary means of accomplishing a task.

## Application Guidelines
- Provide keyboard-activated move operations: select an item with Enter/Space, use arrow keys to reposition, and confirm with Enter
- Announce the drag operation to screen readers: "Item grabbed," "Item moved to position 3 of 5," "Item dropped"
- Offer a context menu alternative with "Move up," "Move down," "Move to..." options for reordering
- For Kanban-style boards, provide keyboard shortcuts or a menu to move cards between columns without dragging
- Use ARIA live regions to announce position changes during keyboard-driven reordering
- When implementing drag-and-drop libraries, verify that their accessibility features are actually functional — many popular libraries claim accessibility but implement it poorly
- Test the keyboard reordering flow end-to-end with a screen reader to verify announcements are clear and operations are successful

## Anti-Patterns
- A task board where the only way to move a card between columns is mouse drag, with no keyboard or menu alternative
- A sortable list that technically has keyboard support but provides no screen reader announcements about position changes
- File management where moving files between folders requires drag-and-drop with no "Move to..." action in the context menu
- A page builder or layout editor where component arrangement is exclusively drag-and-drop with zero keyboard alternatives
