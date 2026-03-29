---
title: Column Management for Comparison Work
category: Data Display & Tables
tags: [table, drag-drop, settings, data-density]
priority: situational
applies_when: "When a table has many columns (15+) and users need to show, hide, reorder, pin, and resize columns to compare specific attributes side by side."
---

## Principle
Give users control over which columns are visible, their order, and their width, so they can place the specific attributes they need to compare side by side without scrolling through irrelevant fields.

## Why It Matters
Enterprise tables routinely have 15-40 columns, but a user performing a comparison task typically cares about 3-5 of them at a time. Without column management, users must horizontally scroll back and forth, trying to hold values in memory across a wide table — a task that is cognitively expensive and error-prone. Column management turns a fixed data dump into a configurable workspace where the user controls what is visible and where, enabling the fast visual comparisons that drive decision-making.

## Application Guidelines
- Provide a **column visibility toggle** — a dropdown or panel listing all available columns with checkboxes — so users can show and hide columns without technical knowledge.
- Support **column reordering** via drag-and-drop on the column headers. Users should be able to drag a column from position 12 to position 2 to place it next to the column they want to compare it against.
- Allow **column resizing** by dragging the header border. Some columns need more space (names, descriptions) while others need less (status flags, dates).
- Support **column pinning/freezing** — allow users to pin one or more columns to the left edge so they remain visible while horizontally scrolling through other columns. The identifier column (name, ID) should be pinnable by default.
- Provide **saved column configurations** (sometimes called "views" or "presets") so users can switch between different column arrangements for different tasks without reconfiguring each time.
- Include a **"Reset columns"** action that restores the default configuration, giving users a safety net.
- Show a **column count indicator** (e.g., "Showing 8 of 23 columns") so users know hidden columns exist and can be revealed.

## Anti-Patterns
- A table with 30 fixed columns that cannot be reordered, resized, hidden, or pinned, requiring constant horizontal scrolling.
- Column management buried in a settings page rather than accessible directly from the table header area.
- Column reordering that does not persist across sessions, forcing users to rearrange columns every time they return.
- No way to pin the identifier column, so when users scroll right to see data columns, they lose track of which row is which.
