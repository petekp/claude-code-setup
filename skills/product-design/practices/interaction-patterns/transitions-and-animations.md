---
title: Transitions and Animations — 150-300ms for State Changes
category: Interaction Patterns
tags: [modal, sidebar, animation, accessibility]
priority: core
applies_when: "When adding transitions to UI state changes — panel reveals, modal entrances, hover effects — and you need to set appropriate durations and easing curves."
---

## Principle
Use transitions of 150-300ms duration for UI state changes to help users track what changed, where elements moved, and how the interface reached its new state.

## Why It Matters
Instant state changes (0ms) cause disorientation — elements appear and disappear without the user understanding what happened or where things went. Slow animations (500ms+) make the interface feel sluggish and waste the user's time. The 150-300ms sweet spot is fast enough to feel responsive while slow enough for the human visual system to track the movement. Transitions serve a functional purpose: they communicate causality (this moved because of that), maintain spatial orientation (this panel slid in from the right), and reduce change blindness (this value just updated).

## Application Guidelines
- Use 150ms for micro-transitions: button state changes, hover effects, checkbox toggles, tooltip appearances
- Use 200-300ms for component transitions: panel reveals, modal entrances, accordion expansions, page transitions
- Use ease-out curves for elements entering the viewport (they arrive quickly and settle slowly) and ease-in for elements exiting
- Never animate elements that the user needs to interact with during the transition — the animation must complete before the element becomes interactive
- Respect user preferences: honor the prefers-reduced-motion media query by reducing or eliminating animations for users who have enabled that setting
- Animate meaningful properties (position, opacity, scale) rather than decorative ones (color cycling, bouncing) to maintain a professional feel

## Anti-Patterns
- Using 800ms ease-in-out animations for every UI transition — dropdown opens, page navigations, modal appearances — making the interface feel slow and unresponsive because every action requires waiting nearly a full second for an animation to complete before the user can proceed
