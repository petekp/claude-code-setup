---
title: "Common Fate in Drag-and-Drop Interfaces"
category: Gestalt Principles
tags: [drag-drop, list, gestalt, direct-manipulation]
priority: niche
applies_when: "When implementing multi-select drag-and-drop and all selected items must move together to confirm the group during the drag operation."
---

## Principle
When multiple elements move together during a drag operation, users perceive them as a unified group, so drag-and-drop interactions must clearly communicate which elements are included in the selection and will share the same movement fate.

## Why It Matters
Drag-and-drop is a direct manipulation pattern where common fate is experienced in real time. If a user selects three items and begins dragging, all three must move together with identical motion to confirm the grouping. If some elements lag, jitter, or remain stationary, the perceived group fractures and users lose confidence about what will happen when they drop.

## Application Guidelines
- When dragging a multi-selection, move all selected items simultaneously with the cursor, maintaining their relative spatial positions
- Show a visual ghost or badge (e.g., "3 items") that moves with the cursor to reinforce the group even if individual items collapse into a single drag preview
- Highlight the drop target zone and animate remaining list items to part smoothly, showing the fate of the insertion point in real time
- On drag start, visually differentiate selected items from unselected items (e.g., dim unselected, elevate selected) so the group boundary is clear before motion begins

## Anti-Patterns
- Dragging only a single-item preview when multiple items are selected, hiding the group and surprising the user on drop
- Allowing selected items to animate at different speeds during reorder, breaking the common-fate perception
- Failing to show what will happen to surrounding items when the dragged group is dropped, leaving the outcome ambiguous
