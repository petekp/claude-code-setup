---
title: Saved Filters and Search Views
category: Search, Filter & Sort
tags: [search, table, collaboration, enterprise, cognitive-load]
priority: situational
applies_when: "When power users repeatedly apply the same complex filter combinations and need saved views they can recall with a single click."
---

## Principle
Allow users to save frequently used filter combinations as named views that can be recalled with a single click, eliminating repetitive filter configuration and supporting consistent team workflows.

## Why It Matters
Power users often apply the same complex filter combination multiple times per day — "Open tickets assigned to my team, created this week, priority P1 or P2." Manually reconstructing this 4-filter combination every session wastes time and introduces error (forgetting one filter, selecting the wrong value). Saved views collapse a multi-step configuration into a single action and serve as a form of encoded workflow knowledge: a manager's "My Team's Urgent Items" view captures not just data filters but a way of thinking about the work.

## Application Guidelines
- Provide a **"Save current view"** action accessible from the filter bar or toolbar that saves all active filters, sort order, column configuration, and search terms as a named view.
- Display saved views as **tabs, a dropdown, or a sidebar list** for quick access. The most-used view should be the default, loadable in one click.
- Support both **personal saved views** (visible only to the creator) and **shared/team views** (visible to a team or organization) with clear labeling of scope.
- Allow users to **update an existing saved view** by applying new filters and choosing "Update view" rather than creating a new one. Also support "Save as new view" for creating variations.
- Include **system-provided default views** for common workflows (e.g., "All Open," "Assigned to Me," "Recently Modified") so the feature has value before users create their own.
- Show a **visual indicator** when the current filter state matches a saved view and when it has been modified from a saved view (e.g., "My Urgent Items (modified)").
- Support **view sharing via URL** — loading a saved view should produce a shareable URL that anyone with access can open.

## Anti-Patterns
- No ability to save filter combinations, forcing users to manually reconstruct their preferred view on every visit.
- Saved views that only save filters but not sort order or column configuration, requiring additional manual setup after loading a view.
- A shared view system where any team member can edit a shared view and accidentally change it for everyone, with no version history or undo.
- Saved views buried in a settings page rather than surfaced directly in the table toolbar where they are needed.
