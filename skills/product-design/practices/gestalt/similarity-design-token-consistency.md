---
title: "Similarity-Based Design Token Consistency"
category: Gestalt Principles
tags: [button, layout, theming, gestalt, consistency]
priority: situational
applies_when: "When auditing or building a design system and you need to ensure functionally equivalent components share identical visual tokens."
---

## Principle
Elements that share visual properties (color, shape, size, typography) are perceived as belonging to the same group, so design tokens must enforce consistent styling for functionally equivalent components.

## Why It Matters
When buttons, links, or interactive elements look different across screens despite serving the same function, users lose confidence in their mental model of the interface. Consistent design tokens harness similarity to make the system feel predictable. Inconsistent tokens break grouping and force users to re-learn what things mean on every page.

## Application Guidelines
- Define a single token for each functional role (e.g., `color-action-primary`) and apply it everywhere that role appears
- Ensure all destructive actions share the same color, weight, and shape so they are instantly perceived as a group
- Use typographic similarity (font size, weight, letter-spacing) to signal that headings at the same hierarchy level are peers
- Audit token usage periodically to catch drift where developers override tokens with one-off values

## Anti-Patterns
- Using slightly different shades of blue for primary buttons across different pages or features
- Styling links as underlined text in one section and as bold colored text in another, breaking the similarity signal
- Allowing each team to define their own "primary action" color without aligning to the shared token set
