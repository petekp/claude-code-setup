---
title: Sunk Cost Fallacy
category: Human Biases in Interfaces
tags: [onboarding, settings, trust, motivation]
priority: niche
applies_when: "When designing migration paths, cancellation flows, or data export features where users' prior investment may trap them in suboptimal workflows."
---

## Principle
Users continue investing in a course of action because of what they have already invested (time, money, effort) rather than because of future expected returns — making it difficult to abandon failing paths.

## Why It Matters
A user who has spent three hours configuring a tool will resist switching to a better alternative because abandoning the configuration feels like wasting those three hours. A team that has invested months in a workflow will resist migration because the sunk investment feels too large to write off. In software, this manifests as users clinging to broken workflows, maintaining unused subscriptions, and refusing to adopt superior tools. The sunk cost fallacy keeps users trapped in suboptimal states and creates artificial loyalty that is actually captivity.

## Application Guidelines
- Make migration and switching costs as low as possible — data export, configuration transfer, and compatibility with competitor formats
- When users are clearly struggling with a workflow, surface alternatives without framing the switch as abandoning their previous investment
- Design onboarding that acknowledges existing investments: "Bring your existing data" rather than "Start fresh"
- For subscription products, let users pause rather than cancel — it reduces the perceived finality of leaving and lowers the sunk-cost barrier to returning
- Frame product improvements as building on the user's existing investment rather than replacing it

## Anti-Patterns
- Deliberately increasing switching costs (proprietary formats, no data export) to exploit sunk cost lock-in
- Guilt-messaging users who try to cancel ("You will lose all your progress and 6 months of data")
- Making the cancellation flow require more effort than signup, weaponizing the effort already invested
- Designing learning curves that front-load investment to create artificial sunk-cost lock-in
