---
title: Status Badge and State Indicator System
category: Design Systems & Tokens
tags: [table, dashboard, accessibility, consistency]
priority: situational
applies_when: "When building or unifying status indicators across an application and you need a consistent badge system with shapes, colors, icons, and positioning."
---

## Principle
Design a unified system of status badges, state indicators, and visual markers that communicate the current state of any entity (record, process, user, system) using consistent shapes, colors, icons, and positioning across the entire application.

## Why It Matters
Enterprise applications track the state of everything: orders are pending/processing/shipped/delivered, users are active/inactive/suspended, documents are draft/review/approved/published, and systems are healthy/degraded/down. Without a consistent indicator system, each feature area invents its own status representation — some use colored dots, others use text labels, others use badges, and others use icons. This inconsistency forces users to relearn status communication in every context. A unified system makes status instantly readable everywhere.

## Application Guidelines
- Define a standard badge component with variants for each status type: success (green), warning (yellow), error (red), info (blue), neutral (gray), and each with a label slot
- Use consistent shapes: filled badges for definitive states (Active, Completed), outlined badges for transitional states (Pending, In Progress), and dot indicators for binary states (online/offline)
- Pair every color indicator with a text label and/or icon to ensure accessibility for color-blind users
- Position status badges consistently: in table cells, they appear in a dedicated Status column; on cards, they appear in the top-right; on detail views, they appear next to the title
- Include animated indicators for in-progress states (a subtle pulse or spinner) to distinguish active processes from static states
- Define status badge sizes that scale proportionally with the context: compact in dense tables, standard in cards, large in hero detail views

## Anti-Patterns
- Using plain colored text ("Active" in green) in some places and colored badges in others for the same status concept
- Inconsistent color usage: green badge for "Active" in user management but blue badge for "Active" in subscription management
- Status indicators that rely solely on color with no text or icon, excluding color-blind users
- Inventing new badge styles for each feature area instead of reusing the design system's standard status components
