---
title: Permission-Based UI Rendering (Least Privilege)
category: Enterprise & B2B Patterns
tags: [button, permissions, enterprise, cognitive-load]
priority: situational
applies_when: "When rendering UI elements conditionally based on the authenticated user's specific permissions, following the principle of least privilege."
---

## Principle
Render each UI element — buttons, fields, navigation items, data columns — based on the authenticated user's specific permissions, following the principle of least privilege: show only what the user is authorized to see and do.

## Why It Matters
In multi-tenant enterprise applications, exposing UI elements that users cannot act on creates confusion, wastes cognitive bandwidth, and can constitute a security information leak (revealing the existence of features or data the user shouldn't know about). Least-privilege rendering ensures the interface is clean, focused, and secure — users see exactly their world, no more and no less.

## Application Guidelines
- Check permissions at the component level, not just the page level: a user may have read access to a record but not write access to specific fields
- For view-without-edit permissions, render fields as formatted text rather than disabled inputs — disabled inputs suggest something is broken, while read-only text is clearly intentional
- Remove action buttons (Edit, Delete, Approve) entirely when the user lacks that permission, rather than showing disabled buttons
- Gate data columns based on field-level permissions — don't show a "Salary" column to users who aren't authorized to view compensation data
- Implement permission checks on both the UI and API layers; the UI rendering is a UX enhancement, but the API is the actual security boundary
- Cache the user's permission set on login and re-validate periodically to avoid per-render permission check latency

## Anti-Patterns
- Showing all UI elements and returning "Permission Denied" errors when users interact with unauthorized features
- Rendering disabled buttons without explanation, leaving users unsure whether it's a bug or a permission restriction
- Implementing UI-only permission hiding without corresponding API enforcement, creating a false sense of security
- Over-engineering permission granularity in the UI (per-character permissions on text fields) to the point where the system is confusing and unmaintainable
