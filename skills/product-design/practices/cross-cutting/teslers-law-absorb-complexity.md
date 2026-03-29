---
title: Tesler's Law — Absorb Complexity Into the System
category: Cross-Cutting Principles
tags: [form, settings, validation, cognitive-load]
priority: core
applies_when: "When users are performing manual complexity — calculating, formatting, cross-referencing — that the system could handle internally through smart defaults, flexible parsing, or auto-computation."
---

## Principle
Every process has an irreducible amount of complexity; the design question is whether that complexity is borne by the user or absorbed by the system. Prefer system-side complexity that simplifies the user's experience.

## Why It Matters
Larry Tesler's Law of Conservation of Complexity states that complexity cannot be eliminated — only moved. When a system requires users to format dates, calculate totals, resolve conflicts, or manually configure settings, it's externalizing complexity that the system could handle internally. Great product design identifies the complexity that users currently bear and systematically moves it into the system: auto-formatting inputs, calculating derived values, resolving simple conflicts automatically, and providing intelligent defaults. The user's experience becomes simpler, even though the system becomes more sophisticated.

## Application Guidelines
- Audit user workflows for manual complexity: anywhere users are calculating, formatting, cross-referencing, or doing routine decision-making, consider whether the system can do it for them
- Provide intelligent defaults that handle 80%+ of cases: pre-fill forms with likely values, auto-select common options, suggest entries based on patterns
- Accept flexible input formats and normalize internally: accept dates in any reasonable format, accept phone numbers with or without formatting, trim whitespace, fix capitalization
- Auto-compute derived values: if the system has the inputs to calculate a total, a deadline, or a status, compute it rather than asking the user to enter it
- Handle routine error recovery automatically: retry failed network requests, resolve simple merge conflicts, auto-correct common data entry errors
- Reserve user-facing complexity for decisions that genuinely require human judgment — the system should handle everything else

## Anti-Patterns
- Requiring users to format data according to strict system rules (e.g., "Enter date in YYYY-MM-DD format") when the system could accept any common format and parse it
- Asking users to compute values the system already has the data to calculate (e.g., requiring manual entry of a total that's the sum of line items)
- Presenting raw system complexity to users: database constraints as error messages, API limitations as UI restrictions, infrastructure details as configuration options
- Simplifying the UI by removing capability rather than by moving complexity into the system
