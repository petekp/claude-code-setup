---
title: Progress Communication in Multi-Step Forms
category: Forms & Input
tags: [form, wizard, loading, feedback-loop, motivation]
priority: situational
applies_when: "When building a multi-step form or wizard and users need to understand where they are in the process and how much remains."
---

## Principle
Multi-step forms must clearly communicate where the user is in the process, how many steps remain, and what each step involves.

## Why It Matters
Without progress communication, multi-step forms feel like walking down an unlit hallway — users do not know if they are nearly done or barely started. This uncertainty increases abandonment because users cannot make informed decisions about whether to continue investing time. Clear progress indicators set expectations, create a sense of forward momentum, and reduce the anxiety that comes from committing time to an unknown-length process.

## Application Guidelines
- Display a step indicator (stepper bar, numbered breadcrumb, or progress bar) that shows total steps, completed steps, and the current step
- Label each step with a descriptive name ("Shipping Address," "Payment," "Review") rather than just numbers so users can anticipate what information is needed
- Allow backward navigation to review and edit previous steps without losing data entered in later steps
- Show a summary or review step before final submission that lets users verify all entered data across all steps
- Indicate which steps are complete, current, and upcoming using distinct visual states (e.g., filled/active/outlined icons)
- For very long processes, consider showing estimated time remaining based on average completion data

## Anti-Patterns
- Showing "Step 2 of ?" or no progress indicator at all, leaving users unable to estimate how much time the form will require and whether they should continue or abandon and return later
