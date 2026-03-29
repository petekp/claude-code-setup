---
title: Dashboard Hover Tooltips for Contextual Detail on Demand
category: Dashboard Design
tags: [dashboard, tooltip, data-viz, progressive-disclosure]
priority: situational
applies_when: "When displaying charts, sparklines, or KPI cards on a dashboard and users need to inspect exact values without cluttering the default view."
---

## Principle
Use hover tooltips to provide precise values, metadata, and context on demand without cluttering the default dashboard view — following Shneiderman's mantra of "overview first, zoom and filter, then details on demand."

## Why It Matters
Dashboards must balance two competing needs: a clean visual overview for pattern recognition, and precise data for verification and decision-making. Permanently displaying exact values on every data point overwhelms the visual field and destroys the gestalt of charts and sparklines. Tooltips resolve this tension by keeping the overview pristine while making detail instantly accessible through a natural, low-cost interaction. Users who spot an anomaly in a chart need to verify the exact value and timestamp — tooltips provide this without a click, a page transition, or any loss of context.

## Application Guidelines
- Show tooltips on hover over any interactive data element: chart data points, bars, pie segments, sparklines, KPI cards, and table cells with truncated content.
- Include in the tooltip: the **exact value**, the **label/dimension**, the **time period**, and where relevant, the **comparison value** (e.g., "+12% vs. previous period").
- Position tooltips to avoid occluding the data point the user is inspecting. Place them above or to the side, and flip orientation dynamically near screen edges.
- Keep tooltip content concise — typically 2-4 lines. If more detail is needed, use the tooltip to offer a "Click for details" affordance that opens a detail panel or drill-down.
- Ensure tooltips appear within **100-200ms** of hover to feel instantaneous, but add a small delay (200-300ms) before showing to prevent tooltip flicker during casual mouse movement across a dense chart.
- On touch devices where hover is unavailable, use tap-to-reveal with a clear dismiss mechanism. Do not simply omit the detail layer on mobile.
- Format numbers in tooltips with proper grouping separators, units, and appropriate precision — a tooltip showing "1984532.847293" is worse than no tooltip at all.

## Anti-Patterns
- Permanently labeling every data point on a line chart with its value, creating a wall of overlapping numbers that obscures the trend line.
- Tooltips that show only the raw value with no label or context (e.g., "42" with no indication of what 42 represents or what units it uses).
- Tooltips with a multi-second delay that make users wait and wonder if the element is interactive.
- Tooltips that occlude the data point being inspected, forcing the user to move the mouse away to see the underlying chart, which dismisses the tooltip.
