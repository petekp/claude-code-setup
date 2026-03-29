---
title: Tooltips — Supplementary Clarification, Not Critical Information
category: Component Patterns
tags: [tooltip, accessibility, mobile, progressive-disclosure]
priority: core
applies_when: "When adding hover-triggered help text to clarify icons, abbreviated labels, or disabled states without placing critical information solely in the tooltip."
---

## Principle
Tooltips should provide helpful supplementary context on hover or focus, never serving as the sole container for information a user needs to complete their task.

## Why It Matters
Tooltips are invisible until triggered, unavailable on most touch devices, and disappear the moment the user moves their cursor. Any critical information placed exclusively in a tooltip is effectively hidden from a significant portion of users. When used correctly — to clarify an abbreviated label, explain a disabled state, or define a technical term — tooltips reduce clutter while keeping help accessible. When misused as the primary home for essential instructions, they create an interface that seems simple but is actually incomprehensible without hovering over everything.

## Application Guidelines
- Use tooltips to expand abbreviated labels, explain icon-only buttons, or provide brief additional context for a visible element
- Keep tooltip text to one or two short sentences — if more explanation is needed, use a popover, help panel, or inline text instead
- Ensure the tooltip trigger element has a visible label or icon that communicates its basic purpose even without the tooltip
- Show tooltips on both hover and keyboard focus to ensure accessibility
- Add a slight delay before showing (200-300ms) to prevent tooltips from flashing during normal cursor movement
- Position tooltips to avoid obscuring the element they describe or adjacent interactive elements
- For touch interfaces, provide an alternative path to the same information (inline text, help icon with a tap-to-reveal popover)

## Anti-Patterns
- Placing form field validation rules exclusively in a tooltip, so users cannot see requirements while typing
- Using tooltips on mobile where hover is not available, leaving touch users without access to the information
- A tooltip containing a paragraph of instructions that disappears when the user moves their cursor to read it
- Tooltip text that simply repeats the label it is attached to, adding no value (e.g., a "Save" button with a "Save" tooltip)
