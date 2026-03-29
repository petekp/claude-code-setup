---
title: Hick's Law — Reduce Choices at Decision Points
category: Cognitive Psychology
tags: [navigation, form, settings, hicks-law, cognitive-load]
priority: core
applies_when: "When designing menus, navigation, settings, or any interface where users must select from multiple options."
---

## Principle
Decision time increases logarithmically with the number of available choices, so each additional option at a decision point measurably slows users down.

## Why It Matters
Every option presented simultaneously competes for cognitive evaluation. In product interfaces, bloated menus, overloaded toolbars, and sprawling settings pages cause decision paralysis — users either choose poorly, choose nothing, or abandon the task entirely. Reducing choices at each decision point accelerates task completion and increases user confidence in their selections. The effect is compounded for infrequent users who lack muscle memory. Decision fatigue compounds this further — each decision a user makes in a session depletes a finite cognitive resource, making subsequent decisions slower and more error-prone.

## Application Guidelines
- At each decision point, present only the options relevant to the user's current context and task
- Use smart defaults to reduce the number of decisions required to complete common workflows
- Break complex multi-option decisions into sequential steps with fewer choices per step (wizard patterns)
- Categorize and group options so users navigate a shallow hierarchy rather than scanning a flat list
- Employ frequency-based ordering: surface the most-used actions first and tuck rarely-used ones behind a "More" affordance
- For settings pages, separate basic and advanced configurations so the majority of users see only what they need
- Limit primary navigation to 5-7 top-level items; use sub-navigation for additional depth
- Highlight recommended or most-common options (e.g., "Most Popular" plan) to reduce evaluation effort
- For large option sets (e.g., country selectors), provide search and filtering rather than raw lists
- Sequence decisions rather than presenting them simultaneously: one decision per screen outperforms ten decisions on one screen
- Eliminate redundant options: if two settings achieve overlapping results, merge them into one with a smarter default
- For creation forms, show only required fields by default with an "Add more details" expansion

## Anti-Patterns
- A context menu with 20+ undifferentiated items, requiring the user to scan every option to find the one they need
- Presenting every possible export format simultaneously rather than defaulting to the most common and offering alternatives on request
- Mega-menus with dozens of undifferentiated options
- Equal visual weight on all options, forcing users to evaluate each one
- Requiring users to choose between options that are poorly differentiated or use unfamiliar terminology
- Presenting a settings page with 50+ uncategorized toggles, each requiring the user to research, evaluate, and decide
