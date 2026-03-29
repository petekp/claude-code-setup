---
title: Contextual Menus — Efficiency Accelerators, Not Primary Pathways
category: Interaction Patterns
tags: [navigation, toolbar, keyboard, progressive-disclosure]
priority: situational
applies_when: "When implementing right-click or long-press context menus and deciding which actions to surface and how they relate to the primary UI."
---

## Principle
Right-click context menus and long-press menus should provide shortcut access to relevant actions for efficient users, but every action in a context menu must also be accessible through the primary UI.

## Why It Matters
Context menus are invisible until invoked — they have zero discoverability for new users. If critical actions are only available through right-click, a significant portion of users will never find them. However, for users who do discover them, context menus are one of the fastest interaction patterns available: right-click on the exact item, see only relevant actions, and execute in one more click. This makes them ideal as an accelerator layer that complements, but never replaces, the visible UI.

## Application Guidelines
- Populate context menus with actions relevant to the specific item or selection — not a generic global menu
- Include only the 5-8 most common actions; use a "More options..." item for the long tail
- Mirror every context menu action in the visible UI: toolbar buttons, hover-revealed actions, or the action menu for the item
- Show keyboard shortcuts alongside context menu items to teach users even faster paths
- Support context menus on both right-click (desktop) and long-press (touch), with the same menu items
- Organize context menu items in a logical order: primary actions first, destructive actions last, separated by dividers
- For selections of multiple items, adapt the context menu to show bulk-applicable actions and hide single-item-only actions

## Anti-Patterns
- Making "Export to CSV" available only through a right-click context menu on a table, with no export button in the toolbar or action menu — so the majority of users who never right-click on a table believe the feature does not exist
