---
title: Row-Level and Batch Actions Design in Tables
category: Data Display & Tables
tags: [table, bulk-actions, toolbar, keyboard]
priority: situational
applies_when: "When a data table needs both individual row actions and multi-select batch operations for tasks like archiving, reassigning, or deleting records."
---

## Principle
Provide both individual row actions (for operating on a single record) and batch actions (for operating on multiple selected records simultaneously), using consistent interaction patterns and clear visual affordances for each.

## Why It Matters
Users need to act on table data, not just view it. Sometimes they need to edit one record; other times they need to archive 50 records or reassign 20 tickets at once. If only row-level actions exist, bulk operations become tedious click-by-click exercises. If only batch actions exist, quick single-record operations feel heavyweight. Supporting both modes efficiently reduces the total time spent on data management tasks from minutes to seconds and significantly reduces friction in administrative and operational workflows.

## Application Guidelines
- **Row-level actions**: Reveal 2-3 primary actions on row hover (edit, view, delete) and place less common actions in a three-dot overflow menu. Keep actions at the right edge of the row in a fixed-width actions column.
- **Batch actions**: Add a checkbox column as the first column. When one or more rows are selected, show a **contextual toolbar** (either at the top of the table or as a floating bar) displaying the count of selected items and available batch operations (delete, export, assign, change status).
- Include a **"Select all" checkbox** in the header that selects all visible rows, with a follow-up prompt to "Select all [N] records matching this filter" for full-dataset operations.
- Show a **live count** of selected items in the batch action toolbar: "3 items selected" or "3 of 1,247 selected."
- Use **confirmation dialogs** for destructive batch actions (delete, archive) that show exactly how many records will be affected and cannot be triggered accidentally.
- Support **keyboard shortcuts** for common batch operations: Ctrl/Cmd+A for select all, Delete for delete selected, with clear keyboard shortcut hints in the UI.
- Disable batch action buttons that do not apply to the current selection (e.g., "Mark as complete" is disabled when all selected items are already complete) and show a tooltip explaining why.

## Anti-Patterns
- No batch actions at all, forcing users to perform repetitive one-by-one operations across dozens or hundreds of records.
- A "Select all" that only selects visible rows on the current page, silently ignoring matching records on other pages.
- Destructive batch actions with no confirmation dialog, allowing accidental deletion of hundreds of records with a single click.
- Batch action toolbar that obscures the table data or pushes it down, breaking the user's view of what they have selected.
