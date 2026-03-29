---
title: Von Restorff Effect — Visual Isolation for Primary Actions
category: Layout & Visual Hierarchy
tags: [button, layout, card, scanning, cognitive-load]
priority: situational
applies_when: "When you need one element per screen to stand out from its surroundings and be noticed and recalled more reliably than its peers."
---

## Principle
When one element is visually distinct from its surroundings, it is more likely to be noticed and remembered — use this effect deliberately to isolate the single most important action or element on each screen.

## Why It Matters
The Von Restorff effect (also called the isolation effect) is a cognitive bias where items that stand out from their context receive disproportionate attention and recall. The effect is automatic and pre-attentive — users notice the different item before conscious processing begins. In interface design, this means that a single visually distinct primary CTA will be found faster, clicked more confidently, and remembered between sessions. The effect only works when isolation is rare — if multiple elements compete for distinctiveness, none of them benefit and the result is visual chaos.

## Application Guidelines
- Assign a single filled, high-contrast primary button per screen or section — all other actions should use secondary (outlined) or tertiary (text-link) styling
- Use your brand's primary action color exclusively for the primary CTA; never reuse that exact color for non-interactive elements or informational badges
- Create visual isolation through whitespace — give the primary action generous padding so it is not crowded by adjacent elements
- In lists or grids, make the "recommended" or "default" option visually distinct through border treatment, background color, or a badge — but only for one item
- Maintain consistency: the primary action color and style should mean the same thing across every screen in the product
- Ensure the visually distinct element is also the most important element — do not accidentally draw attention to the wrong thing

## Anti-Patterns
- Using the primary action color on three or more buttons in the same view, destroying the isolation effect
- Making destructive actions (Delete, Remove) visually identical to constructive primary actions (Save, Submit) — both become "distinct," so neither stands out
- Applying attention-grabbing treatments (pulsing animations, bright colors, large size) to multiple elements simultaneously, resulting in a carnival effect
- Changing the primary CTA position from screen to screen, undermining the spatial predictability that reinforces the Von Restorff benefit
- Highlighting promotional content more prominently than functional content, drawing attention away from the user's task
- Relying solely on color to create distinction, excluding color-blind users from the effect
