---
title: Smart Defaults in Forms and Configuration
category: Forms & Input
tags: [form, settings, cognitive-load, recognition]
priority: core
applies_when: "When designing any form, configuration screen, or setup flow where fields have a predictable most-common value."
---

## Principle
Pre-populate form fields and configuration settings with the most likely correct values, reducing the number of decisions a user must actively make.

## Why It Matters
Every field a user must fill out represents a decision point that consumes cognitive resources. Smart defaults eliminate unnecessary decisions for the majority of users while still allowing customization for edge cases. Research consistently shows that default values heavily influence final selections — most users accept defaults — making thoughtful default selection both a usability optimization and a product design responsibility.

## Application Guidelines
- Default to the most commonly selected option based on usage data; when data is unavailable, choose the safest or most standard option
- Pre-fill fields from previously entered data (e.g., shipping address from billing address, timezone from browser locale, name from account profile)
- For date fields, default to today's date when the most common use case is "now"; for scheduling, default to the next logical slot
- Use adaptive defaults that learn from the individual user's history (e.g., most recently used project, preferred export format)
- Make defaults visible and easily changeable — never hide a pre-selected default behind a collapsed section
- For configuration screens, ensure the "zero-config" default state is functional and safe — users should be able to skip configuration entirely and get a reasonable experience

## Anti-Patterns
- Leaving all form fields blank when 80% of users will enter the same value, forcing every user to manually input predictable data — or worse, defaulting to a value that benefits the business but not the user (e.g., opting into marketing emails)
