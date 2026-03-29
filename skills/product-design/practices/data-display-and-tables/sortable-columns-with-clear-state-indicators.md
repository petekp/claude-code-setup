---
title: Sortable Columns with Clear State Indicators
category: Data Display & Tables
tags: [table, button, affordance, feedback-loop]
priority: core
applies_when: "When building a data table with sortable columns and users need a clear visual indicator of the current sort column and direction."
---

## Principle
Make all relevant table columns sortable with a single click, and always show a clear visual indicator of the current sort column and direction so users are never confused about how the data is ordered.

## Why It Matters
Sorting is one of the most fundamental table interactions — users sort to find extremes (highest, lowest, newest, oldest), to group similar values together, and to impose a mental model on unsorted data. When sort state is unclear, users cannot trust the table's order: they wonder "Is this sorted by date or name? Ascending or descending?" This uncertainty undermines every conclusion drawn from the table. Clear sort indicators eliminate ambiguity and let users confidently read the table as an ordered dataset.

## Application Guidelines
- Make column headers **clickable to sort**, with a first click sorting ascending, a second click sorting descending, and an optional third click resetting to the default sort. Use the cursor change to `pointer` to signal clickability.
- Display a **sort direction arrow** (up for ascending, down for descending) in the active sort column header. The arrow should be visually prominent — not a faint 8px glyph that disappears into the text.
- **Dim or hide sort arrows** on inactive columns to reduce clutter. Show them on hover to indicate sortability, but keep the active sort arrow always visible.
- Support **multi-column sorting** (shift-click to add secondary sort) for power users, and display numbered indicators (1, 2, 3) to show the sort priority.
- Preserve **sort state across pagination** — sorting should apply to the entire dataset, not just the visible page.
- For **non-obvious data types**, sort intelligently: dates should sort chronologically (not lexicographically), numbers should sort numerically (not as strings where "9" > "10"), and null values should sort consistently to the end.
- Provide a **"Reset sort"** option in the column header menu or table toolbar for users who have applied complex multi-column sorts and want to return to the default.

## Anti-Patterns
- Sortable columns with no visual indicator of which column is currently sorted or in which direction.
- Sort arrows that look identical for ascending and descending (e.g., a generic diamond icon that does not change).
- Columns that are not sortable with no indication of why — users click the header and nothing happens, with no tooltip or disabled state to explain.
- Sorting that applies only to the current page of a paginated table, producing meaningless results (the "top 10" on page 1 is only the top 10 of that page's 25 rows).
