---
title: "Proximity Anti-Pattern: USPS-Style Form Field Misalignment"
category: Gestalt Principles
tags: [form, layout, gestalt]
priority: situational
applies_when: "When positioning form labels and you need to ensure each label is unambiguously closer to its own field than to any neighboring field."
---

## Principle
When labels are equidistant from multiple fields, proximity fails to associate the label with the correct input, creating ambiguity that leads to user errors.

## Why It Matters
The classic USPS shipping form is a well-known example: labels float between fields so users cannot tell whether a label belongs to the field above or below it. This ambiguity causes misfilled forms, increased support requests, and user frustration. In high-stakes contexts (medical forms, legal documents, financial applications), a proximity failure can produce serious real-world consequences.

## Application Guidelines
- Place labels closer to their associated field than to any adjacent field -- a minimum 2:1 distance ratio between the label-to-own-field gap and the label-to-neighboring-field gap
- Prefer top-aligned labels directly above their input, which creates the strongest proximity bond and eliminates vertical ambiguity
- When using left-aligned labels, ensure the horizontal gap between label and field is smaller than the vertical gap between form rows
- Group related fields (e.g., first name / last name) in a shared visual container or row to reinforce which labels map to which inputs

## Anti-Patterns
- Centering labels vertically between two stacked input fields so the association is ambiguous
- Using uniform vertical spacing throughout a form with no differentiation between intra-group and inter-group gaps
- Placing helper text or error messages in a location closer to the wrong field than to the field they describe
