---
title: Faceted Search — Show Filters and Results Simultaneously
category: Search, Filter & Sort
tags: [search, sidebar, layout, data-density, feedback-loop]
priority: situational
applies_when: "When building a faceted search interface and ensuring filters are visible alongside results with real-time count updates as filters are applied."
---

## Principle
Display faceted filters alongside search results in a persistent side panel, updating result counts in real time as filters are applied, so users can iteratively narrow results without losing sight of either the controls or the output.

## Why It Matters
Faceted search is the gold standard for navigating large, multi-attribute datasets because it shows users what is available before they commit to a filter. The result count next to each facet value ("Size: Large (42), Medium (103), Small (28)") lets users predict the outcome of their filter choice, preventing dead ends. Showing filters and results simultaneously enables a rapid iterative cycle: apply a filter, see the results change, decide if more refinement is needed, apply another filter — all without page transitions, modal dialogs, or losing visual context.

## Application Guidelines
- Display facets in a **persistent sidebar panel** (typically left side, 200-280px wide) with the results occupying the remaining space to the right. Never hide facets behind a modal or drawer that obscures results.
- Show **result counts** next to each facet value, updating dynamically as other filters are applied. If selecting "Color: Blue" would return 0 results given the current filters, either show "(0)" or disable that option.
- Order facet values by **result count descending** (most results first) or by a logical domain order (S, M, L, XL for sizes). Never use random or alphabetical order when count-based ordering is more useful.
- Support **multi-select within a facet** (show me Red OR Blue) with OR logic, and **cross-facet filtering** with AND logic (Color is Red AND Size is Large). This is the standard e-commerce faceted search behavior.
- Display **applied filters as removable badges** above the results, mirroring the active state of the sidebar checkboxes for clarity.
- Include a **search or type-ahead within long facet lists** (e.g., a Brand facet with 200 values) so users can find specific values without scrolling.
- Allow facet sections to be **collapsed** to save space while still showing a count of active filters in that section: "Color (2 selected)."

## Anti-Patterns
- A filter panel that opens as a modal dialog, covering the results and forcing users to apply filters blindly without seeing the effect.
- Facets with no result counts, giving users no way to predict whether a filter will return 500 results or zero.
- A full-page reload every time a facet value is selected, breaking the rapid iterative filtering flow.
- Facet values that show counts based on the unfiltered dataset, not updating as other filters are applied, providing misleading predictions.
