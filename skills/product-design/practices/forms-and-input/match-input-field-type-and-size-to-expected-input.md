---
title: Match Input Field Type and Size to Expected Input
category: Forms & Input
tags: [form, mobile, affordance, mental-model]
priority: core
applies_when: "When sizing form fields and choosing HTML input types to communicate expected input length and trigger correct mobile keyboards."
---

## Principle
The visual size and HTML type of an input field should communicate the expected length and format of the data it accepts.

## Why It Matters
Field size acts as an implicit affordance that signals expected input length. A full-width text field for a two-digit state abbreviation wastes space and suggests a longer input is expected. A tiny field for a paragraph-length response discourages thorough answers. Using the correct HTML input type (email, tel, url, number) triggers the appropriate virtual keyboard on mobile devices, dramatically improving the input experience on touch interfaces.

## Application Guidelines
- Size fields proportionally to expected input: zip code fields should be narrow, address fields should be wide, description fields should use textareas
- Use HTML5 input types (email, tel, url, number, date) to trigger the correct keyboard layout on mobile and enable browser-native validation
- Set appropriate maxlength attributes that match real-world constraints (e.g., 5 or 9 for US zip, 10-15 for phone numbers)
- Use textarea elements for multi-line input; set a visible initial height of 3-5 rows to invite longer responses, and allow vertical resizing
- For numeric inputs, use inputmode="numeric" with a text type when you need a numeric keyboard but do not want browser-native number spinners (e.g., credit card numbers)
- Align field widths within a form for visual consistency, but vary them enough to provide meaningful length hints

## Anti-Patterns
- Using a generic full-width text input with type="text" for every field in a form — a phone number, a zip code, an email, and a paragraph description all rendered at the same width with the same keyboard — providing no visual or interactive cues about expected input
