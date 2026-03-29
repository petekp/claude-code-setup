---
title: Ease Transition Between Primary and Secondary Information
category: Enterprise & B2B Patterns
tags: [sidebar, tooltip, enterprise, cognitive-load]
priority: situational
applies_when: "When enterprise knowledge workers need to reference related records, policies, or supporting details without losing their place in the primary task."
---

## Principle
Design information architecture so that users can move fluidly between primary content (what they're working on) and secondary content (reference data, related records, supporting details) without losing their place or context.

## Why It Matters
Enterprise knowledge work is inherently referential — users constantly need to check a related record, look up a policy, verify a detail, or cross-reference data while working on their primary task. Every time this reference check requires a full navigation away from the primary context, users lose their place, their train of thought, and the data they were mentally holding. Fluid transitions between primary and secondary information preserve cognitive continuity and dramatically improve work quality.

## Application Guidelines
- Use slide-over panels or side drawers for secondary information that users need to reference briefly without leaving the primary view
- Implement hover cards or preview popovers for linked entities: hovering over a customer name shows key details without clicking through
- Support inline expansion of referenced records: clicking a linked order ID expands the order details in-place rather than navigating away
- Provide split-view options where users can pin reference information alongside their primary work area
- Use browser-native behaviors thoughtfully: Cmd+Click to open references in a new tab preserves the primary context
- When navigation away is necessary, provide a prominent "Return to [previous context]" link rather than relying on the browser back button

## Anti-Patterns
- Requiring full page navigation to view any related or referenced information, forcing constant back-and-forth browsing
- Pop-up windows or modals that block the primary content entirely when the user just needs a quick reference
- Linked references that provide no preview, forcing users to navigate away to determine whether the linked data is what they need
- No mechanism to return to the previous context after viewing secondary information, relying entirely on browser history
