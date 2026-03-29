---
title: Jakob's Law — Leverage Familiar Patterns From Other Products
category: Cognitive Psychology
tags: [navigation, table, keyboard, consistency, mental-model]
priority: core
applies_when: "When deciding whether to follow established conventions from dominant products or invent a custom interaction pattern."
---

## Principle
Users spend most of their time in other products, so they expect your product to work the same way as the ones they already know.

## Why It Matters
Every user arrives with a mental model shaped by the applications they use daily — Gmail, Slack, Figma, Excel, their phone's OS. When your interface matches those established conventions, users can transfer their existing knowledge and become productive immediately. When you deviate from conventions without a compelling reason, you force users to unlearn habits and build new mental models, which feels frustrating and makes your product seem harder to use than it actually is. The cost of being "clever" or "unique" in standard interaction patterns is almost always higher than the benefit.

## Application Guidelines
- Use standard platform conventions for common interactions: swipe-to-delete on mobile, Cmd/Ctrl+S to save, double-click to edit
- Place navigation where users expect it: primary nav on the left or top, user/account menu in the top-right, search prominently accessible
- Follow established e-commerce, SaaS, or domain-specific patterns unless you have validated evidence that a novel approach is significantly better
- When designing data tables, follow spreadsheet conventions (click header to sort, drag to resize columns) because nearly every user has spreadsheet experience
- Match the expected behavior of common components: dropdowns should filter on type, modals should close on Escape, back buttons should go back
- Reserve novelty for your product's unique value proposition, not for standard UI infrastructure

## Anti-Patterns
- Placing the main navigation on the right side of the screen because it "looks different," forcing every user to fight their trained left-side scanning habit
- Inventing a proprietary rich-text editing paradigm when users expect a toolbar similar to Google Docs or Notion
- Using non-standard gestures for standard actions (e.g., long-press to delete instead of swipe) on mobile
- Overriding browser-native behavior like back-button navigation or text selection without a critical reason
