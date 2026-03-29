---
title: Typographic Scale Principles
category: Design Systems & Tokens
tags: [text, layout, scanning, consistency]
priority: core
applies_when: "When defining or enforcing a typographic scale with harmonious size ratios that create clear visual hierarchy across the application."
---

## Principle
Define a harmonious typographic scale with a limited set of font sizes, weights, and line heights that create clear visual hierarchy, and enforce this scale as the only source of text styling across the application.

## Why It Matters
Typography is the primary vehicle for information hierarchy in text-heavy enterprise applications. When developers pick arbitrary font sizes — 13px here, 15px there, 17px somewhere else — the result is a visual cacophony where nothing feels organized and users struggle to distinguish headings from body text from captions. A deliberate typographic scale, like a musical scale, creates harmonious relationships between sizes that make hierarchy instantly perceivable and the interface feel professionally designed.

## Application Guidelines
- Choose a scale ratio (1.200 minor third, 1.250 major third, or 1.333 perfect fourth) and generate sizes mathematically: e.g., 12, 14, 16, 20, 24, 30, 36 for a ~1.2 ratio from a 16px base
- Limit the scale to 6-8 sizes maximum: caption (12px), body-small (14px), body (16px), heading-4 (18-20px), heading-3 (24px), heading-2 (30px), heading-1 (36px)
- Define corresponding line heights for each size: tighter for headings (1.2-1.3), more spacious for body text (1.5-1.6)
- Assign font weights intentionally: regular (400) for body, medium (500) for emphasis, semibold (600) for subheadings, bold (700) for headings
- Create named text styles in the design system (body, body-small, heading-1 through heading-4, caption, label) that bundle size, weight, line-height, and letter-spacing
- Enforce the scale in code: components should reference named text style tokens, never raw font-size values

## Anti-Patterns
- Allowing arbitrary font sizes throughout the codebase, resulting in 15+ different sizes that have no harmonic relationship
- Using only size to create hierarchy without varying weight, leading to headings that are just slightly larger body text
- Defining a typographic scale but not enforcing it, so developers gradually introduce off-scale sizes
- Using the same line-height for all font sizes, producing cramped headings and overly spacious small text
