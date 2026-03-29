---
title: "Figure-Ground: Establish Clear Focal Layers in Every View"
category: Gestalt Principles
tags: [layout, sidebar, modal, gestalt, scanning]
priority: core
applies_when: "When composing any view with multiple layers and you need clear visual separation between foreground content, chrome, and background."
---

## Principle
Every view should be composed of clearly distinguished visual layers — a foreground figure that demands attention and a receding ground that supports without competing — so the user's focus is directed rather than divided.

## Why It Matters
Without clear layering, interfaces feel flat and overwhelming. Users cannot quickly identify what to act on versus what is context. Clear figure-ground separation reduces visual search time, supports scanning workflows, and is especially critical for users with low vision or cognitive conditions who need unambiguous hierarchy to orient themselves.

## Application Guidelines
- Use elevation (shadows, overlays) to separate interactive or primary content from background and chrome — the active layer should feel "closer" to the user
- Reduce the visual intensity of ground elements (lighter colors, lower contrast, smaller type) so they recede and do not compete with the figure
- When multiple content layers exist (e.g., sidebar, main content, modal), ensure each layer has a distinct depth level with consistent visual treatment
- Test figure-ground clarity by converting the design to grayscale — if the layers are still distinguishable, the hierarchy is robust

## Anti-Patterns
- Giving navigation chrome the same visual weight as primary content so the user cannot distinguish tooling from workspace
- Using transparency or glassmorphism effects that blur the boundary between layers, making it unclear which content is in front
- Stacking multiple layers (tooltip on popover on modal on page) without progressive dimming of background layers, creating depth confusion
