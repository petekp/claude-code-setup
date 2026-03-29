---
title: "Color Coding for Scanning: Use Hue to Encode Status and Category"
category: Reading Psychology
tags: [dashboard, table, accessibility, scanning]
priority: situational
applies_when: "When designing a color vocabulary for status indicators, severity levels, or category tags where consistent hue encoding enables pre-attentive scanning."
---

## Principle
Use a consistent color vocabulary where specific hues reliably encode specific meanings — status, category, severity, or type — so users can scan visually without reading labels.

## Why It Matters
Color is processed pre-attentively: the brain registers hue differences in under 200 milliseconds, before conscious reading begins. A well-designed color system lets users scan a dense dashboard or list and instantly identify which items need attention (red), which are healthy (green), and which are pending (yellow/amber). This is orders of magnitude faster than reading status text on each item. However, color coding only works when the mapping is consistent and learned — arbitrary or shifting color meanings create confusion rather than clarity.

## Application Guidelines
- Establish a fixed color vocabulary for your product and document it: red = error/critical, amber = warning/pending, green = success/healthy, blue = informational/neutral
- Never use more than 5-7 distinct hues in a single color coding system; beyond that, users cannot reliably distinguish or remember the mappings
- Always pair color with a secondary indicator (icon, label, pattern) so colorblind users receive the same information
- Use saturation and brightness variations within a hue to encode severity levels (light red = low risk, saturated red = critical)
- Maintain the same color meanings globally across the entire product; do not let red mean "error" on one page and "premium feature" on another

## Anti-Patterns
- Using color decoratively without semantic meaning — applying random hues to categories or tags that carry no consistent mapping, training users that color is noise rather than signal
