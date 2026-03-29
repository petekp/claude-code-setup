---
title: Component Variants via Properties (Not Separate Components)
category: Design Systems & Tokens
tags: [button, layout, consistency]
priority: situational
applies_when: "When building design system components and you need variant props (size, intent, style) on a single component rather than separate components per variation."
---

## Principle
Express component variations (size, style, state, intent) through variant properties on a single component rather than creating separate components for each variation.

## Why It Matters
When a design system creates ButtonPrimary, ButtonSecondary, ButtonDanger, ButtonSmall, ButtonLargeOutline as separate components, the system becomes fragmented and hard to maintain. Changing shared behavior (like focus ring styling) requires updating every variant independently. A single Button component with variant props (intent="primary|secondary|danger", size="sm|md|lg", variant="solid|outline|ghost") keeps all button logic in one place, makes the full set of possibilities discoverable through a single API, and reduces the maintenance surface area.

## Application Guidelines
- Define clear variant dimensions for each component: size (sm, md, lg), intent/color (primary, secondary, danger, warning), style (solid, outline, ghost, link)
- Use a single component with enumerated props rather than separate component files for each variant
- Ensure all variant combinations are valid and tested — if Button can be size="sm" and intent="danger", test that specific combination
- Document variant options with visual examples showing every valid combination in a component gallery or storybook
- Use TypeScript enums or union types to enforce valid variant values and prevent arbitrary customization
- Limit variant dimensions to 3-4 per component — if more are needed, the component may be trying to do too much and should be decomposed

## Anti-Patterns
- Creating separate component files for each visual variant (PrimaryButton.tsx, SecondaryButton.tsx, DangerButton.tsx)
- Using className or style overrides to create ad-hoc variants outside the design system, bypassing the component API
- Having so many variant combinations that no one can remember them all — a component with 5 dimensions of 4 options each creates 1,024 combinations
- Variant props that accept arbitrary strings rather than constrained enums, allowing developers to pass invalid values
