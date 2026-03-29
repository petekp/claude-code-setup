---
title: Sticky Primary CTAs on Long Pages
category: Layout & Visual Hierarchy
tags: [button, form, layout, mobile, fitts-law]
priority: situational
applies_when: "When a page requires scrolling and the primary action needs to remain persistently accessible through a sticky footer or repeated CTA."
---

## Principle
When a page requires scrolling, the primary call-to-action must remain persistently accessible — either through a sticky element or by repeating it at key scroll positions.

## Why It Matters
Long pages (forms, configuration screens, comparison tables, content pages) often place the primary CTA at the bottom, after the last piece of content. This means the user must scroll entirely through the page before they can act, even if they are ready to commit after reviewing the first section. Worse, on very long pages, users may forget the CTA exists or assume the page is purely informational. A sticky or repeated CTA removes the scroll-to-act burden and keeps the user's momentum intact.

## Application Guidelines
- For long forms, use a sticky footer bar that contains the primary action (Save, Submit, Continue) and is always visible regardless of scroll position
- Ensure the sticky bar has a clear top border or shadow to visually separate it from page content and prevent it from appearing to be inline content
- On mobile, sticky CTAs should not consume more than 10-15% of the viewport height to avoid shrinking the content area excessively
- For pricing or comparison pages, repeat the CTA at the top and bottom of the comparison table, and consider a sticky option for the selected column
- Include a clear visual state change (e.g., enabled/disabled, color shift) on sticky CTAs that reflect form validity — a permanently enabled "Submit" button on an incomplete form creates false affordance

## Anti-Patterns
- Placing the only CTA at the bottom of a 3000-pixel-long page with no sticky behavior or intermediate CTA placements
- Making the sticky bar so large or visually heavy that it obscures content and creates a cramped reading experience
- Using a sticky CTA that is always enabled but throws validation errors on click, instead of disabling or visually flagging incomplete state
- Stacking multiple sticky bars (navigation, CTA bar, cookie consent, chat widget) that collectively consume 30%+ of the viewport
