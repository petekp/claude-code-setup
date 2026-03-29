---
title: Expandable Row Detail (Inline Master-Detail)
category: Data Display & Tables
tags: [table, layout, animation, progressive-disclosure]
priority: situational
applies_when: "When building an inline master-detail pattern where expanding a table row reveals a detail panel directly below it for rapid sequential inspection."
---

## Principle
Allow users to expand a table row to reveal a detail panel directly below it, creating an inline master-detail pattern that provides depth without leaving the table context.

## Why It Matters
The master-detail pattern is one of the most common data navigation models: select an item from a list (master) and see its detail in a connected panel (detail). The inline variant — where the detail expands directly below the row — is uniquely powerful for tables because it maintains the user's position in the list, preserves their scroll context, and allows rapid sequential inspection of multiple records by expanding one row, collapsing it, and expanding the next. This is far more efficient than navigating to a separate detail page for each record, which resets context every time.

## Application Guidelines
- Provide a **clear expand/collapse affordance** on each row — a chevron icon (pointing right when collapsed, down when expanded) in the first column or at the row's left edge.
- The expanded detail panel should be **visually distinct** from the table rows — use a different background color, indentation, or a subtle border to separate the detail content from the master rows.
- Keep the expanded detail **scoped and concise**: show the 5-10 most important detail fields, related records, or a mini form. If the detail requires a full page of content, use a sidebar or navigation pattern instead.
- Include a **sub-table or related list** in the expanded detail when the record has child records (e.g., an order's line items, a project's tasks, a customer's recent transactions).
- Support **only one expanded row at a time** by default (auto-collapse the previous row when a new one is expanded) to prevent the table from becoming an unwieldy accordion. Optionally allow multi-expand for power users with a modifier key.
- Ensure the **row's expand/collapse state does not affect sorting or filtering** — the row should remain in its correct position regardless of whether it is expanded.
- Animate the expand/collapse with a **brief, smooth transition** (150-250ms) so the motion is perceived as a reveal rather than a jarring content shift.

## Anti-Patterns
- Allowing all rows to be expanded simultaneously, turning the table into a wall of detail panels where the master-level overview is completely lost.
- Expanded detail panels that are so tall they push the next row off-screen, requiring the user to scroll to continue inspecting adjacent records.
- No visual distinction between the expanded detail and the table rows, making it unclear where the detail ends and the next row begins.
- A full-page navigation to a detail view when the detail content is small enough to fit in an inline panel, unnecessarily breaking table context.
