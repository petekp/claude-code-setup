---
title: Commitment and Consistency Bias
category: Human Biases in Interfaces
tags: [onboarding, form, wizard, motivation]
priority: niche
applies_when: "When designing multi-step onboarding or upgrade flows where the sequence of asks matters and small initial commitments build toward larger ones."
---

## Principle
Once users take a small action or make a public statement, they feel compelled to behave consistently with that initial commitment — making the sequence of asks in an interface as important as the asks themselves.

## Why It Matters
A user who answers "yes" to "Do you care about your privacy?" is more likely to complete a privacy setup wizard. Someone who customizes their profile photo is more likely to fill out the rest of the profile. This is the foot-in-the-door effect: small initial commitments create psychological pressure to follow through with larger, consistent actions. In interface design, the order and framing of requests leverages this deep human need for self-consistency. Ethical use improves onboarding completion; exploitative use traps users in escalating commitments they did not intend.

## Application Guidelines
- Start onboarding with easy, low-stakes actions (choose a name, pick a theme) before asking for higher-commitment steps (invite colleagues, enter payment)
- Frame feature adoption as consistent with actions users have already taken ("Since you set up notifications, you might also want...")
- Use progressive commitment in forms: show one section at a time rather than overwhelming with the full scope upfront
- Allow users to publicly commit to goals within the product (shared objectives, public profiles) to increase follow-through
- Design upgrade paths that feel like natural extensions of what the user is already doing, not disconnected upsells

## Anti-Patterns
- Trapping users in multi-step flows where early easy steps lead to unexpectedly difficult or costly final steps ("bait and switch" funnels)
- Making it easy to subscribe but deliberately hard to cancel, exploiting the consistency pressure to maintain subscriptions
- Using guilt language that references past actions ("You already started this — don't give up now!") to coerce completion
- Requiring users to publicly commit to something before they understand what they are committing to
