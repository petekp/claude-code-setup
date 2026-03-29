---
title: Accordion — Collapsible Sections for Occasionally Needed Content
category: Component Patterns
tags: [layout, accessibility, keyboard, progressive-disclosure]
priority: situational
applies_when: "When a page has secondary content (FAQs, advanced settings, detailed specs) that would overwhelm if always visible but must remain accessible on demand."
---

## Principle
Accordions should be used to progressively disclose content that is occasionally needed but would overwhelm the page if always visible, keeping the page scannable while making details accessible on demand.

## Why It Matters
Accordions solve the tension between information completeness and visual simplicity. FAQs, advanced settings, detailed specifications, and secondary details are important to some users some of the time, but displaying everything at once makes the page harder for everyone to scan. Accordions let users see the full set of available topics at a glance through their headers, then expand only what they need. This preserves page-level scannability while guaranteeing that no content is hidden behind navigation to a different page.

## Application Guidelines
- Use clear, descriptive headers that let users predict the content inside without expanding — the header is the primary decision point
- Allow multiple sections to be open simultaneously by default (independent accordions), unless there is a specific reason to enforce single-open behavior
- Include a visual indicator (chevron, plus/minus icon) that clearly communicates the expanded/collapsed state
- Animate the expand/collapse transition smoothly (200-300ms) to help users track the spatial rearrangement of content
- Ensure expanded sections scroll into view when they push content below the viewport
- For long accordion lists, consider an "Expand All / Collapse All" control
- Make accordion headers keyboard-accessible (Enter/Space to toggle) with appropriate ARIA attributes (aria-expanded, aria-controls)

## Anti-Patterns
- Nesting accordions within accordions, creating a deeply buried content structure that is exhausting to navigate
- Using an accordion for critical content that most users need to see — if 80% of users will expand it, it should be visible by default
- Accordion headers that are vague ("More Info," "Details") and do not help users decide whether to expand
- A single-section accordion that forces users to manually expand one section, adding a click for no benefit since there is nothing else to scan
