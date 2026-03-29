---
title: Attention is Selective — Design for Salience
category: Cognitive Psychology
tags: [layout, button, notification, scanning, cognitive-load]
priority: situational
applies_when: "When establishing visual hierarchy on a screen and deciding which elements should receive the most visual emphasis versus which should recede."
---

## Principle
Human attention is a finite, selective resource — users will notice what is visually salient and miss what blends into the background, regardless of its importance.

## Why It Matters
Users do not read interfaces; they scan them. Attention is drawn to elements with high visual contrast, motion, size, or isolation. If a critical action, warning, or piece of information lacks salience, users will overlook it even when it's technically visible on screen. Conversely, if everything is emphasized, nothing stands out and the page becomes visual noise. Deliberate salience management ensures that the most important elements receive attention proportional to their importance.

## Application Guidelines
- Establish a clear visual hierarchy with no more than three levels of emphasis on any given screen (primary action, secondary content, tertiary details)
- Use size, color contrast, and whitespace to make the single most important element on each screen immediately obvious
- Reserve high-salience treatments (bold color, large size, animation) for genuinely critical elements — alerts, primary CTAs, destructive confirmations
- Use motion sparingly and purposefully; animation should direct attention to a state change, not decorate the interface
- For error states and warnings, combine color with iconography and positioning to ensure visibility even for users scanning quickly
- De-emphasize less important elements (secondary actions, metadata, help text) through smaller size, lighter color, and peripheral positioning

## Anti-Patterns
- Giving equal visual weight to primary and secondary actions, so users cannot quickly distinguish the recommended path from the alternative
- Using bright red for both error messages and decorative accents, diluting the signal that red = problem
- Hiding a critical legal disclaimer in small gray text below the fold while the page is dominated by promotional imagery
- Animating multiple elements simultaneously, creating competing attention demands that result in users noticing none of them
