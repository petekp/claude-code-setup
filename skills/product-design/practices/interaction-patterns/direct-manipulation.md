---
title: Direct Manipulation — Act Directly on UI Elements
category: Interaction Patterns
tags: [drag-drop, layout, keyboard, direct-manipulation]
priority: core
applies_when: "When deciding between indirect controls (edit buttons, modal forms) and letting users drag, resize, or edit content in place."
---

## Principle
Let users interact with objects directly — dragging, resizing, reordering, and editing in place — rather than through indirect controls or separate editing modes.

## Why It Matters
Direct manipulation creates a feeling of immediacy and control that indirect manipulation (selecting an item, clicking an edit button, filling a modal form, clicking save) cannot match. When users can drag a card to reorder a list, resize a column by dragging its edge, or click on text to edit it in place, the interface feels responsive and natural. This reduces the cognitive distance between intention and action, lowers the learning curve, and makes the interface feel like a tool rather than a bureaucratic form.

## Application Guidelines
- Support drag-and-drop for reordering lists, organizing items into groups, moving files between folders, and arranging layouts
- Enable inline editing (click-to-edit) for text content, names, and simple values rather than opening a separate edit dialog
- Allow direct resizing of columns, panels, and containers by dragging edges or handles
- Provide real-time visual feedback during manipulation: show the item moving, a shadow of its destination, and snap indicators for alignment
- Always pair direct manipulation with an alternative method (keyboard shortcuts, context menus) for accessibility and precision
- Ensure manipulations are undoable — users experiment more freely when they know they can reverse any action

## Anti-Patterns
- Requiring users to click an "Edit" button to open a modal dialog, change a single field, and click "Save" to rename a file or update a status — when clicking directly on the name and typing the new value would accomplish the same task in one step
