---
title: Eligibility Transparency in Bulk Actions
category: Workflow & Multi-Step Processes
tags: [table, bulk-actions, error-handling, feedback-loop]
priority: situational
applies_when: "When implementing a bulk action on a selection of items where some items may be ineligible due to state, permissions, or constraints."
---

## Principle
When users select multiple items for a bulk action, clearly show which items are eligible for the action and which are not, with specific reasons for each ineligible item, before executing the operation.

## Why It Matters
In real datasets, not every selected item will be eligible for every action. Some records may be locked, in the wrong state, owned by another user, or lacking required fields. When a bulk action silently skips ineligible items or fails with a cryptic error count, users are left confused about what happened and which items were affected. Eligibility transparency lets users make an informed decision: proceed with eligible items, fix ineligible ones first, or adjust their selection.

## Application Guidelines
- Before executing a bulk action, show a pre-flight summary: "24 of 30 selected items are eligible for this action. 6 items will be skipped."
- List ineligible items with specific reasons: "Order #1234 — Cannot archive: has pending payments" so users understand why and can take corrective action
- Offer the choice to proceed with eligible items only or cancel to fix ineligible items first
- After execution, show a results summary: "24 items updated successfully. 6 items skipped (ineligible)." with a detailed log
- Group ineligibility reasons when patterns exist: "4 items skipped: status is 'Locked'" rather than listing each individually
- Provide a "Fix and retry" path for ineligible items that links directly to the corrective action needed

## Anti-Patterns
- Silently skipping ineligible items during bulk operations with no indication that some items were not affected
- Failing the entire bulk operation because one item is ineligible, wasting the valid selections
- Showing only a count of failures ("6 items failed") with no explanation of why or which items
- Executing the action and then showing errors after the fact, when the user expected all items to be processed
