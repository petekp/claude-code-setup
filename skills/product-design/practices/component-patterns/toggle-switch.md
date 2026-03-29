---
title: Toggle / Switch — Immediate-Effect Binary Settings
category: Component Patterns
tags: [button, settings, mobile, affordance, feedback-loop]
priority: situational
applies_when: "When implementing an on/off control for a binary setting that takes effect immediately without a save action."
---

## Principle
Toggles (switches) should be used exclusively for binary settings that take effect immediately upon interaction, without requiring a separate save action.

## Why It Matters
The toggle's physical metaphor — a light switch — sets a strong user expectation: flip it and the state changes instantly. This makes toggles ideal for on/off settings like "Enable notifications" or "Dark mode." When toggles are used in forms that require a save action, or for non-binary choices, the metaphor breaks and users become confused about whether their change has taken effect. The distinction between a toggle (instant effect) and a checkbox (batched with a save action) is functionally important and must be maintained.

## Application Guidelines
- Use toggles for immediate binary state changes: enable/disable features, show/hide content, on/off preferences
- Always show the current state clearly — the toggle position plus an explicit label like "On" or "Enabled"
- Provide instant visual feedback when toggled, including any relevant system response (e.g., dark mode actually activating)
- Include a brief description of what the toggle controls, especially when the label alone might be ambiguous
- When a toggle triggers a significant change (e.g., making a project public), confirm with a brief inline prompt before applying
- Use checkboxes instead of toggles when the change requires an explicit save action or when multiple boolean options are part of a form
- Ensure the toggle is large enough for comfortable touch interaction (minimum 44px tap target)

## Anti-Patterns
- A toggle in a form that requires clicking "Save" to take effect — this contradicts the immediate-action expectation of the toggle metaphor
- A toggle with no visible indication of its current state, leaving users unsure whether the feature is on or off
- Using a toggle for a choice with more than two options (e.g., Low / Medium / High) — use radio buttons or a segmented control instead
- A toggle that triggers a destructive or irreversible action without any confirmation
