---
title: Row Density Controls
category: Data Display & Tables
tags: [table, settings, data-density, responsive]
priority: situational
applies_when: "When users need to adjust table row height, padding, and font size as a coordinated system to optimize the readability-to-density ratio for their current task."
---

## Principle
Provide user-accessible controls that adjust row height, padding, and font size together as a coordinated system, enabling users to optimize the readability-to-density ratio for their current task and display.

## Why It Matters
Row density is not one-size-fits-all because screens, tasks, and preferences vary enormously. A user on a large monitor comparing 200 records wants maximum density to see as many rows as possible. The same user reviewing individual records for accuracy wants comfortable spacing to read each cell without eye strain. Making density a fixed design decision forces one group to suffer for the other's benefit. A density control lets each user find their optimal working point, and the same user can switch between modes as their task changes throughout the day.

## Application Guidelines
- Implement **three named density levels** as the standard: Compact, Default, and Comfortable. Three levels provide meaningful range without decision paralysis.
- Adjust **row height, cell padding, font size, and line height** together. Changing only row height without adjusting font size creates rows that are either cramped with large text or spacious with tiny text — both bad.
- Place the density control in a **consistent, discoverable location** — typically the table toolbar alongside other view controls (column management, filters, export).
- Use a **recognizable icon** (three horizontal lines with varying vertical spacing) or a segmented control with labels. Avoid burying density controls in a settings menu.
- **Persist the user's preference** across page loads and sessions. This is critical — a density preference is a personal ergonomic choice, not a per-session whim.
- Apply the selected density **consistently across all tables** in the application, or allow per-table overrides with a global default.
- When density changes, **maintain scroll position** so the user does not lose their place in the data.

## Anti-Patterns
- No density controls at all, forcing a fixed row height that suits the designer's monitor but not the user's.
- A density control that adjusts row height but not font size, creating giant rows with tiny text at "comfortable" or tiny rows with normal text at "compact" where text overflows.
- Density preference that resets on every page load, annoying users who prefer compact mode and must toggle it repeatedly.
- Density options without clear labels or preview, leaving users to click each option and observe the effect with no upfront indication of what each level looks like.
