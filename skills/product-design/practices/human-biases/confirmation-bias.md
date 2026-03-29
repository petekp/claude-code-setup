---
title: Confirmation Bias
category: Human Biases in Interfaces
tags: [dashboard, search, data-viz, trust]
priority: niche
applies_when: "When designing analytics dashboards, search tools, or decision-support interfaces where users may selectively attend to data that confirms their existing beliefs."
---

## Principle
Users seek, interpret, and remember information that confirms their existing beliefs — so interfaces must actively surface disconfirming evidence when decisions have significant consequences.

## Why It Matters
In search tools, analytics dashboards, and decision-support interfaces, users gravitate toward data that validates what they already believe. A marketer who thinks a campaign is working will focus on rising metrics and dismiss declining ones. A developer who believes a fix worked will interpret ambiguous test results as passing. Interfaces that passively present information reinforce this bias; interfaces designed with awareness of it can counterbalance by making contradictory signals impossible to ignore.

## Application Guidelines
- In analytics dashboards, surface anomalies and counter-trend data with equal or greater visual prominence than confirming trends
- In search and filtering tools, show what was excluded alongside what was included so users see what they might be missing
- Design review workflows that require users to explicitly acknowledge risks or negative indicators before proceeding
- In A/B testing tools, present confidence intervals and failure scenarios alongside success metrics
- Use devil's advocate prompts in decision-support flows: "Have you considered..." or "Data that contradicts this view..."

## Anti-Patterns
- Search interfaces that only show results matching the user's initial query framing without suggesting alternative perspectives
- Dashboard designs that let users hide or minimize metrics that tell an uncomfortable story
- Recommendation engines that create filter bubbles by only surfacing content aligned with past behavior
- Approval workflows that present only supporting evidence and bury risk factors in expandable sections
