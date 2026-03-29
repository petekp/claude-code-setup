---
title: User Control and Freedom — Undo Over Confirmation
category: Usability Heuristics
tags: [notification, modal, undo, trust]
priority: core
applies_when: "When deciding between confirmation dialogs and undo-based safety nets for destructive or state-changing actions."
---

## Principle
Prefer reversible actions with undo capability over irreversible actions that require confirmation dialogs, giving users the freedom to explore and act without fear while providing a safety net for mistakes.

## Why It Matters
Confirmation dialogs ("Are you sure?") are a weak safety mechanism: research consistently shows that users develop "dialog blindness" and click through confirmations automatically, especially for frequent actions. Undo, by contrast, is invoked only when the user actually made a mistake, has zero cost when they didn't, and avoids interrupting the flow of intentional actions. Gmail's "Message sent — Undo" toast is the canonical example: it adds zero friction to intentional sends while providing a safety net for accidental ones.

## Application Guidelines
- Make destructive actions reversible wherever possible: soft-delete with recovery, archive instead of permanent delete, "trash" folders with time-limited retention
- When an action is completed, show a brief toast notification with an "Undo" button: "3 items archived — Undo" that persists for 5-10 seconds
- Reserve confirmation dialogs only for genuinely irreversible, high-consequence actions: permanent deletion of data that cannot be recovered, sending to external systems, financial transactions
- When a confirmation dialog is necessary, make it specific: "Permanently delete 47 records? This cannot be undone." — not "Are you sure?"
- Provide a "Recently Deleted" or "Trash" area where deleted items can be recovered for a reasonable period (30 days is common)
- Support Cmd+Z as a universal undo shortcut that reverses the most recent reversible action

## Anti-Patterns
- Confirmation dialogs on every action ("Are you sure you want to save?"), training users to click "Yes" reflexively and eliminating any safety benefit
- Permanent deletion with no recovery path, where a single accidental click destroys data
- "Are you sure?" dialogs with no specific information about the consequences, making them indistinguishable from each other
- Undo that disappears too quickly (1-2 seconds) or has no keyboard shortcut, making it unreachable for users who realize their mistake a moment too late
