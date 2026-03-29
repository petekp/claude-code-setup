---
title: Per-Column Filtering and Global Search
category: Search, Filter & Sort
tags: [search, table, form, data-density]
priority: situational
applies_when: "When building a data table that needs both a global search bar for broad discovery and per-column filter controls for precise attribute-level filtering."
---

## Principle
Provide both a global search bar that queries across all columns and per-column filter controls that let users filter individual attributes precisely, supporting both broad discovery and targeted lookup.

## Why It Matters
Global search and per-column filters serve different cognitive modes. Global search supports the user who types "Acme" and wants to find it whether it appears in the company name, contact name, or notes field. Per-column filters support the user who knows they want "Status = Active AND Region = EMEA" — a structured query that global search cannot express cleanly. Most data table interactions involve both modes in the same session: a user might global-search to find records related to "Acme," then column-filter by status to see only active ones. Supporting both modes makes the table versatile enough for diverse user intents.

## Application Guidelines
- Place the **global search bar** above the table in the toolbar area. It should query across all visible (and optionally hidden) columns, highlighting matching text in the results.
- Place **per-column filters** either as filter icons in each column header (click to open a filter dropdown) or as a filter row directly below the header row with input fields for each column.
- Column filters should offer **type-appropriate controls**: text search for string columns, dropdown/multi-select for categorical columns, range sliders or min/max inputs for numeric columns, and date range pickers for date columns.
- Show a **filter icon state change** on column headers with active filters (e.g., the filter icon fills with color or shows a dot) so users can see at a glance which columns are filtered.
- When both global search and column filters are active simultaneously, apply them with **AND logic** — the result set should match the global search AND all column filters.
- Show a **combined result count** that reflects all active filtering: "Showing 8 of 1,247 records (search: 'Acme', Status: Active)."
- Support **clearing individual column filters** without affecting the global search or other column filters.

## Anti-Patterns
- Only a global search with no way to filter by specific columns, forcing users to type complex pseudo-queries like "status:active region:EMEA" (which most users will not know to do).
- Per-column filters with no global search, requiring users to identify the correct column before searching, even when they just want to find any record mentioning "Acme."
- Column filters that reset when the user applies a global search, or vice versa, creating a frustrating mutual-exclusion interaction.
- Per-column filters that are only available for some columns with no clear indication of which columns support filtering.
