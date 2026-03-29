---
title: Never Rely on Color Alone to Convey Information
category: Accessibility
tags: [form, data-viz, icon, accessibility]
priority: core
applies_when: "When any information is communicated through color and you need a redundant channel (text, icon, pattern) so meaning is preserved for all users."
---

## Principle
Every piece of information communicated through color must also be communicated through a redundant channel — text, iconography, pattern, or position — so that meaning is preserved for users who cannot perceive color.

## Why It Matters
Approximately 8% of men and 0.5% of women have some form of color vision deficiency. Beyond color blindness, color perception is affected by screen calibration, ambient lighting, low-quality displays, and cognitive load. If the only way to distinguish an error state from a success state is red versus green, a significant portion of users will miss the distinction entirely. WCAG 1.4.1 (Use of Color) explicitly requires that color is never the sole means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

## Application Guidelines
- For form validation, combine color with an icon (checkmark for success, X or exclamation for error) and a text message explaining the issue
- In data visualizations, use patterns (hatching, dots, dashes), shapes, or direct labels in addition to color differentiation
- For status indicators (active, pending, error, disabled), always include a text label alongside the colored badge or dot
- Ensure links within body text are distinguishable from non-link text by more than just color — add an underline or other non-color treatment
- In charts and graphs, do not rely on a color legend alone — use direct labels or patterns to identify data series
- When using red/green for positive/negative values, add a directional indicator (up/down arrow, +/- prefix) as a redundant signal
- Test your interface in grayscale to verify all information is still distinguishable

## Anti-Patterns
- Form fields that only turn red on error with no icon, label, or message text — a color-blind user sees no change
- A pie chart where the only way to identify slices is by matching colors to a legend, with no labels or patterns
- A status column in a table that uses only colored dots (green, yellow, red) with no text labels
- An "available" / "unavailable" indicator that uses green and red dots, which are the two most commonly confused colors
