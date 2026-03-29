---
title: "Fitts's Law — Size and Proximity of Action Targets"
category: Interaction Patterns
tags: [button, toolbar, mobile, fitts-law]
priority: core
applies_when: "When sizing and positioning interactive elements, especially buttons, links, and touch targets, to ensure they are easy to reach and click without errors."
---

## Principle
The time to reach a target is a function of the target's size and distance — make frequently used and important interactive elements large and place them close to where the user's focus already is.

## Why It Matters
Fitts's Law is one of the most robust predictive models in human-computer interaction: smaller, more distant targets take longer to click and produce more errors. This has direct implications for button sizing, menu placement, toolbar design, and touch target spacing. Ignoring Fitts's Law results in interfaces that feel sluggish and error-prone even when the software is technically fast, because the interaction overhead of reaching small, distant targets dominates the experience.

## Application Guidelines
- Size primary action buttons at minimum 44x44px for touch (Apple HIG) or 48x48dp (Material Design) and 32x32px for mouse; increase size for the most critical actions
- Place primary actions near the user's current focus area — inline actions near the selected item, submit buttons near the last form field
- Use screen edges and corners for frequently accessed controls (menus, navigation) because the cursor cannot overshoot the edge, effectively making the target infinitely tall/wide
- Group related actions together to minimize mouse travel between sequential steps
- For destructive actions, make them smaller and further from primary actions to reduce accidental clicks — the inverse application of Fitts's Law
- On mobile, place frequent actions in the thumb zone (lower half of the screen) and avoid placing critical buttons in hard-to-reach corners
- Extend the clickable area of text links using padding so the hit area is larger than the visible text
- Space interactive elements at least 8px apart to prevent accidental taps on neighboring targets
- For text-heavy pages with multiple inline links, ensure each link has enough surrounding non-interactive space to be targeted without accidentally hitting adjacent links

## Anti-Patterns
- Placing a tiny 16x16px "Save" icon in the top-right corner of a form where the user's focus is at the bottom-left, requiring a long mouse journey to a small target for the most frequent action in the workflow
- Placing two small text links ("Edit" and "Delete") directly next to each other with no spacing or padding, creating a situation where users frequently tap the wrong action
