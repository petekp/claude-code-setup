---
title: False Consensus Effect
category: Human Biases in Interfaces
tags: [navigation, settings, mental-model, trust]
priority: niche
applies_when: "When making design decisions based on team intuition rather than user research, or when navigation and labels reflect internal org structure instead of user goals."
---

## Principle
Designers systematically overestimate how much users share their own mental models, preferences, and technical fluency — leading to interfaces that work for the team but confuse the audience.

## Why It Matters
When product teams assume users think the way they do, navigation structures mirror internal org charts, labels use insider jargon, and default settings optimize for power-user workflows. This creates interfaces where the "obvious" path is only obvious to the people who built it. The result is increased support burden, lower activation rates, and silent churn from users who blame themselves rather than the product.

## Application Guidelines
- Validate assumptions about user behavior with actual usage data, not team consensus or stakeholder opinion
- Run first-click tests and tree tests with representative users before committing to information architecture
- Default to the simplest, most common user path — not the path your team would take
- When debating design decisions internally, explicitly ask "is this what we prefer, or what evidence says users prefer?"
- Use progressive disclosure to serve both novice and expert mental models without forcing one group into the other's paradigm

## Anti-Patterns
- Designing settings panels that reflect engineering architecture instead of user goals (e.g., "Configure WebSocket Parameters" instead of "Notification Speed")
- Skipping usability testing because "it's intuitive" based on team agreement
- Using internal terminology in UI copy because everyone on the team understands it
- Assuming users will read documentation or tooltips to bridge comprehension gaps the team doesn't experience
