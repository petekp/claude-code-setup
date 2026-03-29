---
title: Notifications — Indicators, Validations, and Notifications Taxonomy
category: Interaction Patterns
tags: [notification, form, validation, feedback-loop]
priority: core
applies_when: "When designing system feedback and you need to distinguish between passive indicators, input validations, and attention-requiring notifications."
---

## Principle
Distinguish between three fundamentally different types of system communication — passive indicators (status displays), validations (input feedback), and notifications (attention-requiring alerts) — and use the right pattern for each.

## Why It Matters
When these three communication types are conflated, the result is an interface that either overwhelms users with noise or fails to surface critical information. A badge showing the number of unread messages (indicator) demands different treatment than a form field error (validation) or a system alert that a deployment failed (notification). Each type has different urgency, persistence, and interaction requirements. Using the wrong pattern — like showing a modal alert for a passive status update or an inline indicator for a critical system failure — mismatches urgency to presentation.

## Application Guidelines
- Indicators: Use for ambient, glanceable status (online/offline dots, unread count badges, progress percentages, save status). They should be always visible and require no user action.
- Validations: Use for input-specific feedback (field errors, format guidance, character counts). They should appear adjacent to the relevant field and persist until the issue is resolved.
- Notifications: Use for events that require awareness or action (new messages, system alerts, completed processes). They should interrupt proportionally to urgency — toasts for low urgency, banners for moderate, modals for critical.
- Never use a notification pattern for something that is actually an indicator (e.g., do not show a toast every time a collaborator comes online; show a presence dot instead)
- Never use an indicator pattern for something that is actually a notification (e.g., do not rely on a subtle badge to communicate that the system is about to delete the user's data)
- Document your taxonomy in a design system so all teams classify their communications consistently

## Anti-Patterns
- Treating every piece of system feedback as a toast notification — online status changes, validation errors, save confirmations, and critical alerts all competing for the same notification slot with identical presentation, making it impossible for users to triage by importance
