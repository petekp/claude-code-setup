---
title: Highlighting Recommended Options — Reduce Analysis Paralysis
category: Interaction Patterns
tags: [card, button, hicks-law, trust]
priority: situational
applies_when: "When presenting multiple plans, tiers, or configuration options and users need guidance on which option is best for them."
---

## Principle
When presenting users with multiple options, visually highlight the recommended or most popular choice to reduce decision fatigue and guide confident selection.

## Why It Matters
Hick's Law states that decision time increases with the number and complexity of choices. When every option is presented with equal visual weight, users must evaluate each one individually, which is cognitively expensive and slows conversion. A highlighted recommendation leverages social proof and expert guidance to reduce the evaluation burden — users who are unsure can follow the recommendation, while informed users can still choose freely. This pattern is well-established in pricing pages, plan selection, and configuration workflows.

## Application Guidelines
- Visually distinguish the recommended option with a border, badge ("Most Popular," "Recommended"), elevated card, or contrasting color
- Place the recommended option in the most visually prominent position (center for three options, or first for vertically stacked lists)
- Provide a brief rationale for the recommendation: "Best for teams of 5-20" or "Most popular for your industry" rather than just a badge
- Pre-select the recommended option in radio button groups or plan selectors so it is the default, while making it clear that other choices are available
- Use data-driven recommendations when possible (most popular plan, most common configuration) rather than arbitrary business-driven highlighting
- Ensure non-recommended options are still fully visible and easily selectable — the recommendation should guide, not obscure alternatives

## Anti-Patterns
- Presenting four pricing tiers with identical visual treatment, equal sizing, and no indication of which is appropriate for the user, forcing them to read and compare every detail of every plan before making a selection
