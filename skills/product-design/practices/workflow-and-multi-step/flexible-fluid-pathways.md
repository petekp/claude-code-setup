---
title: Flexible and Fluid Pathways Through Complex Workflows
category: Workflow & Multi-Step Processes
tags: [wizard, navigation, keyboard, cognitive-load]
priority: situational
applies_when: "When a multi-step workflow has independent steps and users should be able to complete them in their preferred order rather than being forced into a rigid sequence."
---

## Principle
Allow users to navigate non-linearly through complex workflows — jumping to specific steps, completing steps in their preferred order, and resuming from any point — rather than enforcing rigid sequential progression when steps are independent.

## Why It Matters
Not all multi-step processes have true sequential dependencies. A user configuring a new project might want to set up integrations before naming the project, or configure notifications before defining team members. Rigid linear wizards force users into the designer's assumed order, which may not match the user's mental model, available information, or preferred workflow. Flexible pathways respect user autonomy and accommodate real-world scenarios where information becomes available in unpredictable order.

## Application Guidelines
- Analyze step dependencies: identify which steps truly depend on previous steps' data and which are independent
- For independent steps, allow direct navigation to any step via the step indicator, regardless of completion order
- For dependent steps, disable forward navigation only to the specific steps that require prerequisite data, not all subsequent steps
- Show completion status on each step: completed (checkmark), in-progress (partial), and not-started (empty), regardless of position in the sequence
- Highlight required steps that must be completed before final submission, with a "Review incomplete steps" prompt at the end
- Allow saving and exiting at any point with the ability to resume at any step, not just where the user left off

## Anti-Patterns
- Forcing strict linear progression through a wizard where most steps are actually independent of each other
- Graying out all future steps until the current step is complete, even when future steps have no dependency on the current one
- Preventing users from returning to edit a completed step without first re-completing all intermediate steps
- Workflows that can only be resumed from the beginning or the last completed step, with no way to jump to a specific section
