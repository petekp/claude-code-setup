---
title: "Working Memory Window Design: Limit Simultaneously Active Elements"
category: Cognitive Load
tags: [table, form, dashboard, cognitive-load, recognition]
priority: core
applies_when: "When designing comparison views, multi-step forms, or any interface where users must hold multiple pieces of information in mind simultaneously."
---

## Principle
Never require users to hold more than 3-4 independent pieces of information in working memory at the same time.

## Why It Matters
Working memory is severely limited — most people can actively manipulate only 3 to 4 chunks of information simultaneously (revised from Miller's classic "7 plus or minus 2" by Cowan's research). When an interface demands that users juggle more than this — comparing five options side by side, remembering values from one screen while entering them on another, or tracking multiple simultaneous processes — errors spike and the experience becomes exhausting. This is especially damaging in data-heavy enterprise tools where users already carry high cognitive overhead from domain complexity. Respecting this window keeps users accurate and confident.

## Application Guidelines
- Limit side-by-side comparisons to 3-4 items at a time; provide filtering to narrow larger sets
- Keep all information needed for a decision visible on the same screen rather than requiring users to remember data from other views
- Use visual indicators (color coding, icons, spatial grouping) to offload categorization from memory to perception
- When multi-step processes reference earlier inputs, display those inputs persistently (e.g., a summary sidebar during checkout)
- Break complex configurations into focused steps that each require tracking only a few variables
- Use recognition over recall: show available options rather than requiring users to type from memory (dropdowns over open text fields, autocomplete over blank inputs)
- Support auto-fill for verification codes rather than requiring users to switch apps, memorize a code, and type it from memory
- When displaying status indicators, use a maximum of four distinct states before grouping or abstracting
- Keep form validation inline and immediate; do not wait until submission to reveal errors

## Anti-Patterns
- Comparison tables with 10+ columns requiring users to mentally track differences across rows
- Wizard flows that reference choices made three steps ago without displaying them
- Dashboards that require users to mentally cross-reference data from multiple unconnected panels
- Copy-paste workflows where users must transfer values between screens manually
- Presenting a flat list of 10+ filter options that must all be considered simultaneously
- Showing every column of a data table by default when the primary task only requires three or four fields
