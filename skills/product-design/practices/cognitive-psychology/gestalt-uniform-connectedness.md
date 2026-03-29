---
title: Gestalt — Uniform Connectedness for Process and Relationship Visualization
category: Cognitive Psychology
tags: [wizard, data-viz, animation, gestalt]
priority: situational
applies_when: "When visualizing workflows, pipelines, org charts, step indicators, or any interface where elements have sequential or hierarchical relationships."
---

## Principle
Elements connected by a visual link — a line, an arrow, or a continuous shared region — are perceived as related, making explicit connections the clearest way to communicate relationships and sequences.

## Why It Matters
While proximity and similarity imply relationships, uniform connectedness makes relationships explicit and unambiguous. This is especially critical when visualizing processes (workflows, pipelines), hierarchies (org charts, file trees), and data relationships (entity diagrams, node graphs). Without explicit visual connections, users must infer relationships from position alone, which becomes error-prone as complexity increases. Connected visual structures let users trace paths, understand dependencies, and navigate relational data with confidence.

## Application Guidelines
- In workflow and pipeline views, use explicit lines or arrows connecting each step to the next, with the line style communicating status (solid = complete, dashed = pending)
- For org charts and hierarchical data, use tree lines that clearly connect parents to children
- In timeline or step-indicator components, use a continuous track or line that connects each step, with visual differentiation for completed, current, and future steps
- When displaying related items across different sections of a page (e.g., a source and its derived outputs), use visual connection lines or shared color coding with explicit labels
- In data flow or integration diagrams, connect data sources to destinations with labeled arrows showing direction and transformation
- Use animation along connection lines to indicate active data flow or in-progress operations

## Anti-Patterns
- A multi-step workflow displayed as disconnected cards with no visual line or indicator connecting them, relying on left-to-right position alone to imply sequence
- An org chart rendered as a flat list of names with indentation but no tree lines, making hierarchical depth ambiguous
- A stepper component where the steps are visually isolated dots with no track connecting them, making it unclear that they represent a sequence
- Related metrics displayed in separate dashboard widgets with no visual indication that they are causally connected
