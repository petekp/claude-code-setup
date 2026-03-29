---
title: "Element Connectedness Anti-Pattern: Line Charts for Categorical Data"
category: Gestalt Principles
tags: [data-viz, dashboard, gestalt]
priority: niche
applies_when: "When choosing a chart type and you need to verify that connecting lines are only used for continuous or ordinal data, not categorical data."
---

## Principle
Lines connecting data points imply Element Connectedness — a continuous relationship between values — and must never be used for categorical or nominal data where no such continuity exists.

## Why It Matters
When a line connects discrete, unordered categories (e.g., product names, departments, or countries), users perceive a trend or trajectory that does not exist. This is not a minor aesthetic issue; it actively misinforms decision-making by implying that the "space between" data points is meaningful when it is not.

## Application Guidelines
- Use bar charts, dot plots, or other discrete visual encodings for categorical data so each value stands on its own without implying connectedness
- Reserve line charts exclusively for continuous or ordinal data (time series, sequential measurements) where interpolation between points is meaningful
- If you must show categorical comparisons alongside a time-series trend, use a dual encoding (bars for categories, line for the trend) rather than putting categories on a line
- When reviewing dashboards, audit every line chart and ask: "Does the x-axis represent a continuous or ordered dimension?" If not, replace the line with a discrete encoding

## Anti-Patterns
- Plotting survey responses by department on a line chart, implying Department A "leads to" Department B
- Connecting monthly NPS scores with a line when the months are filtered non-consecutively (e.g., Jan, Mar, Jul), implying continuity across gaps
- Using sparklines for categorical ranking data where the order of categories is arbitrary
