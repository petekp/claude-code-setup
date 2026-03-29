---
title: Promote Learning by Doing — Safe Exploration
category: Onboarding & Empty States
tags: [onboarding, undo, error-handling, trust]
priority: situational
applies_when: "When designing first-run experiences or sandbox modes where users need to experiment safely with reversible actions and low-risk exploration."
---

## Principle
Users learn software most effectively through direct interaction with real tasks in an environment where mistakes are reversible and consequences are low.

## Why It Matters
Passive instruction (reading documentation, watching videos, following rigid tutorials) has low retention rates compared to active exploration. When users can experiment with real features using sample data or sandbox environments, they build procedural memory and genuine understanding. The key enabler is safety: users must trust that exploration will not damage real data, trigger irreversible changes, or embarrass them in front of colleagues. Without this safety net, users default to the most conservative behavior — clicking as little as possible and never discovering the product's full capabilities.

## Application Guidelines
- Provide undo for all non-destructive actions and make the undo affordance immediately visible after any change (toast notification with "Undo" link, not just Ctrl+Z)
- Offer a sandbox or demo mode with pre-populated sample data where users can experiment freely before committing to real work
- For destructive actions (deleting records, publishing to production), add a confirmation step that clearly states the consequence — but do not add confirmations for reversible actions, which trains users to click through dialogs without reading
- Label experimental or preview features clearly so users understand they are safe to explore without production impact
- Design first-run experiences that have the user complete a real task (create their first item, configure their first setting) rather than passively reading about features

## Anti-Patterns
- Requiring users to read a multi-page tutorial or watch a video before they can access the product
- Making common actions irreversible without warning, training users to fear experimentation
- Providing a sandbox mode that is so limited or different from the real product that skills do not transfer
- Punishing exploration by surfacing error messages for incomplete or tentative actions (e.g., validating a form field the instant it receives focus, before the user has typed)
