---
title: Promote Learnability Through In-Context Tips and Cues
category: Onboarding & Empty States
tags: [tooltip, form, onboarding, recognition]
priority: situational
applies_when: "When embedding instructional cues (placeholder text, inline hints, dismissible banners) directly in the interface to teach users as they work."
---

## Principle
Learnability is maximized when instructional cues are embedded directly within the interface at the moment and location where the user needs them, not separated into external documentation.

## Why It Matters
The cognitive cost of switching from a task to a help resource and back is high enough that most users simply will not do it. In-context tips — inline hints, placeholder text, smart defaults, and contextual banners — teach users as they work, reducing the learning curve without interrupting the workflow. This is especially critical for complex B2B applications where users may have varying levels of technical sophistication and cannot be expected to attend formal training.

## Application Guidelines
- Use descriptive placeholder text in form fields that shows the expected format or an example value (e.g., "acme-corp" in a subdomain field, not "Enter subdomain")
- Place brief inline help text below complex form fields explaining what the field controls and why it matters — keep it to one sentence
- Surface feature tips as dismissible banners or callouts the first 2-3 times a user visits a screen, then hide them permanently after dismissal
- Use smart defaults that demonstrate the most common configuration — users learn what the field does by seeing what it is set to
- Annotate empty charts, tables, and dashboards with ghost-content that shows what the populated state will look like

## Anti-Patterns
- Relying exclusively on external documentation or a knowledge base for feature explanation, requiring users to leave the product to learn it
- Showing instructional banners or callouts on every visit without respecting the user's dismissal — tips should appear a limited number of times and then vanish
- Using placeholder text as labels (the text disappears on focus, leaving the user without context for what to enter)
- Providing in-context tips that describe the UI element ("This is the search bar") rather than explaining its value ("Search across all projects, contacts, and documents")
