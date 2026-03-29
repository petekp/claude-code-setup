---
title: Inline Action Disclosure (Hover Reveal)
category: Interaction Patterns
tags: [table, list, keyboard, progressive-disclosure]
priority: situational
applies_when: "When designing list or table rows with contextual actions and you want to keep the default view clean while making actions accessible on hover or focus."
---

## Principle
Show contextual actions for list items and table rows on hover (or on selection for touch), keeping the default view clean while making actions immediately accessible when the user signals interest.

## Why It Matters
Showing every possible action on every row of a table or list creates visual clutter that overwhelms users and makes the primary content harder to scan. Hiding actions entirely behind right-click menus or distant toolbars adds clicks and breaks spatial proximity. Hover-reveal actions strike a balance: the default view prioritizes content readability, and actions appear precisely where the user is focused as soon as they hover over an item. This pattern is fundamental in email clients, file managers, and data-heavy enterprise applications.

## Application Guidelines
- Reveal action icons (edit, delete, share, more) aligned to the right side of a row when the user hovers over it
- Keep hover-revealed actions to 2-4 icons; use a "more" overflow menu for additional actions
- Provide an alternative access method for touch devices where hover is unavailable: a long-press menu, a swipe gesture, or a visible "more" button
- Ensure hover-revealed actions do not cause layout shifts — reserve space for them or overlay them without pushing content
- Include tooltips on hover-revealed icons since they lack text labels
- For keyboard users, reveal actions when a row is focused via keyboard navigation, not just on mouse hover

## Anti-Patterns
- Displaying six action buttons on every row of a 50-row table at all times, consuming more horizontal space than the actual data and creating a visual wall of buttons that makes the table unreadable
