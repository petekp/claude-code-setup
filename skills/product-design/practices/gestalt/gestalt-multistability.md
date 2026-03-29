---
title: "Gestalt Multistability: Avoiding Ambiguous UI Elements"
category: Gestalt Principles
tags: [icon, button, gestalt, affordance]
priority: niche
applies_when: "When a visual element could be interpreted in two or more ways and you need to eliminate the ambiguity so users settle on the correct reading."
---

## Principle
When a visual arrangement supports two or more equally valid interpretations, users oscillate between them rather than settling on one, so interfaces must eliminate perceptual ambiguity.

## Why It Matters
Multistability -- the Rubin's vase effect -- is fascinating in optical illusions but disastrous in UI. If a layout element can be read as either a button or a heading, a container edge or a divider, or if icon meaning flips depending on context, users hesitate. That moment of uncertainty compounds across an interface, creating a feeling of unreliability even if each individual ambiguity is small.

## Application Guidelines
- Test icons and visual elements by asking unfamiliar users to describe what they see; if interpretations split, redesign the element
- Ensure interactive elements are unambiguously distinct from decorative or structural elements through consistent affordance cues (depth, cursor change, hover state)
- Avoid layouts where the negative space creates shapes that compete with the intended positive-space reading
- Use labels, tooltips, or supporting text to anchor the correct interpretation when a visual alone could flip

## Anti-Patterns
- Using an icon that could mean either "close" or "add" (an X vs. a rotated plus) depending on user interpretation
- Creating card layouts where the gap between cards reads as a visual element itself, competing with the cards for figure status
- Designing toggle switches where neither state is clearly "on" or "off" because both positions look equally plausible
