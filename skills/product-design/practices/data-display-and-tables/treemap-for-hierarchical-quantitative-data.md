---
title: Treemap for Hierarchical Quantitative Data
category: Data Display & Tables
tags: [data-viz, dashboard, accessibility, progressive-disclosure]
priority: niche
applies_when: "When displaying hierarchical quantitative data (e.g., budget by department by project) where area encodes quantity and containment encodes hierarchy."
---

## Principle
Use treemap visualizations to display hierarchical data where size encodes a quantitative value, enabling users to perceive part-to-whole relationships and spot outliers across nested categories simultaneously.

## Why It Matters
Hierarchical quantitative data — disk usage by folder, revenue by division by product, budget by department by project — is extremely common but poorly served by flat tables or standard bar charts. Tables bury the hierarchy in indentation levels and force serial reading. Bar charts cannot show nesting. Treemaps solve both problems by using nested rectangles where area encodes quantity and containment encodes hierarchy. A user can instantly see that "Engineering consumes 60% of the budget" and "within Engineering, the ML team accounts for half" in a single glance — insight that would require cross-referencing multiple rows in a table.

## Application Guidelines
- Use treemaps when the data has **2-3 levels of hierarchy** and a single dominant quantitative metric (file size, revenue, population, cost). Deeper hierarchies become too visually complex.
- Encode the **primary quantitative value as rectangle area** — this is the treemap's core communication channel. Users perceive area differences intuitively without reading numbers.
- Use **color to encode a secondary variable** — for example, area for revenue and color for growth rate (green for growing, red for declining), creating a two-dimensional analysis in one visualization.
- Label rectangles **directly** with the category name and value. Avoid forcing users to hover for basic identification — labels should be visible on all rectangles large enough to display text legibly.
- Provide **hover tooltips** with full detail (exact value, percentage of parent, percentage of total) for precision when the labels are truncated.
- Support **click-to-zoom** interaction: clicking a category should zoom in to show its children as a full treemap, with a breadcrumb trail to navigate back up. This makes deep hierarchies explorable without displaying all levels at once.
- Include a **legend** for the color encoding and ensure the color scale is accessible (avoid red-green only; include a luminance gradient).

## Anti-Patterns
- Using a treemap for data with no meaningful hierarchy — a flat list of categories is better served by a bar chart.
- Treemaps with 4+ hierarchy levels displayed simultaneously, creating tiny, unreadable rectangles nested inside slightly larger tiny rectangles.
- No labels on the rectangles, forcing users to hover over every element to identify what it represents.
- Using treemaps when the quantitative values are very similar across categories (e.g., all within 5% of each other), resulting in near-identical rectangle sizes that communicate nothing.
