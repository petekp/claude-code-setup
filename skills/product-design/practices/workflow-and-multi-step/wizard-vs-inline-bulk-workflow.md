---
title: Wizard vs. Inline Bulk Workflow Selection
category: Workflow & Multi-Step Processes
tags: [wizard, bulk-actions, enterprise, mental-model]
priority: situational
applies_when: "When choosing between a guided wizard and an inline bulk interface for multi-item operations based on complexity, user expertise, and frequency."
---

## Principle
Choose between a wizard-style interface and an inline bulk interface for multi-item operations based on the complexity, user expertise, and frequency of the task — don't default to one pattern for all cases.

## Why It Matters
Wizards and inline bulk interfaces serve different needs. A wizard provides guidance and structure for complex, infrequent, or unfamiliar operations. An inline bulk interface provides speed and efficiency for simple, frequent, or expert operations. Using a wizard for a task an expert performs 50 times a day wastes their time. Using an inline interface for a complex task a novice performs once a month leads to errors. The right choice depends on who is doing it, how often, and how complex it is.

## Application Guidelines
- Use a wizard when: the operation has complex dependencies between steps, users are unfamiliar with the process, the operation is performed infrequently, or errors have high consequences
- Use inline bulk when: the operation is a simple attribute change (status update, assignment, tagging), users are experienced, the operation is performed frequently, or errors are easily reversible
- For tasks that span both cases, offer both: a guided wizard for first-time or complex cases and an inline quick-action for routine cases
- Inline bulk should support: select items > choose action > confirm > execute, with no more than 2-3 clicks for a common operation
- Wizard bulk should support: upload/select items > configure parameters > validate > preview > execute, with guidance at each stage
- Allow users to switch between modes: "Use quick mode" link in the wizard, "Use guided mode" link in the inline interface

## Anti-Patterns
- Using a multi-step wizard for simple bulk status changes that could be done with a select-and-click inline action
- Using an inline bulk interface for complex operations with configuration, validation, and conditional logic that needs step-by-step guidance
- Providing only one interface style with no awareness of user expertise or task complexity
- Wizard bulk workflows that require individual item configuration when the same configuration applies to all items
