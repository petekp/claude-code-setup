---
title: Design for Scanning — Leverage F-Pattern and Layer-Cake Patterns
category: Layout & Visual Hierarchy
tags: [layout, text, table, scanning]
priority: core
applies_when: "When designing any content-heavy page and you need to place key information along natural scan paths (F-pattern, layer-cake) so users find it without reading linearly."
---

## Principle
Users scan interfaces in predictable patterns — primarily the F-pattern for text-heavy pages and the layer-cake pattern for structured content — and layouts should be designed to place key information along these natural scan paths.

## Why It Matters
Eye-tracking studies consistently show that users do not read web pages linearly. On text-heavy pages, gaze follows an F-shape: a horizontal scan across the top, a shorter horizontal scan partway down, then a vertical scan along the left edge. On pages with clear section headings, users employ a "layer-cake" pattern, reading each heading and selectively diving into the content beneath relevant ones. Designs that align with these patterns ensure critical information falls where eyes naturally land. Designs that fight these patterns bury important content in zones users skip.

## Application Guidelines
- Place the most important content and navigation in the left column and top region of the page, where the F-pattern begins
- Use clear, descriptive section headings that form a scannable "layer cake" — a user reading only the headings should understand the page's structure
- Front-load headings and paragraph text with the most important words (avoid starting with "The" or "This" or generic verbs)
- Break long text blocks into short paragraphs (2-4 sentences) with frequent subheadings to create more horizontal scan entry points
- For data-heavy interfaces, place the most-queried column on the far left of tables and use row-level visual differentiation (alternating backgrounds or subtle dividers)

## Anti-Patterns
- Centering all text on a page, which eliminates the strong left-edge anchor that the F-pattern depends on
- Using vague section headings ("Details," "Information," "More") that provide no scanning value and force users to read the body text
- Placing critical information or actions in the right column or lower-right corner — the area eye-tracking studies consistently show receives the least attention
- Creating long, unbroken walls of text without subheadings, forcing linear reading instead of enabling scanning
