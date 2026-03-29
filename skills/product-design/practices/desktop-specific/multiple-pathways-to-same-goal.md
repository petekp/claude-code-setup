---
title: Multiple Pathways to the Same Goal
category: Desktop-Specific Patterns
tags: [toolbar, navigation, keyboard, accessibility, consistency]
priority: situational
applies_when: "When implementing actions that should be accessible through multiple methods — menu, toolbar, keyboard shortcut, context menu, and command palette."
---

## Principle
Provide multiple interaction methods to accomplish the same action — menu, toolbar, keyboard shortcut, context menu, and command palette — so users can choose the pathway that matches their current context and skill level.

## Why It Matters
Different situations call for different interaction methods. A user might right-click to delete one item, use a keyboard shortcut to delete the next, and drag to trash to delete a batch. Providing only one way to do things forces all users into the same interaction pattern regardless of context, expertise, or accessibility needs. Multiple pathways also serve as a discovery mechanism: a user who finds "Bold" in the Format menu sees the Cmd+B shortcut and learns a faster path.

## Application Guidelines
- Every common action should be accessible through at minimum: (1) the menu bar, (2) a keyboard shortcut, and (3) a toolbar button or context menu
- Use menus as the canonical registry of all available actions — every action in the application should appear in a menu, even if it's also available elsewhere
- Show the keyboard shortcut in every place the action appears (menu label, toolbar tooltip, command palette row) to reinforce learning
- Support drag-and-drop as an additional pathway for spatial operations (moving, reordering, filing) alongside explicit commands
- Implement a command palette that provides a universal search-based pathway to every action, which serves both as a power-user accelerator and an accessibility aid
- Ensure all pathways produce identical results — the action triggered by a shortcut must behave exactly like the same action triggered from a menu

## Anti-Patterns
- Providing only one way to perform common actions (e.g., a button with no keyboard shortcut and no menu entry), creating a single point of failure for different interaction preferences
- Having different pathways produce subtly different results (e.g., "Save" from the menu saves to a different location than Cmd+S)
- Providing so many pathways that users are confused about which one to use — pathways should be layered by complexity, not competing
- Removing toolbar buttons or menu entries to "encourage" keyboard shortcut use, penalizing novice users and those with accessibility needs
