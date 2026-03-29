---
title: Hierarchical Settings Architecture
category: Enterprise & B2B Patterns
tags: [settings, enterprise, permissions, mental-model]
priority: situational
applies_when: "When organizing application settings in an inheritance hierarchy — system defaults, organization overrides, team overrides, user preferences — for a multi-tenant enterprise product."
---

## Principle
Organize application settings in a clear inheritance hierarchy — system defaults, organization overrides, team overrides, user preferences — where more specific levels inherit from and can override more general ones.

## Why It Matters
Enterprise applications serve organizations with layered governance: company-wide policies, department-specific configurations, team preferences, and individual user settings. A flat settings model forces either one-size-fits-all configuration or per-user chaos. A hierarchical model lets organizations set sensible defaults that cascade downward while allowing controlled exceptions at each level, matching the real-world delegation of authority.

## Application Guidelines
- Define clear settings levels: Platform Default > Organization > Team/Department > User, with each level inheriting from the one above
- Show the effective value at each level and indicate where it was set: "Session timeout: 30 min (set at Organization level)"
- Allow higher levels to lock settings, preventing lower levels from overriding them when policy enforcement is required
- Provide a "Reset to inherited value" action at every override level so administrators can remove local overrides
- Display a visual indicator when a setting differs from its inherited value so administrators can see at a glance which settings have been customized
- Include a "View effective settings" summary that shows the fully resolved configuration for any user, incorporating all inheritance levels

## Anti-Patterns
- Flat settings with no hierarchy, forcing administrators to configure every setting for every user or team individually
- Implicit inheritance with no visibility into where a value is coming from, making it impossible to debug unexpected configurations
- Settings that can be overridden at lower levels with no ability for administrators to lock policy-critical settings
- Hierarchical settings with no way to see the resolved effective configuration, requiring mental computation of inheritance chains
