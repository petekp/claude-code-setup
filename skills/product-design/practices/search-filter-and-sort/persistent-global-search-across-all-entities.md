---
title: Persistent Global Search Across All Entities
category: Search, Filter & Sort
tags: [search, navigation, keyboard, enterprise]
priority: situational
applies_when: "When ensuring the global search bar is visible and accessible from every page, with keyboard shortcut access and cross-entity search results."
---

## Principle
Make the global search bar visible and accessible from every page in the application, maintaining query state and recent searches across navigation, so users can search from anywhere without navigating to a dedicated search page.

## Why It Matters
Users' need to search arises unpredictably — while viewing a dashboard, editing a record, reading documentation, or configuring settings. If the search bar only exists on certain pages, users must first navigate to a search-enabled page (breaking their current task) before they can search (starting a new task). A persistent, always-available search bar eliminates this navigation tax and makes the application feel like a cohesive, queryable system rather than a collection of disconnected pages. It also reduces the cognitive load of remembering where the search function lives.

## Application Guidelines
- Place the search bar in the **application header** (top bar) so it is visible on every page without exception. It should survive navigation, page transitions, and even error states.
- Support a **keyboard shortcut** (Cmd/Ctrl+K or Cmd/Ctrl+/) that focuses the search bar from anywhere, regardless of the current page or focus state. Display the shortcut hint near the search bar.
- **Search across all entity types** — not just the entity type on the current page. If the user is on the Orders page and searches "John Smith," they should find John Smith's customer record, his orders, his support tickets, and any documents mentioning him.
- Show **search results in a dropdown overlay** (command palette style) rather than navigating to a separate search results page. This lets users find and navigate to a result without fully abandoning their current context.
- Preserve **recent searches** in the search dropdown, available before the user types anything, for quick re-execution of common queries.
- Display **recently viewed items** alongside recent searches in the dropdown, serving as a quick navigation history.
- Ensure the search bar gracefully handles **empty and error states**: show helpful messaging ("Start typing to search across all records") rather than a blank dropdown.

## Anti-Patterns
- A search function that only exists on one page (e.g., a dedicated "Search" page in the navigation menu), requiring users to navigate there before every search.
- A search bar that only searches the current page's entity type, silently ignoring results from other sections of the application.
- Navigation to a full-page search results view that completely replaces the user's current context, with no way to return to their previous state.
- No keyboard shortcut for search, requiring users to reach for the mouse and click the search bar every time.
