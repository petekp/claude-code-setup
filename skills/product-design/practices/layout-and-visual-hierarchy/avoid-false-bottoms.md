---
title: Avoid False Bottoms — Visual Continuity in Scrollable Views
category: Layout & Visual Hierarchy
tags: [layout, list, card, scanning]
priority: situational
applies_when: "When a scrollable page could present a visually complete composition at the fold and you need to ensure users know more content exists below."
---

## Principle
A scrollable page must never present a visual layout that appears complete, causing users to stop scrolling before they have seen all the content.

## Why It Matters
A "false bottom" occurs when content above the fold creates a visually complete composition — full-width sections ending with whitespace, a row of cards that perfectly fills the viewport, or a horizontal rule that looks like a page terminator. Users unconsciously interpret these as "end of content" and stop scrolling, never discovering the features, information, or actions below. This is not a scrolling literacy problem — it is a layout design failure that misleads even experienced users.

## Application Guidelines
- Ensure at least one content element is visually "cut off" by the bottom edge of the viewport, creating an obvious cue that more content exists below
- Avoid placing full-width horizontal dividers or large blocks of whitespace at positions that align with common viewport heights
- For card grids, ensure the bottom row of visible cards is partially visible (cropped by the viewport edge), not neatly concluded
- Use subtle scroll indicators (a fade gradient at the bottom edge, a small "scroll for more" hint) for content areas that are scrollable within the page
- Test layouts at multiple viewport heights (768px, 900px, 1024px, 1200px) to catch false-bottom alignments that occur at common screen sizes

## Anti-Patterns
- Ending a hero section with a full-width background change that creates a "finished" appearance right at the fold
- Placing a "Back to top" button or footer-like element partway through the page, suggesting the page has ended
- Designing scrollable containers (modals, side panels, embedded lists) with no visible indication that content extends beyond the visible area
- Using full-bleed images or illustrations that perfectly fill the remaining viewport, creating a magazine-page-turn illusion
