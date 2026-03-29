---
title: "Element Interactivity Management: Decouple Interconnected Decisions"
category: Cognitive Load
tags: [form, settings, cognitive-load]
priority: situational
applies_when: "When designing configuration panels or forms where changing one field affects the options or validity of other fields."
---

## Principle
When multiple interface elements affect each other, make their relationships explicit and reduce the number of elements that must be considered simultaneously.

## Why It Matters
Element interactivity — the degree to which elements must be processed together rather than independently — is a primary driver of intrinsic cognitive load. A form where changing one field changes the options in three other fields, or a configuration panel where every setting interacts with every other setting, forces users to mentally simulate cascading effects. The more interconnected the elements, the more cognitive resources required. Decoupling these relationships, or at least making them visible and predictable, keeps the task tractable.

## Application Guidelines
- When field values depend on other fields, update dependent fields automatically and visibly rather than relying on users to track the cascade
- Isolate independent decision groups into separate sections or steps so users can focus on one group at a time
- Provide real-time previews that show the combined effect of multiple interacting settings
- Use clear visual connections (lines, grouping, color coding) to show which elements are related
- For highly interactive configurations, offer presets or templates that set multiple interacting values to known-good combinations

## Anti-Patterns
- Configuration panels where changing one setting silently invalidates others without notification
- Forms with hidden dependencies that only surface as validation errors after submission
- Requiring users to mentally calculate the combined effect of multiple independent sliders or toggles
- Presenting interacting and non-interacting elements with identical visual treatment, hiding the relationships
