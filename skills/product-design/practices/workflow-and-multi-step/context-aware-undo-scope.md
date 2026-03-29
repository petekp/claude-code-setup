---
title: Context-Aware Undo Scope
category: Workflow & Multi-Step Processes
tags: [undo, keyboard, feedback-loop, mental-model]
priority: niche
applies_when: "When defining the scope of undo operations based on the user's current context — what gets undone, how far back, and what side effects are reversed."
---

## Principle
Define the scope and boundary of undo operations based on the user's current context — what gets undone, how far back undo reaches, and what side effects are reversed — rather than implementing a naive "undo last action" across the entire application.

## Why It Matters
"Undo" seems simple but becomes complex in multi-context applications. If a user is editing a document and also managing a sidebar panel, does Cmd+Z undo the document edit or the panel change? If they sent an email and then edited a record, can they undo the email send? Context-aware undo scopes these decisions intentionally: undo applies to the focused context, reverses only the actions that make sense to reverse, and communicates its scope clearly so users know what will happen.

## Application Guidelines
- Scope undo to the currently focused context: undo in a text editor reverses text changes; undo in a list view reverses list operations (move, delete, sort)
- Define clear undo boundaries: some actions are undoable (editing, moving, deleting), others are not (sending emails, publishing to external systems), and this should be communicated at action time
- Show what will be undone before executing: a toast notification "Deleted 3 items — Undo" clearly scopes the undo to that specific deletion
- For non-undoable actions, require confirmation before execution and explain why the action cannot be reversed
- In multi-panel layouts, ensure undo applies to the panel with keyboard focus and provide visual feedback about which panel received the undo command
- Time-scope undo for real-time collaborative actions: edits can be undone within 30 seconds, but not after other users have built on top of the change

## Anti-Patterns
- Global undo that reverses the last application-wide action regardless of context, undoing work in an area the user isn't looking at
- No undo scope communication: the user presses Cmd+Z and something unexpected changes because the undo applied to a different context than intended
- Undo that partially reverses an action, leaving the system in an inconsistent state (e.g., undoing a move that also triggered a notification — the notification is not recalled)
- Binary undo/no-undo with no middle ground — either an action is fully undoable or the user gets no recourse at all
