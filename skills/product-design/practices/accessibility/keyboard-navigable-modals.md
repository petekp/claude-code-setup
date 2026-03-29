---
title: Keyboard-Navigable Modals and Focus Trapping
category: Accessibility
tags: [modal, keyboard, accessibility]
priority: situational
applies_when: "When implementing a modal or dialog and you need focus to move into the modal, stay trapped within it, and return to the trigger on close."
---

## Principle
When a modal dialog opens, keyboard focus must move into the modal, remain trapped within it until dismissed, and return to the trigger element upon close.

## Why It Matters
For keyboard and screen reader users, a modal that does not trap focus is invisible — they can Tab right past it into the obscured background content, interact with elements they cannot see, and have no idea the modal exists. Conversely, a modal that traps focus but does not return it on close leaves the user stranded at an arbitrary point in the page. Proper focus management is the difference between a modal being accessible and being a complete barrier to keyboard users.

## Application Guidelines
- On modal open: move focus to the first focusable element inside the modal (or the modal container itself if it has a descriptive heading)
- Trap focus within the modal: Tab from the last focusable element should cycle back to the first, and Shift+Tab from the first should cycle to the last
- Close the modal on Escape key press and return focus to the element that triggered the modal
- Apply `aria-modal="true"` and `role="dialog"` to the modal container, and provide an accessible name via `aria-labelledby` pointing to the modal's heading
- Prevent background scrolling while the modal is open to reinforce the focus trap visually
- Include at least one visible close mechanism (X button, Cancel button) that is reachable via keyboard
- Use `inert` attribute or `aria-hidden="true"` on background content when the modal is open to prevent assistive technology from accessing obscured elements

## Anti-Patterns
- A modal that opens but does not move focus into it, leaving keyboard users tabbing through background content behind the overlay
- Focus escaping the modal so keyboard users can interact with buttons and links in the background that they cannot see
- Closing a modal and leaving focus at the top of the page instead of returning it to the trigger element
- A modal with no Escape key handler, forcing keyboard users to Tab through every element to find the close button
