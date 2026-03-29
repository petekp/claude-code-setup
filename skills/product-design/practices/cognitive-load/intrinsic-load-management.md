---
title: "Intrinsic Load Management: Scaffold High-Complexity Tasks Sequentially"
category: Cognitive Load
tags: [wizard, settings, cognitive-load, progressive-disclosure]
priority: situational
applies_when: "When designing a setup flow, configuration wizard, or any multi-step task where inherent complexity cannot be simplified away."
---

## Principle
When a task is inherently complex, break it into a sequence of manageable steps rather than presenting all complexity simultaneously.

## Why It Matters
Some tasks are genuinely complex — configuring a deployment pipeline, setting up a tax profile, designing a workflow automation. This intrinsic complexity cannot be designed away, but it can be managed. Presenting all of it at once overwhelms users and increases error rates. Sequential scaffolding — guiding users through one focused decision at a time while showing progress — keeps intrinsic load within manageable bounds. The total effort may be the same, but the moment-to-moment cognitive demand stays within human capacity.

## Application Guidelines
- Use step-by-step wizards for complex setup tasks, with each step focused on one conceptual group of decisions
- Show a progress indicator so users know how much remains and can plan their effort
- Allow users to review and edit previous steps without losing progress on subsequent ones
- Provide sensible defaults at each step to reduce the number of active decisions
- For expert users, offer an "advanced mode" that collapses the wizard into a single view — but default to the scaffolded experience

## Anti-Patterns
- Single-page forms with 30+ fields for complex configurations
- Requiring users to understand the entire system before they can complete any part of the setup
- Wizard steps that are so granular they become tedious (one field per page for simple inputs)
- Linear wizards with no ability to skip ahead or return to earlier steps
