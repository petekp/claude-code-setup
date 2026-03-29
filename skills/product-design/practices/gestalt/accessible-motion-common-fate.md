---
title: Accessible Motion: Common Fate with prefers-reduced-motion
category: Gestalt Principles
tags: [animation, accessibility, gestalt]
priority: situational
applies_when: "When using synchronized motion to group elements and you need to ensure the grouping survives prefers-reduced-motion settings."
---

## Principle
Common Fate grouping through synchronized motion must degrade gracefully when users have enabled prefers-reduced-motion, preserving the grouping relationship through non-motion cues.

## Why It Matters
Users with vestibular disorders, motion sensitivities, or cognitive conditions like ADHD can experience nausea, disorientation, or distraction from animated elements. If Common Fate is the sole grouping signal, disabling motion destroys the user's ability to perceive which elements belong together, leaving them with a broken information hierarchy.

## Application Guidelines
- Always query `prefers-reduced-motion: reduce` and provide a static fallback that communicates the same grouping (e.g., shared color, enclosure, or connecting lines)
- When reduced motion is active, replace animated transitions with instant state changes (opacity crossfade at most) so grouped elements still update together visually
- Use CSS custom properties or a motion-scale token so animation durations can be set to zero in one place rather than scattered across components
- Test the reduced-motion experience as a first-class design, not an afterthought — verify that every Common Fate relationship remains perceivable without animation

## Anti-Patterns
- Relying exclusively on synchronized animation to convey grouping with no static fallback
- Interpreting prefers-reduced-motion as "remove all animation" instead of replacing motion with equivalent non-motion cues
- Providing a reduced-motion mode that simply freezes elements mid-animation, leaving the UI in an ambiguous visual state
