---
title: "Proximity: Group Related Elements with Consistent Spatial Density"
category: Gestalt Principles
tags: [layout, form, data-density, gestalt]
priority: core
applies_when: "When defining the spacing system for any layout and you need consistent spacing tiers that create unambiguous visual groupings."
---

## Principle
Related elements must be placed closer to each other than to unrelated elements, using consistent and deliberate spacing ratios to create an unambiguous visual hierarchy of groupings.

## Why It Matters
Proximity is the first grouping principle the brain applies — even before color, shape, or size are processed. Inconsistent spacing destroys the user's ability to quickly parse a layout into meaningful clusters. When spacing is deliberate and rhythmic, users scan interfaces faster, make fewer errors, and experience less fatigue in data-heavy applications.

## Application Guidelines
- Define at least three spacing tiers in your design system: tight (within a group), medium (between sub-groups), and wide (between major sections), with each tier at least 2x the previous
- Apply the same spacing tier consistently for the same level of relationship throughout the application — do not use 8px between fields in one form and 16px in another
- When elements must be grouped but cannot be placed close together (e.g., in a wide layout), reinforce the Proximity relationship with a secondary cue like Common Region or connecting lines
- Audit layouts by squinting or blurring the screen — if the intended groups do not emerge as distinct clusters, the spacing ratios need adjustment

## Anti-Patterns
- Using a single spacing value (e.g., 16px) everywhere, making all relationships feel equidistant and ungrouped
- Relying on borders or headings to create groups while spacing is uniform, which creates conflicting grouping signals
- Allowing auto-layout or CSS defaults to determine spacing without explicitly setting values that reflect the intended information architecture
