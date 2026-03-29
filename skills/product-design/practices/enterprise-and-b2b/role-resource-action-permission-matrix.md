---
title: Role-Resource-Action Permission Matrix
category: Enterprise & B2B Patterns
tags: [table, permissions, enterprise, settings]
priority: niche
applies_when: "When modeling granular permissions as a three-dimensional matrix of Roles, Resources, and Actions and exposing it through a clear admin UI."
---

## Principle
Model permissions as a three-dimensional matrix of Roles, Resources, and Actions, and expose this matrix through a clear UI that lets administrators understand and configure who can do what to which entities.

## Why It Matters
Enterprise permission models that rely on binary role assignments ("Admin" or "User") are too coarse for real organizational needs. A department manager should be able to view all employee records, edit records in their department, approve time-off requests for their direct reports, but not modify salary data. This requires granular control over which actions (view, create, edit, delete, approve) each role can perform on which resources (users, records, reports, settings). A clear matrix UI makes this complexity manageable.

## Application Guidelines
- Present permissions in a grid format: roles as rows, resources as columns, with action checkboxes at each intersection
- Group resources by category (User Management, Content, Billing, Settings) to make the matrix scannable
- Support bulk operations: "Grant all View permissions to this role" or "Revoke all access to Billing resources"
- Show permission inheritance clearly: if a "Manager" role inherits from "User," indicate which permissions are inherited vs. directly assigned
- Provide a "Test as Role" or permission preview that lets administrators see exactly what a user with a given role would experience
- Include a search/filter on the matrix for large permission sets so administrators can quickly find specific resource-action combinations
- Log all permission changes in the audit trail with before/after states

## Anti-Patterns
- Exposing permissions only through code-level configuration files that require developer involvement for every change
- Binary role models (Admin/User) that force administrators to grant either too much or too little access
- Permission UIs that show a flat list of hundreds of checkboxes with no grouping, hierarchy, or search capability
- Permission changes that take effect only after a user logs out and back in, with no way to force immediate propagation
