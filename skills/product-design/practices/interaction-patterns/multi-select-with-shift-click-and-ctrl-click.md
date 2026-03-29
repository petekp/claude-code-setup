---
title: Multi-Select with Shift+Click and Ctrl+Click
category: Interaction Patterns
tags: [table, list, bulk-actions, keyboard, consistency]
priority: situational
applies_when: "When implementing selection behavior in lists, tables, or grids where users need to select multiple items for bulk actions."
---

## Principle
Support standard multi-selection conventions — Shift+Click for range selection and Ctrl/Cmd+Click for individual toggle selection — in any list, table, or grid where users may need to act on multiple items.

## Why It Matters
Power users and frequent users develop muscle memory around multi-select conventions established by operating systems over decades. When a file manager, email list, or data table supports these conventions, users can efficiently select exactly the items they need without learning a new interaction model. When applications break these conventions or fail to support multi-select at all, users are forced into tedious one-at-a-time operations for tasks that naturally involve batch selection.

## Application Guidelines
- Implement Shift+Click to select a contiguous range from the last selected item to the clicked item
- Implement Ctrl+Click (Cmd+Click on Mac) to toggle selection on individual items without affecting other selections
- Provide a visual selection indicator: a checkbox, a highlight color, or both for each selected item
- Show a selection count and bulk action toolbar when multiple items are selected: "12 items selected — Delete | Move | Export"
- Include a "Select All" option (typically a checkbox in the header row for tables) with a "Select all X items" link when the selection exceeds the visible page
- Support keyboard-driven selection: Shift+Arrow keys for range selection, Space to toggle individual items
- Allow deselection by clicking on an already-selected item or pressing Escape to clear the entire selection

## Anti-Patterns
- Providing only individual checkboxes with no Shift+Click range support in a table of 500 items, forcing users to click each checkbox individually when they need to select items 10 through 50
