---
title: Context-Sensitive Menu Content
category: Desktop-Specific Patterns
tags: [toolbar, navigation, keyboard, cognitive-load]
priority: situational
applies_when: "When implementing right-click context menus or action menus that need to dynamically adapt their content based on the user's current selection and state."
---

## Principle
Dynamically adapt menu content — right-click context menus, action menus, and toolbars — to show only the actions relevant to the user's current selection and state.

## Why It Matters
Static menus that show every possible action regardless of context overwhelm users with irrelevant choices and force them to mentally filter options on every interaction. Context-sensitive menus reduce cognitive load by surfacing precisely the actions that apply right now, which accelerates decision-making and reduces errors from selecting inapplicable commands.

## Application Guidelines
- Show only actions that are valid for the current selection — if a user right-clicks an image, show image-specific actions; if they right-click text, show text actions
- Gray out (disable) actions that exist in this context but cannot currently be executed, and provide a tooltip explaining why (e.g., "Cannot delete — item is locked by another user")
- Order menu items by frequency of use, with the most common actions at the top; maintain consistent positioning of items that always appear
- Include keyboard shortcut hints next to each action in the context menu to reinforce learning
- Group related actions with visual separators and keep menus under 10-12 items — use submenus sparingly and only for genuinely hierarchical action sets

## Anti-Patterns
- Showing identical context menus regardless of what the user right-clicked, forcing them to discover applicability by trial and error
- Silently hiding actions without explanation, making users think functionality is missing rather than contextually unavailable
- Deeply nested submenus (more than one level) that require precision mouse tracking and are easy to accidentally dismiss
- Context menus that include destructive actions (Delete, Remove) as the first item where an accidental click is likely
