---
title: Notification Center with Categorization
category: Feedback & Error Handling
tags: [notification, search, enterprise, collaboration]
priority: situational
applies_when: "When building a centralized notification center that aggregates alerts, messages, and updates with filtering and read/unread management."
---

## Principle
Provide a centralized notification center that aggregates all alerts, messages, and updates with clear categorization, filtering, and read/unread management.

## Why It Matters
As applications grow in complexity, notifications multiply across channels: in-app toasts, email, push, and SMS. Without a central repository, users lose track of important updates, cannot review past notifications, and have no way to manage notification overload. A notification center serves as the user's single source of truth for all system communications, enabling them to catch up on missed items, review history, and manage their attention across categories.

## Application Guidelines
- Provide a persistent notification center accessible from a global header icon with an unread count badge
- Categorize notifications by type (system alerts, mentions, task updates, approvals, announcements) and allow filtering by category
- Support read/unread status with the ability to mark individual items or mark all as read
- Show a timestamp and sufficient context for each notification so users can triage without opening each one
- Include direct action links within notifications: "Sarah requested your review — Approve / Decline" rather than requiring navigation to a separate page
- Implement notification preferences that let users control which categories generate notifications and through which channels (in-app, email, push)
- Archive or auto-clear old notifications to prevent the center from becoming an overwhelming backlog

## Anti-Patterns
- Relying solely on transient toast notifications with no persistent record, so if a user misses a toast (they were looking at another window, stepped away briefly, or the toast auto-dismissed too quickly), the information is permanently lost with no way to recover it
