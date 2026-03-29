---
title: Three-Layer Design Token Architecture
category: Design Systems & Tokens
tags: [layout, theming, consistency]
priority: situational
applies_when: "When organizing design tokens and you need a three-layer architecture (primitives, semantic aliases, component tokens) for flexible theming."
---

## Principle
Organize design tokens into three layers — global primitives, semantic aliases, and component-specific tokens — to create a token system that is both flexible enough for theming and specific enough for component consistency.

## Why It Matters
A flat list of design tokens (color-blue-500, spacing-16, font-size-14) provides no semantic meaning and makes theming impossible — you can't swap "blue-500" for a dark mode equivalent because you don't know what purpose it serves. A purely semantic system (color-primary, color-surface) is too abstract for component-specific overrides. The three-layer architecture provides the right abstraction at each level: raw values at the bottom, purpose-driven semantics in the middle, and component-precise tokens at the top.

## Application Guidelines
- **Layer 1 — Global Primitives:** Define raw values with descriptive names: blue-50 through blue-900, gray-50 through gray-900, space-1 through space-12, font-size-xs through font-size-3xl. These are the full palette, never referenced by components directly.
- **Layer 2 — Semantic Aliases:** Map primitives to purposes: color-bg-surface: gray-50, color-text-primary: gray-900, color-border-default: gray-200, color-interactive: blue-600. These carry meaning and are what theme switching remaps.
- **Layer 3 — Component Tokens:** Map semantic tokens to specific component properties: button-bg-primary: color-interactive, card-border: color-border-default, input-text: color-text-primary. These allow per-component overrides without breaking the semantic layer.
- Each layer references only the layer below it — component tokens reference semantic tokens, semantic tokens reference primitives
- Document the full token chain for debugging: "button-bg-primary → color-interactive → blue-600 → #2563EB"
- Version the token system and communicate changes clearly, since token modifications cascade through the entire application

## Anti-Patterns
- A single flat layer of tokens with no semantic abstraction, making theme switching require remapping every token individually
- Referencing primitive tokens directly in components, bypassing the semantic layer and making theming impossible
- Only two layers (primitives and components) with no semantic middle layer, forcing component tokens to reference raw values
- Token names that embed their current value (color-blue-button) rather than their purpose (color-interactive), making theme switches semantically confusing
