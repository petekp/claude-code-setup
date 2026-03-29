---
title: Full Keyboard Accessibility for All Interactive Elements
category: Accessibility
tags: [button, form, navigation, keyboard, accessibility]
priority: core
applies_when: "When building any interactive element or workflow and every action must be fully operable using only a keyboard."
---

## Principle
Every interactive element and workflow in the application must be fully operable using only a keyboard, with no mouse or touch required at any point.

## Why It Matters
Keyboard accessibility is not an edge case accommodation — it serves users with motor disabilities who cannot use a mouse, power users who prefer keyboard workflows, users of voice control software (which often simulates keyboard input), and anyone with a temporarily injured hand. It is also a legal requirement under WCAG 2.1 Level A (Success Criterion 2.1.1). If a user can complete a task with a mouse but not a keyboard, the feature is broken for a significant portion of the user population.

## Application Guidelines
- All interactive elements (buttons, links, form controls, menus, tabs, dialogs) must be reachable via Tab and operable via Enter, Space, or Arrow keys as appropriate
- Implement standard keyboard patterns from WAI-ARIA Authoring Practices: Tab for moving between components, Arrow keys for moving within a composite component (tabs, menus, radio groups)
- Ensure no keyboard traps exist — the user must always be able to Tab or Escape out of any component
- Provide keyboard shortcuts for frequent actions (Cmd/Ctrl+S for save, Cmd/Ctrl+K for search) and document them visibly
- Custom interactive widgets built with `<div>` or `<span>` must include `tabindex="0"` and keyboard event handlers — they are invisible to keyboard users without this
- Test every user flow end-to-end using only a keyboard: create, read, update, delete, navigate, search, filter, and submit
- Ensure dropdown menus, date pickers, color pickers, and other complex widgets are fully operable via keyboard

## Anti-Patterns
- A drag-and-drop interface with no keyboard alternative for reordering items
- Custom dropdown menus that open on click but cannot be navigated with arrow keys or closed with Escape
- A "Close" button in a modal that can only be reached by clicking, not by pressing Escape or tabbing to it
- Interactive elements built with `<div onclick>` that have no tabindex and no keyboard event handling
