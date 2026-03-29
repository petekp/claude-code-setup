---
title: Appropriate Control Selection for Form Inputs
category: Forms & Input
tags: [form, button, accessibility, affordance, recognition]
priority: core
applies_when: "When building a form and choosing which input control type (dropdown, radio, checkbox, toggle, combobox) to use for each field."
---

## Principle
Every form input should use the control type that best matches the nature of the data, the number of options, and the selection behavior expected by the user.

## Why It Matters
Choosing the wrong control type creates friction: a dropdown with two options wastes a click, a text field for a fixed set of choices invites typos, and radio buttons for 20+ options overwhelm the screen. The right control reduces errors, speeds completion, and communicates the expected input format without requiring instructions. Users develop strong expectations about how controls behave — violating those expectations erodes trust and slows task completion.

## Application Guidelines
- Use radio buttons for 2-5 mutually exclusive options where all choices should be visible simultaneously
- Use a dropdown/select for 6-15 mutually exclusive options, and a searchable combobox for 15+ options
- Use checkboxes for independent boolean choices or multi-select from a small set; use a multi-select list or chip input for larger multi-select sets
- Use toggle switches only for immediate on/off settings that take effect without a save action — never as a substitute for checkboxes in forms with a submit button
- Use date pickers for date input rather than free-text fields; use steppers or sliders for bounded numeric ranges with a small number of discrete values
- Use text areas (not single-line inputs) when the expected response exceeds a single sentence

## Anti-Patterns
- Using a dropdown with only two options (yes/no, on/off) when radio buttons or a single checkbox would eliminate an unnecessary click and show both options at once
