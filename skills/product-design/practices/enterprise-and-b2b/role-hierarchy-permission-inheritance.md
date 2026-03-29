---
title: Role Hierarchy and Permission Inheritance
category: Enterprise & B2B Patterns
tags: [permissions, enterprise, settings, mental-model]
priority: niche
applies_when: "When structuring roles in a clear hierarchy where child roles inherit permissions from parent roles to reduce redundant configuration."
---

## Principle
Structure roles in a clear hierarchy where child roles inherit permissions from parent roles, reducing redundant configuration and ensuring that organizational authority relationships are reflected in the permission model.

## Why It Matters
Real organizations have hierarchical authority: a VP has all the permissions of a Director, who has all the permissions of a Manager, who has all the permissions of a Team Member. Without permission inheritance, administrators must manually assign every permission to every role, creating maintenance burden and increasing the risk of gaps where a higher-level role accidentally lacks a permission that lower roles have. Inheritance makes the permission model match the organizational model.

## Application Guidelines
- Define a clear role hierarchy: e.g., Super Admin > Organization Admin > Team Manager > Team Member > Viewer
- Child roles automatically inherit all permissions from parent roles; additional permissions can be added at each level
- Visualize the hierarchy as a tree diagram so administrators can understand the inheritance chain at a glance
- Clearly distinguish inherited permissions (shown but not editable at the child level) from directly-assigned permissions (editable)
- Allow creating custom roles at any level of the hierarchy that inherit from an existing role and add specific permissions
- Provide a "permission diff" view that shows exactly which permissions a role has beyond what it inherits
- Prevent circular inheritance and ensure that removing a permission from a parent role cascades to all children

## Anti-Patterns
- Flat role lists where every role is independent and administrators must manually duplicate permission sets across related roles
- Inheritance that is implicit and invisible — permissions appear granted but administrators can't tell whether they're directly assigned or inherited
- Role hierarchies with no way to create custom intermediate roles, forcing organizations into a rigid structure that doesn't match theirs
- Permission inheritance that doesn't cascade removals — removing a permission from a parent role leaves it active on child roles
