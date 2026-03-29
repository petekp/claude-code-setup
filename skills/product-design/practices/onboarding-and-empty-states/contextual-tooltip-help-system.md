---
title: Contextual Tooltip Help System
category: Onboarding & Empty States
tags: [tooltip, form, onboarding, progressive-disclosure]
priority: situational
applies_when: "When adding help content to complex labels, unfamiliar terminology, or fields with non-obvious formatting requirements via tooltips triggered at the point of need."
---

## Principle
Help content should appear at the point of need, adjacent to the element it explains, triggered by user intent rather than forced on every visit.

## Why It Matters
Users rarely read documentation proactively — they seek help only when they are stuck or uncertain. A contextual tooltip system places explanations, definitions, and guidance exactly where the user encounters confusion, eliminating the context-switch cost of navigating to a help center or documentation site. When tooltips are well-designed, they reduce support tickets, accelerate onboarding, and make complex features accessible without simplifying the interface itself.

## Application Guidelines
- Use an info icon or subtle help indicator next to complex labels, unfamiliar terminology, or fields with non-obvious formatting requirements
- Keep tooltip content concise: 1-2 sentences maximum. If more explanation is needed, link to detailed documentation from within the tooltip
- Trigger tooltips on hover (desktop) and tap (mobile), not automatically on page load — respect the user's attention and only surface help when requested
- Include concrete examples in tooltips where possible ("e.g., YYYY-MM-DD" for a date format field) rather than abstract descriptions
- Position tooltips so they do not obscure the element they are explaining or other content the user needs to see simultaneously

## Anti-Patterns
- Attaching tooltips to every single field on a form, creating a sea of info icons that adds visual noise rather than reducing confusion
- Using tooltips for critical information that should be visible without interaction (e.g., hiding required field indicators in tooltips)
- Creating tooltips that are longer than 3-4 lines, which should instead be inline help text or a linked documentation page
- Showing tooltips automatically on page load or on a timer, interrupting the user's focus without being requested
