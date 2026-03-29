---
title: Learnability Through Concrete Examples
category: Onboarding & Empty States
tags: [form, text, onboarding, cognitive-load]
priority: situational
applies_when: "When introducing complex features like query builders, formula fields, or template editors where concrete examples teach faster than abstract descriptions."
---

## Principle
Abstract descriptions of features are far less effective than concrete examples that show users exactly what input produces what output.

## Why It Matters
Users comprehend new concepts fastest when shown specific, realistic instances rather than abstract definitions. A query builder that shows "e.g., status = active AND created > 30 days ago" teaches the syntax in seconds, while a description of "supported operators include equals, greater than, and logical AND" requires the user to construct the example mentally. Concrete examples reduce the cognitive load of learning new interfaces, especially for power features like search syntax, formula fields, API configurations, and template systems.

## Application Guidelines
- Show a completed example alongside every blank input for complex features (query builders, formula fields, template editors, regex inputs)
- Use realistic domain-specific examples that match the user's context rather than generic placeholders — a CRM should show "company:Acme AND deal_stage:negotiation", not "field:value AND field:value"
- Provide a gallery of example templates or configurations that users can select and modify rather than building from scratch
- When introducing a new feature, show a before/after or input/output pair that makes the feature's effect immediately tangible
- Include example values in API documentation, webhook configuration, and integration setup screens — never show only the abstract schema

## Anti-Patterns
- Describing a feature's capabilities in abstract terms without ever showing a concrete instance of its use
- Using lorem ipsum or obviously fake data in examples that fails to communicate how the feature applies to real work
- Showing only the simplest possible example that does not demonstrate the feature's actual power (e.g., a single-condition filter when the feature supports complex boolean logic)
- Placing examples only in external documentation rather than inline where the user is configuring the feature
