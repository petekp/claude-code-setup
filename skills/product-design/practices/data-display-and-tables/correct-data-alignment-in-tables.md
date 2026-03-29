---
title: Correct Data Alignment in Tables
category: Data Display & Tables
tags: [table, text, layout, scanning]
priority: core
applies_when: "When formatting table cells and deciding on text alignment per data type to enable fast scanning and accurate magnitude comparison."
---

## Principle
Align table cell content based on data type — right-align numbers, left-align text, and center short categorical values — so the eye can scan columns quickly and compare values accurately.

## Why It Matters
Correct alignment is not a cosmetic preference; it is a cognitive tool. Right-aligned numbers create a visual "decimal point column" that lets users instantly compare magnitudes without reading each digit. Left-aligned text creates a consistent starting point for reading strings of varying length. When alignment is wrong — numbers left-aligned, text centered, or alignment inconsistent within a column — users must work harder to parse every cell individually, slowing down the scanning and comparison that tables are designed to support.

## Application Guidelines
- **Right-align all numeric values** — currency, counts, percentages, measurements. This aligns the decimal points (or the ones digit for integers) vertically, enabling instant magnitude comparison.
- **Left-align all text values** — names, descriptions, categories, identifiers. Left alignment provides a consistent left edge for reading.
- **Center short categorical values** (e.g., status badges, boolean flags, icons) when they are visually discrete and short enough that centering does not create ragged edges.
- **Right-align column headers** for numeric columns so the header aligns with the data beneath it. Left-align headers for text columns.
- Use **consistent decimal precision** within a column. Mixing "$1,200.00" and "$340.5" in the same column creates a jagged right edge that defeats the purpose of right-alignment.
- Use **monospace or tabular-figure fonts** for numeric columns so that digits have uniform width and columns remain aligned regardless of which digits appear (e.g., "1" and "8" take the same width).
- **Align units consistently** — if some values have units (e.g., "42 ms") and others do not, extract units to the column header ("Latency (ms)") so all cell values are bare numbers that align cleanly.

## Anti-Patterns
- Left-aligning a column of dollar amounts, creating a ragged right edge that makes it hard to compare $1,200,000 and $800 at a glance.
- Centering all columns regardless of data type, which makes both text and numbers harder to scan.
- Mixing alignment within a single column — some cells left-aligned, others centered — creating visual chaos.
- Using proportional fonts for numeric columns where "1,111" is narrower than "8,888," causing misalignment even with correct right-alignment.
