---
title: "Contrast Sensitivity: Meet WCAG Standards for All Text"
category: Reading Psychology
tags: [text, accessibility, theming]
priority: core
applies_when: "When choosing text and background color combinations, designing color palettes, or auditing an interface for WCAG contrast compliance."
---

## Principle
All text must meet or exceed WCAG 2.1 contrast ratios to ensure legibility across vision abilities, screen types, and ambient lighting conditions.

## Why It Matters
Approximately 1 in 12 men and 1 in 200 women have some form of color vision deficiency, and every user experiences reduced contrast sensitivity in bright sunlight or on low-quality displays. When text fails contrast thresholds, users don't just struggle — they abandon. Insufficient contrast is the single most common accessibility failure found in automated audits, and it disproportionately punishes older users whose contrast sensitivity declines naturally with age.

## Application Guidelines
- Maintain a minimum contrast ratio of 4.5:1 for normal text (under 18px) and 3:1 for large text (18px+ bold or 24px+ regular) per WCAG AA
- Target AAA compliance (7:1 for normal text, 4.5:1 for large text) for body copy and any text users must read to complete a task
- Never rely on color alone to convey meaning — pair color coding with icons, labels, or patterns
- Test contrast in both light and dark modes, and verify against simulated color blindness (protanopia, deuteranopia, tritanopia)
- Use tools like the WebAIM Contrast Checker or browser DevTools accessibility audits during design handoff, not just at QA

## Anti-Patterns
- Using light gray text on white backgrounds for "aesthetic minimalism" — this sacrifices readability for style and commonly drops below 2:1 contrast ratio, failing even the most lenient thresholds
