---
title: Recently Viewed Records and Resume Incomplete Workflows
category: Navigation & Information Architecture
tags: [navigation, search, enterprise, recognition]
priority: situational
applies_when: "When users return to the application after interruption and need to resume work, access recently viewed records, or restore their prior filter and view state."
---

## Principle
The application should remember and surface the user's recent context — recently viewed records, in-progress workflows, and last-used configurations — so users can resume work without reconstructing their prior state.

## Why It Matters
Users rarely complete complex tasks in a single session. They are interrupted by meetings, switch between tools, and return to tasks hours or days later. When the application provides no memory of recent activity, users must re-navigate to the record they were viewing, re-apply the filters they had configured, or restart the workflow they were halfway through. This re-navigation tax is one of the most significant yet invisible sources of friction in enterprise software. Recency features transform the application from a stateless tool into a work partner that remembers context.

## Application Guidelines
- Provide a "Recently Viewed" list accessible from the main navigation or a quick-access menu, showing the last 10-20 records the user viewed or edited
- Auto-save incomplete form entries and multi-step wizard progress so users can return and resume without data loss
- Restore the user's last-used filters, sort order, and view configuration when they return to a list or dashboard
- Show a "Continue where you left off" prompt on the dashboard or home screen that links to the user's most recent in-progress task
- Include recently used items in search suggestions and command palette results, weighted by recency and frequency

## Anti-Patterns
- Resetting all filters, sort orders, and pagination to defaults every time a user navigates away from a list and returns
- Losing all form input when a user navigates away from an incomplete form, even temporarily (e.g., to look up a value on another page)
- Providing no way to access recently viewed records, requiring users to search or navigate from scratch every time
- Auto-saving state so aggressively that users cannot distinguish between their intentional configurations and accidental ones — provide a "Reset to defaults" option alongside state persistence
