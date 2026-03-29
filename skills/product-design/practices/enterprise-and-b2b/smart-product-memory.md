---
title: Smart Product Memory — Persist User Configurations
category: Enterprise & B2B Patterns
tags: [settings, table, enterprise, consistency]
priority: situational
applies_when: "When the application should remember and restore user preferences — column widths, sort orders, filters, panel positions — across sessions and devices."
---

## Principle
Remember and restore every user preference, configuration, and state — column widths, sort orders, filter selections, panel positions, last-viewed items — so the application feels like a personalized workspace, not a fresh install every session.

## Why It Matters
Enterprise users configure their workspace deliberately: they set up table columns to match their workflow, apply filters for their responsibilities, arrange panels for their monitor setup, and navigate to their area of focus. When an application forgets these configurations on refresh, logout, or update, users must repeat this setup ritual daily — a frustrating tax on productivity that signals the application doesn't respect their time or preferences.

## Application Guidelines
- Persist all user-configurable state server-side: table column order and visibility, sort direction, applied filters, sidebar collapse state, selected tab, density preference
- Restore the user's last-visited location and scroll position when they return to the application
- Remember form input for incomplete submissions so users can resume where they left off after interruptions
- Store "recent items" and "frequently accessed" sections that surface the user's most common navigation targets
- Provide a "Reset to Default" option for any persisted preference so users can recover from unwanted configurations
- Sync preferences across devices when the user accesses the application from multiple locations

## Anti-Patterns
- Resetting all user preferences on page refresh, requiring users to reconfigure their workspace every time they reload
- Persisting some preferences (like theme) but not others (like table columns or filter state), creating an inconsistent experience
- Storing preferences only in browser localStorage, which is lost when users switch devices or clear their browser
- Persisting configurations that become stale (e.g., a saved filter referencing a deleted user) without graceful fallback
