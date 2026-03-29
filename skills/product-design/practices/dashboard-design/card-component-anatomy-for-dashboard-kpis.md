---
title: Card Component Anatomy for Dashboard KPIs
category: Dashboard Design
tags: [card, dashboard, data-viz, consistency]
priority: situational
applies_when: "When designing KPI card components for a dashboard and establishing a consistent internal layout for label, value, trend indicator, and sparkline."
---

## Principle
Design KPI cards with a consistent internal anatomy — label, value, trend indicator, sparkline, and action affordance — so users can scan multiple cards quickly by relying on spatial consistency rather than reading each card from scratch.

## Why It Matters
When every KPI card has a different internal layout — one puts the value on top, another buries it under a chart, a third uses a completely different visual language — users must re-orient themselves for each card, breaking the rapid scanning that makes dashboards valuable. A consistent card anatomy creates a learnable pattern: once users know where to look for the value, the trend, and the label on one card, they can extract the same information from every card in milliseconds. This is the typographic grid principle applied to data display.

## Application Guidelines
- Establish a **fixed internal layout** for all KPI cards: metric label at top, primary value large and centered or left-aligned, trend indicator (delta + arrow) directly below or beside the value, and an optional sparkline or micro-chart at the bottom.
- The **primary value** should be the largest text element in the card — at least 2x the font size of the label. Users should be able to read the value from arm's length.
- **Trend indicators** should combine a directional icon (arrow up/down/flat), a numeric delta ("+12%" or "-$340"), and semantic color. Never use color alone.
- Include an **optional sparkline** (last 7-30 data points) within the card to show trajectory without requiring the user to navigate to a full chart.
- Add a **subtle hover state** and make the entire card clickable to navigate to a detail view. Indicate interactivity with a cursor change and slight elevation/shadow on hover.
- Maintain **consistent card dimensions** across the row. Use a responsive grid that adjusts card width uniformly rather than letting individual cards grow to fit content.
- Reserve a small corner area for a **status dot or icon** when the metric has alert thresholds (e.g., a red dot when the error rate exceeds 5%).

## Anti-Patterns
- Each KPI card using a different layout, font size, or information order, forcing users to decode every card individually.
- Making the label the largest element and the value small — inverting the visual hierarchy so users see "Monthly Revenue" in 24px but "$2.4M" in 12px.
- Cards with no trend context — just a number floating in a box with no indication of direction, comparison, or whether the value is good or bad.
- Oversized cards that waste space with decorative backgrounds or illustrations, reducing the number of KPIs visible without scrolling.
