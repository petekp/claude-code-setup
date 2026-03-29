---
title: "Multi-Cue Similarity for Accessible Affordances"
category: Gestalt Principles
tags: [icon, button, accessibility, gestalt, affordance]
priority: situational
applies_when: "When encoding similarity through color and you need to ensure grouping survives color vision deficiency by adding shape, size, or texture cues."
---

## Principle
Accessible interfaces encode similarity through multiple visual channels simultaneously (color, shape, size, texture, and iconography) so that no single channel is a sole differentiator.

## Why It Matters
Roughly 8% of men and 0.5% of women have some form of color vision deficiency. If similarity grouping relies on color alone, a significant portion of users cannot perceive the intended relationships. Multi-cue encoding ensures that interactive affordances remain distinguishable and grouped correctly regardless of individual perception differences.

## Application Guidelines
- Pair color with a secondary cue such as shape (filled vs. outlined icons), size, or a text label to communicate function
- Use consistent iconography alongside color-coding in status indicators (e.g., a checkmark + green, an X + red) so either cue alone is sufficient
- Test all similarity-based groupings through color-blindness simulation tools (e.g., Sim Daltonism, Stark plugin)
- Apply distinct border styles or patterns in addition to color when differentiating data series in charts

## Anti-Patterns
- Relying solely on red vs. green to distinguish error states from success states
- Using color as the only differentiator between enabled and disabled buttons
- Assuming that hue alone is enough to group related navigation items without supporting shape or position cues
