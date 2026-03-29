---
title: Deep Linking and URL State Persistence
category: Navigation & Information Architecture
tags: [navigation, search, collaboration, consistency]
priority: core
applies_when: "When building any view with filters, tabs, sort order, or modals whose state should be bookmarkable, shareable, and restorable via URL."
---

## Principle
Every meaningful application state — the current page, active filters, selected tab, sort order, open modal, and view configuration — should be reflected in the URL so that the state can be bookmarked, shared, and restored via browser navigation.

## Why It Matters
URLs are the web's universal state-sharing mechanism. When application state is not encoded in the URL, users lose the ability to bookmark a specific view, share their exact context with a colleague via link, use browser back/forward navigation to undo state changes, and reopen a closed tab to the same view. In collaborative B2B applications, the inability to share a filtered, sorted, contextualized view via URL is a major workflow friction — it forces the receiving user to manually recreate the sender's state, which is error-prone and time-consuming.

## Application Guidelines
- Encode active filters, sort order, selected tab, pagination position, and view mode (list/grid/board) as URL query parameters or hash fragments
- Ensure the browser back button reverses the most recent state change (e.g., going back from a detail page returns to the list with the same filters and scroll position)
- When a user shares a URL, the recipient should see the exact same view (minus user-specific permissions) — test this regularly as a QA practice
- For complex state (multiple filters, custom column configurations), use compressed or hashed URL parameters to avoid excessively long URLs
- Support direct navigation to modals, side panels, and detail overlays via URL (e.g., /projects/123?detail=456 opens project 123 with record 456 in a side panel)

## Anti-Patterns
- Using client-side state management (React state, Vuex) without syncing to the URL, making all state ephemeral and unshareable
- Encoding state in the URL but not restoring it on page load — the URL changes but direct navigation to that URL does not reproduce the state
- Using overly complex URL encoding that breaks when copied and pasted (unescaped special characters, double-encoded parameters)
- Changing the URL on every micro-interaction (every keystroke in a search field, every hover state), polluting the browser history with hundreds of entries
