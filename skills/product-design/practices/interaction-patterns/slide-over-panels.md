---
title: Slide-Over Panels as Non-Blocking Modal Alternatives
category: Interaction Patterns
tags: [sidebar, list, layout, keyboard]
priority: situational
applies_when: "When users need to view or edit detail content from a list while maintaining visual context of the parent page, as an alternative to full modals or page navigations."
---

## Principle
Use slide-over panels (drawers) when users need to view or edit detail content while maintaining visual context of the parent list or page — they offer the focus of a modal without the full-context-loss of a page navigation.

## Why It Matters
Modals block all interaction with the underlying page, and full-page navigations lose the parent context entirely. Slide-over panels occupy a middle ground: they overlay part of the screen (typically sliding in from the right) while keeping the parent view partially visible. This is ideal for master-detail patterns where users need to see a record's details while retaining awareness of which list item they selected, or when comparing the current item against others in the list. The pattern is now standard in CRM, project management, and admin tools.

## Application Guidelines
- Use slide-over panels for viewing or editing a single record from a list without losing list context
- Size panels to cover 40-60% of the viewport width so the parent list remains partially visible; support resizing for user preference
- Include a visible close mechanism (X button, click outside, Escape key) and clear heading that identifies the content
- Support navigation between items without closing the panel: "Previous / Next" arrows or clicking a different list item
- Maintain scroll position in the parent list when the panel opens and closes
- Trap focus within the panel for accessibility while it is open, and return focus to the trigger element on close
- Use panels for moderate-complexity content (5-15 fields); for very simple edits use inline editing, and for very complex edits use a full-page view

## Anti-Patterns
- Opening a full-page navigation to view a single record from a long list, forcing the user to click back, re-scroll to their position, and re-orient themselves in the list every time they want to check a different record
