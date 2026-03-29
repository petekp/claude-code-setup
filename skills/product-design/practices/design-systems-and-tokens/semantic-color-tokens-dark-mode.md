---
title: Semantic Color Tokens for Dark Mode Theme Switching
category: Design Systems & Tokens
tags: [layout, theming, accessibility]
priority: situational
applies_when: "When implementing dark mode or theme switching and you need semantic color tokens so components reference purpose rather than literal color values."
---

## Principle
Define colors as semantic tokens that describe purpose (background-surface, text-primary, border-subtle) rather than appearance (gray-100, blue-500), enabling theme switching between light and dark modes by remapping token values without changing component code.

## Why It Matters
When components reference literal color values (color: #333333), switching to dark mode requires finding and updating every color reference in the codebase — a maintenance nightmare that inevitably produces inconsistencies. Semantic tokens create an abstraction layer: components reference color-text-primary and the theme decides what color that maps to. Light mode maps it to dark gray; dark mode maps it to light gray. This makes theme switching a matter of swapping a token map, not editing hundreds of components.

## Application Guidelines
- Define three token layers: global primitives (blue-500, gray-200), semantic aliases (color-text-primary, color-bg-surface), and component tokens (button-bg, card-border)
- Components should only reference semantic or component tokens, never primitives — this is the enforcement point for theme-ability
- Create semantic tokens for every distinct purpose: surface backgrounds (multiple elevation levels), text (primary, secondary, disabled), borders (default, subtle, strong), interactive states (hover, active, focus), and status colors
- Define complete token maps for both light and dark themes, ensuring every semantic token has a value in both contexts
- Test the full application in both themes as part of QA — don't treat dark mode as a secondary afterthought
- Support a "system" preference option that follows the OS theme setting, with manual override available

## Anti-Patterns
- Using hardcoded hex values in component styles, making theme switching impossible without a codebase-wide find-and-replace
- Creating semantic tokens but allowing components to bypass them with direct color references, gradually eroding the token system
- Generating dark mode values mechanically (just invert all colors) without testing for readability, contrast, and aesthetic quality
- Defining tokens only for the most common cases, forcing developers to use raw values for edge cases, which breaks in theme switches
