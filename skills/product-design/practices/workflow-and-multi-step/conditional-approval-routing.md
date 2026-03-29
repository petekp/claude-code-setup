---
title: Conditional Approval Routing
category: Workflow & Multi-Step Processes
tags: [wizard, enterprise, permissions, collaboration]
priority: situational
applies_when: "When approval requests should route to different approvers or chains based on configurable conditions like amount thresholds, department, or risk level."
---

## Principle
Route approval requests to different approvers or approval chains based on configurable conditions — amount thresholds, department, risk level, request type — so that the right people review the right requests.

## Why It Matters
Not all approvals require the same level of oversight. A $50 office supply purchase and a $500,000 capital expenditure should not follow the same approval path. Low-risk, low-value requests should be approved quickly by a direct manager; high-risk, high-value requests should involve multiple levels of review. Conditional routing ensures that approval rigor is proportional to impact, preventing both rubber-stamping of critical decisions and bottlenecking of routine ones.

## Application Guidelines
- Define routing rules through a visual rule builder: "If amount > $10,000, require VP approval in addition to manager approval"
- Support multiple condition types: numeric thresholds, category matching, department routing, risk scoring, and custom field values
- Allow routing to specific individuals, role-based groups, or dynamic groups (e.g., "the requester's manager's manager")
- Visualize the routing logic as a flowchart or decision tree so administrators can understand all possible paths
- Test routing rules with sample data before activating: "If this request were submitted, it would route to: [list of approvers]"
- Log the routing decision in the audit trail: "Routed to VP approval because amount ($15,000) exceeds $10,000 threshold"
- Support parallel approval paths when multiple conditions apply: "Requires both Finance approval (amount > $5,000) and Legal approval (vendor is new)"

## Anti-Patterns
- A single approval chain for all requests regardless of type, amount, or risk, creating bottlenecks for routine approvals and insufficient oversight for critical ones
- Routing rules that can only be configured by developers in code, preventing business administrators from adjusting thresholds and paths
- Conditional routing with no visibility into why a request was routed to a specific approver, creating confusion for both requesters and approvers
- Routing rules that can conflict without detection: two rules that route the same request to different paths with no priority resolution
