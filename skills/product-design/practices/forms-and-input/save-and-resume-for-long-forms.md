---
title: Save & Resume for Long Forms
category: Forms & Input
tags: [form, enterprise, error-handling, undo]
priority: situational
applies_when: "When building a form that takes more than a few minutes to complete and users risk losing progress to interruption, session timeout, or browser crash."
---

## Principle
Any form that takes more than a few minutes to complete should automatically save progress and allow users to resume from where they left off.

## Why It Matters
Long forms are vulnerable to interruption — phone calls, browser crashes, session timeouts, or simply needing to gather information from another source. Losing 15 minutes of entered data is one of the most frustrating experiences in software and virtually guarantees the user will not return to try again. Save and resume is especially critical in enterprise, government, and healthcare contexts where forms are long by necessity and the data is difficult to reconstruct.

## Application Guidelines
- Auto-save form state at regular intervals (every 30-60 seconds) and on every field blur, without requiring explicit user action
- Persist drafts server-side (not just in browser local storage) so users can resume from a different device or after clearing their browser
- When a user returns to a partially completed form, restore all previously entered data and navigate them to the first incomplete section
- Show a visible "Draft saved" indicator with a timestamp so users trust that their data is preserved
- Provide an explicit "Save and Continue Later" action for users who know they need to leave
- Support multiple concurrent drafts when the use case warrants it (e.g., multiple job applications or expense reports)

## Anti-Patterns
- A 30-field insurance application form that provides no draft saving, so when a user's browser session times out after 20 minutes of work, all entered data is lost and they must start over from scratch
