---
title: Design for Interruption — Autosave and Session Resumability
category: Enterprise & B2B Patterns
tags: [form, enterprise, error-handling, trust]
priority: situational
applies_when: "When users work in environments with frequent interruptions and the application should autosave in-progress work and restore session state seamlessly."
---

## Principle
Automatically save user work in progress and restore session state so that interruptions — whether deliberate (switching tasks), accidental (closing a tab), or forced (network loss) — never result in lost work.

## Why It Matters
Enterprise users are constantly interrupted: a colleague stops by, a meeting starts, a higher-priority ticket comes in, the VPN drops, or the browser crashes. Every interruption is a potential data loss event if the application requires explicit save actions. Autosave and session resumability transform the application from a fragile tool that punishes interruptions into a resilient workspace that absorbs them gracefully, building deep user trust.

## Application Guidelines
- Autosave form data and in-progress edits at regular intervals (every 5-30 seconds) or on every meaningful change, with a subtle "Saved" indicator
- When a user returns to an incomplete form or workflow, offer to restore their previous state with a clear prompt: "You have unsaved changes from 2 hours ago. Resume or discard?"
- Preserve draft states server-side so they survive browser refreshes, device switches, and session timeouts
- Show a visual indicator when unsaved changes exist (e.g., a dot on the tab, "Unsaved changes" in the header) so users know their current save state
- Handle network interruptions gracefully: queue changes locally and sync when connectivity returns, with conflict resolution for concurrent edits
- Implement version history for important documents so users can recover from autosaved states that overwrote intended content

## Anti-Patterns
- Requiring users to click "Save" explicitly with no draft or autosave capability, making every interruption a data loss risk
- Losing all form data when a session times out, forcing users to re-enter everything after a security-mandated timeout
- Autosaving without any indicator, so users don't know whether their changes are persisted or will be lost
- Implementing autosave that silently overwrites without any version history or undo capability
