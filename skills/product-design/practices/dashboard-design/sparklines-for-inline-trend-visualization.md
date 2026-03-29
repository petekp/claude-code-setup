---
title: Sparklines for Inline Trend Visualization
category: Dashboard Design
tags: [dashboard, data-viz, card, data-density]
priority: situational
applies_when: "When embedding compact trend indicators alongside metric values in KPI cards, table cells, or metric bars to show trajectory without a full chart."
---

## Principle
Use sparklines — small, word-sized graphics without axes or labels — to embed trend context directly alongside numeric values, enabling users to see both the current state and its trajectory in a single glance.

## Why It Matters
A metric value tells you where you are; a sparkline tells you where you have been and where you are heading. Sparklines invented by Edward Tufte are the most information-dense visualization possible — they convey trend direction, volatility, seasonality, and anomalies in a space no larger than a line of text. Embedding them in KPI cards, table cells, and metric bars gives users trend awareness without requiring them to navigate to a full chart, dramatically reducing the number of clicks and context switches needed to assess dashboard health.

## Application Guidelines
- Size sparklines to be **roughly the height of adjacent text** (16-24px tall, 60-120px wide). They should feel like a natural part of the data display, not a separate chart demanding attention.
- Show the **last 7-30 data points** depending on the metric's natural cadence. Daily metrics show 30 days; hourly metrics show 24 hours.
- Optionally highlight the **start point, end point, minimum, and maximum** with small dots to give the sparkline anchoring context. The end point is the most important — it represents "now."
- Use **consistent color** for sparklines across the dashboard (typically a neutral mid-tone), reserving color shifts only when the trend crosses a threshold (e.g., turning red when a downward trend breaches a warning level).
- Do not add **axes, labels, gridlines, or legends** to sparklines. These elements defeat the purpose of a compact inline visualization. If the user needs that detail, they should click through to a full chart.
- Ensure sparklines use the **same scale** when displayed side by side for comparison. Two sparklines with different y-axis ranges placed next to each other create misleading visual comparisons.
- Place sparklines **consistently** — either always below the metric value or always to the right — so users learn where to look.

## Anti-Patterns
- Adding full axes, labels, and legends to a sparkline, turning it into a tiny, unreadable chart instead of an inline trend indicator.
- Using sparklines with only 2-3 data points, which show a meaningless straight line rather than a trend.
- Making sparklines too large (50+ px tall) so they dominate the card and compete with the metric value for attention.
- Displaying sparklines with mismatched scales in the same row, making one metric appear volatile and another flat purely due to axis differences.
