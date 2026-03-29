---
title: Toolbars — Frequency, Context, Grouping
category: Desktop-Specific Patterns
tags: [toolbar, icon, layout, scanning]
priority: situational
applies_when: "When organizing toolbar actions and deciding placement, grouping, and sizing based on usage frequency and workflow relevance."
---

## Principle
Organize toolbar actions by frequency of use, contextual relevance, and logical grouping so that the most-needed tools are always visible, related tools are spatially adjacent, and rarely-used tools are accessible but not consuming prime screen real estate.

## Why It Matters
Toolbars are the primary action surface in desktop applications — the first place users look when they need to do something. A poorly organized toolbar that mixes high-frequency and low-frequency actions, or that groups commands by engineering category rather than user workflow, forces users to visually scan the entire bar for every action. Strategic organization based on real usage patterns dramatically reduces the time from intent to action.

## Application Guidelines
- Place the 5-8 most frequently used actions in the leftmost (most visible) toolbar positions, based on actual usage data, not designer assumptions
- Group related actions visually with separators or subtle background changes (e.g., clipboard actions together, formatting actions together, navigation actions together)
- Use larger icons or icon+label for the highest-frequency actions and icon-only for secondary actions, creating a natural visual hierarchy
- Provide overflow menus (chevron/ellipsis) for actions that don't fit the current toolbar width rather than wrapping to a second row or hiding without indication
- Make toolbars responsive to window width — collapse groups into dropdowns progressively, starting with the least-used group
- Show tooltips with action name and keyboard shortcut on hover for every toolbar icon

## Anti-Patterns
- Alphabetically ordering toolbar actions, which has no relationship to workflow and makes the most common actions arbitrarily positioned
- Showing every possible action in the toolbar simultaneously, creating a dense row of indistinguishable icons
- Grouping actions by data model or code module (all "user" actions, all "document" actions) rather than by task workflow
- Using toolbar icons with no tooltips, forcing users to click experimentally to discover what buttons do
