---
title: Dark Mode — Dark Gray, Not Pure Black
category: Desktop-Specific Patterns
tags: [layout, text, theming, accessibility]
priority: situational
applies_when: "When implementing a dark mode color scheme and choosing background colors, text colors, and contrast ratios for comfortable extended reading."
---

## Principle
Use dark gray backgrounds (#1a1a1a to #2d2d2d) rather than pure black (#000000) for dark mode interfaces to reduce eye strain, maintain elevation hierarchy, and produce a more refined visual experience.

## Why It Matters
Pure black backgrounds create excessive contrast against white or light-colored text, causing halation — a visual phenomenon where bright text appears to bleed into the dark background, making extended reading uncomfortable. Dark gray provides sufficient contrast for readability while allowing designers to use darker shades for depth and elevation. Material Design and Apple's Human Interface Guidelines both recommend off-black backgrounds for this reason.

## Application Guidelines
- Use a base background of #1a1a1a to #212121 for the primary surface, reserving #000000 only for true OLED power-saving contexts (mobile)
- Create elevation hierarchy through lightness: base surface at ~#1a1a1a, raised cards at ~#242424, modals at ~#2d2d2d, tooltips at ~#383838
- Maintain a minimum contrast ratio of 4.5:1 for body text (WCAG AA) using off-white text (#e0e0e0 to #f0f0f0) rather than pure white (#ffffff)
- Desaturate accent colors by 10-20% in dark mode to prevent oversaturation and vibrating color effects against dark backgrounds
- Use subtle, low-opacity borders (#ffffff at 8-12% opacity) rather than solid colored borders for separating elements
- Test dark mode on both high-end displays and standard office monitors; dark modes look dramatically different at low brightness

## Anti-Patterns
- Using pure black (#000000) backgrounds with pure white (#ffffff) text, creating uncomfortable maximum contrast
- Applying the same color palette in dark mode as light mode without adjusting saturation, producing neon-like accent colors
- Losing elevation hierarchy by using the same dark shade for all surfaces — cards, backgrounds, and modals blend together
- Neglecting to adjust shadow colors in dark mode; black shadows on dark backgrounds are invisible, so elevation must come from surface lightness
