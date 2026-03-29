---
title: "Element Connectedness: Explicitly Link Related Data Points"
category: Gestalt Principles
tags: [data-viz, table, layout, gestalt]
priority: situational
applies_when: "When data points have meaningful relationships and you need explicit visual connectors (lines, arrows, shared accents) rather than relying on spatial proximity alone."
---

## Principle
When data points have a meaningful relationship (sequential, causal, or hierarchical), they must be explicitly connected with visual links — lines, arrows, or shared enclosures — rather than relying on the user to infer the connection from position alone.

## Why It Matters
In data-rich interfaces, users make critical decisions based on which data points they perceive as related. If connections are only implied by layout proximity, users may miss relationships, invent false ones, or take longer to trace the actual links. Explicit visual connectors eliminate ambiguity, reduce cognitive load, and make the data tell its story without requiring the user to assemble it mentally.

## Application Guidelines
- In time-series charts, connect sequential data points with lines to show trajectory; use line weight and style to encode relationship strength or type
- In hierarchical data (org charts, dependency trees, folder structures), draw explicit parent-child connector lines with clear directional cues
- When showing related items across different sections of an interface (e.g., a selected list item and its detail panel), use highlighting, shared color accents, or an explicit visual link to make the connection obvious
- For flow diagrams and process maps, use arrows with consistent directional semantics (e.g., top-to-bottom, left-to-right) and label the connections when the relationship type is not self-evident

## Anti-Patterns
- Displaying related data points in separate tables or sections with no visual cue linking them, expecting users to remember and cross-reference
- Using connecting lines that are so thin or low-contrast that they disappear against the background, especially in printed or low-resolution contexts
- Drawing connector lines that cross and overlap without any visual differentiation (color, dash pattern), creating a tangle that obscures rather than reveals relationships
