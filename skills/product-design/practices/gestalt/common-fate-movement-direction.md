---
title: "Common Fate: Group Elements That Move in the Same Direction"
category: Gestalt Principles
tags: [drag-drop, animation, gestalt]
priority: situational
applies_when: "When animating multiple UI elements in response to user action and you need synchronized motion to reinforce which elements belong together."
---

## Principle
Elements that move, change, or transform together at the same time and in the same direction are perceived as a group — use synchronized motion intentionally to signal which elements belong together.

## Why It Matters
Common Fate is one of the most powerful Gestalt principles because it operates in real time — the brain groups co-moving elements before conscious thought kicks in. In dynamic interfaces with animations, transitions, and live updates, Common Fate either reinforces your intended groupings (when motion is synchronized) or destroys them (when motion is unsynchronized). It is never neutral.

## Application Guidelines
- When a user action affects multiple elements (e.g., filtering a list, resizing a panel), animate all affected elements with the same direction, duration, and easing so they read as one group
- Use simultaneous state changes (color shifts, opacity fades) as a form of Common Fate for non-spatial grouping — elements that change together are perceived as related
- When dragging an item that has sub-elements (e.g., a card with an icon, title, and description), ensure all sub-elements move as a rigid body with zero relative displacement
- Coordinate scroll behavior for related panels (e.g., a code editor and its line numbers) so they scroll in lockstep, reinforcing their connectedness

## Anti-Patterns
- Animating list items with individual staggered delays so long that they appear to move independently rather than as a group
- Allowing related UI elements to update at different times due to asynchronous rendering, creating the perception that they are unrelated
- Moving a parent container while its children remain stationary or lag behind, which visually detaches them from the group
