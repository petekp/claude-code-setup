---
title: "Common Region: Use Enclosure to Define Semantic Containers"
category: Gestalt Principles
tags: [layout, card, accessibility, gestalt]
priority: core
applies_when: "When grouping related elements in any interface and you need visible enclosure boundaries that match the semantic structure."
---

## Principle
Every distinct semantic group in an interface should be enclosed in a visible Common Region — a bordered, filled, or otherwise bounded area — so users perceive its contents as a single unit without conscious effort.

## Why It Matters
Common Region is one of the most powerful Gestalt cues because it overrides even Proximity and Similarity. A border or background change instantly communicates "these things belong together." In complex interfaces with many element types, Common Region provides an unambiguous parsing framework that reduces cognitive load and prevents misassociation of unrelated elements.

## Application Guidelines
- Use background color shifts, borders, or card containers to enclose logically related elements (e.g., a user profile block, a settings group, a notification cluster)
- Ensure the enclosure boundary has enough contrast against the surrounding area to be immediately perceived, but not so much that it competes with the content inside
- Align Common Region boundaries with semantic HTML landmarks (section, nav, aside, article) so the visual grouping matches the accessibility tree
- Nest Common Regions sparingly and with clear visual differentiation between levels — more than two nesting levels typically signals a need to restructure

## Anti-Patterns
- Using whitespace alone to separate semantic groups in dense interfaces where spacing can be ambiguous
- Enclosing every small element in its own container, creating a "box soup" that provides no meaningful grouping signal
- Applying Common Region containers inconsistently — some groups enclosed, others not — so users cannot rely on enclosure as a grouping cue
