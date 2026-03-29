---
title: Design for the Perpetual Intermediate
category: Cross-Cutting Principles
tags: [navigation, onboarding, progressive-disclosure, cognitive-load]
priority: core
applies_when: "When designing an interface and you need to optimize for the majority user population — people past the beginner phase who have not and likely will not become power users."
---

## Principle
Optimize the interface for the intermediate user — someone who is past the beginner phase but has not (and likely will not) become a power user — because this is where the majority of your users will permanently reside.

## Why It Matters
Alan Cooper observed that the distribution of user expertise is not a bell curve but a ski slope: there's a brief novice period, a long intermediate plateau, and a small expert tail. Most users will spend the vast majority of their time as intermediates — they know the basics, they have established workflows, but they don't use every feature or know every shortcut. Designing primarily for novices (excessive hand-holding) or experts (minimal guidance) misses the largest user population. The intermediate user needs an interface that doesn't get in their way but remains discoverable when they need to learn something new.

## Application Guidelines
- Make common tasks fast and frictionless — intermediates know what they want to do and don't need step-by-step guidance for routine operations
- Keep advanced features discoverable but not prominent: intermediates should be able to find new capabilities when they're ready without being overwhelmed by them daily
- Provide contextual learning opportunities that promote intermediates toward expertise: keyboard shortcut hints, "did you know" tips, and progressive disclosure of advanced features
- Don't hide commonly-used functions behind novice onboarding that intermediates must click through repeatedly
- Support the "learning dip" when intermediates try something new: good error messages, easy undo, and inline help for advanced features they haven't used before
- Test with intermediate users specifically — not just first-time users and not just internal experts

## Anti-Patterns
- Designing exclusively for the first-time experience with no path to efficiency once users know the system
- Designing exclusively for experts, creating a steep learning curve that most users never fully climb
- Forcing intermediates through beginner tutorials or onboarding flows they've already outgrown
- Assuming users will "eventually" learn all features — most won't, and the interface should work well for their stable subset of usage
