---
title: "Similarity: Encode Function Through Consistent Visual Attributes"
category: Gestalt Principles
tags: [button, navigation, gestalt, consistency]
priority: core
applies_when: "When building any interface where elements of the same function must share identical visual attributes so users recognize functional categories by appearance."
---

## Principle
Elements that share the same function must share the same visual attributes — color, shape, size, and typography — so users can identify functional categories by appearance alone.

## Why It Matters
Similarity is how users build a visual vocabulary for an interface. When all destructive actions are red, all navigation links are the same weight, and all status badges are the same shape, users stop reading and start recognizing. This dramatically accelerates task completion and reduces the learning curve for new users. Breaking Similarity forces users to read every element individually, which does not scale.

## Application Guidelines
- Map each functional category to a unique, consistent visual treatment: primary actions get one style, secondary actions another, destructive actions a third
- Ensure Similarity operates across the entire application, not just within a single page — a "Save" button should look the same everywhere it appears
- When introducing a new element type, verify it does not accidentally share visual attributes with an existing type, which would create false Similarity
- Use Similarity intentionally to create contrast: make the element you want to stand out visually dissimilar from its peers (e.g., a single filled button among ghost buttons)

## Anti-Patterns
- Styling the same action differently on different pages because different designers built them
- Using the same color for both informational badges and interactive buttons, creating false Similarity between non-interactive and interactive elements
- Changing the visual style of a recurring element (e.g., the save button) in a specific context "for emphasis," which trains users that the style is unreliable as a signal
