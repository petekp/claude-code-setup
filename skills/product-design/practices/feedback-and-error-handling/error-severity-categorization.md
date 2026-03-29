---
title: Error Severity Categorization — Match Presentation to Impact
category: Feedback & Error Handling
tags: [notification, error-handling, feedback-loop, consistency]
priority: situational
applies_when: "When designing a notification or error system that needs to visually differentiate info, warning, error, and critical severity levels."
---

## Principle
Not all errors are equal — categorize errors by severity (info, warning, error, critical) and match the visual urgency and interruption level of the message to the actual impact on the user.

## Why It Matters
When every error looks the same, users cannot triage effectively. A minor validation issue presented with the same alarming red banner as a system outage creates unnecessary panic for small problems and desensitization to large ones. Proper severity categorization helps users allocate attention appropriately, take urgent action when genuinely needed, and not be derailed by issues that are informational or easily resolved.

## Application Guidelines
- Define a clear severity taxonomy: Info (neutral, no action needed), Warning (potential issue, optional action), Error (action failed, user action needed), Critical (system failure, immediate attention required)
- Use escalating visual treatments: info uses neutral colors and inline text, warnings use amber with icons, errors use red with prominent placement, critical errors use modal overlays or full-page states
- Match the interruption level to severity: info and warnings should never block workflow; errors should highlight the affected area; critical errors may appropriately block the entire interface
- Include appropriate urgency in the language: "Note: This field is optional" vs. "Warning: Unsaved changes will be lost" vs. "Error: Payment failed" vs. "System unavailable — our team has been notified"
- Log all severities for debugging, but only surface user-actionable messages in the UI

## Anti-Patterns
- Using a red error banner with an exclamation icon for every issue from "Password must be 8 characters" to "Database connection lost," making it impossible for users to distinguish between a quick fix and a system-wide problem
