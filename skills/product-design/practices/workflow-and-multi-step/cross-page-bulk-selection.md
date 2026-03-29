---
title: Cross-Page Bulk Selection
category: Workflow & Multi-Step Processes
tags: [table, bulk-actions, enterprise]
priority: situational
applies_when: "When users need to select items across multiple pages of paginated results and perform bulk actions on the entire selection, not just the current page."
---

## Principle
Enable users to select items across multiple pages of paginated results and perform bulk actions on the entire selection, not just the items visible on the current page.

## Why It Matters
When a list contains thousands of items spread across hundreds of pages, "Select All" that only selects the current page's 25 items is deeply frustrating. Users who need to act on 500 items matching a filter would need to repeat the same action 20 times, one page at a time. Cross-page selection — either through "Select All X matching items" or by maintaining selection state across page navigation — transforms a tedious multi-page operation into a single action.

## Application Guidelines
- After selecting all items on a page, show a banner: "All 25 items on this page are selected. Select all 1,247 items matching the current filter?"
- When "Select all matching" is chosen, clearly display the total count: "1,247 items selected" and adjust bulk action labels to reflect the full scope
- Maintain individual selection state when navigating between pages — items selected on page 1 should remain selected when the user visits page 3
- Show a persistent selection count indicator: "47 items selected" that remains visible during pagination and navigation
- Provide a "Clear selection" action to deselect all items across all pages in one click
- Support deselecting individual items from a cross-page selection: "All 1,247 selected, except 3 items" — this handles the common "all except these few" use case
- Process cross-page bulk actions asynchronously since they may involve large datasets

## Anti-Patterns
- "Select All" that only selects items on the current page with no cross-page capability
- Selection state that resets when navigating to a different page, forcing users to perform actions one page at a time
- No indication of how many items are selected across pages, leaving users guessing about the scope of their bulk action
- Cross-page selection that offers no way to exclude specific items from a "select all" operation
