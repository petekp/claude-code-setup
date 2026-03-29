---
title: Pagination vs. Virtual Scrolling Decision Framework
category: Data Display & Tables
tags: [table, list, performance, accessibility]
priority: situational
applies_when: "When choosing between pagination and virtual scrolling based on dataset size, shareability requirements, accessibility needs, and user task flow."
---

## Principle
Choose between pagination and virtual scrolling based on a structured evaluation of dataset size, user task type, shareability requirements, and technical constraints — not habit or convention.

## Why It Matters
Both pagination and virtual scrolling solve the same underlying problem (rendering large datasets efficiently), but they serve different interaction models and have different tradeoffs for UX, accessibility, and technical complexity. Picking the wrong one creates friction: pagination interrupts continuous analysis workflows with click-to-advance steps, while virtual scrolling prevents URL-based position sharing and complicates keyboard accessibility. A decision framework prevents cargo-culting one pattern everywhere and ensures the choice is deliberate and defensible.

## Application Guidelines
- **Choose pagination when:** result sets have a meaningful total count, users need to share or bookmark specific pages, the data is consumed in discrete batches (admin reviews, approval queues), SEO or deep-linking matters, or accessibility requirements are strict (pagination is simpler for screen readers).
- **Choose virtual scrolling when:** datasets are very large (1,000+ rows), users need continuous scanning without interruption, the data is consumed sequentially (logs, timelines, feeds), or the table is used as a real-time monitoring view.
- **Evaluate shareability:** Can users share a URL that returns the same data view? Pagination supports this naturally with `?page=3`; virtual scrolling requires additional work to encode scroll position.
- **Evaluate accessibility:** Pagination works with screen readers out of the box; virtual scrolling requires careful ARIA implementation (`aria-rowcount`, `aria-rowindex`) to communicate the virtual structure.
- **Evaluate performance:** For datasets under 200 rows, render all rows — neither pagination nor virtual scrolling is needed. For 200-1,000 rows, pagination is simpler. For 1,000+ rows, virtual scrolling avoids pagination's many-pages problem.
- **Evaluate task flow:** If users frequently jump between non-adjacent sections of the data, pagination with page numbers is better. If users always start at the top and work downward, virtual scrolling is more natural.
- Document your decision in the design spec with the reasoning, so future designers do not revisit it without context.

## Anti-Patterns
- Defaulting to pagination everywhere because "that's what we always do," even for real-time log viewers where page boundaries are meaningless.
- Defaulting to virtual scrolling everywhere because "it feels modern," even for admin tables where URL shareability and screen reader access matter.
- Implementing virtual scrolling without addressing keyboard navigation, screen reader support, or scroll position persistence, creating an inaccessible experience.
- Using pagination with only prev/next buttons on a 500-page dataset, forcing users to click through hundreds of pages to reach a specific position.
