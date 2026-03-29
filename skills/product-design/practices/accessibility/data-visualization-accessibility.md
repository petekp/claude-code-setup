---
title: Data Visualization Accessibility
category: Accessibility
tags: [data-viz, dashboard, keyboard, accessibility]
priority: situational
applies_when: "When building charts or data visualizations and you need alternative text, accessible colors, keyboard interaction, and data tables for all users."
---

## Principle
Charts, graphs, and data visualizations must be accessible to all users through alternative text descriptions, accessible color palettes, keyboard interaction, and underlying data tables.

## Why It Matters
Data visualizations are among the most information-dense elements in any application, and they are among the hardest to make accessible. A bar chart that clearly communicates a trend to a sighted user is completely opaque to a screen reader user unless the data is also available in an accessible format. Color-only encoding excludes color-blind users. Mouse-only interactions (hover for tooltips) exclude keyboard users. Making visualizations accessible is not about degrading the visual experience — it is about ensuring the insights they convey reach every user through appropriate channels.

## Application Guidelines
- Provide a text summary of each visualization's key insight (e.g., "Revenue increased 23% year-over-year, with Q3 showing the strongest growth")
- Include an accessible data table as an alternative or expandable companion to every chart — this gives screen readers structured access to the raw data
- Use a color palette that is distinguishable by users with all common forms of color vision deficiency (test with a color blindness simulator)
- Add patterns, textures, or direct labels to differentiate data series beyond color alone
- Make interactive elements within charts (data points, series toggles, zoom controls) keyboard-accessible with clear focus indicators
- Use `aria-label` or `aria-describedby` on the chart container to provide a concise description of what the chart shows
- For complex interactive dashboards, ensure that filtering, time range selection, and drill-down interactions are all keyboard-operable

## Anti-Patterns
- A chart rendered as a `<canvas>` or `<img>` with no alternative text, data table, or ARIA description — completely invisible to screen readers
- A color legend with 8 similar-hue colors that are indistinguishable for color-blind users and offer no pattern or label alternative
- Data point details only accessible via mouse hover, with no keyboard equivalent
- A dashboard with no text summary, requiring users to visually interpret every chart to understand the current state
