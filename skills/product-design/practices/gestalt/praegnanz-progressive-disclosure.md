---
title: Praegnanz in Progressive Disclosure
category: Gestalt Principles
tags: [layout, dashboard, gestalt, progressive-disclosure]
priority: niche
applies_when: "When designing collapsed or summary views that expand to show detail, and each level needs to feel visually complete and orderly on its own."
---

## Principle
Progressive disclosure should present the simplest, most regular interpretation of the interface at each level of detail, adding complexity only when the user explicitly requests it.

## Why It Matters
The Law of Praegnanz (the tendency to perceive the simplest possible form) means users default to the least complex reading of what they see. If a first-level view is cluttered or structurally irregular, users cannot form a stable mental model before diving deeper. Progressive disclosure succeeds only when each layer feels complete and orderly on its own.

## Application Guidelines
- Design the default collapsed state to convey the essential information in the fewest possible elements — title, status, and one key metric are usually sufficient
- Ensure the visual structure of the collapsed state is geometrically regular (aligned grid, even spacing, symmetrical layout) so Praegnanz is satisfied at a glance
- When expanding to show more detail, reveal content within the existing visual structure rather than reshuffling the layout, so the user's mental model extends rather than breaks
- Limit the number of disclosure levels to two or three — each additional layer adds cognitive overhead that works against Praegnanz

## Anti-Patterns
- Showing a "simple" view that is still visually noisy because it includes decorative elements, redundant labels, or inconsistent alignment
- Expanding a section in a way that pushes surrounding content around unpredictably, violating the user's spatial expectations
- Hiding critical information behind progressive disclosure so aggressively that users must expand every section to accomplish basic tasks
