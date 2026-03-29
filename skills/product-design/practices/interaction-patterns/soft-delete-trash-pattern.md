---
title: Soft Delete / Trash Pattern for Recoverable Deletion
category: Interaction Patterns
tags: [list, notification, undo, error-handling]
priority: core
applies_when: "When implementing delete functionality and you need to protect users from accidental permanent data loss by providing a recoverable trash or archive state."
---

## Principle
Instead of permanently deleting items immediately, move them to a trash or archive state where they can be recovered within a retention window before permanent removal.

## Why It Matters
Permanent, immediate deletion is the most common source of catastrophic user errors in software. Once data is gone, no amount of error messaging or support intervention can recover it. The soft delete pattern eliminates this entire class of risk by making deletion a two-phase process: items are first moved to a recoverable state (trash), then permanently purged after a retention period. This mirrors the physical-world behavior of a recycling bin and matches users' expectations from desktop operating systems and email clients.

## Application Guidelines
- Implement a "Trash" or "Recently Deleted" view that holds soft-deleted items for a defined retention period (30 days is a common standard)
- Show a clear recovery action ("Restore") alongside each trashed item, placing items back in their original location
- Allow permanent deletion from trash for users who want to explicitly purge items
- Display the auto-purge date for each trashed item so users know how long they have to recover
- When a user deletes an item, show a toast with an immediate "Undo" option that restores the item without requiring navigation to the trash
- Exclude soft-deleted items from search results, listings, and counts by default, but allow a "Show deleted" filter for discovery
- Communicate the trash/retention policy clearly in confirmation dialogs: "This item will be moved to Trash and permanently deleted after 30 days"

## Anti-Patterns
- Immediately and permanently purging data when a user clicks "Delete" with no trash mechanism, no undo option, and no recovery path — making a single misclick capable of destroying months of work
