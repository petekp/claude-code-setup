---
title: Wizards — Use for Novice Users and Infrequent Complex Processes
category: Workflow & Multi-Step Processes
tags: [wizard, form, progressive-disclosure, mental-model]
priority: situational
applies_when: "When deciding whether a process warrants a step-by-step wizard (infrequent, complex, novice users) or a flat form (routine, simple, expert users)."
---

## Principle
Use wizard (step-by-step) interfaces for processes that are performed infrequently, by novice users, or that involve complex decisions requiring guided order — not for routine operations performed by experienced users.

## Why It Matters
Wizards excel at reducing complexity for unfamiliar processes by breaking them into guided steps with explanations at each stage. However, this same step-by-step structure becomes a frustrating bottleneck for frequent, familiar operations. The key design decision is knowing when a wizard helps (first-time setup, complex configuration, infrequent processes) versus when it hurts (daily operations, expert workflows, simple actions). Applying wizards correctly dramatically improves completion rates for complex processes while avoiding unnecessary friction for routine tasks.

## Application Guidelines
- Use wizards for processes performed less than once a month or by users encountering the process for the first time
- Use wizards when the process has inherent step dependencies (step 3's options depend on step 2's choices) that make a flat form confusing
- Provide a "quick mode" or form-based alternative alongside the wizard for experienced users who know the process and want to skip the guidance
- Include explanatory content at each wizard step: why this information is needed, what happens next, and what the impact of each choice is
- Show a clear progress indicator with step labels so users know where they are and how much remains
- Allow experienced users to jump to specific steps rather than forcing sequential traversal when steps are independent

## Anti-Patterns
- Using a 5-step wizard for a process that has 3 fields and could be a simple inline form
- Forcing all users through a wizard with no fast-path alternative, penalizing experienced users who perform the process daily
- Using wizards for processes where steps are independent and don't require sequential order — a flat form with sections is better
- Wizard steps with a single field each, creating excessive navigation friction for minimal complexity reduction
