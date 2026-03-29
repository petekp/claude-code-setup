---
title: Design Every Interactive State — Not Just the Happy Path
category: Interaction Patterns
tags: [button, empty-state, loading, error-handling, affordance]
priority: core
applies_when: "When designing or reviewing any interactive component to ensure it has deliberate visual treatments for hover, focus, disabled, loading, error, and empty states."
---

## Principle
Every interactive element must have deliberately designed states for default, hover, focus, active, disabled, loading, error, empty, and populated conditions — not just the happy-path default.

## Why It Matters
Users encounter non-default states constantly: they hover before clicking, they see empty states before adding data, they encounter disabled buttons before meeting prerequisites, and they experience loading states on every page transition. When these states are undesigned, the interface feels incomplete and unresponsive — a button with no hover state feels unclickable, an empty screen with no guidance feels broken, a loading state with no indicator feels frozen. Designing all states is what separates a polished product from a prototype.

## Application Guidelines
- Design and document all interactive states for every component: default, hover, focus (keyboard), active (pressed), disabled, loading, error, success
- Empty states deserve dedicated design: explain why the area is empty, what the user can do to populate it, and include a primary action ("No projects yet — Create your first project")
- Loading states should be designed per-context: skeleton screens for initial page loads, inline spinners for component refreshes, progress bars for uploads
- Disabled states must be visually distinct and include a tooltip or adjacent text explaining why the element is disabled and how to enable it
- Focus states must be visible for keyboard accessibility — never remove the browser's default focus outline without replacing it with something equally visible
- Error states on form fields need specific visual treatment (red border, error icon, error message) that is distinct from the default state

## Anti-Patterns
- Shipping a feature with only the "happy path" designed: the default view and the populated state look polished, but the empty state shows a blank white area, the loading state is the browser's default spinner, the error state shows raw API error text, and disabled buttons look identical to enabled ones
