---
title: Presence Indicators for Collaborative Editing
category: Interaction Patterns
tags: [table, text, real-time, collaboration]
priority: situational
applies_when: "When building a collaborative feature where multiple users can view or edit the same content simultaneously and need awareness of each other's activity."
---

## Principle
In collaborative environments, show real-time presence indicators — who is online, where they are in the document, and what they are editing — to prevent conflicts and enable coordination.

## Why It Matters
When multiple people can edit the same content, the absence of presence awareness leads to conflicts, overwritten work, and duplicated effort. Two people editing the same paragraph without knowing it will produce a merge conflict or silent data loss. Presence indicators (pioneered by Google Docs and now expected in any collaborative tool) solve this by making collaboration visible: users can see who else is active, where they are working, and implicitly coordinate to avoid stepping on each other's work.

## Application Guidelines
- Show avatars or initials of active collaborators in a persistent location (typically the top-right header area) with color coding
- Display real-time cursors or selection highlights in the document/canvas with the collaborator's name and assigned color
- Show "currently viewing" or "currently editing" status to distinguish passive viewers from active editors
- For non-real-time collaboration, show "last edited by [name] [time]" indicators on sections or records
- In list or table views, show a presence indicator on rows being edited: "Sarah is editing this row" with a subtle lock or avatar icon
- Provide a way to follow a collaborator's cursor/position for pair-editing or guided review scenarios
- Handle presence state transitions gracefully: show when someone joins, leaves, or goes idle without creating notification noise

## Anti-Patterns
- A collaborative spreadsheet where two users can edit the same cell simultaneously with no indication that the other person is present, resulting in one user's changes silently overwriting the other's with no conflict resolution or even awareness that a conflict occurred
