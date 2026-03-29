---
title: Role-Based Interface Adaptation (RBAC in UI)
category: Enterprise & B2B Patterns
tags: [navigation, permissions, enterprise, progressive-disclosure]
priority: situational
applies_when: "When an enterprise application serves multiple roles and the interface should adapt by showing, hiding, or emphasizing features based on user permissions."
---

## Principle
Adapt the interface to each user's role by showing, hiding, or emphasizing features based on their permissions and responsibilities, so every user sees a focused view tailored to their job function.

## Why It Matters
Enterprise applications serve many roles — administrators, managers, individual contributors, auditors, support staff — each with different responsibilities and permissions. Showing every user the full interface creates cognitive overload for users who only need a fraction of the features, and creates security confusion when users see actions they cannot perform. Role-based adaptation ensures each user gets an interface proportional to their responsibilities.

## Application Guidelines
- Hide navigation items and features that the user's role has no access to rather than showing disabled buttons everywhere — reduce noise, not just interactivity
- For features the user can view but not edit, show the data in a read-only presentation that is clearly distinguishable from editable views
- Adapt the dashboard and landing experience per role: a sales rep should see their pipeline, a manager should see team metrics, an admin should see system health
- Allow role switching for users with multiple roles (e.g., a manager who is also a contributor) with a clear indicator of which role is currently active
- Use progressive disclosure to show advanced admin features only when the user navigates to admin-specific areas rather than cluttering every view
- Ensure role adaptation is server-enforced, not just a UI filter — the API must validate permissions independently

## Anti-Patterns
- Showing all features to all users with disabled buttons and "You don't have permission" errors on click, creating frustration and visual clutter
- Over-hiding features so that users don't know capabilities exist, even when those capabilities could be requested through a role change
- Adapting the interface inconsistently — hiding some unauthorized features while leaving others visible and broken
- Implementing role-based UI hiding without corresponding server-side permission checks, creating a security vulnerability
