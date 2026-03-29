---
title: Design Error Recovery Paths at Every Failure Point
category: Feedback & Error Handling
tags: [form, notification, error-handling, feedback-loop]
priority: situational
applies_when: "When mapping failure points in critical user flows and designing retry mechanisms, offline queuing, or alternative recovery paths."
---

## Principle
For every point where the system can fail, design a specific recovery path that helps the user get back on track with minimal effort and no data loss.

## Why It Matters
Most products are designed for the happy path — the sequence of steps when everything works. But in production, things fail constantly: APIs time out, file uploads corrupt, sessions expire, third-party services go down. Without designed recovery paths, users hit dead ends that require starting over, contacting support, or abandoning the task entirely. Error recovery is not an edge case; it is a core design responsibility that directly impacts user retention and satisfaction.

## Application Guidelines
- Map every failure point in critical user flows and design a specific recovery for each: retry mechanisms for transient failures, alternative paths for persistent ones
- Preserve user input across failures — if a form submission fails, the entered data should still be in the form when the user retries
- Provide automatic retry with exponential backoff for network failures, showing the user what is happening: "Connection lost. Retrying in 3 seconds..."
- For expired sessions, re-authenticate the user and then complete the original action rather than redirecting to a generic login page that loses context
- Offer offline queuing for critical actions: let users compose and "send" emails, save edits, or submit forms while offline, and sync when connectivity returns
- When a feature is unavailable, suggest alternatives: "File upload is temporarily unavailable. You can email your file to uploads@example.com instead."

## Anti-Patterns
- Showing a generic error page with no back button, no retry option, and no preservation of the user's context — forcing them to navigate back to the beginning of a multi-step process and re-enter all their data
