---
title: Define Information Carried Between Workflow Steps
category: Workflow & Multi-Step Processes
tags: [wizard, form, cognitive-load, consistency]
priority: situational
applies_when: "When designing a multi-step workflow and explicitly mapping what data passes from each step to the next to prevent re-entry and context loss."
---

## Principle
Explicitly design what information passes from each workflow step to the next, ensuring that subsequent steps have all the context they need without requiring users to re-enter or re-find data.

## Why It Matters
Multi-step workflows fail when steps operate in isolation. A user who enters customer information in step 1 shouldn't have to re-enter it in step 3. An approval step should automatically carry forward the request details, not require the approver to look them up. Poorly defined information handoffs between steps create data re-entry, context loss, and errors. Explicitly designing what data carries forward is the structural foundation of a smooth, efficient multi-step workflow.

## Application Guidelines
- Map the data flow between steps during design: document exactly which fields from each step are consumed by subsequent steps
- Auto-populate fields in later steps with data entered in earlier steps: the billing address should default to the shipping address entered in step 1
- Pass computed values forward: if step 2 calculates a total, step 3 (confirmation) should display it without recalculation
- Carry forward user selections as visible context: "You selected 3 items totaling $450" should appear as a reference summary in later steps
- When a step modifies carried-forward data (e.g., applying a discount), show the change clearly: "Original: $450 → After discount: $382.50"
- For approval workflows, bundle all relevant context from the request step into the approval step so approvers can decide without leaving the workflow

## Anti-Patterns
- Steps that operate on shared data but don't pass it forward, requiring users to re-enter information they already provided
- Approval steps that contain only "Approve/Reject" buttons with no context about what's being approved, forcing the approver to navigate elsewhere for details
- Data entered in step 1 that is invisible in subsequent steps, preventing users from verifying that their earlier input is being used correctly
- Multi-step workflows where a mistake in step 1 can only be caught in step 5, with no earlier visibility into how the data propagates
