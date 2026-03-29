---
title: Undo Enables Exploration
category: Interaction Patterns
tags: [notification, keyboard, undo, trust]
priority: core
applies_when: "When designing any destructive or state-changing action and you want users to feel safe experimenting rather than hesitating before every click."
---

## Principle
Provide undo capabilities throughout the application so users can explore, experiment, and take action without fear of making irreversible mistakes.

## Why It Matters
When actions cannot be undone, users become cautious — they hesitate before clicking, avoid trying new features, and second-guess their decisions. This fear-based interaction is the opposite of the confident, efficient flow that good software should enable. Undo transforms the user's relationship with the interface from anxious to exploratory: when you know you can reverse any action, you learn faster, work more efficiently, and feel more in control. Ctrl+Z is one of the most used shortcuts in computing precisely because it removes the risk from action.

## Application Guidelines
- Support Ctrl/Cmd+Z undo for all content editing operations, and make it multi-level (not just single-step) so users can walk back through a sequence of changes
- For non-editing actions (delete, move, archive, send), provide undo via feedback toasts with a time-limited undo option
- Show undo options proactively after significant actions rather than relying on users to know keyboard shortcuts
- Track undo history per-session and consider persisting it across sessions for critical workflows (e.g., design tools)
- Make redo (Ctrl+Shift+Z or Ctrl+Y) available alongside undo so users can move forward again after undoing
- For collaborative environments, scope undo to the current user's actions to avoid undoing other people's work

## Anti-Patterns
- Providing no undo mechanism in a text editor or document builder, so every accidental deletion, formatting change, or paste operation is permanent and users must manually reconstruct any lost work
