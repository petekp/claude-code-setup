---
title: Inline Validation — Validate on Field Blur, Not on Keystroke
category: Forms & Input
tags: [form, validation, error-handling, feedback-loop, accessibility]
priority: core
applies_when: "When adding validation to form fields or designing error feedback for user input."
---

## Principle
Validate form fields inline as the user completes each one (on blur), not while they are still typing (on keystroke) or only after full form submission.

## Why It Matters
Validation on keystroke is disruptive — it shows error messages before the user has finished entering their input, creating a hostile "you're wrong" experience with every character. Validation only on submit forces users to scroll back through the form to find and fix multiple errors, losing context. Inline validation on blur strikes the right balance: it catches errors immediately after the user signals they are done with a field, while the field's context is still fresh in working memory.

## Application Guidelines
- Validate on blur (when the user tabs or clicks away from a field) for format and completeness checks
- For fields with specific format requirements (email, URL, phone), show validation results on blur, not on every keystroke
- Show success indicators (a green checkmark) on blur for fields that require server-side validation (e.g., username availability) to confirm the input was accepted
- For password fields, showing real-time strength meters on keystroke is acceptable because it provides constructive guidance rather than error messaging
- Display error messages directly below or beside the field, using color and an icon (not color alone) to ensure accessibility
- Clear error messages as soon as the user begins correcting the field — do not wait for another blur event

## Anti-Patterns
- Showing a "Please enter a valid email address" error after the user has typed only "j" into the email field, punishing them for not having finished typing yet
