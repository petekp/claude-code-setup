---
title: Metrics Bar — KPI Highlight Row
category: Dashboard Design
tags: [dashboard, card, layout, scanning]
priority: situational
applies_when: "When designing the topmost section of a dashboard to provide an at-a-glance health check with 3-6 headline KPIs."
---

## Principle
Dedicate the topmost horizontal strip of every dashboard to a metrics bar — a row of 3-6 headline KPIs — that gives users an instant health check before they engage with any detail below.

## Why It Matters
The metrics bar is the dashboard's headline. Just as a newspaper headline lets readers decide in seconds whether to read further, a KPI row lets users assess overall status at a glance. Without it, users must scan charts and tables to piece together a summary, which is slow and error-prone. A well-designed metrics bar answers "Do I need to pay attention right now?" in under 3 seconds, saving time for users who check the dashboard repeatedly throughout the day and providing an anchor for those who need to investigate further.

## Application Guidelines
- Display **3-6 KPIs** maximum. More than 6 dilutes attention and forces the bar to wrap or shrink type below readable sizes.
- Each KPI should show: the **metric name**, the **current value** (prominently sized), and a **trend or comparison indicator** (e.g., +5.2% vs. last period, with directional arrow and semantic color).
- Use **consistent card sizing** across the row. Uneven card widths create visual noise and imply importance differences that may not exist.
- Place the single most important KPI **first (leftmost)** in LTR layouts, matching natural reading order and F-pattern scanning.
- Make the metrics bar **sticky** so it remains visible as the user scrolls through the rest of the dashboard, providing persistent context.
- Ensure each KPI in the bar is **clickable or tappable**, linking to the relevant detail section below or to a drill-down view.
- Use **semantic colors** for trend indicators: green for favorable movement, red for unfavorable, and neutral gray for negligible change. Always pair color with an icon or arrow for accessibility.

## Anti-Patterns
- Cramming 12+ KPIs into the metrics bar, turning a scannable summary into a wall of tiny numbers that requires careful reading.
- Showing raw values without trend context (e.g., "Revenue: $2.4M" with no indication of whether that is good, bad, up, or down).
- Using a metrics bar that scrolls horizontally, hiding KPIs off-screen and breaking the "glance and know" purpose.
- Placing decorative elements (logos, illustrations, welcome messages) in the top row instead of data, pushing KPIs below the fold.
