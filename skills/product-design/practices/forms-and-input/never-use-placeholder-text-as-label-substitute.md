---
title: Never Use Placeholder Text as a Substitute for Labels
category: Forms & Input
tags: [form, text, accessibility, cognitive-load]
priority: core
applies_when: "When labeling form fields or considering whether placeholder text alone provides sufficient context for users."
---

## Principle
Placeholder text must never replace a visible, persistent label — it should only provide supplementary hints about format or expected content.

## Why It Matters
Placeholder text disappears the moment a user begins typing, eliminating the only context for what the field expects. This forces users to delete their input to recall the instruction, creates accessibility failures for screen readers that may not announce placeholder content, and violates WCAG guidelines. The problem compounds in longer forms where users tab between fields — without persistent labels, they lose track of which field they are editing.

## Application Guidelines
- Always provide a visible label above or to the left of every form field, regardless of whether placeholder text is also present
- Use placeholder text only for supplementary format hints (e.g., "MM/DD/YYYY" or "e.g., john@example.com"), never for the field's identity
- Ensure labels remain visible and associated with their fields at all times, including when the field is focused or filled
- Use floating labels (labels that animate from placeholder position to above the field on focus) only if the label remains persistently visible after the transition
- For search fields and other single-purpose inputs where context is unambiguous, an icon plus placeholder may suffice — but pair with an aria-label for accessibility

## Anti-Patterns
- Using placeholder text as the only indication of what a field expects, so that once the user types a single character, all context about the field's purpose vanishes and cannot be recovered without clearing the input
