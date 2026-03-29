---
title: Panel Docking and Undocking
category: Desktop-Specific Patterns
tags: [sidebar, layout, drag-drop, direct-manipulation]
priority: niche
applies_when: "When building a professional desktop application (IDE, design tool, financial terminal) where users need to rearrange, dock, and float panels across monitors."
---

## Principle
Allow users to dock, undock, rearrange, and float panels within the application window so they can compose a workspace layout optimized for their task and monitor setup.

## Why It Matters
Professional desktop users — developers, designers, financial analysts, video editors — work across diverse monitor configurations and task types. A single fixed layout cannot serve a user with an ultrawide monitor the same way it serves someone on a laptop, nor can it serve the same user doing two different tasks. Panel docking gives users agency over their workspace, which directly increases productivity and reduces frustration in long-session applications.

## Application Guidelines
- Support drag-to-dock with visual drop-zone indicators that preview where the panel will land (top, bottom, left, right, or tabbed alongside another panel)
- Allow panels to be undocked into floating windows, which is critical for multi-monitor setups where users want reference panels on a secondary screen
- Provide named layout presets (e.g., "Writing," "Review," "Analysis") that users can save, switch between, and reset to defaults
- Remember the last-used layout per user and restore it on application launch
- Support panel minimization to a sidebar tab strip so collapsed panels are accessible with one click without consuming workspace area
- Include a "Reset Layout" option for users who get into a broken state

## Anti-Patterns
- Locking all panels to fixed positions with no ability to rearrange, forcing users into the designer's workflow assumptions
- Supporting undocking but not re-docking, so users can tear panels out but must restart the app to restore them
- Offering layout customization that doesn't persist across sessions, requiring users to rebuild their workspace daily
- Drop-zone indicators that are unclear or jittery, making it difficult to predict where a dragged panel will land
