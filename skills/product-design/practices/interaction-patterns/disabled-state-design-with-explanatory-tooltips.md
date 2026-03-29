---
title: Disabled State Design with Explanatory Tooltips
category: Interaction Patterns
tags: [button, tooltip, accessibility, affordance]
priority: core
applies_when: "When an interactive element needs to be disabled due to unmet prerequisites, missing permissions, or contextual constraints, and users need to understand why."
---

## Principle
Disabled interactive elements must be visually distinct from enabled elements and must explain why they are disabled and what the user needs to do to enable them.

## Why It Matters
A grayed-out button with no explanation is a dead end: the user can see the action exists, wants to take it, but cannot determine why it is unavailable or how to make it available. This creates frustration and support tickets. Disabled states without explanation are especially problematic for new users who have not yet learned the system's prerequisites. An explanatory tooltip transforms a dead end into guidance, teaching users the system's rules while respecting the fact that the action is contextually unavailable.

## Application Guidelines
- Apply a visually distinct disabled treatment: reduced opacity (50-60%), desaturated color, and a not-allowed cursor on hover
- Add a tooltip on hover that explains why the element is disabled: "Complete the required fields above to enable submission" or "Requires admin permissions"
- When the prerequisite is a specific field or action, link to it: "Select a recipient to enable Send"
- For disabled items in dropdowns or menus, show them in the list (grayed out) rather than hiding them entirely, so users learn what options exist even when unavailable
- Ensure disabled elements are still visible to screen readers with appropriate aria-disabled attributes and accessible descriptions
- Consider whether the element should be disabled at all — sometimes hiding it entirely is clearer, particularly when the user will never be able to enable it in the current context

## Anti-Patterns
- Displaying a grayed-out "Submit" button with no tooltip, no helper text, and no indication of which of the form's 15 fields is preventing submission — leaving the user to check each field through trial and error
