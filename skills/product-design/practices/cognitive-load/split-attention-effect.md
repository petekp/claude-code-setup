---
title: "Fix the Split-Attention Effect: Co-Locate Labels With Their Referents"
category: Cognitive Load
tags: [form, data-viz, error-handling, cognitive-load]
priority: situational
applies_when: "When placing labels, error messages, help text, or legends relative to the elements they describe, especially in forms, charts, and complex layouts."
---

## Principle
Place explanatory information — labels, descriptions, error messages, and help text — directly adjacent to the element it describes, not in a separate location.

## Why It Matters
The split-attention effect occurs when users must mentally integrate two or more sources of information that are physically separated on screen. Every time a user's eye must jump from a form field to a distant error message, from a chart to a remote legend, or from an icon to a tooltip in another corner, they pay a cognitive tax to re-establish context. This fragmented layout forces users to hold one piece of information in memory while searching for its counterpart, consuming working memory capacity that should be spent on the task itself.

## Application Guidelines
- Place form field labels directly above or to the left of the field, never in a separate column or distant legend
- Display validation errors inline next to the offending field, not in a summary block at the top or bottom of the form
- Embed chart legends and annotations directly on or adjacent to the relevant data points
- Position help text and tooltips near the element they explain, triggered by proximity-based interactions
- In code editors or complex tools, show contextual information (documentation, type hints) in-situ rather than in a separate panel

## Anti-Patterns
- Error summaries at the top of a page that list field names without visual connection to the actual fields
- Footnote-style references that require scrolling to find the explanation
- Chart legends placed far from the chart, requiring constant eye movement to decode colors
- Instructions on a separate page or collapsed section that users must reference while performing actions elsewhere
