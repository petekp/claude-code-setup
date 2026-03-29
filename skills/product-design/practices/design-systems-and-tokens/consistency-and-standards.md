---
title: Consistency and Standards
category: Design Systems & Tokens
tags: [navigation, form, button, consistency, mental-model]
priority: core
applies_when: "When building any part of an application and you need uniform interaction patterns, visual design, and terminology so users can transfer learning."
---

## Principle
Maintain consistent interaction patterns, visual design, and terminology throughout the application so that users can transfer knowledge from one area to another without relearning.

## Why It Matters
Every inconsistency in an interface creates a learning moment — the user must stop, process the difference, and adjust their mental model. When the same action is triggered by a button in one place and a link in another, when the same concept is called "project" on one screen and "workspace" on another, or when tables sort differently across views, users build unreliable mental models that slow them down and cause errors. Consistency reduces cognitive load because users learn patterns once and apply them everywhere.

## Application Guidelines
- Establish and document interaction patterns: how tables sort, how forms validate, how modals behave, how notifications appear — and apply them uniformly
- Use consistent terminology: maintain a glossary of product terms and ensure every team member uses the same word for the same concept
- Standardize component usage: if status is shown with a colored badge in one list, use the same badge component in every list
- Follow platform conventions (web, macOS, Windows) for common interactions so users can leverage existing knowledge
- Conduct regular consistency audits across the application, checking navigation patterns, button styles, form layouts, and terminology
- Build a living design system with documented components and patterns that all teams reference as the single source of truth

## Anti-Patterns
- Different development teams building the same component with different visual designs and interaction patterns
- Using multiple words for the same concept ("delete" vs. "remove" vs. "trash" for the same action) across different screens
- Inconsistent placement of common actions — Save on the left in one form and on the right in another
- Modal dialogs that behave differently in different contexts: some close on overlay click, some don't; some have X buttons, some don't
