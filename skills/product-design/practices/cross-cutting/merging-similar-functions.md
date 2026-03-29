---
title: Merging Similar Functions — Reduce Feature Fragmentation
category: Cross-Cutting Principles
tags: [search, settings, consistency, cognitive-load]
priority: situational
applies_when: "When auditing the product for overlapping features that serve the same purpose with different wrappers and you need to consolidate them into a single, more capable feature."
---

## Principle
When multiple features serve overlapping purposes, merge them into a single, more capable feature rather than maintaining parallel implementations that confuse users and fragment their workflows.

## Why It Matters
Feature fragmentation is a natural consequence of organic product growth: different teams build similar capabilities for different use cases, or the same capability is reimplemented slightly differently for different user segments. The result is an application with multiple ways to do approximately the same thing — two search bars, three export mechanisms, two notification settings pages — each with slightly different capabilities and slightly different behaviors. Users waste time figuring out which variant to use and lose trust when similar-looking features behave differently.

## Application Guidelines
- Regularly audit the product for overlapping features: look for two or more features that serve the same core purpose with different wrappers
- When overlap is identified, merge into a single feature that encompasses all the capabilities of the individual features, rather than forcing users to choose or switch between them
- Use configuration or modes within a single feature rather than separate features: one search bar with filters and modes rather than "Quick Search" and "Advanced Search" as separate features
- After merging, redirect old entry points to the new unified feature so users who have muscle memory for the old path aren't stranded
- Resist the pressure to build a new parallel feature when extending an existing one would serve the need — feature addition is easy, but feature fragmentation is expensive to undo
- Communicate merges to users as improvements: "We've combined Quick Search and Advanced Search into a single, more powerful search"

## Anti-Patterns
- Maintaining two or more features that do 80% the same thing but have slightly different capabilities, forcing users to learn both
- Building a "V2" of a feature alongside the original rather than improving the original, creating permanent feature duplication
- Separate settings pages for closely related configurations (email notifications, push notifications, in-app notifications) when a unified notification preferences page would serve users better
- Addressing user complaints about feature complexity by building a "simplified" parallel version rather than improving the original
