---
title: "Past Experience / Familiarity Principle in Convention-Based Design"
category: Gestalt Principles
tags: [navigation, icon, gestalt, mental-model, consistency]
priority: situational
applies_when: "When choosing between a novel interaction pattern and an established convention, and you need to decide whether the novelty is worth the learning cost."
---

## Principle
Users perceive and group interface elements based on prior experience with similar interfaces, so designs should leverage established conventions before introducing novel patterns.

## Why It Matters
Every user arrives with a mental library of interface patterns shaped by years of using other software. When your design aligns with those expectations, users orient instantly. When it deviates without clear benefit, users must unlearn habits and rebuild their mental model -- a costly cognitive tax that increases errors and slows adoption.

## Application Guidelines
- Place primary navigation where users expect it (top bar for marketing sites, left sidebar for SaaS tools) unless research justifies otherwise
- Use universally recognized icons (hamburger for menu, magnifying glass for search, gear for settings) before inventing custom iconography
- Follow platform conventions for interactive patterns (e.g., swipe to delete on iOS, right-click context menus on desktop)
- When introducing a novel interaction, bridge from the familiar by using progressive disclosure or onboarding cues that connect the new pattern to known ones

## Anti-Patterns
- Moving the shopping cart icon to the left side of the header because it "looks better" in the layout
- Replacing the standard "X" close button on modals with a custom word or icon that users do not recognize
- Using non-standard scrolling behavior (horizontal scroll for vertical content) without strong contextual justification
