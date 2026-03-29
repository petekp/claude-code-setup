---
title: Contextual Toolbar Actions
category: Desktop-Specific Patterns
tags: [toolbar, icon, keyboard, progressive-disclosure]
priority: situational
applies_when: "When designing a toolbar that should show different tools based on what the user has selected or which mode they are in."
---

## Principle
Adapt toolbar content dynamically based on the user's current selection, active mode, or focused object so that the most relevant tools are always visible and immediately accessible.

## Why It Matters
Static toolbars that display every possible action at all times create visual noise and force users to scan dozens of icons to find the one they need. Contextual toolbars reduce this scanning cost by surfacing only relevant actions — when a user selects a table, they see table tools; when they select an image, they see image tools. This pattern is the backbone of productive interfaces in applications like Microsoft Office, Adobe Creative Suite, and modern design tools.

## Application Guidelines
- Show a base set of always-available actions (save, undo, redo) plus a contextual section that changes based on selection
- Animate the transition between toolbar states smoothly but quickly (150-200ms) so the change is noticeable but not disruptive
- Maintain consistent positioning for actions that appear across multiple contexts — "Delete" should always be in the same relative position
- Label icons with text for less-frequent or ambiguous actions; icon-only is acceptable only for universally recognized symbols (bold, italic, undo)
- Provide a visible indicator of which context is active (e.g., "Table Tools" or "Image Format" tab label) so users understand why the toolbar changed
- Ensure the toolbar is accessible via keyboard — Tab/arrow keys should move through toolbar actions, and each action should have a shortcut

## Anti-Patterns
- Showing all tools for all contexts simultaneously, creating a cluttered toolbar with dozens of irrelevant options
- Changing toolbar content without any visual indication of context, leaving users confused about why familiar buttons disappeared
- Removing the toolbar entirely in favor of right-click-only access, forcing users to memorize which actions exist
- Making contextual tools appear only on hover, which is invisible to keyboard users and undiscoverable to novices
