---
title: Skeleton Screens for Full-Page Loads (2-10 Seconds)
category: Loading & Performance Perception
tags: [loading, layout, performance, progressive-disclosure]
priority: core
applies_when: "When designing loading states for pages or components that fetch data asynchronously and the load takes 2-10 seconds."
---

## Principle
For page loads in the 2-10 second range, skeleton screens (gray placeholder shapes that mirror the page's content layout) provide superior perceived performance compared to spinners by giving users a preview of the page structure before content arrives.

## Why It Matters
Skeleton screens work by exploiting the brain's pattern-completion tendency. When users see placeholder boxes arranged in a familiar layout (a header bar, a sidebar, a content grid), they begin mentally modeling the incoming content and pre-planning their interactions before data arrives. Studies show that skeleton screens reduce perceived load time by 10-20% compared to equivalent-duration spinner experiences. They also reduce layout shift — the jarring repositioning of elements that occurs when content loads into an empty container — because the placeholder reserves the correct amount of space.

## Application Guidelines
- Match the skeleton layout to the actual content layout: if the page has a two-column layout with a sidebar, the skeleton should show two columns with a sidebar-shaped placeholder
- Use a subtle pulse or shimmer animation on skeleton elements to indicate loading activity — static gray boxes can appear broken
- Show the skeleton immediately (within 100ms of navigation) and transition smoothly to real content as it arrives, replacing skeleton blocks with real content progressively (top to bottom, or by component priority)
- Design skeleton components for each major content type in your design system: skeleton card, skeleton table row, skeleton chart, skeleton text block — reuse them consistently
- Include recognizable structural elements in the skeleton (the navigation, the page title area, the primary action zone) to give the user immediate spatial orientation

## Anti-Patterns
- Using a skeleton that does not match the actual page layout, causing a jarring layout shift when real content replaces the skeleton
- Showing skeletons for pages that load in under 1 second — the flash of gray blocks before instant content is distracting rather than helpful
- Using identical skeleton layouts for pages with different structures, which provides false spatial cues and no orientation benefit
- Animating skeleton elements too aggressively (fast pulsing, bouncing, color cycling), which draws attention to the loading state rather than the incoming content
