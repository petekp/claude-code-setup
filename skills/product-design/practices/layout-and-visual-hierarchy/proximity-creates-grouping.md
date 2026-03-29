---
title: Proximity Creates Grouping — Gestalt Principle
category: Layout & Visual Hierarchy
tags: [layout, form, button, gestalt]
priority: core
applies_when: "When placing any label, control, or action near other elements and you need spatial closeness to communicate which elements belong together."
---

## Principle
Elements placed near each other are perceived as belonging to the same functional group, regardless of their visual similarity.

## Why It Matters
Users do not read interfaces — they parse spatial relationships. When related controls, labels, and data are physically close, users build accurate mental models of how the interface is organized without conscious effort. When proximity is mismanaged, users misattribute labels to the wrong fields, overlook related actions, or waste time scanning for information that should have been co-located.

## Application Guidelines
- Place labels immediately adjacent to their associated inputs — above or to the left, never equidistant between two fields
- Use whitespace as a structural element: increase spacing between groups more than spacing within groups (minimum 2:1 ratio between inter-group and intra-group spacing)
- Group related form fields into visible sections rather than presenting them as a flat list
- Ensure action buttons sit visually within the group they affect — a "Delete" button should be proximate to the item it deletes, not floating in a toolbar 200 pixels away
- When displaying metadata (timestamps, authors, statuses), cluster them with the object they describe

## Anti-Patterns
- Placing a field label equidistant between two inputs, forcing users to guess which field it belongs to
- Using uniform spacing between all elements on a page, destroying the implicit grouping that proximity provides
- Separating a "Save" button from the form it submits by placing it in a fixed footer far from the last field
- Presenting related settings across multiple tabs or pages when they could coexist in a single spatial group
