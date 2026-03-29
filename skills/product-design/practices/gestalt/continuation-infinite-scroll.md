---
title: "Continuation-Based Gestalt in Infinite Scroll and Implied Content"
category: Gestalt Principles
tags: [list, layout, gestalt, scanning]
priority: situational
applies_when: "When building scrollable lists or carousels and you need a partially visible edge element to signal that more content exists."
---

## Principle
Partially visible content at the edge of the viewport leverages continuation to signal that more content exists beyond the visible area, inviting the user to scroll or swipe.

## Why It Matters
If all visible content fits neatly within the viewport with no visual bleed, users may assume they have seen everything. A clipped card, a fading gradient, or a partially visible row creates a visual line that the eye wants to follow, triggering scroll behavior. Without this cue, users miss content that is just out of view.

## Application Guidelines
- In horizontal carousels, ensure the last visible item is partially clipped (roughly 15-25% visible) to signal scrollability
- Use fade-out gradients at the scroll edge to imply continuation rather than hard crop boundaries
- In infinite scroll feeds, display a loading skeleton or partial next item before the next batch loads to maintain visual continuity
- Pair the visual continuation cue with a subtle scroll indicator (arrow, dots) for users who may not pick up on the spatial hint alone

## Anti-Patterns
- Fitting carousel items exactly within the viewport so there is no visible hint that more items exist off-screen
- Ending a scrollable area with a clean edge and ample whitespace, which signals "end of content" rather than continuation
- Using pagination buttons as the only affordance for more content when the visual layout suggests everything is already shown
