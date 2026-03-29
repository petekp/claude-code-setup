---
title: Command Palette
category: Interaction Patterns
tags: [search, navigation, keyboard, progressive-disclosure]
priority: situational
applies_when: "When building a feature-rich application where users need a fast, searchable way to access any action, page, or setting from anywhere."
---

## Principle
Provide a keyboard-activated command palette that lets users search for and execute any action, navigate to any page, or access any setting through a unified, type-ahead search interface.

## Why It Matters
As applications grow in feature surface area, navigating through menus and settings to find a specific action becomes increasingly inefficient. A command palette (activated by Ctrl/Cmd+K or similar) collapses the entire application's action space into a single, searchable interface. Power users can reach any feature in two seconds regardless of how deeply it is nested in the navigation hierarchy. This pattern, popularized by VS Code, Figma, and Slack, has become an expected feature in productivity software because it dramatically reduces navigation overhead.

## Application Guidelines
- Activate the command palette with a standard keyboard shortcut (Ctrl/Cmd+K is the emerging convention) and make it accessible from any screen
- Index all navigable pages, actions, settings, and recent items so they are searchable from the palette
- Support fuzzy matching so users do not need to remember exact names — "usr set" should match "User Settings"
- Show results categorized by type (Pages, Actions, Settings, Recent) with the most likely result pre-selected
- Include recently used and frequently used commands at the top when the palette opens with an empty query
- Support keyboard-only interaction: type to search, arrow keys to navigate results, Enter to execute, Escape to dismiss
- Show keyboard shortcuts next to their corresponding commands to teach users direct shortcuts over time

## Anti-Patterns
- Building a complex application with 200+ features and no command palette, forcing users to navigate through 4-level-deep menu hierarchies to find infrequently used features they know exist but cannot locate
