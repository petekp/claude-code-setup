---
title: Similarity-Based Responsive Touch Targets
category: Gestalt Principles
tags: [button, mobile, responsive, gestalt]
priority: niche
applies_when: "When adapting interactive elements across breakpoints and you need to maintain visual similarity so buttons read as the same type on every viewport."
---

## Principle
Interactive elements of the same type must maintain visual Similarity across all viewport sizes, scaling their touch targets proportionally so affordance cues remain consistent from desktop to mobile.

## Why It Matters
When buttons, links, or controls look different at different breakpoints — changing shape, color, or proportion — users lose confidence in what is tappable. Similarity is how the brain classifies objects as "the same kind of thing." Breaking it across viewports forces users to re-learn the interface on every device, increasing errors and slowing task completion.

## Application Guidelines
- Define interactive element styles (border-radius, fill color, padding ratios, icon size) as tokens that stay consistent regardless of viewport, even when absolute dimensions change
- Ensure all primary action buttons meet minimum touch target sizes (48x48 CSS pixels on mobile) while keeping the same visual proportions — do not just make them taller without also scaling width and padding
- When adapting a row of icon buttons from desktop to mobile, maintain equal sizing and spacing among them so the set still reads as a uniform group
- Test that hover states on desktop and active/pressed states on mobile use the same visual language (e.g., same darkening percentage, same scale transform) to preserve cross-device Similarity

## Anti-Patterns
- Rendering full-label buttons on desktop but icon-only buttons on mobile without any visual cue linking them as the same action
- Allowing touch targets to shrink below minimum sizes at certain breakpoints because "it looks fine on my screen"
- Styling some buttons as pills and others as rectangles within the same functional group just because the layout changed at a breakpoint
