---
title: Inline Editing with Friction Calibration
category: Data Display & Tables
tags: [table, form, keyboard, direct-manipulation, validation]
priority: situational
applies_when: "When users need to edit table cell values in place and the confirmation friction should vary based on the risk and reversibility of the change."
---

## Principle
Allow users to edit table cell values directly in place with a click, but calibrate the confirmation friction (instant save vs. explicit save) based on the risk and reversibility of the change.

## Why It Matters
When users spot a typo or need to update a status, navigating to a separate edit form, making the change, saving, and navigating back to the table is a 5-step process for what should be a 1-step operation. Inline editing collapses this to click-edit-done, dramatically reducing task time for data correction workflows. However, not all edits carry equal risk — changing a contact name is low-risk, while changing a price or an access permission is high-risk. The confirmation mechanism must match the stakes: auto-save for safe fields, explicit save for consequential ones.

## Application Guidelines
- Make cells **editable on click** (single click to enter edit mode) for fields that are commonly updated. Show a visual cue on hover (subtle pencil icon, underline, or background change) to signal editability.
- Use **auto-save** (save on blur or Enter) for low-risk, reversible changes: names, descriptions, tags, notes, and status updates. Show a brief "Saved" confirmation.
- Use **explicit save** (show Save/Cancel buttons in the cell) for high-risk or irreversible changes: prices, quantities, permissions, financial values, and configurations that affect other systems.
- Provide **field-appropriate input controls** in edit mode: a text input for strings, a dropdown for enumerated values, a date picker for dates, a number stepper for quantities. Do not force users to type "Active" when a dropdown would prevent typos.
- Show **inline validation** immediately on edit: if a value is invalid (out of range, wrong format, conflicts with a constraint), show the error message next to the cell before attempting to save.
- Support **Escape to cancel** editing and revert to the original value, giving users a reliable bail-out at any point.
- Support **Tab to advance** to the next editable cell in the row, enabling spreadsheet-like editing flow for users who need to update multiple fields across records.

## Anti-Patterns
- Requiring navigation to a full-page edit form for every field change, adding 5+ seconds of overhead to what should be a 1-second edit.
- Auto-saving high-risk fields (like prices or permissions) without any confirmation, allowing accidental edits to propagate immediately.
- Editable cells with no visual indication of editability, leaving users to discover the feature by accident or not at all.
- Inline editing that does not support keyboard navigation (Tab, Enter, Escape), forcing mouse-only interaction that slows power users.
