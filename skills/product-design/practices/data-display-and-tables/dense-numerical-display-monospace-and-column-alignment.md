---
title: Dense Numerical Display — Monospace and Column Alignment
category: Data Display & Tables
tags: [table, text, data-density, scanning]
priority: situational
applies_when: "When displaying columns of numerical data that need tabular-figure fonts, consistent decimal precision, and right-alignment for instant magnitude comparison."
---

## Principle
Display numerical data using tabular-figure (monospace-width digit) fonts with consistent decimal precision and right-alignment so columns of numbers form a clean visual grid that enables instant magnitude comparison.

## Why It Matters
In proportional fonts, the digit "1" is narrower than "8," which means "$1,111" is visually narrower than "$8,888" even though they differ by just 4 digits. In a column of numbers, this creates a ragged, misaligned display where the decimal points and digit positions do not line up. Users comparing values must read each number individually because they cannot rely on spatial position to infer magnitude. Tabular figures and consistent formatting solve this by making every digit the same width, turning a column of numbers into a visually aligned grid where larger values are instantly distinguishable from smaller ones by their position relative to the column.

## Application Guidelines
- Use a font that supports **tabular figures** (`font-variant-numeric: tabular-nums` in CSS) for all numeric table columns. Most professional typefaces include tabular figure variants; if not, use a monospace font for numeric columns.
- Apply **consistent decimal precision** within each column. If one value shows two decimal places ("$1,234.56"), all values in the column should show two decimal places ("$800.00"), not a mix of "$800" and "$1,234.56."
- Use **thousands separators** (commas in US locale, periods or spaces in others) for values above 999 to improve readability of large numbers.
- **Right-align** all numeric columns so the ones digit (and decimal point, if present) lines up vertically across rows.
- Abbreviate large numbers consistently when space is constrained: use "1.2M" or "$34.5K" with the abbreviation applied uniformly across the column, not mixing "$1,200,000" with "$34.5K."
- Place **units in the column header**, not in every cell. "Revenue ($)" in the header is cleaner than "$1,234," "$5,678," "$9,012" repeated in every cell.
- When displaying percentages, keep precision consistent and include the "%" symbol in every cell (or in the header only if all cells in the column are percentages).

## Anti-Patterns
- Using a proportional font for numeric columns where "1" and "8" have different widths, creating misaligned columns.
- Mixing decimal precision within a column: "99.5%," "100%," "33.333%" in the same column.
- Left-aligning numeric columns so that "$12" and "$12,000,000" start at the same left edge, making magnitude comparison purely a reading exercise.
- Inconsistent number formatting: some values with separators ("1,234"), others without ("1234"), some abbreviated ("1.2K"), others not ("1,200").
