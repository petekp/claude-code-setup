---
title: Single-Column Form Layouts and Logical Field Sequencing
category: Forms & Input
tags: [form, layout, scanning, mental-model]
priority: core
applies_when: "When laying out a form and deciding on field arrangement, column count, and the logical sequencing of fields."
---

## Principle
Forms should use a single-column layout with fields ordered in a logical sequence that matches the user's mental model of the task.

## Why It Matters
Multi-column form layouts break the user's vertical reading flow and introduce ambiguity about field ordering — users may read left-to-right or top-to-bottom, leading to skipped fields and input errors. Eye-tracking studies consistently show that single-column forms have faster completion times and lower error rates. Logical sequencing (e.g., first name before last name, street before city before zip) reduces cognitive load by matching the order in which people naturally think about information.

## Application Guidelines
- Use a single-column layout for all forms; reserve multi-column only for tightly coupled short fields like city/state/zip or first/last name
- Sequence fields to match real-world mental models: personal info before contact info, billing before shipping, general before specific
- Group fields into labeled sections when a form exceeds 6-8 fields, maintaining logical flow within and between groups
- Place optional fields after required fields within each logical group, and clearly mark them as optional rather than marking required fields
- For address forms, follow the postal convention of the user's locale (e.g., street-city-state-zip in the US, different ordering in Japan or the UK)

## Anti-Patterns
- Placing unrelated fields side-by-side in a multi-column grid to "save space," forcing users to zigzag through the form and increasing completion time by 20-60%
