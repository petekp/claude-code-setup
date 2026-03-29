---
title: Meaningful Alternative Text for Images and Data Visualizations
category: Accessibility
tags: [data-viz, icon, accessibility]
priority: core
applies_when: "When any non-decorative image or data visualization needs alternative text that conveys the same information the visual communicates to sighted users."
---

## Principle
Every non-decorative image and data visualization must have alternative text that conveys the same information or function that the visual element communicates to sighted users.

## Why It Matters
Alternative text is the screen reader user's only access to visual content. When alt text is missing, screen readers announce the file name ("IMG_3847.png"), which communicates nothing. When alt text is generic ("image" or "chart"), users know something visual exists but cannot access its content. When alt text is well-written, screen reader users receive the same information and context as sighted users. For data visualizations, this means conveying the insight the chart communicates, not just describing its visual appearance.

## Application Guidelines
- Write alt text that conveys the purpose and content: "Bar chart showing Q3 revenue of $4.2M, up 15% from Q2" rather than "Bar chart" or "Revenue chart"
- For functional images (icons used as buttons), describe the action: alt="Close dialog" not alt="X icon"
- For decorative images that add no informational value, use an empty alt attribute (`alt=""`) so screen readers skip them entirely
- For complex data visualizations, provide a brief alt text summary plus a detailed description via `aria-describedby` or an expandable text alternative
- For user-uploaded images, prompt users to provide alt text at upload time and offer AI-generated suggestions as a starting point
- For informational images (diagrams, screenshots, infographics), describe the key information the image conveys, not just its visual appearance
- Review and update alt text when content changes — stale alt text that does not match the current image is misleading

## Anti-Patterns
- Missing alt attributes entirely, causing screen readers to announce the file path or URL
- Generic alt text on every image: alt="image", alt="photo", alt="icon" — these add noise without information
- Alt text that describes visual appearance instead of meaning: "Blue line going up to the right" instead of "Monthly active users increased from 10K to 45K over the past year"
- Decorative background images or icons that have alt text, causing screen readers to announce meaningless content
