---
title: Framing Effect
category: Human Biases in Interfaces
tags: [text, dashboard, notification, trust, motivation]
priority: situational
applies_when: "When writing copy for pricing, error messages, performance metrics, or any context where positive vs. negative framing of identical facts changes user behavior."
---

## Principle
The way information is presented — positive vs. negative framing, percentage vs. absolute numbers, gain vs. loss language — changes user decisions even when the underlying facts are identical.

## Why It Matters
"95% uptime" and "18 hours of downtime per year" describe the same reality but produce entirely different emotional and evaluative responses. "Save $50" and "50% off" can describe the same discount but motivate differently depending on the base price. Users do not process raw information objectively — they respond to the frame. This makes copywriting, data visualization choices, and information architecture decisions as impactful as the underlying product capabilities. Every label, metric, and description in an interface is a frame that shapes perception.

## Application Guidelines
- Frame positive outcomes in absolute terms when the numbers are impressive ("Save 2 hours per week") and relative terms when percentages are more compelling ("40% faster")
- In error and warning states, frame the message around what users can do (positive frame) rather than what went wrong (negative frame) when possible
- Present subscription costs in smaller time units ("$2.50/day") when trying to minimize perceived cost, and larger units ("$75/month") when trying to convey value
- In data dashboards, be conscious of whether you show positive metrics (revenue gained) or negative metrics (revenue missed) — both are valid but produce different emotional responses
- Test different frames for the same information to understand how framing affects user behavior in your specific context
- Use positive framing for encouraging adoption: "Join 10,000 teams already using X" not "Don't miss out like those who haven't tried X"
- Use negative framing for warnings and risk communication where you want users to take protective action
- Be consistent with framing within a decision context — do not mix positive and negative frames for options being compared, as this makes comparison impossible
- Present success rates for encouraging actions and failure rates for discouraging actions

## Anti-Patterns
- Selectively showing only positively framed metrics while hiding negative framings of the same data
- Using small time-unit pricing ("just $0.99/day!") to obscure genuinely expensive annual costs
- Framing mandatory requirements as optional benefits ("You get to verify your email!" instead of "Email verification required")
- Presenting success rates without corresponding failure rates in high-stakes decision interfaces (medical, financial, security)
- Inconsistent framing within the same decision context — positive when it benefits the business, negative when discouraging churn
