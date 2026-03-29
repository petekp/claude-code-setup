---
title: Modal Editing Selection Framework (Inline / Modal / Full Page)
category: Interaction Patterns
tags: [modal, sidebar, layout, cognitive-load]
priority: situational
applies_when: "When deciding whether to use inline editing, a modal dialog, a slide-over panel, or a full-page editor based on the complexity and risk of the edit."
---

## Principle
Choose the editing pattern — inline edit, modal dialog, slide-over panel, or full-page editor — based on the complexity of the edit, the amount of context needed, and the risk of the operation.

## Why It Matters
Not every edit deserves the same UI treatment. Renaming a file inline is fast and natural; forcing a modal dialog for it is overkill. Editing a complex multi-field record inline would be cramped and error-prone; a full-page editor gives the space needed. The editing pattern should match the cognitive and spatial demands of the task. Choosing wrong in either direction — too heavy for simple edits or too constrained for complex ones — creates friction and frustration.

## Application Guidelines
- Inline editing: Use for single-field edits (renaming, toggling status, changing a single value) where context preservation is paramount and the edit is low-risk
- Modal dialog: Use for focused, 2-6 field edits that temporarily require the user's full attention but do not need the user to reference other parts of the page
- Slide-over panel: Use when the user needs to edit an item while maintaining visibility of the list or parent context — effective for master-detail patterns
- Full-page editor: Use for complex, multi-section edits (document editing, profile setup, configuration forms) that need maximum screen real estate and minimal distraction
- Consider the risk of the operation: higher-risk edits benefit from more explicit patterns (modals or full pages with explicit Save/Cancel) rather than auto-saving inline edits
- Ensure all patterns support keyboard navigation, focus management, and proper focus trapping (for modals) or focus return (after inline edits)

## Anti-Patterns
- Using the same pattern for all edits — opening a full-page form to rename a single item, or cramming a 20-field record edit into a tiny inline dropdown — because the development team standardized on one editing pattern without considering task complexity
