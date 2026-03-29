---
title: Master-Detail Side-by-Side Layout
category: Desktop-Specific Patterns
tags: [layout, sidebar, list, keyboard, scanning]
priority: situational
applies_when: "You are building a desktop interface where users browse a collection and review individual item details in a triage or review workflow."
---

## Principle
Present a browsable list of items alongside a detail view so users can scan, compare, and drill into content without losing their place in the collection.

## Why It Matters
Desktop screens have the real estate to show both navigation context and content simultaneously. When users must click into a detail view and then navigate back to a list, they lose mental context and waste time reorienting. A side-by-side layout preserves the list as a persistent anchor, dramatically reducing navigation cost and supporting rapid comparison workflows.

## Application Guidelines
- Place the list (master) on the left at 25-35% width and the detail pane on the right; this matches the F-pattern reading flow in LTR languages
- Highlight the selected item in the master list with a persistent active state so the user always knows which record they are viewing
- Support keyboard arrow-key navigation through the master list with instant detail pane updates — this is critical for triage and review workflows
- Allow the master pane to be resized or collapsed so users can maximize the detail view when they need to focus on a single record
- Show a meaningful empty state in the detail pane when no item is selected (e.g., "Select a message to read")
- Include enough metadata in each master-list row (subject, status, timestamp) that users can make selection decisions without opening the detail

## Anti-Patterns
- Forcing full-page navigation to view item details on desktop, requiring the user to use the browser back button to return to the list
- Making the master list too narrow to show useful preview information, turning it into an opaque index of IDs
- Losing the user's scroll position or selected item in the master list when they interact with the detail pane
- Failing to provide keyboard navigation through the list, forcing mouse-only interaction for what is fundamentally a sequential scanning task
