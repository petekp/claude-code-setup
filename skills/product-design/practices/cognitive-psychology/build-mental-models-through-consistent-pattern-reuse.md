---
title: Build Mental Models Through Consistent Pattern Reuse
category: Cognitive Psychology
tags: [navigation, form, consistency, mental-model]
priority: situational
applies_when: "When adding a new feature or section to an existing product and deciding whether to reuse established interaction patterns or introduce novel ones."
---

## Principle
Users build internal mental models of how a system works by observing patterns, so reusing the same interaction patterns across the product accelerates learning and builds confidence.

## Why It Matters
A mental model is the user's internal theory of how your product behaves. Strong mental models let users predict what will happen before they act, which is the foundation of confident, efficient usage. Every time a pattern is reused consistently, it reinforces the mental model. Every time a pattern is contradicted, the mental model fractures and the user must either investigate, guess, or retreat. Products with strong pattern reuse feel "learnable" — users who master one section can immediately navigate new sections. Products with inconsistent patterns feel perpetually unfamiliar.

## Application Guidelines
- Define a finite set of interaction patterns (list → detail, create → configure → confirm, filter → sort → act) and apply them uniformly across all features
- When adding a new feature, default to an existing pattern before considering a novel one — novel patterns require learning investment from every user
- Use the same edit/save/cancel paradigm everywhere: if some forms auto-save and others require explicit save actions, the mental model breaks
- Maintain consistent information density across similar views — if one list view shows 6 columns, a similar list view shouldn't show 15
- When patterns must evolve, migrate the entire product simultaneously rather than creating a split experience where old and new patterns coexist
- Document your pattern library internally so every designer and engineer implements patterns the same way

## Anti-Patterns
- Using inline editing for some data fields and a separate edit screen for others within the same feature, with no discernible logic for which approach is used where
- Having one section of the product use auto-save while another requires manual save, with no visual indicator of the difference
- Introducing a completely novel navigation paradigm for one feature while the rest of the product uses a standard sidebar pattern
- Gradually redesigning the product feature-by-feature, leaving users in a split experience of old and new patterns for months
