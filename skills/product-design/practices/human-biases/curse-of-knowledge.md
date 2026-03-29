---
title: Curse of Knowledge
category: Human Biases in Interfaces
tags: [text, empty-state, error-handling, mental-model]
priority: situational
applies_when: "When writing UI copy, error messages, or labels and you need to ensure language is comprehensible to users without domain expertise."
---

## Principle
Once you understand how something works, you become incapable of imagining what it is like not to understand it — making expert-designed interfaces systematically hostile to the people they are built for.

## Why It Matters
Product teams live inside their product daily. They understand every abbreviation, every navigation path, every hidden feature. This deep familiarity makes it neurologically difficult to see the product through a newcomer's eyes. The result is interfaces with cryptic icons, unexplained workflows, missing context, and error messages that assume knowledge the user does not have. This bias is especially dangerous because it is invisible to the people who have it — the more expert you become, the less you realize what you are assuming.

## Application Guidelines
- Write all UI copy as if the user has never seen the product before — then test it with someone who has not
- Replace jargon with plain language, or provide inline definitions when technical terms are unavoidable
- Include contextual help at decision points, not just in a help center users will not visit
- Use the "mom test" for critical flows: could someone unfamiliar with your domain complete this task?
- Mandate regular usability testing with actual new users, not just internal QA passes
- Write error messages that explain what happened, why, and what to do next — not error codes

## Anti-Patterns
- Tooltip text that explains jargon with more jargon
- Empty states with no guidance ("No items found" with no explanation of how to create one)
- Onboarding tours that show where features are without explaining why a user would need them
- Settings labeled with internal feature names instead of user-facing descriptions of what they control
