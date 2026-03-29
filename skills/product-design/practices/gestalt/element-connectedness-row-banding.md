---
title: Element Connectedness via Row Banding in Tables
category: Gestalt Principles
tags: [table, accessibility, gestalt]
priority: situational
applies_when: "When building wide data tables and you need alternating row colors to visually bind cells within each row for reliable horizontal scanning."
---

## Principle
Alternating row background colors (zebra striping) leverage Element Connectedness to bind each cell in a row into a single perceptual unit, making horizontal scanning reliable in data-dense tables.

## Why It Matters
In wide tables with many columns, the eye easily drifts to an adjacent row while scanning from left to right. Row banding creates a continuous visual connector — the shared background color — that links all cells in a row, preventing misreading and significantly reducing error rates in data lookup tasks.

## Application Guidelines
- Use a subtle background color difference (5-10% lightness shift) between alternating rows — enough to connect cells but not so strong it creates visual vibration
- Maintain row banding even when rows are interactive (hoverable, selectable) by layering the hover/selection state on top of the band color rather than replacing it
- In tables with row grouping or expandable rows, apply banding within each group independently so the connectedness cue resets at group boundaries
- Ensure the banding colors meet minimum contrast requirements against the text in both light and dark themes

## Anti-Patterns
- Using row banding colors so strong that the table looks like a checkerboard, creating figure-ground ambiguity between the rows themselves
- Removing row banding on mobile table views where horizontal scrolling makes cross-row drift even more likely
- Applying column banding instead of (or in addition to) row banding, which creates a grid pattern that defeats the purpose of horizontal connectedness
