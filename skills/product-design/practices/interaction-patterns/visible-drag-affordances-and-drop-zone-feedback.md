---
title: Visible Drag Affordances and Drop Zone Feedback
category: Interaction Patterns
tags: [drag-drop, accessibility, keyboard, affordance, direct-manipulation]
priority: situational
applies_when: "You are implementing drag-and-drop reordering, reparenting, or any direct manipulation where users move objects by dragging them."
---

## Principle
Draggable elements must have a visible grip handle or affordance, and valid drop zones must provide clear visual feedback when an item is dragged over them.

## Why It Matters
Drag-and-drop is a powerful direct manipulation pattern, but it is completely undiscoverable if there is no visual indication that an element can be dragged. Users will never attempt to drag something that does not look draggable, and they will not know where to drop it without clear drop zone feedback. Without these affordances, the drag-and-drop capability may as well not exist — it becomes an accidental discovery for a lucky few rather than a designed interaction for all users.

## Application Guidelines
- Show a visible drag handle (a dots/grip icon) on draggable items; for touch interfaces, the entire item area may be the drag target, but still show a handle for discoverability
- Change the cursor to "grab" on hover over draggable elements and "grabbing" during the drag operation
- When a drag begins, show a semi-transparent "ghost" of the dragged item following the cursor to confirm the drag is active
- Highlight valid drop zones with a border, background color change, or "drop here" indicator as the dragged item enters the zone
- Show insertion indicators (a line between items) for list reordering so users can see exactly where the item will land
- Provide alternative keyboard-based reordering (Alt+Arrow keys or a "Move to..." menu) for accessibility, since drag-and-drop is not accessible to all users
- Show a "drop not allowed" indicator (red border, no-entry cursor) when dragging over invalid zones so users do not waste effort

## Anti-Patterns
- Implementing drag-and-drop reordering on a list with no drag handles, no cursor change, and no drop zone indicators — so the feature is only discoverable by users who accidentally click-and-drag, and even then they cannot see where the item will land until they release
