---
title: Overlay vs. Inline Split Pane Modes
category: Desktop-Specific Patterns
tags: [sidebar, layout, modal, cognitive-load]
priority: situational
applies_when: "When deciding between an overlay panel and an inline split pane for secondary content, depending on whether users need a brief reference or sustained side-by-side work."
---

## Principle
Offer both overlay (floating panel) and inline (side-by-side split) modes for secondary content, and let users choose based on whether they need to reference or simultaneously interact with both views.

## Why It Matters
Different tasks demand different spatial relationships between primary and secondary content. When a user needs to briefly reference a record while working on another, an overlay panel (slide-over, modal drawer) avoids disrupting their layout. When they need to compare or cross-reference two pieces of content in parallel, an inline split provides persistent side-by-side access. Forcing one mode for all situations either wastes screen space or blocks the primary workflow.

## Application Guidelines
- Default to inline split when the secondary content is the focus of the current task and will be used for more than a few seconds (e.g., comparing two documents, reading source while editing)
- Default to overlay when the secondary content is transient reference material — a quick lookup, a record preview, or a settings panel
- Provide a toggle to switch between overlay and inline modes so users can promote a quick reference into a persistent pane
- In overlay mode, ensure the panel does not block critical primary-view content; position it to the right or left with a visible close button and click-outside-to-dismiss behavior
- In inline mode, make the split divider resizable and remember the user's preferred ratio
- Consider a "popout" option that opens the secondary content in a separate window for multi-monitor workflows

## Anti-Patterns
- Using only full-screen modals for secondary content, completely blocking the primary view and forcing users to memorize information before closing
- Using only inline splits, consuming screen space permanently even when the user only needs a 5-second glance at reference data
- Overlay panels that cannot be pinned or converted to inline panes, trapping users in a transient interaction mode
- Inline splits with no way to collapse or close the secondary pane, permanently consuming space after the task is done
