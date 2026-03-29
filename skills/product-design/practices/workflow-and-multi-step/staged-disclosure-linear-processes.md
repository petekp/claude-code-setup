---
title: Staged Disclosure for Linear Multi-Step Processes
category: Workflow & Multi-Step Processes
tags: [wizard, form, progressive-disclosure, cognitive-load]
priority: core
applies_when: "When designing a multi-step process (wizard, onboarding, or configuration flow) and deciding how to reveal steps progressively to reduce overwhelm."
---

## Principle
Reveal each step of a multi-step process only when the user reaches it, showing the full step sequence but only the current step's content, to reduce overwhelm and maintain focus on the immediate task.

## Why It Matters
Presenting all steps of a complex process simultaneously — a 15-field form, a 6-step configuration wizard, or a multi-phase onboarding flow — overwhelms users before they begin. Staged disclosure breaks the process into digestible chunks where users can focus on one decision at a time. This reduces cognitive load, decreases abandonment rates, and gives users a clear sense of progress. The visible step indicator provides motivation ("I'm on step 3 of 5") without the paralysis of seeing everything at once.

## Application Guidelines
- Show a step indicator (progress bar, numbered steps, breadcrumb) that reveals the full journey while highlighting the current position
- Present only the current step's form fields and decisions; future steps should be visible as labels only, not expandable
- Validate each step before allowing progression to the next, providing immediate feedback rather than batch errors at the end
- Allow backward navigation to review and edit previous steps without losing data entered in subsequent steps
- Pre-populate fields with smart defaults and data from previous steps to minimize redundant input
- Show a review/summary step before final submission that displays all entered data across all steps in a readable format

## Anti-Patterns
- Showing all form fields on a single long-scrolling page with no logical grouping or progression, overwhelming users from the start
- Staged disclosure with no step indicator, leaving users unable to gauge progress or anticipate the remaining effort
- Steps that lose previously entered data when the user navigates backward, punishing review behavior
- Breaking a simple 4-field form into 4 separate steps, adding unnecessary navigation friction to a process that isn't complex enough to warrant staging
