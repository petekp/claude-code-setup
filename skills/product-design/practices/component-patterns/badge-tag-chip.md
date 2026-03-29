---
title: Badge / Tag / Chip — Semantic Color and Label Consistency
category: Component Patterns
tags: [icon, table, accessibility, theming, consistency]
priority: situational
applies_when: "When using badges, tags, or chips to convey status or category and you need a consistent color-to-meaning mapping across the product."
---

## Principle
Badges, tags, and chips must use a consistent color-to-meaning mapping and clear labeling across the entire product so users can decode status and category at a glance.

## Why It Matters
These small visual markers are among the most frequently scanned elements in data-dense interfaces — they appear in tables, lists, cards, and detail views. When color-meaning associations are consistent (green = active, red = error, yellow = warning, blue = informational), users develop rapid pattern recognition and can scan a table of 50 rows and spot problems in seconds. When the same color means different things in different contexts, or when meanings shift without explanation, these markers create confusion instead of clarity.

## Application Guidelines
- Define a product-wide semantic color palette: map each color to a specific meaning (e.g., green = success/active, red = error/critical, amber = warning/pending, blue = info/default, gray = inactive/draft) and enforce it everywhere
- Always pair color with a text label — never use a colored dot alone to convey meaning (accessibility requirement)
- Keep badge/tag text concise: one or two words maximum (e.g., "Active," "Overdue," "Draft")
- Use consistent shapes: if badges are rounded pills in one view, they should be rounded pills everywhere
- Limit the number of distinct badge types per view to avoid rainbow noise — if a table row has five different colored badges, the signal is diluted
- For user-created tags/labels (like project tags), allow custom colors but provide a constrained palette to maintain visual harmony
- Ensure sufficient color contrast between the badge text and its background (4.5:1 minimum)

## Anti-Patterns
- Using green to mean "active" in one table and "low priority" in another, destroying the user's color-meaning association
- A badge that displays a color with no text label, requiring users to hover for a tooltip to understand the meaning
- Inconsistent shapes: round badges in one feature, square badges in another, with no semantic reason for the difference
- A view with 8+ distinct badge colors, creating a confusing rainbow that users cannot parse quickly
