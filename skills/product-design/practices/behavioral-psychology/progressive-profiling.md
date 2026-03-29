---
title: "Progressive Profiling: Gradually Building User Data Over Time"
category: Behavioral Psychology
tags: [onboarding, form, progressive-disclosure, motivation]
priority: situational
applies_when: "When deciding how much user information to collect at signup versus deferring to later contextually relevant moments."
---

## Principle
Collect user information incrementally across multiple sessions and interactions rather than demanding comprehensive data upfront — each request for information should be contextually relevant and deliver immediate value in return.

## Why It Matters
Asking for too much information at signup creates friction that kills conversion — every additional form field reduces completion rates by approximately 5-10%. But products need user data to deliver personalized, relevant experiences. Progressive profiling resolves this tension by spreading data collection across the user lifecycle, asking for each piece of information at the moment it becomes relevant and can deliver immediate value. A user who has been using the product for two weeks is far more willing to share industry and company size than a first-time visitor who has not yet experienced any value.

## Application Guidelines
- At signup, collect only what is absolutely necessary to create the account and deliver first value (typically email and password, sometimes name)
- Request additional profile data at moments when it directly improves the user's experience: ask for role when personalizing the dashboard, ask for team size when suggesting a plan
- Explain why each piece of information is needed and what the user gets in return: "Tell us your industry to see benchmarks from similar companies"
- Store partial profiles gracefully — every feature should work with incomplete data, progressively improving as more data becomes available
- Use implicit data collection where possible (usage patterns, feature preferences) rather than explicit surveys

## Anti-Patterns
- Requiring users to fill out a 15-field registration form including company name, phone number, job title, and industry before they can see the product — this front-loads all data collection at the moment of lowest trust and highest abandonment risk
