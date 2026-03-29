---
title: "Selective Enclosure to Create Dashboard Hierarchy"
category: Gestalt Principles
tags: [dashboard, card, layout, gestalt]
priority: niche
applies_when: "When designing a dashboard and you need to use selective card enclosures to signal which widget clusters are semantically related."
---

## Principle
Enclosing specific dashboard regions with visible boundaries (cards, borders, background fills) groups their contents and signals a higher level of importance or cohesion relative to unenclosed content.

## Why It Matters
Dashboards pack dense information into limited space. When every widget has the same card treatment, enclosure loses its grouping power and the layout becomes a uniform grid of boxes. Selective enclosure -- applying boundaries only where grouping is meaningful -- creates a visual hierarchy that tells users which clusters of data belong together and which stand alone.

## Application Guidelines
- Reserve card enclosures for widgets that form a logical group (e.g., three KPI metrics that together tell a story) and leave standalone widgets unenclosed
- Use a shared background fill behind a cluster of related widgets to create an enclosure at a higher level than individual cards
- Vary enclosure weight: use heavier borders or stronger background contrast for primary groups and lighter treatment for secondary groupings
- Combine enclosure with a group label or header to reinforce the semantic meaning of the bounded region

## Anti-Patterns
- Wrapping every single widget in an identically styled card, which neutralizes enclosure as a grouping signal
- Using enclosure without any content relationship, where visually grouped items are not actually related
- Nesting too many levels of enclosure (card inside card inside section) creating visual clutter and confusing depth
