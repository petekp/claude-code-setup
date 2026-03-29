---
title: Progressive Onboarding (Feature Discovery Over Time)
category: Onboarding & Empty States
tags: [onboarding, notification, progressive-disclosure, cognitive-load]
priority: core
applies_when: "When designing the onboarding journey and you need to distribute feature discovery over time rather than front-loading everything into the first session."
---

## Principle
Onboarding should be distributed across the user's entire journey, revealing features and guidance at the moment each becomes relevant rather than front-loading everything into the first session.

## Why It Matters
Users can absorb only a limited amount of new information per session. Front-loaded onboarding that attempts to teach every feature during signup overwhelms users and results in near-zero retention of advanced features. Progressive onboarding introduces capabilities incrementally as the user's competence and needs evolve — basic features on day one, intermediate features as usage patterns emerge, and power features when the user reaches the workflows that need them. This approach matches the natural learning curve and ensures each feature introduction lands with relevance.

## Application Guidelines
- Design an onboarding roadmap with tiers: Day 1 (core value actions), Week 1 (workflow optimization), Month 1 (power features and integrations)
- Trigger feature introductions based on user behavior: when a user manually performs an action three times, suggest the automated version; when they create their tenth record, introduce bulk operations
- Use subtle, non-blocking UI cues (pulsing dots, "New" badges, one-line banners) to draw attention to newly relevant features without interrupting the current task
- Track which features the user has been introduced to and avoid re-surfacing dismissed introductions
- Provide a discoverable "What's new" or "Tips" section where users can browse features they may have missed or dismissed

## Anti-Patterns
- Presenting all features with equal urgency on the first login, overwhelming the user with a fire-hose of information
- Never introducing advanced features at all, relying on users to discover them through exploration or external documentation
- Triggering feature introductions based on time elapsed rather than user behavior — a user who has not yet used basic features does not benefit from advanced feature tips at the 30-day mark
- Using aggressive, hard-to-dismiss modals for progressive feature introductions, turning a helpful pattern into an annoying one
