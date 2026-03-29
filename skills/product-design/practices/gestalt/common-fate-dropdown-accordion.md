---
title: Common Fate in Dropdown and Accordion Animation
category: Gestalt Principles
tags: [navigation, animation, gestalt]
priority: niche
applies_when: "When animating dropdown menus or accordion panels and you need child elements to move as a unified group."
---

## Principle
Elements within a dropdown or accordion panel should animate as a single unified group so that Common Fate reinforces their membership in the same container.

## Why It Matters
When items inside an expanding panel animate individually or at different rates, the brain cannot group them, and the panel feels like a collection of unrelated pieces rather than a cohesive unit. Synchronized motion tells the user "these items belong together" before they even read the content, reducing cognitive overhead during navigation.

## Application Guidelines
- Animate the container's height (or max-height) and let child elements flow naturally within it, rather than staggering child animations independently
- If you do use staggered reveals for polish, keep the stagger interval under 50ms so the items are perceived as a single wave, not as independent actors
- Ensure the open/close animation of all sibling accordion panels uses the same easing curve and duration so that panel-level Common Fate groups all accordions as peers
- Coordinate the chevron or toggle icon rotation with the panel expansion so the trigger and content feel linked by shared motion

## Anti-Patterns
- Animating each list item inside a dropdown on a separate delay curve, making them appear unrelated to each other and to the dropdown container
- Using different easing functions for open vs. close, which makes the same group feel like two different interactions
- Leaving the toggle icon static while the panel animates, breaking the visual connection between trigger and content
