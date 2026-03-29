---
title: Data Tables — Support All Four Core User Tasks by Design
category: Data Display & Tables
tags: [table, search, bulk-actions, mental-model]
priority: core
applies_when: "When designing a data table from scratch and ensuring it supports lookup, comparison, pattern discovery, and action rather than just passive display."
---

## Principle
Design every data table to support the four fundamental tasks users perform with tabular data: lookup (find a specific record), comparison (evaluate multiple records against each other), pattern discovery (identify trends and outliers), and action (act on records) — not just display.

## Why It Matters
Most data tables are built to show data but not to help users do anything with it. A table that does not support filtering fails at lookup. A table that does not support column reordering or row selection fails at comparison. A table without sorting or conditional formatting fails at pattern discovery. A table with no row-level actions forces users to copy IDs into another screen. When all four task types are supported, the table becomes a complete workspace rather than a passive display, and users can accomplish their goals without leaving the page.

## Application Guidelines
- **Lookup support:** Include search/filter capabilities (global search bar, per-column filters, and filter chips for active filters) so users can narrow thousands of rows to the one record they need.
- **Comparison support:** Let users select multiple rows (via checkboxes), reorder or pin columns to place comparison attributes side by side, and optionally provide a dedicated "compare selected" mode with a side-by-side layout.
- **Pattern discovery support:** Enable sorting on any column, support conditional formatting or heatmap coloring for numeric columns, and include sparklines or inline bar charts for trend-capable fields.
- **Action support:** Provide row-level actions (edit, delete, view, assign) via an actions column or context menu, and batch actions (bulk edit, export, delete) via a toolbar that appears when rows are selected.
- Prioritize the task types based on **user research** — an admin table may weight actions highest, while an analytics table may weight pattern discovery. All four should be present, but the primary task should be most prominent.
- Show **record count and active filter summary** at all times so users always know how many records match and what criteria are applied.

## Anti-Patterns
- A table that is read-only with no actions, forcing users to note down IDs and navigate to another page to perform operations.
- A table with no search or filter, requiring users to scroll through hundreds of rows to find a specific record.
- A table where columns are fixed and cannot be reordered, preventing users from placing the two columns they want to compare side by side.
- A table with no sorting that displays records in arbitrary database insertion order, making pattern discovery impossible.
