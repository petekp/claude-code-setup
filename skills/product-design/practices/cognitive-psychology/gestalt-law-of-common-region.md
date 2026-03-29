---
title: Gestalt — Law of Common Region for Visual Grouping
category: Cognitive Psychology
tags: [card, form, dashboard, gestalt]
priority: situational
applies_when: "When grouping related content into cards, sections, or bounded containers to communicate that elements belong together."
---

## Principle
Elements enclosed within a shared visual boundary — a box, a card, a background color — are perceived as a single group, regardless of their individual differences.

## Why It Matters
Common region is one of the strongest Gestalt grouping principles and overrides similarity, proximity, and even connectedness in perceptual strength. In interface design, it is the primary tool for communicating "these things belong together." When common region is used well, users instantly understand informational relationships without reading labels. When it's missing or misapplied, users misattribute relationships — associating a button with the wrong section or a label with the wrong input.

## Application Guidelines
- Use cards to group related content units (e.g., a contact card containing name, phone, email, and actions that all apply to that contact)
- Apply a subtle background color or border to delineate form sections, ensuring labels and inputs within the same section are clearly associated
- In dashboards, enclose each widget in its own bounded container so users can identify individual metrics at a glance
- Use common region to associate action buttons with the content they act upon — place "Edit" and "Delete" inside the same card or row as the entity they modify
- When displaying grouped filters, enclose related filter controls in a shared container to distinguish them from other filter groups
- Nest common regions to communicate hierarchy: a page section (large container) containing multiple item cards (smaller containers)

## Anti-Patterns
- Placing an "Add Item" button outside the container for the item list, making it ambiguous whether the button adds to this list or the adjacent one
- Using the same background color for adjacent but unrelated sections, causing users to perceive them as a single group
- Failing to visually bound a set of radio buttons, so users don't realize they are part of the same selection group
- A settings panel where action buttons float in the margin between two content sections, with no clear region associating them to either
