---
title: Comparison Mode for Time-Series Data
category: Dashboard Design
tags: [dashboard, data-viz, search, cognitive-load]
priority: situational
applies_when: "When users need to overlay or juxtapose time-series data across different periods, segments, or cohorts to identify patterns and causal relationships."
---

## Principle
Provide a dedicated comparison mode that lets users overlay or juxtapose time-series data across different periods, segments, or cohorts, enabling pattern recognition and causal analysis that single-period views cannot support.

## Why It Matters
The most common analytical question about time-series data is "how does this compare?" — this week vs. last week, this campaign vs. that campaign, North America vs. Europe. Without a comparison mode, users must mentally hold one chart in memory, navigate to another view, and try to reconcile differences in their heads. This is slow, error-prone, and discouraging. A built-in comparison mode eliminates this cognitive burden and reveals patterns — seasonality, regression, divergence — that are invisible when viewing a single series in isolation.

## Application Guidelines
- Support **period-over-period comparison** as the default mode: overlay the current period with the same period from the previous cycle (last week, last month, last year) on the same chart using distinct but harmonious line styles (solid vs. dashed, or two distinguishable colors).
- Allow users to **select custom comparison periods** — not just the immediately preceding period, but any arbitrary date range, enabling year-over-year, quarter-over-quarter, and pre/post-event analysis.
- Support **segment comparison**: overlay two or more dimensions (e.g., Product A vs. Product B, Region 1 vs. Region 2) on the same time axis.
- When overlaying, **align the x-axis by relative time** (Day 1, Day 2...) rather than absolute dates, so that a 7-day period starting on Monday can be compared to one starting on Thursday.
- Provide a **side-by-side layout option** as an alternative to overlay for cases where the scales differ significantly and overlaying would make one series appear flat.
- Show a **difference band or delta chart** below the main comparison that quantifies the gap between the two series at each point.
- Limit comparisons to **2-3 series** simultaneously. More than 3 overlapping lines become unreadable, and the comparison loses its clarity.

## Anti-Patterns
- Forcing users to open two browser tabs with different date ranges and visually compare charts side by side manually.
- Overlaying 5+ series on a single chart with similar colors, creating a tangled mess that no one can decode.
- Comparing periods with misaligned x-axes (absolute dates instead of relative days) so that weekday/weekend patterns create misleading visual differences.
- Providing comparison with no way to see the actual delta or percentage difference, forcing users to eyeball the gap between lines.
