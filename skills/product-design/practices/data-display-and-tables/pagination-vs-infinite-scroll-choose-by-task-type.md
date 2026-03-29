---
title: Pagination vs. Infinite Scroll — Choose by Task Type
category: Data Display & Tables
tags: [table, list, navigation, mental-model]
priority: situational
applies_when: "When deciding between pagination and infinite scroll for a data list or table based on whether users are searching for specific records or browsing content."
---

## Principle
Select pagination for task-oriented tables where users need to locate specific records, and infinite scroll for browsing-oriented feeds where users are exploring content — never default to one pattern for all data displays.

## Why It Matters
Pagination and infinite scroll serve fundamentally different user behaviors. Pagination gives users a sense of position ("I'm on page 3 of 12"), supports bookmarking and sharing specific result sets, and works well with precise record counts. Infinite scroll supports fluid browsing where the user has no specific target — social feeds, activity logs, image galleries. Using the wrong pattern creates friction: infinite scroll on an admin table makes it impossible to jump to page 8 or share a link to a specific result set; pagination on an activity feed interrupts the browsing flow with unnecessary clicks.

## Application Guidelines
- Use **pagination** when: users need to find specific records, the total count matters, results need to be shareable by URL, or the data is structured/tabular. Common in admin panels, search results, CRMs, and data management tools.
- Use **infinite scroll** when: users are browsing without a specific target, content is consumed sequentially, and the total count is less important. Common in activity feeds, notification lists, and content discovery interfaces.
- For paginated tables, show: **page numbers** (with first/last and previous/next), **total record count**, **records per page**, and a **page size selector** (10, 25, 50, 100).
- For paginated tables, **preserve page state in the URL** (e.g., `?page=3&per_page=25`) so users can bookmark, share, and use browser back/forward.
- For infinite scroll, show a **"Load more" button** as a fallback for users who prefer explicit control, and display a running count ("Showing 75 of ~1,200 results").
- For infinite scroll, implement a **"Back to top" button** that appears after scrolling down significantly, preventing the tedious manual scroll-up.
- Consider **hybrid approaches** for power-user tools: paginated by default with an option to "Load all" for small filtered result sets.

## Anti-Patterns
- Infinite scroll on a data management table where users need to jump to specific pages, share URLs, or know the total record count.
- Pagination with only "previous/next" and no page numbers, forcing users to click through dozens of pages sequentially.
- Infinite scroll with no loading indicator, leaving users staring at a blank space wondering if more data is coming.
- Pagination that resets scroll position and filter state when navigating between pages, losing context.
