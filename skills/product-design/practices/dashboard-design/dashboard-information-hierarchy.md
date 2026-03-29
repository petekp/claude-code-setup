---
title: Dashboard Information Hierarchy
category: Dashboard Design
tags: [dashboard, layout, card, progressive-disclosure, scanning]
priority: core
applies_when: "When structuring a dashboard's vertical layout to serve both executives who need a quick health check and analysts who need to drill into detail."
---

## Principle
Structure dashboard content in a clear three-tier hierarchy — summary KPIs at the top, supporting visualizations in the middle, and granular detail at the bottom — so users can get the answer at the altitude they need without wading through irrelevant depth.

## Why It Matters
Users approach dashboards with different urgency levels: an executive glancing during a meeting needs a 3-second "are we healthy?" answer, while an analyst investigating a dip needs to drill into segment-level data. A flat layout that treats all information equally forces every user to do unnecessary work. A well-layered hierarchy lets the executive stop at the top row and the analyst scroll deeper, serving both from the same screen without compromising either experience.

## Application Guidelines
- **Level 1 (top):** 3-6 headline KPIs displayed as large numbers with trend indicators and comparison context. This row should answer "How are we doing overall?" in under 5 seconds.
- **Level 2 (middle):** Charts, graphs, and visualizations that explain the "why" behind the KPIs. Use 2-4 panels per row maximum. Each visualization should have a clear title stating the question it answers.
- **Level 3 (bottom):** Data tables, logs, or detailed breakdowns that support investigation. This level is for users who need to verify, export, or drill into specifics.
- Use **progressive disclosure** between levels: Level 1 is always visible above the fold, Levels 2 and 3 are accessible via scrolling or expanding sections but do not compete with the summary.
- Use consistent **visual treatment** to reinforce hierarchy: Level 1 elements are largest and highest-contrast, Level 2 uses medium sizing, Level 3 uses compact/dense display.
- Group related metrics across levels vertically. If a KPI card shows "Revenue: $2.4M," the chart directly below it should show the revenue trend, and the table below that should show revenue by segment.

## Anti-Patterns
- Placing a data table as the first thing users see on a dashboard, forcing them to scan rows to derive a summary they should have been given directly.
- Mixing summary KPIs and granular detail in the same visual band, creating a confusing jumble where large numbers sit next to dense tables.
- Having no clear entry point — every element is the same size, weight, and prominence, so users do not know where to look first.
- Requiring clicks to reach the summary (e.g., hiding KPIs behind a "Summary" tab) when it should be the default view.
