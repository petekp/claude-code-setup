---
title: Surface Frequent Admin Actions Prominently
category: Enterprise & B2B Patterns
tags: [toolbar, navigation, enterprise, recognition]
priority: situational
applies_when: "When designing an admin interface and the top 5-10 most frequently performed actions should be accessible within one or two clicks from anywhere."
---

## Principle
Identify the 5-10 most frequently performed admin actions and make them accessible within one or two clicks from anywhere in the admin interface, rather than burying them in deep navigation hierarchies.

## Why It Matters
Administrators perform a small set of actions far more frequently than others: creating users, resetting passwords, reviewing access requests, checking system status, and adjusting common settings. If these high-frequency actions require navigating through three levels of menus, admins waste significant time on navigation overhead. Surfacing frequent actions prominently turns the admin panel from a configuration maze into an efficient control center.

## Application Guidelines
- Analyze actual admin usage data to identify the true top actions, which may differ from what designers assume
- Provide quick-action buttons on the admin dashboard for the top 5-7 tasks: "Add User," "Reset Password," "View Logs," "Manage Roles"
- Include a global "+" or "Create" button in the admin toolbar that provides shortcuts to create the most common entity types
- Support a command palette or admin search (Cmd+K) that lets admins jump directly to any action or setting by name
- Place commonly-needed reference information (user count, active sessions, recent errors) on the dashboard without requiring navigation
- Provide a "Recent Admin Actions" section that lets admins quickly repeat or review their last few operations

## Anti-Patterns
- Designing the admin panel with deep hierarchical navigation where every action requires 3+ clicks to reach
- Using a flat settings page with hundreds of options alphabetically sorted, making frequently-used settings as hard to find as rarely-used ones
- Designing the admin dashboard as a decorative overview with no actionable quick-access to common tasks
- Requiring admins to navigate to a user's profile to perform common actions (reset password, change role) that could be done from a user list
