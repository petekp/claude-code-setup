---
title: Common Region for Dashboard KPI Containers
category: Gestalt Principles
tags: [dashboard, card, layout, gestalt]
priority: situational
applies_when: "When designing KPI cards on a dashboard and you need each metric to read as a distinct, self-contained unit."
---

## Principle
Each KPI on a dashboard should be enclosed in its own visually distinct Common Region container so users instantly perceive each metric as a discrete, self-contained unit.

## Why It Matters
Dashboards pack dense information into a single view. Without clear enclosure, labels, values, sparklines, and trend indicators blur together into a wall of numbers. Common Region provides an immediate parsing framework — the eye groups everything inside a boundary as one unit, enabling rapid scanning and comparison across KPIs.

## Application Guidelines
- Enclose each KPI in a card with a consistent border, background fill, or subtle shadow that clearly separates it from adjacent KPIs and the dashboard background
- Maintain uniform card dimensions across a row so Similarity reinforces the Common Region grouping — every KPI looks like a peer
- Inside each card, use Proximity to sub-group the metric label, primary value, and trend indicator so the internal hierarchy is clear within the enclosure
- When a KPI card is interactive (clickable to drill down), ensure the entire Common Region is the click target, reinforcing that everything inside is one object

## Anti-Patterns
- Displaying KPIs as floating text on a flat background with only whitespace as separation, which is fragile and breaks at different densities
- Using cards with such heavy borders or shadows that the containers themselves become visual noise competing with the data
- Nesting additional card-like containers inside KPI cards, creating ambiguous enclosure boundaries that confuse rather than clarify
