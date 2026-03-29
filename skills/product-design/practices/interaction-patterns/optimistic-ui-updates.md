---
title: Optimistic UI Updates
category: Interaction Patterns
tags: [list, button, performance, feedback-loop]
priority: situational
applies_when: "When implementing actions with high success rates (likes, toggles, reordering) where waiting for a server response would make the interface feel sluggish."
---

## Principle
For actions that are very likely to succeed, update the UI immediately as if the action succeeded and reconcile with the server response asynchronously — rolling back only in the rare case of failure.

## Why It Matters
Server round trips take 100-500ms or more. If the UI waits for a server confirmation before updating, every action feels sluggish — the user clicks "like," waits, and then sees the count increment. With optimistic updates, the UI responds instantly: the like count increments immediately, the message appears in the chat instantly, the item moves to the new column on drag-drop without a pause. Since most actions succeed (>99% in well-built systems), the perceived performance improvement is dramatic with almost no risk of incorrect state.

## Application Guidelines
- Apply optimistic updates to actions with a high success rate: likes, comments, status changes, reordering, toggling settings
- Update the UI immediately on user action, then send the request to the server in the background
- If the server confirms success, do nothing (the UI is already correct); if it fails, revert the UI to the previous state and show an error message
- For actions that create new items (sending a message, creating a record), show the item with a pending indicator until server confirmation
- Do not use optimistic updates for high-stakes actions where failure has significant consequences (payments, deletions, publishing) — wait for server confirmation for these
- Implement idempotent APIs on the backend so retries do not cause duplicate actions if the first request actually succeeded but the response was lost

## Anti-Patterns
- Showing a loading spinner for every single user action (toggling a checkbox, reordering a list, marking as read) while waiting for server confirmation, making the interface feel unresponsive even though the server consistently responds in under 200ms
