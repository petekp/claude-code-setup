---
title: Visual Hierarchy — Establish a Clear Type Scale
category: Layout & Visual Hierarchy
tags: [text, layout, scanning, consistency]
priority: core
applies_when: "When establishing or auditing the typographic hierarchy of any interface and you need a consistent type scale to guide the user's reading order."
---

## Principle
A consistent, intentional type scale creates an implicit reading order that guides users through content by importance without requiring explicit instructions.

## Why It Matters
Typography is the primary vehicle for information hierarchy in most software interfaces. When type sizes, weights, and colors follow a predictable scale, users instantly distinguish page titles from section headers from body text from metadata. A broken or inconsistent type scale forces users to rely on position alone, increasing cognitive load and causing them to miss critical information buried in same-sized text.

## Application Guidelines
- Define a type scale with no more than 5-7 distinct sizes, using a consistent ratio (1.25 or 1.333 are reliable starting points for product interfaces)
- Reserve the largest size for the single most important element on the page — typically the page title or primary data point
- Use font weight (bold, semibold, medium) as a secondary differentiator within the same size tier, not as a substitute for size differentiation
- Pair type size changes with consistent color treatment: primary content in high-contrast text, secondary content in muted tones, tertiary content (timestamps, IDs) in the lightest weight
- Maintain the same type scale across all pages in the application — inconsistency between screens erodes the user's learned hierarchy

## Anti-Patterns
- Using more than three font weights on a single screen, creating visual noise instead of hierarchy
- Making section headers and body text the same size, differentiated only by bolding — this is too subtle for scanning
- Applying ad hoc font sizes per component without reference to a shared scale, resulting in 12+ distinct sizes across the product
- Using ALL CAPS for more than one level of the hierarchy, which flattens distinction between tiers
