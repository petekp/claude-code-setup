---
title: Match Between System and the Real World
category: Usability Heuristics
tags: [text, navigation, mental-model, consistency]
priority: core
applies_when: "When choosing terminology, information ordering, or conceptual framing for an interface that should use the user's domain language rather than system-oriented jargon."
---

## Principle
Use language, concepts, and conventions from the user's real-world domain rather than system-oriented technical terminology, so the interface feels like a natural extension of how users already think and work.

## Why It Matters
Every piece of technical jargon in an interface is a translation tax. When a healthcare worker sees "Update encounter entity" instead of "Edit patient visit," they must pause to translate system language into domain language before they can act. Multiplied across hundreds of interactions per day, this translation overhead significantly slows work and increases error rates. Interfaces that speak the user's language eliminate this tax entirely, making the tool feel invisible and letting users focus on their actual work.

## Application Guidelines
- Research your users' actual vocabulary through interviews, observing their work, and reading their existing documents — don't assume you know their terms
- Use domain terminology consistently: if users call it a "case," don't call it a "ticket" or "record" in the interface
- Follow real-world conventions for information ordering: addresses in the format people expect (street, city, state, zip), dates in the locale-appropriate format
- Use metaphors that match the physical process: a "file cabinet" for document storage, a "queue" for ordered work items, an "inbox" for incoming items to process
- Present information in a natural, logical order that matches the user's workflow sequence, not the database schema order
- When technical terms are unavoidable, provide inline definitions or tooltips that translate them into domain language

## Anti-Patterns
- Using database field names or developer terminology in the UI: "created_at" instead of "Created Date," "org_id" instead of "Organization"
- Inventing new terminology for concepts that already have well-established names in the user's domain
- Organizing information by system architecture (tables, entities, modules) rather than by the user's mental model of their work
- Error messages that reference technical concepts: "Foreign key constraint violation" instead of "This item is still being used by other records and cannot be deleted"
