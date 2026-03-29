---
title: "Common Fate in Animated Data Visualization"
category: Gestalt Principles
tags: [data-viz, animation, real-time, gestalt]
priority: niche
applies_when: "When animating live data visualizations and you need synchronized motion to group related data points while preventing false groupings."
---

## Principle
Elements that move together in the same direction and at the same speed are perceived as a unified group, making synchronized animation a powerful tool for showing data relationships in motion.

## Why It Matters
Animated data visualizations (live dashboards, streaming charts, real-time maps) introduce temporal grouping that static charts cannot. When data points move in concert, users instantly perceive them as related -- a stock sector rising together, a fleet of vehicles heading the same direction. Without intentional animation design, simultaneous but unrelated movements create false groupings that mislead interpretation.

## Application Guidelines
- Synchronize transition timing and easing for data elements that represent the same group or category when animating chart updates
- Use consistent movement direction and velocity for related data points in animated scatterplots, map markers, or flow diagrams
- Stagger animations for unrelated groups so they do not accidentally appear to share common fate
- Provide a pause or scrub control so users can freeze the animation and examine groupings at specific moments

## Anti-Patterns
- Animating all chart elements with the same timing regardless of grouping, making everything appear as a single undifferentiated mass
- Using random or inconsistent easing functions across related data points, breaking the common-fate perception
- Allowing real-time data updates to produce incidental common-fate illusions between unrelated data series
