---
title: Search as Primary Navigation
category: Navigation & Information Architecture
tags: [navigation, search, keyboard, enterprise]
priority: situational
applies_when: "When building a command palette or universal search bar that lets experienced users reach any record, screen, or action by typing rather than browsing."
---

## Principle
For applications with large data sets or many features, search must function as a first-class navigation method — not just a content-finding tool — enabling users to reach any record, screen, or action by typing rather than browsing.

## Why It Matters
As applications grow in complexity, hierarchical navigation becomes insufficient for experienced users. A user who knows they want "the Anderson Corp deal from last quarter" should not need to navigate to Deals > filter by company > filter by date > scan results. Search-as-navigation (exemplified by command palettes, universal search bars, and spotlight-style interfaces) allows intent-driven access that is faster than any menu hierarchy. This pattern is essential for power users and becomes the preferred navigation method for experienced users in content-rich applications.

## Application Guidelines
- Provide a global search accessible from every page via both a visible search bar and a keyboard shortcut (Cmd/Ctrl+K is the emerging standard for command palettes)
- Return results across all content types (records, pages, settings, actions, help articles) in a single search, grouped by type with clear category labels
- Support both exact matching and fuzzy matching — users may remember approximate names, partial IDs, or related terms
- Show recent searches and frequently accessed items before the user types anything, making the search bar double as a "recently viewed" shortcut
- Enable action execution from search results: not just "navigate to the Settings page" but "open Settings > Notifications" or "create new Project"

## Anti-Patterns
- Limiting search to a single content type (only searching records, not pages or settings), forcing users to know which search to use for which task
- Requiring exact-match queries with no fuzzy matching, typo tolerance, or synonym support
- Placing the search bar in a collapsed state behind an icon with no keyboard shortcut, making it slower to access than hierarchical navigation
- Returning results without context (showing "Anderson Corp" without indicating whether it is a contact, company, deal, or document), requiring users to click each result to identify it
