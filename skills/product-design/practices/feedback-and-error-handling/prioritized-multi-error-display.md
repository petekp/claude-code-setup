---
title: Prioritized Multi-Error Display
category: Feedback & Error Handling
tags: [form, error-handling, validation, cognitive-load, scanning]
priority: situational
applies_when: "When a form or flow can produce multiple simultaneous errors and you need to guide the user through fixing them in a prioritized order."
---

## Principle
When multiple errors exist simultaneously, display them in a prioritized, structured format that guides the user to fix the most impactful issues first rather than presenting an undifferentiated error dump.

## Why It Matters
A form with eight errors is overwhelming if they are all presented as an equal-weight red list. Users do not know where to start, which errors might resolve other errors (e.g., selecting a country might auto-populate the correct phone format), or which errors are blocking submission versus advisory. Prioritized display reduces cognitive load, creates a clear path through the corrections, and prevents the discouragement that causes users to abandon rather than fix.

## Application Guidelines
- Order errors by severity (blocking before advisory) and by form position (top-to-bottom matching the field order) so users can work through them sequentially
- Auto-focus or scroll to the first error field so the user has an immediate starting point
- For dependent errors, fix the root cause first and re-validate: if selecting "United States" as the country would fix three address-format errors, guide the user to the country field first
- Show a summary count ("3 fields need attention") alongside inline errors to set expectations for the correction effort
- Collapse resolved errors in real-time as the user fixes them, providing a sense of progress
- Limit the number of simultaneously displayed errors when possible — for very long forms, validate section by section rather than showing 30 errors at once

## Anti-Patterns
- Dumping 15 validation errors into a single red box at the top of a form in the order they were detected by the validation engine, with no prioritization, no links to the fields, and no indication of which are blocking versus which are warnings
