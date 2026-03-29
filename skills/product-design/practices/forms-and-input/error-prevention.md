---
title: Error Prevention
category: Forms & Input
tags: [form, validation, error-handling, affordance, cognitive-load]
priority: core
applies_when: "When designing any form or input flow where constraining the interface can prevent user errors before they occur."
---

## Principle
The best error message is the one that never needs to appear — design interfaces that make errors difficult or impossible to commit in the first place.

## Why It Matters
Recovering from errors is always more costly than preventing them. Every error forces the user to context-switch from their goal to diagnosing and fixing a mistake, breaking flow and eroding confidence. Error prevention is particularly critical for irreversible actions (deleting data, sending messages, financial transactions) where recovery may be impossible. Well-designed constraints and affordances guide users toward valid inputs naturally.

## Application Guidelines
- Use constrained input controls (date pickers, dropdowns, sliders) instead of free-text fields whenever the valid input set is bounded
- Disable or hide actions that are not available in the current state rather than allowing the user to attempt them and fail
- Apply input masks and formatting helpers (phone numbers, credit cards, SSNs) to guide correct entry and reduce format errors
- Implement real-time character counters for fields with length limits, showing remaining characters rather than just a maximum
- Use confirmation steps with explicit summaries before irreversible actions — show the user exactly what will happen before they commit
- Set sensible min/max values, step increments, and type attributes on numeric and date inputs to prevent out-of-range entries at the browser level

## Anti-Patterns
- Accepting any free-text input for structured data (dates, phone numbers, currencies) and then rejecting it after submission with a vague format error, when a constrained input control would have prevented the mistake entirely
