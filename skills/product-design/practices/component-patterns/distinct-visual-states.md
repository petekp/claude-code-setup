---
title: Distinct Visual States for Clickable, Selected, and Plain Elements
category: Component Patterns
tags: [button, accessibility, affordance, feedback-loop, consistency]
priority: core
applies_when: "When implementing interactive elements that need visually distinct default, hover, active, selected, focused, and disabled states."
---

## Principle
Every interactive element must have visually distinct states for default, hover, active/pressed, selected, focused, and disabled, so users always know what is actionable and what state it is in.

## Why It Matters
Visual states are the primary feedback mechanism for direct manipulation interfaces. When a user hovers over a button and nothing changes, they question whether it is clickable. When they click a tab and the active state is indistinguishable from the inactive state, they are unsure whether their action registered. When a disabled button looks identical to an enabled one, they waste time clicking something that will not respond. Clear state differentiation is not decorative — it is the communication layer that makes interfaces feel responsive and trustworthy.

## Application Guidelines
- Define and implement all six core states for interactive elements: default, hover, active/pressed, focused, selected (where applicable), and disabled
- Hover state should provide a subtle but noticeable change (background color shift, slight elevation change) within 50ms of cursor entry
- Active/pressed state should be visually distinct from hover, providing a "pushed" feeling (darker shade, reduced elevation)
- Selected state (for toggles, tabs, list items) must be clearly distinguishable from the default state even without hover
- Disabled state should reduce opacity or use muted colors and remove the pointer cursor — it should be obvious at a glance, not only discoverable by attempting to click
- Focus state must use a visible outline or ring distinct from the selected state, for keyboard navigation accessibility
- Maintain consistent state treatments across all components — if hover means a background color shift on buttons, it should also mean a background color shift on list items

## Anti-Patterns
- A button with no hover state, leaving users uncertain whether it is interactive
- Selected and unselected tab states that differ only by a subtle font weight change, requiring careful comparison to identify the active tab
- A disabled button that looks identical to an enabled button, causing users to click repeatedly in confusion
- Interactive list items that show a hover state but no selected state, leaving users unsure which item they have chosen
