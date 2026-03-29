---
title: Dirty State Indicators and Unsaved Change Warnings
category: Feedback & Error Handling
tags: [form, notification, error-handling, feedback-loop, trust]
priority: core
applies_when: "When building an editing interface where users can modify data and risk losing unsaved changes by navigating away."
---

## Principle
When a user has modified data that has not yet been saved, the interface must visually indicate the unsaved state and warn before any action that would discard those changes.

## Why It Matters
Losing unsaved work is among the most frustrating experiences in software. Users frequently navigate away from forms, close tabs, or click links without realizing they have pending changes. Without a dirty-state indicator, there is no visual cue that work is at risk. Without a navigation guard, the system silently discards that work. Together, these mechanisms protect users from accidental data loss and build trust that the application is safeguarding their effort.

## Application Guidelines
- Show a visual dirty-state indicator (e.g., a dot on the tab, an asterisk in the title, a highlighted "Unsaved changes" badge) as soon as any field is modified from its saved state
- Intercept navigation events (browser back, tab close, in-app route changes) with a confirmation dialog: "You have unsaved changes. Discard or stay?"
- Differentiate between "no changes," "unsaved changes," and "saving in progress" with distinct visual states
- Clear the dirty indicator immediately when a save succeeds; if a save fails, keep the indicator active so the user knows data is still at risk
- For auto-saving interfaces, replace the dirty indicator with a save-status indicator ("Saving..." / "All changes saved") so users always know the current state

## Anti-Patterns
- Allowing users to navigate away from a form with 10 minutes of unsaved edits without any warning, silently discarding all changes and providing no way to recover
