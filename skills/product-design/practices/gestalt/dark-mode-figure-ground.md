---
title: "Dark Mode Figure-Ground Inversion"
category: Gestalt Principles
tags: [layout, modal, theming, gestalt]
priority: situational
applies_when: "When implementing or auditing a dark mode theme and you need to re-establish figure-ground hierarchy using surface color instead of shadows."
---

## Principle
Switching from light to dark mode inverts the figure-ground relationship, requiring deliberate re-evaluation of elevation, contrast, and visual hierarchy to maintain clarity.

## Why It Matters
In light mode, elevated elements (cards, modals) are typically lighter than the background and use drop shadows for depth. Simply inverting colors in dark mode often flattens this hierarchy because shadows become invisible against dark surfaces and lighter backgrounds become the figure. Without intentional adjustment, users lose the ability to distinguish interactive surfaces from the background.

## Application Guidelines
- Use progressively lighter surface colors (not shadows) to convey elevation in dark mode (e.g., Material Design's overlay system)
- Ensure text contrast ratios meet WCAG AA (4.5:1 for body, 3:1 for large text) after the inversion -- do not assume light-mode ratios hold
- Re-test all overlay elements (tooltips, dropdowns, modals) in dark mode to confirm the figure layer is visually distinct from the ground
- Reduce pure white (#FFFFFF) text on pure black (#000000) backgrounds to avoid halation; prefer off-white on dark gray

## Anti-Patterns
- Naively inverting all colors and assuming the hierarchy remains intact
- Using the same drop-shadow values in dark mode as in light mode, where they become invisible
- Allowing low-contrast figure-ground situations where cards blend into the dark background
