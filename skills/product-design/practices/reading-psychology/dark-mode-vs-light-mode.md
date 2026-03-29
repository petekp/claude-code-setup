---
title: "Dark Mode vs. Light Mode: Default to Light for Readability"
category: Reading Psychology
tags: [text, theming, accessibility]
priority: situational
applies_when: "When implementing dark mode, choosing default polarity for a text-heavy application, or adjusting contrast and background colors for dark themes."
---

## Principle
Default to light mode (dark text on light background) for reading-heavy interfaces, while offering dark mode as an option — and when implementing dark mode, reduce contrast to avoid halation.

## Why It Matters
Research on positive polarity (dark text on light background) versus negative polarity (light text on dark background) consistently shows that positive polarity produces faster reading speeds and better proofreading accuracy for most users in most lighting conditions. This is because the human pupil constricts more in bright conditions, increasing depth of field and visual acuity. However, dark mode reduces eye strain in low-light environments and is strongly preferred by many users — making it an essential option, not something to omit. The key is implementing each mode correctly rather than choosing only one.

## Application Guidelines
- Default to light mode for text-heavy applications (documentation, email, long-form content); offer dark mode as a user-controlled toggle
- In dark mode, reduce text contrast to approximately 85-90% white rather than pure white (#FFFFFF) on pure black (#000000) — full contrast causes halation (glowing/blurring) that reduces readability
- Use slightly elevated dark backgrounds (#1A1A1A or #121212) rather than pure black to reduce the harshness of the contrast
- Ensure all color coding, status indicators, and semantic colors are re-tested in dark mode — colors that are distinct on white may be indistinguishable on dark backgrounds
- Respect the OS-level preference (prefers-color-scheme) as the default, but always allow manual override

## Anti-Patterns
- Implementing dark mode by simply inverting all colors, producing pure white text on pure black backgrounds with garish accent colors — this creates a visually harsh experience that causes more eye fatigue than the light mode it was meant to replace
