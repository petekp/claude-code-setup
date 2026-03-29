---
title: "Invariance for Cross-Platform Icon Recognition"
category: Gestalt Principles
tags: [icon, responsive, gestalt, consistency]
priority: niche
applies_when: "When designing icons that must remain recognizable across platforms, sizes, and themes by preserving their invariant structural features."
---

## Principle
Users recognize icons by their invariant structural features (essential shape, key distinguishing details) rather than exact rendering, so icons must preserve these features across platforms, sizes, and themes.

## Why It Matters
A settings icon needs to read as "settings" whether it is 16px on a mobile tab bar or 48px on a desktop sidebar, whether rendered in light mode or dark mode, filled or outlined. If scaling, color changes, or style variations destroy the invariant features (the gear teeth, the wrench angle, the envelope flap), recognition breaks and users must relearn the icon's meaning in each context.

## Application Guidelines
- Identify the 2-3 structural features that make each icon recognizable (e.g., the circular gear teeth, the magnifying glass handle) and preserve them across all size and style variants
- Test icons at the smallest target size to ensure invariant features survive -- if details collapse at 16px, simplify the icon rather than forcing the same drawing to scale
- Maintain consistent stroke weight relative to icon size so the proportional structure remains stable across platforms
- When offering both filled and outlined icon variants, ensure the silhouette (the invariant shape) is identical between them

## Anti-Patterns
- Using a detailed, realistic icon at large sizes that loses all recognizable features when scaled to tab-bar size
- Changing the fundamental silhouette of an icon between platforms (e.g., a house icon on web vs. a building icon on mobile for "Home")
- Allowing stroke weight to remain constant across sizes, making small icons look heavy and large icons look skeletal
