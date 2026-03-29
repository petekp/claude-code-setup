---
title: Enterprise Onboarding — Self-Service Success Without Training
category: Onboarding & Empty States
tags: [wizard, onboarding, enterprise, validation]
priority: situational
applies_when: "When building enterprise setup flows (SSO, data import, permissions, integrations) that need to be completable without formal training or professional services."
---

## Principle
Enterprise software must be designed so that users can onboard, configure, and achieve their first value without requiring formal training, live demos, or customer success intervention.

## Why It Matters
Enterprise products historically relied on professional services, training sessions, and dedicated customer success managers to onboard users. This model does not scale, creates a dependency that delays time-to-value, and fails the growing population of enterprise users who expect consumer-grade self-service experiences. When enterprise software requires training to use, every new hire, role change, and feature release creates a training bottleneck. Self-service onboarding eliminates this bottleneck and puts the user in control of their own learning pace.

## Application Guidelines
- Design every setup workflow (SSO configuration, data import, team permissions, integrations) as a guided wizard with clear progress indicators, inline validation, and contextual help — never as a raw configuration form with a link to documentation
- Provide pre-built templates for common configurations (role hierarchies, workflow automations, report layouts) so teams can start from a proven pattern instead of a blank slate
- Include an interactive onboarding checklist that tracks setup progress and highlights the next critical step, visible from the dashboard until complete
- Offer self-service data import with column mapping, validation previews, and error correction rather than requiring CSV files formatted to an exact schema
- Build diagnostic tools (connection testers, permission validators, data preview) directly into setup flows so users can verify their configuration without filing a support ticket

## Anti-Patterns
- Requiring a "kickoff call" or "implementation specialist" before users can access core product functionality
- Presenting enterprise configuration screens (SAML setup, API key management, webhook configuration) as raw forms without step-by-step guidance or validation
- Hiding onboarding documentation behind a login-wall in a separate knowledge base rather than embedding it in the product
- Designing setup flows that require knowledge of internal product terminology (field IDs, system object names, API entity types) without providing lookup or search tools
