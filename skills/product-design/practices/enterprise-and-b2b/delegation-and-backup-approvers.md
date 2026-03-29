---
title: Delegation and Backup Approvers
category: Enterprise & B2B Patterns
tags: [wizard, enterprise, collaboration, permissions]
priority: situational
applies_when: "When building approval workflows that need delegation and backup mechanisms so processes do not stall when the primary approver is unavailable."
---

## Principle
Build delegation and backup mechanisms into approval workflows so that business processes don't stall when the primary approver is unavailable due to vacation, illness, meetings, or role transitions.

## Why It Matters
Approval bottlenecks are one of the most common workflow failures in enterprise software. When a single person is the required approver and they're out of office, the entire process stops — purchase orders aren't approved, time-off requests sit in limbo, and change requests block deployments. Delegation and backup approver mechanisms keep business moving by providing authorized fallback approvers while maintaining the accountability and audit trail that approval workflows exist to ensure.

## Application Guidelines
- Allow approvers to designate a delegate who can approve on their behalf during a specified date range (vacation coverage)
- Support automatic escalation to a backup approver after a configurable timeout period (e.g., "If not approved within 48 hours, escalate to the department director")
- Clearly indicate in the audit trail when an approval was made by a delegate: "Approved by Maria Santos on behalf of John Park (delegated 3/15-3/22)"
- Allow approvers to set up standing delegates who can always approve on their behalf, not just during specific date ranges
- Notify the original approver when their delegate takes action so they maintain awareness even while away
- Provide a delegation dashboard where managers can see all active delegations in their organization and ensure coverage
- Support multi-level escalation: delegate first, then manager, then department head, with configurable timeouts at each level

## Anti-Patterns
- Single-person approval bottlenecks with no delegation or escalation mechanism, causing process stalls whenever the approver is unavailable
- Delegation that bypasses audit requirements — delegate approvals must be logged with the same rigor as direct approvals
- Requiring administrator intervention to set up delegation for each absence rather than letting approvers manage their own delegates
- Backup approvers who receive no context about the approval request, forcing them to research from scratch
