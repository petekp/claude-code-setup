---
title: Group Related Form Fields With Section Headings
category: Forms & Input
tags: [form, layout, accessibility, gestalt, scanning]
priority: core
applies_when: "When building a form with more than 6-8 fields that need logical grouping to reduce perceived complexity and aid scanning."
---

## Principle
Related form fields should be visually grouped under descriptive section headings that communicate the purpose of each cluster, creating a scannable hierarchy.

## Why It Matters
An undifferentiated wall of form fields overwhelms users and makes it impossible to estimate completion effort. Grouping fields into logical sections leverages the Gestalt principle of proximity to communicate relationships, reduces perceived complexity, and enables users to orient themselves within the form. Section headings serve as landmarks that support both scanning and resumption — if a user is interrupted, headings help them find where they left off.

## Application Guidelines
- Group fields into sections of 3-7 fields each, organized by topic (e.g., "Personal Information," "Payment Details," "Notification Preferences")
- Use clear, descriptive section headings — not clever or branded names — that tell the user exactly what information the section collects
- Add subtle visual separators (whitespace, light horizontal rules, or card boundaries) between sections to reinforce grouping
- Maintain consistent internal structure within sections: label placement, field widths, and spacing should be uniform
- For very long forms, consider collapsible sections that let users focus on one group at a time while maintaining awareness of the full scope
- Use fieldset and legend elements in HTML to ensure section groupings are accessible to screen readers

## Anti-Patterns
- Presenting 20+ fields in a single unbroken column with no headings, separators, or grouping — making the form appear longer and more burdensome than it actually is, and preventing users from building a mental map of the information requested
