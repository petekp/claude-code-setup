---
title: Activity Log UI with Filterable Timeline
category: Enterprise & B2B Patterns
tags: [list, search, enterprise, real-time]
priority: situational
applies_when: "When building a filterable, searchable activity timeline that lets administrators trace what happened, when, by whom, and in what sequence."
---

## Principle
Present system and user activity as a filterable, searchable timeline that allows administrators and users to trace what happened, when, by whom, and in what sequence.

## Why It Matters
When something goes wrong in an enterprise system — a record was modified incorrectly, a permission was changed unexpectedly, an integration failed — the first question is always "what happened?" An activity log with a well-designed filterable timeline is the primary tool for answering this question. Without it, debugging becomes guesswork, and accountability becomes impossible. A good activity log also serves as a passive monitoring tool: admins who regularly glance at the timeline can spot anomalies before they become incidents.

## Application Guidelines
- Display activities in reverse chronological order with clear timestamps, actor identities, action descriptions, and affected entities
- Provide filter controls for: date range, actor (who), action type (created, updated, deleted, login, export), and entity type (user, record, setting)
- Support full-text search across activity descriptions to find specific events
- Use visual indicators to distinguish action types: color-coded icons or badges for creates (green), updates (blue), deletes (red), and system events (gray)
- Include expandable detail rows that show the full change delta (before/after values) without cluttering the timeline summary
- Provide real-time streaming for the activity log so admins monitoring the system see events as they happen
- Support bookmarking or flagging specific events for follow-up investigation

## Anti-Patterns
- Activity logs that show only the last 24 hours with no way to access historical data
- Unstructured text logs with no filtering, requiring admins to Ctrl+F through thousands of entries
- Activity logs that record only entity IDs without human-readable descriptions, forcing admins to cross-reference
- Logs that don't capture the actor identity, making it impossible to determine who performed an action
