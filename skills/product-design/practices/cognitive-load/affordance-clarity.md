---
title: "Affordance Clarity: Make Interactivity Self-Evident"
category: Cognitive Load
tags: [button, icon, affordance, cognitive-load]
priority: core
applies_when: "When designing buttons, links, icons, or any interactive element where users need to immediately distinguish clickable from static content."
---

## Principle
Interactive elements must visually communicate their interactivity so users can identify what is clickable, draggable, or editable without experimentation.

## Why It Matters
When users cannot distinguish interactive elements from static content, they resort to trial-and-error clicking — a costly cognitive strategy that diverts attention from their actual task. Clear affordances allow users to build an accurate mental model of the interface instantly, reducing the cognitive overhead of simply navigating the UI. In flat design systems where visual cues have been stripped away, affordance ambiguity is one of the leading causes of user confusion.

## Application Guidelines
- Buttons should look like buttons: use depth cues (shadow, border), distinct shape, and contrast to separate them from surrounding text
- Links in body text should be visually differentiated (underline, color) and not rely solely on color for accessibility
- Use cursor changes (pointer, grab, text-select) to reinforce affordances on hover
- Provide visible drag handles for draggable elements rather than relying on the user to discover drag behavior
- Ensure disabled states are clearly distinct from enabled states (reduced opacity, muted color, no hover effect)

## Anti-Patterns
- Ghost buttons (transparent, borderless) used for primary actions where they blend into the background
- Clickable text that looks identical to non-clickable text
- Icons without labels that require users to guess their function
- Interactive cards where the clickable area is ambiguous (is it the whole card? just the title? just the icon?)
