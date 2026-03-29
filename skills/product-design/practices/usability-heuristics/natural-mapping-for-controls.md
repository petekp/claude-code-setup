---
title: Map Between System and Real World — Natural Mapping for Controls
category: Usability Heuristics
tags: [layout, settings, affordance, mental-model]
priority: niche
applies_when: "When arranging controls so their spatial layout corresponds naturally to the thing they affect, leveraging physical-world spatial reasoning to make the interface self-explanatory."
---

## Principle
Arrange controls and indicators so their spatial layout corresponds naturally to the thing they affect, leveraging physical-world spatial reasoning to make the interface self-explanatory.

## Why It Matters
Don Norman's concept of natural mapping describes the relationship between a control and its effect. When a row of light switches maps spatially to the row of lights they control, no labels are needed — the mapping is self-evident. In software, natural mapping means that a slider on the left controls the left panel, up/down controls move things up/down, and a color picker positioned next to text controls text color. Good mapping eliminates the need for labels and instructions because the interface communicates through spatial logic that humans process intuitively.

## Application Guidelines
- Position controls adjacent to or directly on the elements they affect: a resize handle on the edge of a panel, a color control inline with the text it colors, a volume slider next to the audio it controls
- Use directional consistency: up means increase, right means forward/more, left means back/less — respect the metaphors users bring from the physical world
- Arrange settings panels so that controls appear in the same spatial order as the elements they affect in the output (e.g., header settings at the top, footer settings at the bottom)
- For WYSIWYG editors, place formatting controls as close as possible to the content being formatted — floating toolbars near the selection are better than distant fixed toolbars
- When direct spatial mapping isn't possible, use visual connectors (lines, highlights, animated indicators) to link controls to their effects
- Test mapping clarity by asking: "Can a user determine what this control does without reading its label, based solely on its position and context?"

## Anti-Patterns
- Controls positioned far from the elements they affect, with no visual connection: a footer style control at the top of a sidebar
- Directional controls that move things in the opposite direction users expect (an "up" button that moves an item down in a list)
- Settings pages organized alphabetically or by technical category rather than spatially mapped to what they control
- Controls grouped by implementation convenience (all text inputs together, all toggles together) rather than by the objects they configure
