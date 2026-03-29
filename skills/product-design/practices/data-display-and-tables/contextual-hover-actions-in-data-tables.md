---
title: Contextual Hover Actions in Data Tables
category: Data Display & Tables
tags: [table, button, keyboard, progressive-disclosure, affordance]
priority: situational
applies_when: "When a data table has row-level actions (edit, delete, copy) that should be available on hover without permanently cluttering every row."
---

## Principle
Reveal row-level actions (edit, delete, copy, view) on hover rather than permanently displaying them, keeping the table clean during scanning while making actions instantly available during focused interaction.

## Why It Matters
Permanently showing action buttons or icons on every row creates visual clutter that competes with the data. In a 50-row table with 3 actions per row, that is 150 buttons polluting the user's visual field when they are probably just scanning, not acting. Hover-revealed actions follow the progressive disclosure principle: the table is clean and scannable by default, but the moment a user hovers over a row — signaling interest in that specific record — the available actions appear. This preserves data density for scanning mode and provides action affordances for interaction mode.

## Application Guidelines
- Show a **row highlight** on hover (subtle background color change) to indicate the active row, and reveal action buttons or icons at the right edge of the row or in a designated actions column.
- Limit hover actions to **2-4 of the most common operations** (e.g., Edit, View, Delete). Less common actions should be accessible via a "more" overflow menu (three-dot icon).
- Ensure hover actions are **visually lightweight** — small icon buttons or text links — so they do not shift the row layout or push content when they appear.
- For **touch devices** where hover is unavailable, provide an alternative: a persistent actions column with icon buttons, a swipe-to-reveal action tray, or a tap-to-select model that reveals a toolbar.
- Support **keyboard access** to row actions — when a row is focused via keyboard navigation, the actions should be visible and tabbable, not dependent on mouse hover.
- Maintain **consistent action placement** — actions always appear in the same position relative to the row, so users develop muscle memory and can act quickly without visual search.
- Use **recognizable icons with tooltips** for action buttons. A trash can icon for delete, a pencil for edit, and an eye for view are conventional. Always pair icons with tooltip labels for clarity.

## Anti-Patterns
- Permanently displaying 4-5 action buttons on every row, consuming 15-20% of the row's width with controls instead of data.
- Hover actions that shift the row layout (pushing columns or changing row height) when they appear, causing the table to visually "jump."
- Actions that are accessible only via hover with no alternative for keyboard or touch users.
- Using non-standard or ambiguous icons for actions with no tooltip labels, forcing users to click to find out what a button does.
