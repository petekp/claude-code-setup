---
title: Pattern Recognition and UI Consistency
category: Cognitive Psychology
tags: [button, icon, navigation, consistency]
priority: situational
applies_when: "When auditing an interface for inconsistent button placement, icon usage, date formats, or interaction patterns that break user expectations."
---

## Principle
The human visual system is optimized for detecting patterns and anomalies, so consistent UI patterns let users predict behavior and inconsistencies create confusion.

## Why It Matters
Users build expectations rapidly from the first few interactions with an interface. When patterns hold — same action in the same position, same visual treatment for the same function — users stop thinking about the interface and focus on their task. When patterns break, users must re-evaluate every element, which destroys flow state and erodes trust. Pattern inconsistency is one of the most common sources of "this feels janky" feedback that is hard to diagnose but easy to prevent.

## Application Guidelines
- Establish and enforce a component library where each UI element has one canonical appearance and behavior across the entire product
- Place recurring actions (save, cancel, delete, search) in the same relative position on every screen where they appear
- Use identical iconography for identical functions — never represent the same action with different icons in different contexts
- Maintain consistent information architecture: if lists are sorted alphabetically in one section, they should be sorted alphabetically everywhere unless there is a strong, explicit reason to differ
- Apply the same animation timing, easing curves, and transition patterns throughout the product
- When a pattern must change (e.g., destructive action styling), the change itself should be systematic and predictable (all destructive actions styled the same way)

## Anti-Patterns
- Using a "Save" button in the top-right on some forms and bottom-left on others
- Representing "Delete" with a trash can icon in one view and an "X" icon in another
- Inconsistent date formats across different screens (MM/DD/YYYY in one table, DD-Mon-YYYY in another)
- Mixing pagination and infinite scroll for similar list views within the same product
