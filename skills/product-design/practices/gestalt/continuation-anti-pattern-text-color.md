---
title: "Continuation Anti-Pattern: Text Color Overriding Reading Order"
category: Gestalt Principles
tags: [text, layout, gestalt, scanning]
priority: niche
applies_when: "When using colored or highlighted text inline and you need to prevent the color from creating a visual path that overrides the natural reading order."
---

## Principle
When colored or highlighted text fragments create a stronger visual path than the natural reading order, the eye follows the color continuation rather than the intended left-to-right, top-to-bottom flow.

## Why It Matters
Highlighting, brand-colored keywords, or inline colored labels can accidentally create a visual "thread" that the eye follows across the page, jumping over unhighlighted text. Instead of reading linearly, users chase the colored words, missing the context between them. This distorts comprehension and can make critical non-highlighted information invisible.

## Application Guidelines
- Limit colored inline text to single occurrences or small clusters rather than scattering highlights across a paragraph
- When using inline color for status labels or tags, ensure they are spatially separated enough that they do not form a competing visual path
- Prefer bold or weight changes over color changes for emphasis within body text, as weight shifts are less likely to create continuation paths
- If multiple highlights are necessary, use a consistent background highlight (like a marker) rather than text color changes, which are more likely to form connecting threads

## Anti-Patterns
- Coloring every third keyword in a paragraph for "emphasis," which creates a dotted visual path that overrides reading order
- Using red text for errors scattered throughout a form so the red fragments create a visual line that pulls attention away from the fields themselves
- Applying link-colored text to non-link content, creating false continuation paths that users attempt to follow
