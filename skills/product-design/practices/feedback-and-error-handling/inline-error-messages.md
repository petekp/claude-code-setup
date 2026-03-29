---
title: Inline Error Messages — Proximity to Source Field
category: Feedback & Error Handling
tags: [form, error-handling, validation, accessibility, gestalt]
priority: core
applies_when: "When displaying validation errors on a form and positioning error messages relative to the fields that caused them."
---

## Principle
Error messages must appear directly adjacent to the field or element that caused the error, not in a remote summary at the top or bottom of the page.

## Why It Matters
When an error message appears at the top of a form while the problematic field is scrolled off-screen, users must map the error description to the correct field — a cognitively expensive task that becomes harder as form length increases. Inline placement leverages spatial proximity to make the connection between error and source instant and unambiguous. This reduces fix time, prevents users from correcting the wrong field, and makes error resolution feel guided rather than punishing.

## Application Guidelines
- Display error messages directly below (or beside) the field that triggered the error, using a consistent position across all fields
- Use color, an icon, and a visible border change on the field itself to draw attention to the error location — but never rely on color alone
- When a form has multiple errors, highlight all erroneous fields simultaneously and scroll to (or focus) the first one
- If a page-level error summary is also provided (for accessibility or complex forms), make each item in the summary a link that scrolls to and focuses the relevant field
- Maintain the inline error message until the user corrects the input — do not auto-dismiss error messages on a timer
- Ensure error messages do not cause layout shifts that push other fields around, which can disorient users mid-correction

## Anti-Patterns
- Displaying all validation errors in a red box at the top of a long form with messages like "Field 3 is invalid" that require the user to count fields to figure out which one needs attention, with no visual indication on the fields themselves
