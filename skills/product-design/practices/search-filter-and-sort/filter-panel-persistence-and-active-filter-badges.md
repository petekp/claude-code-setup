---
title: Filter Panel Persistence and Active Filter Badges
category: Search, Filter & Sort
tags: [search, table, navigation, feedback-loop, consistency]
priority: situational
applies_when: "When filters must persist across navigation and page reloads, with clear badge indicators showing which filters are active and how many results they produce."
---

## Principle
Keep active filters visible and persistent through navigation, and display clear badge indicators showing which filters are applied and how many results they produce, so users are never confused about what subset of data they are viewing.

## Why It Matters
Hidden filters are dangerous. When a user applies three filters, navigates to a record detail, and returns to the table, those filters must still be active — otherwise the user sees a different dataset than they expected and may not realize it. Equally important, active filters must be clearly displayed at all times. A user staring at a table showing 12 records when the total is 1,200 needs to immediately see "Filtered: Status = Open, Priority = High, Team = Engineering" — not wonder why data is missing and start debugging a phantom bug.

## Application Guidelines
- Display **active filter badges** (chips or tags) in a persistent bar at the top of the table or result set. Each badge shows the filter dimension and value: "Status: Open" "Priority: High."
- Include an **"x" dismiss button** on each badge for one-click filter removal, and a "Clear all" action to reset everything at once.
- Show the **filtered result count** prominently: "Showing 12 of 1,247 records" so users know the filters are reducing the dataset.
- **Persist filter state** across navigation: when a user opens a record and returns, the filters should still be active. Use URL parameters, session storage, or application state management.
- Persist filters across **page reloads** for the current session, using URL query parameters as the source of truth. This also makes filtered views shareable.
- When filter panels are collapsible (e.g., a sidebar filter panel), show a **filter count badge** on the collapse toggle (e.g., a "3" badge on the filter icon) so users know filters are active even when the panel is closed.
- Animate filter application subtly — a brief transition or count update — so users perceive that the data is responding to their filter action.

## Anti-Patterns
- Filters that silently reset when the user navigates away and returns, showing different data with no explanation.
- No visible indication that filters are active, causing users to mistake a filtered subset for the complete dataset.
- Filter badges that show the dimension ("Status") but not the value ("Open"), requiring users to open the filter panel to see what is actually applied.
- Active filters hidden inside a collapsed filter panel with no external indicator, so the table appears to have "missing data" for no apparent reason.
