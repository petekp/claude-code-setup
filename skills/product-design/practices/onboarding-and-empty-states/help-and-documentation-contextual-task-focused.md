---
title: Help and Documentation — Contextual and Task-Focused
category: Onboarding & Empty States
tags: [search, tooltip, onboarding, mental-model]
priority: core
applies_when: "When organizing help content and you need to structure it around user tasks and goals rather than product features, with contextual access from within the product."
---

## Principle
Help content must be organized around user tasks and goals, not around product features or internal architecture, and it must be accessible without leaving the user's current context.

## Why It Matters
Nielsen's tenth usability heuristic acknowledges that even well-designed systems need documentation. The failure mode is not the existence of documentation but its organization and accessibility. When help is structured as a feature encyclopedia ("About the Dashboard," "About Reports," "About Settings"), users must first translate their task into the product's vocabulary before finding relevant guidance. Task-focused help ("How to track monthly revenue," "How to invite a teammate") meets users where they are and reduces the translation burden.

## Application Guidelines
- Structure help articles around user tasks and goals ("How to create a recurring invoice") rather than feature descriptions ("About the Invoice Module")
- Provide contextual help links within the product that deep-link to the relevant help article for the current screen or workflow step
- Include searchable help that surfaces results from both documentation and in-product UI labels so users can find help regardless of whether they use the product's terminology
- Offer layered help: a brief inline tooltip for quick reference, a linked help article for detailed guidance, and a contact/chat option for complex issues
- Keep help content updated with the product — stale documentation that describes a previous version of the UI is worse than no documentation

## Anti-Patterns
- Organizing the entire help center as a mirror of the product's navigation structure, forcing users to know which feature category their question falls under
- Linking to a generic "Help Center" homepage from every screen instead of deep-linking to the contextually relevant article
- Writing help articles in developer or product-manager jargon rather than the language users actually use to describe their tasks
- Providing only video-based help with no text alternative, which cannot be searched, scanned, or referenced quickly
