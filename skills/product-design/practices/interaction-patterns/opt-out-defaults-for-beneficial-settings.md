---
title: Opt-Out Defaults for Beneficial Settings
category: Interaction Patterns
tags: [settings, form, cognitive-load, trust]
priority: situational
applies_when: "When deciding whether a beneficial feature (auto-save, security prompts, accessibility preferences) should default to on or off."
---

## Principle
Default beneficial features and settings to "on" so users receive value immediately, and let them opt out if they prefer — do not require opt-in for features that help the majority of users.

## Why It Matters
Most users never change default settings. If a beneficial feature (auto-save, spell check, two-factor authentication prompts, dark mode matching system preference, email notifications for critical events) requires opt-in, the vast majority of users will never enable it — not because they do not want it, but because they never discover the setting. Defaulting to the beneficial state ensures most users receive the value while respecting the autonomy of users who prefer to opt out.

## Application Guidelines
- Default auto-save, undo history, and crash recovery to enabled — these protect user data with no downside for the vast majority
- Default accessibility features (reduced motion, high contrast, font scaling) to respect system-level preferences automatically
- Default security features (session timeout warnings, login notifications, 2FA prompts) to enabled, allowing users to relax them if they choose
- Default helpful notifications (task reminders, deadline warnings, collaboration updates) to enabled with easy per-category opt-out
- Never default settings that benefit the business at the user's expense (marketing emails, data sharing with partners, usage tracking beyond product improvement)
- When adding a new feature, default it to "on" if it genuinely helps users; default it to "off" if it changes existing workflows in ways users might not expect

## Anti-Patterns
- Requiring users to discover and enable auto-save through a buried settings screen, so the 90% of users who never find the setting lose work regularly in an application that has the capability to prevent it but chose to make it opt-in
