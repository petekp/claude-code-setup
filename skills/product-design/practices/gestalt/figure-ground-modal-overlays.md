---
title: Figure-Ground with Modal Overlays and Drawers
category: Gestalt Principles
tags: [modal, sidebar, layout, gestalt]
priority: situational
applies_when: "When implementing modals, drawers, or overlays and you need a scrim or dimming layer to establish unambiguous figure-ground separation."
---

## Principle
Modals, drawers, and overlays must establish unambiguous figure-ground separation by dimming or de-emphasizing the background layer so the user's attention is captured entirely by the foreground content.

## Why It Matters
When an overlay appears without sufficient figure-ground contrast, users are unsure whether the background is still interactive, where to focus, or how to dismiss the overlay. This ambiguity leads to accidental clicks, missed content, and frustration. Strong figure-ground separation makes the interaction model immediately self-evident: this layer is active, everything else is not.

## Application Guidelines
- Apply a semi-transparent scrim (40-60% opacity black or dark overlay) behind modals to push the background layer into the ground and make the modal the clear figure
- Ensure the modal or drawer has visible elevation (shadow, border, or higher brightness) relative to the scrim so it reads as a distinct layer, not as part of the dimmed background
- Disable pointer events on the background content while the overlay is active so the interaction boundary matches the visual boundary
- For drawers that share the screen with content, use a visible edge shadow or scrim on the adjacent area to maintain figure-ground even when the drawer does not cover the full viewport

## Anti-Patterns
- Opening a modal without any background dimming, so the user cannot tell which content is currently active
- Using a scrim so dark that users believe the background content has been removed rather than merely de-emphasized
- Allowing the background to remain scrollable or interactive while a modal is open, creating a mismatch between visual and interaction layers
