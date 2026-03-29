---
title: Delta Indicators and Contextual Comparisons
category: Dashboard Design
tags: [dashboard, card, data-viz, cognitive-load]
priority: situational
applies_when: "When displaying KPI values on a dashboard and users need to immediately judge whether a number is good, bad, or trending in the right direction."
---

## Principle
Always pair raw metric values with a comparison — period-over-period change, goal progress, or benchmark delta — so users can immediately judge whether a number is good, bad, or neutral without mental arithmetic.

## Why It Matters
A number without context is meaningless. "Revenue: $2.4M" tells you nothing unless you know whether that is up or down, ahead or behind plan, better or worse than the industry benchmark. Users should never have to remember last month's number and subtract in their heads. Delta indicators transform raw data into actionable insight by embedding the comparison directly into the display, reducing cognitive load and enabling faster, more accurate decisions.

## Application Guidelines
- Show **period-over-period deltas** (e.g., "+12.3% vs. last month") next to every headline KPI. Use both the absolute change and the percentage change when space permits, as different users think in different units.
- Use **directional arrows or icons** (up, down, flat) combined with **semantic color** (green for favorable, red for unfavorable, gray for neutral). Always define "favorable" in context — for error rates, down is green; for revenue, up is green.
- Include a **comparison label** that specifies the baseline: "vs. last week," "vs. same period last year," "vs. target." Never show a delta without naming what it is relative to.
- Support **toggling the comparison period** — let users switch between week-over-week, month-over-month, and year-over-year to see different trend perspectives.
- For goal-based metrics, show a **progress bar or gauge** alongside the delta to visualize how close the metric is to its target.
- When a delta is statistically insignificant or within normal variance, use a **muted treatment** (gray, no arrow) rather than green or red, to prevent false alarms on noise.
- Apply consistent delta formatting across the entire dashboard — same arrow style, same color semantics, same placement relative to the value.

## Anti-Patterns
- Showing raw values with no comparison, forcing users to remember previous values or open a separate report to assess performance.
- Using green for "up" universally, even for metrics where increases are bad (e.g., error rate, churn rate, cost overruns).
- Displaying deltas with excessive precision ("+12.34567%") that implies false accuracy and clutters the display.
- Showing a delta with no label, so users cannot tell if "+5%" means versus yesterday, last quarter, or a target.
