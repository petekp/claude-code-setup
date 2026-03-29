---
title: Exposing Options vs. Hiding in Dropdowns for Primary Choices
category: Interaction Patterns
tags: [form, button, recognition, hicks-law]
priority: situational
applies_when: "When presenting a small number of mutually exclusive choices (2-5 options) and deciding between visible selectors (tabs, radio cards) and a dropdown."
---

## Principle
When users must choose among a small number of primary options, expose all choices visually (as buttons, tabs, or radio cards) rather than hiding them behind a dropdown that requires a click to reveal.

## Why It Matters
Dropdowns hide information behind an interaction — the user must click to see what choices exist, evaluate them from a transient list, and click again to select. For primary choices that define the user's path (view mode, content type, pricing tier, account type), hiding options in a dropdown adds friction and reduces the discoverability of alternatives. Visible options let users scan and compare without additional clicks, leading to faster and more informed decisions. Dropdowns are appropriate for long lists, not for 2-5 primary choices.

## Application Guidelines
- For 2-5 mutually exclusive primary options, use segmented controls, tab bars, radio button groups, or card-based selectors rather than dropdowns
- Reserve dropdowns for selections with 6+ options where showing all choices would consume excessive screen space
- When options have meaningful differences, use card-based selectors that can include descriptions, icons, or preview visuals alongside each option
- If one option is recommended, highlight it visually while keeping all options equally accessible
- Ensure the selected option is clearly indicated in visible selectors (filled state, border, checkmark) so the current selection is always apparent
- For responsive design, exposed options can collapse to a dropdown at narrow breakpoints — but default to exposed on larger screens

## Anti-Patterns
- Hiding a critical choice between "Individual" and "Business" account types inside a dropdown on a signup form, when two radio cards with descriptions would let users understand and choose between the options without any additional clicks
