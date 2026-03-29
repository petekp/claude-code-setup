---
title: Always-Available CSV/Excel Export
category: Enterprise & B2B Patterns
tags: [table, enterprise, permissions, toolbar]
priority: situational
applies_when: "When building any list, table, or report view in an enterprise application and data export to CSV or Excel should be a standard, always-available capability."
---

## Principle
Make data export to CSV and Excel available on every list, table, and report view as a standard capability, not a premium feature or admin-only action.

## Why It Matters
Enterprise users live in spreadsheets. No matter how good your reporting and analytics features are, users will always need to export data for custom analysis, ad-hoc reporting, board presentations, and integration with other tools. Blocking or restricting export forces users into painful workarounds (copy-pasting from the UI, screenshotting tables) and erodes trust. Data export is a hygiene expectation in enterprise software, not a differentiating feature.

## Application Guidelines
- Place an Export button in a consistent, discoverable location on every data view — typically in the toolbar or above the table
- Export the data as currently filtered, sorted, and configured — what the user sees should be what they get
- Offer both CSV (for data processing) and Excel (for formatted reports) formats
- Include column headers that match the display labels, not internal field names
- For large datasets, process the export asynchronously with a progress indicator and notification when complete
- Respect permissions in exports — don't include data columns the user doesn't have authorization to view
- Support exporting selected rows (if items are selected) or all rows matching the current filter

## Anti-Patterns
- Gating export behind premium pricing tiers or administrator permissions, holding user data hostage
- Exporting with internal field names (created_at, org_id) instead of human-readable headers (Created Date, Organization)
- Limiting exports to the current page of results (e.g., 25 rows) when the user needs the full filtered dataset
- Providing only PDF export when users need editable data they can manipulate in a spreadsheet
