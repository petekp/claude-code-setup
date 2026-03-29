---
title: Contextual Secondary Navigation via Tabs
category: Navigation & Information Architecture
tags: [navigation, layout, consistency, mental-model]
priority: situational
applies_when: "When organizing related content within a single page context using tabs for quick switching between views of the same entity or dataset."
---

## Principle
Tabs should be used to organize related content within a single page context, providing quick switching between views without leaving the parent page or losing page-level state.

## Why It Matters
Tabs communicate that the content behind each tab is of the same type or importance level, belongs to the same parent context, and can be switched between without consequence. They are a natural pattern for organizing entity details (a contact's profile, activity, notes, and settings), view modes (list, board, timeline), or data facets (all, active, archived). When used correctly, tabs reduce page count and keep related information spatially grouped. When misused — for unrelated content, for too many items, or as a replacement for primary navigation — they create confusion about scope and hierarchy.

## Application Guidelines
- Use tabs for 2-7 views of the same entity or dataset — beyond 7, consider a different pattern (vertical sub-nav, dropdown selector)
- Ensure tab labels are concise (1-2 words) and follow the same grammatical form (all nouns: "Overview," "Activity," "Settings"; or all actions: "View," "Edit," "Share")
- Preserve in-tab state (scroll position, filter selections) when the user switches between tabs and returns — losing state on tab switch is a significant usability regression
- Place tabs immediately below the page header and above the content they control, maintaining a clear spatial relationship
- Use tabs for same-level, non-sequential content — if the content has a required sequence, use a wizard/stepper instead

## Anti-Patterns
- Using tabs to separate unrelated content areas that have no shared parent context (e.g., tabs for "Dashboard," "Reports," "Settings" — these are top-level navigation, not tabs)
- Nesting tabs within tabs, creating a confusing double-tab layout where the user cannot tell which tab controls which content area
- Using more than 8-10 tabs, which forces horizontal scrolling or overflow and makes the tab bar itself a navigation challenge
- Resetting all content and state when the user clicks between tabs, punishing users for exploring related views
