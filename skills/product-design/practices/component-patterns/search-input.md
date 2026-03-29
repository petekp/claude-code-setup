---
title: Search Input Component Design Standards
category: Component Patterns
tags: [search, keyboard, accessibility, recognition]
priority: core
applies_when: "When designing the search input component itself: its placement, typeahead behavior, keyboard shortcuts, and result display."
---

## Principle
Search inputs must be instantly discoverable, fast to use, and helpful before, during, and after the user types, providing guidance and results at every stage.

## Why It Matters
Search is often the fastest path to content in any application with more than a handful of items. A well-designed search experience can redeem even mediocre information architecture, while a poor one forces users into manual browsing. The search input itself — its placement, behavior, and feedback — determines whether users adopt search as their primary navigation strategy or avoid it entirely. Every millisecond of latency and every missing convenience feature pushes users toward slower, more frustrating browsing.

## Application Guidelines
- Place search in a consistent, prominent location — top of the page or accessible via a standard keyboard shortcut (Cmd/Ctrl+K)
- Include a search icon (magnifying glass) and placeholder text that communicates what is searchable (e.g., "Search projects, tasks, and people...")
- Show recent searches and suggested queries when the input is focused but empty
- Provide results as-you-type with debounced server queries (200-300ms delay) rather than requiring the user to press Enter
- Highlight the matching text within each result to show why it matched
- Support keyboard navigation through results (arrow keys to move, Enter to select, Escape to close)
- Show the total result count and organize results by category when searching across multiple entity types
- Provide a clear button (X icon) to reset the search input quickly

## Anti-Patterns
- A search input hidden behind a small icon that requires clicking to expand, adding friction to the most common navigation action
- Search that requires pressing Enter and navigates to a separate results page, losing the user's current context
- No search suggestions, recent searches, or typeahead — just a blank input that provides zero guidance
- Search results that do not indicate why they matched, leaving users confused about the relevance of each result
