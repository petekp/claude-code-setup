---
title: 8pt Grid Spatial System
category: Design Systems & Tokens
tags: [layout, button, form, consistency]
priority: core
applies_when: "When defining or enforcing a spatial system and all spacing, sizing, and layout dimensions should be based on 8px multiples."
---

## Principle
Base all spacing, sizing, and layout dimensions on multiples of 8 pixels (with 4px for fine adjustments) to create consistent, harmonious visual rhythm throughout the interface.

## Why It Matters
When developers choose arbitrary spacing values — 5px here, 7px there, 13px somewhere else — the result is a subtly but perceptibly uneven interface that feels unpolished without users being able to articulate why. An 8pt grid system eliminates this by constraining all spatial decisions to a predictable set of values (4, 8, 16, 24, 32, 40, 48, 64). This mathematical consistency produces interfaces with even rhythm and alignment, scales cleanly across screen densities, and simplifies design-to-development communication.

## Application Guidelines
- Define a spacing scale based on 8pt increments: 4px (xs), 8px (sm), 16px (md), 24px (lg), 32px (xl), 48px (2xl), 64px (3xl)
- Use these spacing values for all padding, margins, gaps, and offsets — never use arbitrary values like 5px, 10px, or 15px
- Allow 4px as the minimum unit for fine adjustments (icon padding, badge margins, border offsets) where 8px is too large
- Size components on the 8pt grid: buttons at 32px or 40px height, input fields at 40px, avatars at 32px or 48px
- Apply the grid to layout dimensions: sidebar width at 240px (30x8), card width at 320px (40x8), etc.
- Configure design tools (Figma, Sketch) with 8px grid overlay and snap-to-grid enabled to enforce the system during design
- Define spacing tokens (space-1 through space-8) that map to the grid values, so components reference tokens rather than raw pixel values

## Anti-Patterns
- Using arbitrary spacing values (margin: 5px, padding: 13px, gap: 7px) that have no mathematical relationship to each other
- Mixing different spatial systems (some areas on 8pt, others on 5pt, others on 10pt) within the same application
- Defining the 8pt grid but not enforcing it in code, allowing gradual drift as developers eyeball spacing values
- Applying the grid rigidly to everything including text line-heights and icon sizes where other considerations (readability, optical alignment) should take precedence
