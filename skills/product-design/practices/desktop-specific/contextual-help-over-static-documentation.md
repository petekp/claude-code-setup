---
title: Contextual Help Over Static Documentation
category: Desktop-Specific Patterns
tags: [tooltip, onboarding, enterprise, progressive-disclosure]
priority: situational
applies_when: "When users need help understanding complex features and you want to deliver guidance at the point of need rather than sending them to external documentation."
---

## Principle
Deliver help content at the point of need — embedded in the interface next to the relevant feature — rather than sending users to a separate documentation site or help center.

## Why It Matters
Users who need help are already struggling with a task. Forcing them to leave the application, search through documentation, and then mentally map what they read back to the interface creates a high-friction experience that many users simply abandon. Contextual help — tooltips, inline hints, expandable explanations, and guided walkthroughs — meets users where they are, reducing the cognitive overhead of learning and the risk of abandoning complex features.

## Application Guidelines
- Add informational tooltips (triggered by a small "?" icon or on hover) next to complex form fields, settings, and configuration options
- Use inline help text below form fields for commonly misunderstood inputs — explain the expected format, valid ranges, and downstream effects
- Provide "Learn more" links that open a focused help panel or slide-over within the application rather than navigating away to external documentation
- Implement guided feature tours that walk users through complex workflows step-by-step, highlighting relevant UI elements in context
- Include contextual help in empty states — when a section is empty, explain what it's for and how to populate it
- Support F1 or "?" keyboard shortcuts that open help content relevant to the currently focused element or active feature area

## Anti-Patterns
- Relying exclusively on a separate help center or documentation wiki, requiring users to context-switch and search for answers
- Showing help content that is generic rather than specific to the user's current context (e.g., linking to the entire settings documentation rather than the specific setting they're looking at)
- Cluttering the interface with permanent help text that experienced users cannot dismiss or hide
- Providing tooltips that merely restate the label ("Click here to save" on a Save button) instead of adding genuine explanatory value
