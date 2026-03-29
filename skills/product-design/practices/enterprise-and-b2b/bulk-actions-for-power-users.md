---
title: Bulk Actions for Power Users
category: Enterprise & B2B Patterns
tags: [table, bulk-actions, keyboard, enterprise]
priority: situational
applies_when: "When enterprise users need to select and act on multiple items simultaneously — approving, updating, archiving, or tagging records in bulk."
---

## Principle
Enable users to select and act on multiple items simultaneously through bulk selection, batch operations, and multi-item editing to eliminate repetitive one-at-a-time workflows.

## Why It Matters
Enterprise users routinely need to perform the same action on dozens or hundreds of items: approving requests, updating statuses, assigning records, archiving old entries, or applying tags. Without bulk actions, these become tedious click-by-click marathons that waste time and introduce errors from fatigue. Bulk operations transform O(n) workflows into O(1), dramatically improving productivity for the tasks that matter most to power users.

## Application Guidelines
- Provide checkbox selection on every list and table row, with Select All and Select All on Page controls prominently placed
- Show a sticky bulk action bar when items are selected, displaying the count of selected items and available batch operations
- Support Shift+Click for range selection and Cmd/Ctrl+Click for additive selection, matching OS-native conventions
- Show a confirmation dialog for bulk destructive actions that includes the exact count and a summary: "Archive 47 records? This will remove them from active view."
- Provide progress feedback for long-running bulk operations with the ability to cancel mid-operation
- Allow bulk editing of shared fields — if 50 records are selected, show editable fields that apply to all 50 with "Multiple values" indicators for fields that differ

## Anti-Patterns
- Providing no multi-select capability, forcing users to open each record individually to perform the same action
- Offering Select All but only acting on the current page, with no way to select items across pages
- Executing bulk destructive actions without confirmation or with a generic "Are you sure?" that doesn't specify the scope
- Showing bulk actions that partially fail with no indication of which items succeeded and which failed
