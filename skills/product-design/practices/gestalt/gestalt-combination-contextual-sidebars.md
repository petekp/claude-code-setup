---
title: "Gestalt Combination: Figure-Ground + Continuation for Contextual Sidebars"
category: Gestalt Principles
tags: [sidebar, layout, animation, gestalt]
priority: niche
applies_when: "When building a contextual detail sidebar and you need to visually connect it to the trigger element while separating it from the main content."
---

## Principle
Contextual sidebars should use figure-ground separation to distinguish the panel from the main content while using continuation cues to connect the sidebar's content to the element that triggered it.

## Why It Matters
Sidebars that appear without a clear visual relationship to their trigger feel disconnected -- users wonder "where did this come from?" and may not associate the sidebar's details with the correct item. Conversely, a sidebar that does not separate from the main content canvas feels like an intrusion rather than a focused detail view. The combination of figure-ground and continuation solves both problems.

## Application Guidelines
- Give the sidebar a distinct background color or elevation (shadow, border) to establish it as the figure layer over the main content ground
- Use a visual connector -- a highlighted row, a subtle line, or an arrow -- linking the triggering element in the main content to the sidebar, establishing continuation
- Animate the sidebar entrance from the direction of the triggering element to reinforce the spatial connection
- Dim or desaturate the main content slightly when the sidebar is active to strengthen the figure-ground contrast

## Anti-Patterns
- Opening a sidebar with no visual link to the item the user clicked, leaving the connection ambiguous
- Styling the sidebar identically to the main content area so it does not register as a separate layer
- Overlaying the sidebar without dimming or shifting the main content, creating a competing figure-figure relationship
