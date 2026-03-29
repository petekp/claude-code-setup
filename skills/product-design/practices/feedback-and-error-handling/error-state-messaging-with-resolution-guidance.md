---
title: Error State Messaging with Resolution Guidance
category: Feedback & Error Handling
tags: [notification, text, error-handling, feedback-loop]
priority: core
applies_when: "When designing error states and ensuring every error message tells users what went wrong and provides a clear path to resolution."
---

## Principle
Every error message should tell the user what went wrong and provide a clear, actionable path to resolve it — never leave users at a dead end.

## Why It Matters
An error message that only describes the problem ("Something went wrong") without suggesting a solution leaves users stranded. They must guess what to do, search help documentation, or contact support — all of which increase frustration and time to resolution. Error messages are a moment of vulnerability in the user experience; handling them with clear guidance transforms a frustrating failure into a recoverable situation and demonstrates that the product was designed to support users when things go wrong.

## Application Guidelines
- Structure error messages in two parts: (1) what happened, stated plainly, and (2) what to do about it, with a specific action
- Provide direct action links or buttons when possible: "Your session expired. Log in again." with a "Log In" button
- For transient errors (network timeout, rate limit), offer an automatic or one-click retry rather than making users figure out how to retrigger the action
- For user-caused errors (invalid input), explain exactly what is wrong and what valid input looks like: "Phone number must be 10 digits. Example: (555) 123-4567"
- For system errors the user cannot fix, set expectations: "Our servers are experiencing issues. We have been notified and are working on it. Check status.example.com for updates."
- Avoid error codes without explanation — if you must show a code for support purposes, pair it with a human-readable description

## Anti-Patterns
- Displaying "Error 500: Internal Server Error" or "Something went wrong. Please try again later." with no explanation, no retry button, no status page link, and no indication of whether the user's data was saved
