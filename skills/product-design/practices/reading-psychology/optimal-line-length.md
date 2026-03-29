---
title: "Optimal Line Length: 45-75 Characters for Maximum Readability"
category: Reading Psychology
tags: [text, layout, responsive]
priority: situational
applies_when: "When setting max-width on text containers, designing content columns, or noticing that body text spans too wide on large screens."
---

## Principle
Body text should be set at 45-75 characters per line (including spaces), with 66 characters as the ideal target, to maximize reading speed and comprehension.

## Why It Matters
Line length directly affects reading rhythm. Lines that are too short cause excessive line breaks that fragment thoughts and force constant eye movement back to the left margin. Lines that are too long make it difficult for the eye to track back to the start of the next line, causing readers to lose their place or accidentally re-read lines. The 45-75 character range, derived from centuries of typographic practice and confirmed by modern readability research, represents the sweet spot where the eye can comfortably sweep across a line and return accurately.

## Application Guidelines
- Set a max-width on text containers rather than letting prose span the full viewport — a max-width of 65ch on the content block is a reliable starting point
- For wide layouts (dashboards, admin panels), constrain text columns even if the overall layout is fluid
- Allow narrower line lengths (40-50 characters) for mobile and sidebar contexts, but avoid going below 35 characters where fragmentation becomes severe
- Multi-column layouts should each independently maintain optimal line lengths rather than splitting a single wide column
- Test line length at the actual font size and typeface being used — character width varies significantly between fonts

## Anti-Patterns
- Allowing body text to stretch edge-to-edge across a 1920px monitor with no max-width constraint, producing lines of 150+ characters that are nearly impossible to track accurately
