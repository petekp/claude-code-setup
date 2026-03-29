---
title: Gestalt — Law of Similarity for Interactive Affordance
category: Cognitive Psychology
tags: [button, card, icon, gestalt, affordance]
priority: situational
applies_when: "When establishing a consistent visual language for interactive elements so users can distinguish clickable from static content across the product."
---

## Principle
Elements that share visual properties — color, shape, size, or typography — are perceived as belonging to the same functional category, so interactive elements must look consistently distinct from static content.

## Why It Matters
Users unconsciously rely on visual similarity to infer what is clickable, editable, or actionable. When interactive elements lack a consistent visual signature, users either miss actions they need or waste time clicking on static text expecting something to happen. This directly impacts task success rate and perceived product quality. Consistent affordance signals reduce the learning curve for new features because users can transfer their understanding from one part of the interface to another.

## Application Guidelines
- Establish a clear, product-wide visual language that differentiates interactive elements (links, buttons, form fields) from static content (labels, descriptions, headings)
- All primary actions should share a common visual treatment (e.g., filled buttons in brand color); all secondary actions should share a different but equally consistent treatment
- Use the same shape, elevation, and padding for all interactive cards so users recognize them as tappable without inspecting each one
- Ensure inline links are visually distinct from surrounding body text through color and underline — not just color alone
- Interactive icons should share a consistent weight, size, and hover/focus style that distinguishes them from decorative icons

## Anti-Patterns
- Styling some clickable items as blue underlined text and others as plain bold text within the same view, breaking the user's mental model of "what is a link"
- Using the same card style for both informational summaries and actionable items, so the user cannot tell which cards are clickable without hovering
- Making static labels visually identical to editable fields, causing users to click on read-only text expecting an input
