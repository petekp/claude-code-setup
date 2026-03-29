---
title: Resizable Split-Pane Layout
category: Desktop-Specific Patterns
tags: [layout, sidebar, keyboard, direct-manipulation]
priority: situational
applies_when: "When users need to view two content areas simultaneously and control how much screen space each receives through a draggable divider."
---

## Principle
Allow users to divide their workspace into resizable panes so they can simultaneously view and interact with related content, adjusting the allocation of screen space to match their current task.

## Why It Matters
Desktop users frequently need to reference one piece of content while working on another — reading source material while writing, comparing two records, viewing code alongside a preview. Resizable split panes let users control exactly how much space each content area gets, adapting the layout to their task rather than forcing a fixed allocation chosen by the designer.

## Application Guidelines
- Provide a visible, draggable divider between panes with a clear grab affordance (a handle, dots, or a subtle raised bar)
- Set sensible default split ratios (e.g., 50/50 or 30/70) that work for the most common use case, and persist the user's custom ratio across sessions
- Support double-click on the divider to reset to default or to collapse one pane entirely
- Enforce minimum pane widths to prevent content from becoming unusable, and provide a collapse threshold — if dragged below minimum, the pane should snap closed
- Support keyboard-based pane resizing (e.g., Ctrl+Shift+Arrow) for accessibility
- In three-pane layouts, allow independent resizing of each divider while maintaining the overall layout structure

## Anti-Patterns
- Fixed-width panes with no resize capability, forcing users to accept a layout that may not match their needs or monitor size
- Dividers with no visual affordance, making them invisible and undiscoverable — users don't know they can resize
- Allowing panes to be resized to zero width without a clear way to restore them, effectively hiding content with no recovery path
- Resizing that causes layout thrashing, content reflow, or scroll position loss in the adjacent pane
