---
title: Visible Focus Indicators
category: Accessibility
tags: [button, form, keyboard, accessibility]
priority: core
applies_when: "When building any interactive element and it must display a clearly visible focus indicator when it receives keyboard focus."
---

## Principle
Every interactive element must display a clearly visible focus indicator when it receives keyboard focus, so keyboard users can always see where they are on the page.

## Why It Matters
For sighted keyboard users, the focus indicator is the equivalent of a mouse cursor — it is the only way they know which element will respond to their next keystroke. Without a visible focus indicator, keyboard navigation becomes a blind guessing game where users press Tab and have no idea what they have selected. Removing or hiding default browser focus indicators for aesthetic reasons is one of the most common and most damaging accessibility violations. WCAG 2.4.7 (Focus Visible) requires that focus indicators are perceivable, and WCAG 2.4.11 (Focus Appearance) specifies minimum visibility requirements.

## Application Guidelines
- Never use `outline: none` or `outline: 0` without providing an equally visible custom focus style
- Design a custom focus indicator that is visible on all background colors — a 2px+ solid outline with offset, or a contrasting ring that works on both light and dark surfaces
- The focus indicator must have at least a 3:1 contrast ratio against the unfocused state and against adjacent backgrounds
- Use `:focus-visible` to show focus indicators for keyboard navigation while suppressing them for mouse clicks, if the aesthetic concern is specifically about mouse click focus rings
- Ensure focus indicators work on all component types: buttons, links, form inputs, tabs, menu items, cards, checkboxes, and custom widgets
- Test focus visibility by tabbing through every page with the mouse hidden — if you ever lose track of where focus is, the indicator is insufficient
- Consider using a consistent focus style across the entire product (e.g., a blue ring with 2px offset) for predictability

## Anti-Patterns
- A global CSS rule of `*:focus { outline: none; }` that removes all focus indicators across the product
- Focus indicators that are only visible on light backgrounds but disappear on dark or colored backgrounds
- Extremely subtle focus indicators (a slight background color change or thin dotted line) that require careful inspection to notice
- Custom components that receive focus but show no visual change at all, making them invisible to keyboard users
