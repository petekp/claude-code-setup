---
title: Self-Sufficient Wizard Steps — Include Relevant Context Per Step
category: Workflow & Multi-Step Processes
tags: [wizard, form, cognitive-load, recognition]
priority: situational
applies_when: "When designing wizard steps that should include all necessary context — summaries of prior selections, inline help, dependency explanations — so users never need to navigate backward."
---

## Principle
Design each wizard step to include all the information and context a user needs to complete that step, without requiring them to remember details from previous steps or reference external sources.

## Why It Matters
Wizard steps are often designed as if the user has perfect memory of everything they entered on previous steps and complete knowledge of the system's terminology and requirements. In reality, users forget what they entered two steps ago, don't know what a field label means, and can't remember the constraints they chose earlier. Self-sufficient steps include relevant context, summaries of previous selections, and explanatory help — reducing errors and eliminating the need to navigate backward to check previous decisions.

## Application Guidelines
- Show a compact summary of relevant previous-step selections at the top of each step: "You selected: Standard Plan, Annual Billing, 50 seats"
- Include inline help text for every non-obvious field, explaining what it does, why it's needed, and what the impact of each option is
- When a step's options depend on a previous selection, make this dependency visible: "Because you selected Enterprise Plan, the following security options are available"
- Provide contextual validation messages that reference the full picture: "Your total will be $5,000/year (50 seats × $100/seat × annual billing)"
- If a step requires external information (an API key, a billing address, a team member's email), tell the user at the beginning of the step so they can gather it before filling in fields
- Include "What does this mean?" expandable sections for complex concepts rather than assuming domain knowledge

## Anti-Patterns
- Wizard steps that reference previous selections with no summary, forcing users to click Back to remember what they chose
- Steps that assume domain expertise: "Configure your SAML SSO" with no explanation of what SAML is or why it matters
- Fields that require external information (API keys, credentials, account numbers) with no forewarning, causing users to abandon the step to look up information
- Validation messages that reference system internals rather than user-understandable concepts
