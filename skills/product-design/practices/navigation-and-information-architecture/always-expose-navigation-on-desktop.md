---
title: Always Expose Navigation on Desktop — No Hamburger Menus
category: Navigation & Information Architecture
tags: [navigation, sidebar, responsive, recognition]
priority: core
applies_when: "When deciding whether to use a hamburger menu or a persistent visible navigation on desktop viewports."
---

## Principle
On desktop viewports, all primary navigation should be persistently visible — hiding navigation behind a hamburger menu on screens that have ample space sacrifices discoverability for a marginal gain in content area.

## Why It Matters
The hamburger menu pattern was designed for mobile devices where screen real estate is genuinely constrained. On desktop (1200px+ viewports), hiding navigation behind a hamburger icon reduces feature discoverability by 50% or more, according to multiple A/B studies. Users cannot navigate to what they cannot see. Visible navigation serves as a persistent map of the product's capabilities, reminding users of features they may not have tried and providing a one-click path to any section. The content-area space saved by hiding navigation is almost always less valuable than the discoverability lost.

## Application Guidelines
- Use a persistent left sidebar or top navigation bar on desktop viewports that shows all primary sections without requiring a click to reveal
- Reserve the hamburger pattern exclusively for mobile and narrow tablet viewports (below 768-1024px) where horizontal space is genuinely scarce
- If the application has too many sections to display at once, use grouped navigation with collapsible sections — still more discoverable than a hidden hamburger
- For content-heavy pages that benefit from maximum width (document editors, data grids), provide a toggle to collapse the sidebar to icons rather than hiding navigation entirely
- Ensure responsive behavior transitions smoothly: visible sidebar on desktop collapses to hamburger on mobile, with an animation that communicates the relationship

## Anti-Patterns
- Using a hamburger menu on a 1440px-wide desktop viewport with ample unused space for a sidebar
- Hiding both primary and secondary navigation behind a single hamburger icon, requiring two levels of click-to-reveal
- Defaulting the navigation to collapsed (hamburger state) on desktop and requiring users to opt in to seeing it
- Replacing visible navigation with a "universal search" as the only navigation method — search requires knowing what to search for, while visible navigation enables browsing
