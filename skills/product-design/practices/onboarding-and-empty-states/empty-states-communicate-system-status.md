---
title: Empty States — Communicate System Status Honestly
category: Onboarding & Empty States
tags: [empty-state, onboarding, feedback-loop, trust]
priority: core
applies_when: "When designing what users see before data exists, after clearing filters, or when errors leave a view empty."
---

## Principle
An empty state must clearly communicate why there is no data and what the user can do about it — it is a system status message, not a design afterthought.

## Why It Matters
Empty states are among the most frequently encountered screens in any application — they appear on first use, after filtering produces no results, after deleting all items, and when external systems fail to return data. When an empty state is blank or displays only a generic "No results" message, users cannot distinguish between "nothing exists yet," "your filter is too restrictive," and "something is broken." This ambiguity erodes trust and stalls the user's workflow. A well-crafted empty state is an opportunity to orient, educate, and propel the user forward.

## Application Guidelines
- Always explain the reason for emptiness in plain language: "You haven't created any projects yet" vs. "No projects" vs. a blank screen
- Provide a single, clear primary action that resolves the empty state (e.g., "Create your first project" button) — do not leave the user without a next step
- Differentiate between empty states caused by the user (no items created), by filters (no items match), and by errors (failed to load) — each requires different messaging and actions
- For filter-driven empty states, show the active filters and offer a "Clear filters" action inline
- Use a simple illustration or icon to provide visual warmth, but keep it secondary to the message and action

## Anti-Patterns
- Showing a completely blank white screen with no explanation when a list or table has no items
- Using a generic "No data available" message for every empty state regardless of cause
- Omitting the primary action — telling the user there are no items but providing no way to create one from the empty state itself
- Displaying a full-page error illustration when the issue is simply "you haven't added anything yet," which implies the system is broken
