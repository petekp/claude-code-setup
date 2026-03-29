---
title: Permission-Aware Navigation Design
category: Enterprise & B2B Patterns
tags: [navigation, permissions, enterprise, consistency]
priority: situational
applies_when: "When building navigation for an enterprise app with complex permission models where different roles see dramatically different feature sets."
---

## Principle
Build navigation that dynamically reflects the user's permissions, showing only the sections and features they can access, while maintaining enough structural consistency that the application feels coherent across roles.

## Why It Matters
Enterprise applications with complex permission models can have dramatically different feature sets available to different roles. A navigation that shows everything and relies on error messages when users click unauthorized items creates frustration and security anxiety. Conversely, navigation that hides too much can make users feel they're using a different (inferior) application than their colleagues. Permission-aware navigation finds the balance: showing users their world without exposing unreachable destinations.

## Application Guidelines
- Remove navigation items entirely for features the user has zero access to — don't show a "Billing" section to users who can't view or manage billing
- For features with partial access (view but not edit), show the navigation item normally but adapt the destination to a read-only view
- Maintain the overall navigation structure and ordering across roles so users who gain permissions find new items in predictable locations
- Show a count or badge on navigation items where applicable (e.g., "Approvals (3)") so users can see at a glance where their attention is needed
- If a user lands on a page via direct link but lacks permission, show a clear explanation and suggest what they can do instead, rather than a blank 403 page
- Cache permission data at login and update it periodically rather than checking on every navigation action, to maintain snappy navigation performance

## Anti-Patterns
- Showing all navigation items to all users and displaying "Access Denied" when they click unauthorized sections — this wastes clicks and creates frustration
- Hiding so many navigation items that some users see an application with only 2-3 sections, making it feel broken or incomplete
- Changing navigation item positions when items are hidden for certain roles, breaking spatial memory for users who switch between roles
- Checking permissions synchronously on every navigation click, introducing noticeable latency to every page transition
