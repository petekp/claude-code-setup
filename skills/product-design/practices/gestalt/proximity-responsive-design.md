---
title: "Proximity in Responsive Design: Auditing Breakpoint Proximity Shifts"
category: Gestalt Principles
tags: [layout, responsive, gestalt]
priority: situational
applies_when: "When testing responsive layouts and you need to verify that proximity-based groupings remain intact across breakpoints."
---

## Principle
Every responsive breakpoint must be audited to ensure that Proximity-based groupings remain intact — elements that are close together on one viewport must not drift apart or collide at another.

## Why It Matters
Proximity is the strongest automatic grouping cue the brain applies. When a layout reflows at a breakpoint and related items end up far apart (or unrelated items end up adjacent), users misread the information architecture without realizing it. This creates silent usability failures that rarely surface in desktop-only design reviews.

## Application Guidelines
- Define spacing tokens as ratios rather than fixed pixel values so that intra-group and inter-group gaps scale proportionally across breakpoints
- At each breakpoint, verify that the ratio of intra-group spacing to inter-group spacing stays above 1:2 — the gap between groups should always be noticeably larger than the gap within groups
- When a row of related items wraps to a new line on smaller screens, add a Common Region container or visual divider to preserve the grouping that horizontal proximity previously provided
- Include breakpoint proximity audits in your design QA checklist: resize the browser through every breakpoint and confirm no grouping relationships reverse or become ambiguous

## Anti-Patterns
- Using identical margins everywhere so that intra-group and inter-group spacing are indistinguishable at any viewport width
- Allowing a sidebar to stack below the main content at a breakpoint without re-evaluating which elements now appear adjacent
- Testing responsive layouts only at exact breakpoint widths instead of the full range, missing the in-between states where proximity breaks down
