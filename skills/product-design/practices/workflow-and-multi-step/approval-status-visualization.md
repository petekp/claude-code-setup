---
title: Approval Status Visualization
category: Workflow & Multi-Step Processes
tags: [wizard, notification, collaboration, feedback-loop]
priority: situational
applies_when: "When building an approval workflow and stakeholders need to see where a request stands, who needs to act, and what has already happened."
---

## Principle
Visualize the current state, history, and next steps of approval workflows clearly so that all stakeholders can see where a request stands, who needs to act, and what has already happened.

## Why It Matters
Approval workflows are inherently multi-person, multi-step processes where the most common question is "where is my request?" Without clear status visualization, requesters bombard approvers with "did you see my request?" messages, approvers lose track of pending items, and the entire process feels opaque and frustrating. Clear visualization of approval state — who approved, who's pending, what's next — transforms approval from a black box into a transparent, trustworthy process.

## Application Guidelines
- Display the approval chain as a visual timeline or horizontal stepper showing each approver, their status (pending/approved/rejected/skipped), and timestamps
- Color-code approval states consistently: green checkmark for approved, gray clock for pending, red X for rejected, yellow for returned-for-revision
- Show the current bottleneck prominently: "Waiting on Sarah Chen (Director) — submitted 2 days ago"
- Provide automatic notifications at each approval stage: notify the next approver when it's their turn, notify the requester when status changes
- Include the ability to add comments at each approval step so approvers can explain their decisions inline
- Show estimated completion time based on historical approval patterns: "Typically approved within 3 business days"
- Support escalation indicators for overdue approvals: highlight items that have exceeded their expected response time

## Anti-Patterns
- Approval workflows where the requester has no visibility into current status and must email approvers to ask
- Status shown as a single field ("In Review") with no indication of which step in a multi-step approval chain
- No timestamps on approval events, making it impossible to determine how long a request has been waiting
- Approval chains where rejected items simply disappear with no explanation or path to resubmission
