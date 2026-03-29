---
title: Virtual Scrolling for Large Datasets
category: Data Display & Tables
tags: [table, list, performance, accessibility]
priority: situational
applies_when: "The interface displays a scrollable list or table with more than 200 rows and pagination is not appropriate for the workflow."
---

## Principle
Render only the rows currently visible in the viewport (plus a small buffer), dynamically creating and destroying DOM elements as the user scrolls, so tables with thousands or millions of rows remain performant and responsive.

## Why It Matters
Rendering 10,000 table rows into the DOM simultaneously creates 10,000+ DOM nodes per column, each consuming memory, slowing paint cycles, and making the browser unresponsive. Users experience long initial load times, laggy scrolling, and crashed tabs. Virtual scrolling solves this by maintaining a "window" of perhaps 30-50 rendered rows that shifts as the user scrolls, keeping DOM node count constant regardless of dataset size. The user sees a full-length scrollbar and smooth scrolling; the browser does a fraction of the work.

## Application Guidelines
- Implement virtual scrolling when datasets **exceed 200-500 rows** and pagination is not appropriate for the use case (e.g., real-time logs, continuous browsing workflows).
- Maintain a **buffer of 5-10 rows** above and below the visible viewport to prevent blank flashes during fast scrolling.
- Preserve **consistent row heights** or implement dynamic row height measurement for variable-height rows. Virtual scrolling depends on predictable row positioning to calculate which rows are visible.
- Show an **accurate scrollbar** that reflects the total dataset size, not just the rendered subset. Users should see a small scrollbar thumb for a 10,000-row table and be able to jump to any position.
- Support **keyboard navigation** (arrow keys, Page Up/Down, Home/End) that correctly scrolls and focuses virtual rows, not just the rendered subset.
- Ensure **accessibility**: screen readers should announce total row count and current position. Use ARIA attributes (`aria-rowcount`, `aria-rowindex`) so assistive technology can convey the virtual structure.
- Handle **search and filter** correctly — when a user filters the dataset, the virtual scroller should reset its position and recalculate based on the filtered row count, not the original.

## Anti-Patterns
- Rendering all 10,000 rows into the DOM at once, causing multi-second load times, janky scrolling, and memory pressure that crashes tabs.
- Virtual scrolling that shows blank white gaps during fast scrolling because the buffer is too small or row rendering is too slow.
- A scrollbar that does not reflect the true dataset size, making it impossible for users to estimate how much data exists or to jump to a specific position.
- Virtual scrolling that breaks keyboard navigation or screen reader announcements, making the table inaccessible.
