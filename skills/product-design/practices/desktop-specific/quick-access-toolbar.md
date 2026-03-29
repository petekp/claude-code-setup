---
title: Quick Access Toolbar (QAT)
category: Desktop-Specific Patterns
tags: [toolbar, icon, keyboard, fitts-law]
priority: niche
applies_when: "When building a feature-rich desktop application where users need a customizable toolbar to pin their most-used actions for single-click access."
---

## Principle
Provide a user-customizable toolbar area where individuals can pin their most-used actions for single-click access, independent of the current mode or context.

## Why It Matters
Every user has a different set of high-frequency actions depending on their role, workflow, and habits. A quick access toolbar lets each user build their own optimized control surface rather than being constrained by the designer's assumptions about what's most important. This is especially valuable in feature-rich applications where no single toolbar arrangement serves everyone well.

## Application Guidelines
- Position the QAT in a persistent, easily reachable location — typically above or below the main toolbar/ribbon
- Allow users to add actions via right-click ("Add to Quick Access Toolbar") from any menu, toolbar, or command palette
- Support drag-and-drop reordering within the QAT so users can arrange actions by personal priority
- Keep the QAT compact — small icons, minimal padding — since its purpose is rapid access, not discovery
- Persist QAT configuration per user account so it follows them across devices and sessions
- Provide a default QAT configuration with the 4-6 most universally useful actions (save, undo, redo, print) that users can customize

## Anti-Patterns
- Providing no way for users to customize which actions are immediately accessible, forcing everyone into the same toolbar layout
- Allowing QAT customization but not persisting it, so users must rebuild their toolbar after every session or update
- Making the QAT customization process buried deep in settings rather than available via right-click in context
- Cluttering the QAT with too many default items, defeating the purpose of a compact, personalized access point
