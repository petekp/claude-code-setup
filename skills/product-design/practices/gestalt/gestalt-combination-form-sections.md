---
title: "Gestalt Combination: Proximity + Similarity + Common Region for Form Sections"
category: Gestalt Principles
tags: [form, layout, gestalt, cognitive-load]
priority: situational
applies_when: "When designing long or multi-section forms where field groupings need to be instantly clear across screen sizes."
---

## Principle
Form sections should layer Proximity, Similarity, and Common Region together so that field groupings are instantly unambiguous at every level of the form hierarchy.

## Why It Matters
Long forms are one of the highest-friction touchpoints in software. When fields lack clear grouping, users waste cognitive effort figuring out which inputs relate to each other, leading to higher error rates and abandonment. Combining multiple Gestalt principles creates redundant grouping signals that survive varied screen sizes, zoom levels, and assistive technology contexts.

## Application Guidelines
- Use Proximity first: place tighter vertical spacing (8-12px) between fields within a group and wider spacing (24-32px) between groups to create an obvious rhythm
- Reinforce with Common Region: wrap each logical section in a subtle bordered card or background-color shift so the boundary is visible even if spacing collapses on small screens
- Apply Similarity within each section: use consistent label placement, input widths, and type styles so every field in a group looks like it belongs together
- Give each Common Region container a section heading that acts as a landmark for screen readers, tying the visual grouping to the semantic grouping

## Anti-Patterns
- Using only one principle (e.g., a section heading with no spacing or enclosure change) so the grouping is fragile
- Applying Common Region borders that are so heavy they compete with input field borders, creating visual noise instead of clarity
- Mixing label placements (top-aligned in one section, left-aligned in another) without an intentional reason, which breaks Similarity and confuses scanning patterns
