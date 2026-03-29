---
title: Menu Design — Predictable Hierarchy, Keyboard Shortcuts
category: Desktop-Specific Patterns
tags: [navigation, toolbar, keyboard, consistency]
priority: situational
applies_when: "When designing the application menu bar structure and you need a predictable, convention-following hierarchy with keyboard accelerators."
---

## Principle
Design application menus with a predictable, conventional hierarchy that users can navigate efficiently through muscle memory, spatial recall, and keyboard accelerators.

## Why It Matters
Menus are the discovery layer of a desktop application — the place where users go when they don't know the shortcut or can't find the toolbar button. A well-structured menu with consistent organization across applications lets users leverage their existing mental model rather than relearning navigation patterns for each tool. Predictable menus reduce the time from "I want to do X" to "I found how to do X" to near zero for experienced users.

## Application Guidelines
- Follow platform-standard menu ordering: File, Edit, View, Insert, Format, Tools, Window, Help — deviate only with strong justification
- Place every action in the menu system even if it's also in a toolbar or context menu; menus are the canonical discoverable inventory of application capabilities
- Show keyboard shortcuts right-aligned next to every menu item that has one; this is the primary way users learn shortcuts
- Use standard accelerator keys (underlined letters) for menu items so users can navigate menus entirely via keyboard (Alt+F for File, then N for New)
- Keep top-level menus to 7-10 items maximum; group related items with separators rather than creating additional top-level categories
- Never change menu item positions dynamically — users rely on spatial memory to navigate menus quickly; use disabling rather than hiding

## Anti-Patterns
- Rearranging menu items based on frequency of use, breaking the spatial memory that makes expert menu access fast
- Hiding menu items behind "Show All" or "Advanced" expandable sections, creating a two-tier system that frustrates users who need those features
- Using non-standard top-level menu categories that don't match user expectations from other applications
- Omitting keyboard shortcuts from menu item labels, removing the primary passive learning mechanism
