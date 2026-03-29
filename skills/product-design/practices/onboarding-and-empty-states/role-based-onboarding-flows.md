---
title: Role-Based Onboarding Flows
category: Onboarding & Empty States
tags: [onboarding, wizard, enterprise, cognitive-load]
priority: situational
applies_when: "When your product serves multiple user roles (admin, contributor, manager) and onboarding needs to branch based on what each role needs to accomplish first."
---

## Principle
Onboarding should adapt to the user's role, asking early what they intend to do and then tailoring the setup steps, sample content, and feature highlights accordingly.

## Why It Matters
A single onboarding flow cannot serve an administrator configuring team permissions, a manager tracking project progress, and an individual contributor entering daily data. When all users receive identical onboarding, most of the content is irrelevant to each individual, creating frustration and abandonment. Role-based onboarding respects the user's time by showing only what matters to them, accelerating time-to-value and reducing the overwhelming feeling of seeing features they will never use.

## Application Guidelines
- Ask the user's role or primary goal early in signup or first-run (e.g., "What best describes you?" with 3-4 options) and use this to branch the onboarding flow
- Tailor the initial dashboard, default views, and highlighted features based on the selected role — an admin sees team management and billing first; a contributor sees their task list and quick-entry forms
- Adjust onboarding checklist items per role: admins need to invite users and configure permissions; contributors need to complete their profile and learn core workflows
- Allow users to change their role selection later without penalty — role detection should refine the experience, not lock users into a permanent track
- For products with many roles, group them into 2-4 archetypes to keep the selection simple while still providing meaningful personalization

## Anti-Patterns
- Forcing every user through a 10-step onboarding wizard that covers admin, power-user, and basic-user features sequentially
- Asking the user's role but then delivering identical onboarding regardless of their answer
- Requiring users to self-identify with highly specific or technical role labels they may not recognize ("Are you a Data Steward, Data Analyst, or Data Engineer?")
- Never asking about role or goals and instead surfacing every feature with equal prominence, hoping the user will self-select
