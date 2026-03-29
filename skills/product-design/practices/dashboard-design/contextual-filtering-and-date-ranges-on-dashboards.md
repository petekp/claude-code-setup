---
title: Contextual Filtering and Date Ranges on Dashboards
category: Dashboard Design
tags: [dashboard, search, data-viz, progressive-disclosure]
priority: situational
applies_when: "When building a dashboard that needs date range controls, cross-filtering between panels, or persistent filter state."
---

## Principle
Provide persistent, clearly visible filtering controls — especially date ranges — that apply globally across all dashboard panels, so users can slice data without losing context or navigating away.

## Why It Matters
Dashboards that lack filtering force users to accept whatever default view was chosen at build time, which rarely matches their current question. Without date range controls, users cannot distinguish "this is a new problem" from "this has been happening for months." Without dimensional filters, a VP sees a blended average that hides the one region dragging down performance. Effective filtering transforms a static report into an interactive analytical tool that serves dozens of questions from a single screen.

## Application Guidelines
- Place a **global date range selector** in the top-right corner (the conventional location users look for it). Support both preset ranges (Last 7 days, Last 30 days, This quarter) and custom date pickers.
- When the user changes the global date range, update **all panels simultaneously** with a coordinated loading state. Never leave some panels showing old data while others refresh.
- Show the **currently active filters** in a persistent bar or chip row near the top of the dashboard so users always know what slice of data they are viewing.
- Support **contextual cross-filtering**: clicking a segment in one chart (e.g., a bar in a bar chart) should filter related panels to that segment, with a clear visual indicator and a one-click way to clear the filter.
- Default to the date range and filters that answer the user's most common question. For operational dashboards, this is usually "today" or "last 24 hours"; for strategic dashboards, "this quarter" or "this month."
- Persist filter selections across sessions (via URL parameters or user preferences) so returning users do not have to re-apply their preferred view every time.

## Anti-Patterns
- Hiding the date range selector inside a settings modal or behind a gear icon, making users hunt for the most fundamental dashboard control.
- Applying filters to only some panels while others remain unfiltered, creating contradictory data on the same screen.
- Providing a date picker with no preset shortcuts, forcing users to manually select start and end dates for common ranges like "last 7 days."
- Resetting all filters on page reload, forcing repeat configuration that discourages exploration.
