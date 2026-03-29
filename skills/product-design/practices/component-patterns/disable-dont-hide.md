---
title: Disable, Don't Hide, Irrelevant Menu Items
category: Component Patterns
tags: [button, toolbar, permissions, affordance, consistency]
priority: core
applies_when: "When an action is temporarily unavailable and you must decide whether to hide it or show it in a disabled state with an explanatory tooltip."
---

## Principle
When an action is temporarily unavailable due to the current state or context, show it in a disabled state rather than hiding it, so users know the action exists and understand the interface is consistent.

## Why It Matters
Hiding unavailable actions creates two serious problems. First, it causes layout instability — menus and toolbars shift in size and arrangement depending on context, breaking spatial memory. Second, it prevents discoverability — users who need that action in a different context will never know it exists if they have only seen the interface in a state where it is hidden. Disabled items with explanatory tooltips teach users about capabilities and the conditions required to unlock them. Hidden items create a perception that the product lacks the feature entirely.

## Application Guidelines
- Show actions in a disabled state (grayed out, reduced opacity, no pointer cursor) when they are temporarily unavailable
- Provide a tooltip on the disabled element explaining why it is unavailable and what the user can do to enable it (e.g., "Select at least one item to enable bulk actions")
- Maintain consistent menu and toolbar layouts regardless of state — the same items should always appear in the same positions
- The disabled visual treatment should be clearly different from the default state but should not make the label unreadable
- For destructive actions that require specific permissions, show them disabled with a permission explanation rather than hiding them from unauthorized users (unless there is a security reason to hide the action's existence entirely)
- Exception: In genuinely overloaded interfaces (e.g., 30+ toolbar actions), hiding rarely-used actions behind a "More" menu is acceptable — but within that menu, use disable rather than hide

## Anti-Patterns
- A toolbar that shows 5 buttons in one context and 8 in another, with buttons shifting position as items appear and disappear
- Hiding the "Export" action when no data exists, so new users never discover the export capability until they happen to have data
- A context menu where half the items disappear based on the selected item type, making it feel unstable and unpredictable
- Disabling an action without any explanation, leaving users to guess why it is grayed out and whether it is a bug
