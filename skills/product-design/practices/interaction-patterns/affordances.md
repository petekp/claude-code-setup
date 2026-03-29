---
title: Affordances — Make Interaction Cues Visible
category: Interaction Patterns
tags: [button, form, affordance, feedback-loop]
priority: core
applies_when: "When designing any interactive element — buttons, links, drag handles, form fields — that must visually communicate its interactivity to users."
---

## Principle
Every interactive element must visually communicate that it is interactive and what kind of interaction it supports — buttons should look clickable, draggable items should look grabbable, and links should look navigable.

## Why It Matters
An affordance is a visual cue that signals how an element can be used. Without clear affordances, users cannot distinguish interactive elements from static content: flat-design buttons that look like labels go unclicked, draggable items without grab handles are never dragged, and links without underlines or color differentiation are missed entirely. Poor affordance design is one of the most common causes of usability failures identified in testing. Users should never have to guess whether something is clickable.

## Application Guidelines
- Buttons must look like buttons: use visible borders or fill, adequate padding, a distinct shape, and a cursor change on hover
- Links must be visually distinct from body text: use color differentiation and underlines (on hover at minimum, ideally persistently) for text links
- Draggable elements should show a grab handle (dots or lines icon), a grab cursor on hover, and a visual lift on drag start
- Resizable elements should show a resize cursor at draggable edges and a visible handle at corners or borders
- Interactive icons should have a hover state (background highlight, color change) that distinguishes them from decorative icons
- Form fields should have visible borders that distinguish them from labels and static text; avoid borderless input fields that are indistinguishable from the page background

## Anti-Patterns
- Using flat-design text labels with no border, no fill, no underline, and no hover effect as the primary call-to-action button, making it visually indistinguishable from a static heading — and then wondering why click-through rates are low
