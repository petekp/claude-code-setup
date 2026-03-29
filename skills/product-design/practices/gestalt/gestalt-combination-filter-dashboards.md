---
title: "Gestalt Combination: Similarity + Common Fate for Filter-Driven Dashboards"
category: Gestalt Principles
tags: [dashboard, search, animation, gestalt]
priority: niche
applies_when: "When building a filter-driven dashboard with many widgets and you need to visually communicate which widgets are affected by a filter action."
---

## Principle
When dashboard widgets share visual styling (similarity) and respond to the same filter action simultaneously (common fate), users perceive them as a coordinated group governed by that filter.

## Why It Matters
Complex dashboards often contain dozens of widgets, only some of which are affected by a given filter. Without clear signals, users cannot tell which charts updated after applying a filter. Combining similarity (shared border style, color accent, or header treatment) with common fate (synchronized animation or data refresh) makes the filter's scope immediately obvious.

## Application Guidelines
- Give all widgets controlled by the same filter a shared visual marker -- a consistent accent color, a shared header style, or a grouped container
- When a filter is applied, animate all affected widgets simultaneously (e.g., a brief fade-and-refresh) so their common fate is visible
- Dim or visually separate widgets that are unaffected by the active filter to reinforce which group responded
- Label filter scope explicitly (e.g., "Applies to: Revenue, Churn, MRR") alongside the visual grouping for redundancy

## Anti-Patterns
- Applying a filter that silently updates some widgets while others remain static, with no visual indication of which changed
- Styling filter-linked widgets identically to independent widgets so users cannot distinguish the groups
- Refreshing widgets at different speeds or with inconsistent animations after a single filter action, breaking the common fate signal
