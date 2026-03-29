---
title: Three-Level Navigation: Global / Contextual / Local
category: Navigation & Information Architecture
tags: [navigation, sidebar, layout, consistency, mental-model]
priority: situational
applies_when: "When designing the navigation structure for a complex application with multiple sections, each containing sub-areas and page-level views."
---

## Principle
Complex applications should organize navigation into three clearly distinct tiers — global (product-wide sections), contextual (section-specific sub-areas), and local (page-specific views or actions) — with each tier occupying a consistent, dedicated position in the layout.

## Why It Matters
When navigation tiers are not visually and spatially separated, users cannot distinguish between product-level navigation, section-level navigation, and page-level navigation. This leads to disorientation: a user clicking what they think is a section sub-page may actually navigate to an entirely different product area. Three-tier navigation provides a clear, learnable mental model: "the sidebar tells me where I am in the product, the secondary nav tells me where I am in the section, and the tabs tell me what view I am looking at within this page."

## Application Guidelines
- Tier 1 (Global): Persistent left sidebar or top bar showing all major product sections — this never changes regardless of the current page
- Tier 2 (Contextual): Sub-navigation within a section, typically rendered as a secondary sidebar, horizontal tabs below the header, or a section-specific menu — this changes based on the selected global section
- Tier 3 (Local): Page-level navigation such as tabs, view toggles, or anchor links within a single page — this changes based on the selected contextual item
- Ensure each tier has a visually distinct treatment: different background, different typography, or different spatial position — they must not look like the same navigation component
- When a tier is not needed (a simple section with no sub-navigation), omit it rather than leaving an empty navigation area

## Anti-Patterns
- Mixing global and contextual navigation into a single sidebar where product sections and section sub-items are visually identical
- Using the same tab component for both contextual navigation (switching between section areas) and local navigation (switching between page views), making it impossible to distinguish which tier each tab belongs to
- Stacking three horizontal navigation bars (global top nav, section tabs, page tabs), creating a navigation-heavy header that consumes excessive vertical space
- Changing the global navigation based on the current section (hiding irrelevant sections), which destroys the user's mental model of the product's structure
