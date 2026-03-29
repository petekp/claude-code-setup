---
title: Color Contrast — Minimum 4.5:1 for Normal Text
category: Accessibility
tags: [text, accessibility, theming]
priority: core
applies_when: "You are placing text on any background color, designing a color palette or theme, or auditing an interface for WCAG compliance."
---

## Principle
All text must meet a minimum contrast ratio of 4.5:1 against its background for normal text and 3:1 for large text (18px+ or 14px+ bold), ensuring readability for users with low vision.

## Why It Matters
Insufficient color contrast is the single most common accessibility failure found in automated audits, affecting an estimated 85%+ of websites. Low contrast text is not merely an annoyance — for users with low vision, cataracts, or age-related vision changes (which will eventually affect most people), it renders content literally unreadable. Even users with perfect vision experience increased eye strain and slower reading speed with low-contrast text, especially on mobile devices in bright environments. WCAG 2.1 Level AA requires 4.5:1 for normal text and 3:1 for large text.

## Application Guidelines
- Use a contrast checking tool (WebAIM Contrast Checker, Figma plugins like Stark or A11y) during design, not just in code review
- Test all text-background combinations, including text on images, text on gradients, and text on colored backgrounds
- Ensure placeholder text in form inputs meets contrast requirements — many default implementations fail this
- For UI components and graphical objects (icons, borders, focus indicators), maintain at least a 3:1 contrast ratio against adjacent colors
- Be especially careful with light gray text on white backgrounds, white text on colored buttons, and text overlaid on images or videos
- Consider providing a high-contrast mode or theme for users who need even stronger contrast
- For text on images, use a semi-transparent overlay, text shadow, or contained text box to guarantee contrast regardless of image content

## Anti-Patterns
- Light gray placeholder text (#999 or lighter) on a white background, which typically fails the 4.5:1 ratio
- White text on a pastel or medium-saturation colored button that looks fine on the designer's calibrated monitor but fails on low-quality displays
- Text overlaid directly on a photograph with no overlay or background treatment, where contrast varies by image
- Disabled text that is so low-contrast it becomes completely invisible rather than merely de-emphasized
