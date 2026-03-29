---
title: Microinteraction Four-Component Model
category: Interaction Patterns
tags: [button, animation, feedback-loop, consistency]
priority: niche
applies_when: "When designing or auditing micro-interactions (toggles, pull-to-refresh, sliders) and you need a structured framework for trigger, rules, feedback, and loops."
---

## Principle
Design microinteractions using four explicit components: Trigger (what initiates it), Rules (what happens), Feedback (how the user perceives it), and Loops/Modes (how it evolves over time).

## Why It Matters
Microinteractions are the tiny, single-purpose interactions that make up the texture of a product experience: toggling a switch, pulling to refresh, adjusting a volume slider, liking a post. Individually they seem trivial, but collectively they define how a product feels. Designing them with the four-component model (from Dan Saffer's framework) ensures each microinteraction is complete: it has a clear entry point, predictable behavior, visible feedback, and thoughtful long-term behavior. Without this rigor, microinteractions feel unfinished or inconsistent.

## Application Guidelines
- Trigger: Define what initiates the microinteraction — a user action (click, swipe, keystroke) or a system event (timer, data change). Make triggers discoverable.
- Rules: Define the behavior rules — what happens when triggered, what constraints apply, and what the sequence of events is. Keep rules simple and predictable.
- Feedback: Provide immediate, proportional feedback for every state change — visual (animation, color change), auditory (click sound), or haptic (vibration). Feedback should be fast (under 100ms) and unambiguous.
- Loops and Modes: Define how the microinteraction behaves on repeat use (does the animation simplify for frequent users?) and whether it has modes (does long-press behave differently from tap?).
- Keep microinteractions lightweight — they should feel instant and never block the user's flow
- Ensure consistency: similar microinteractions across the product should use the same feedback patterns

## Anti-Patterns
- A toggle switch that changes state on click (rules) but provides no animation, no sound, and no visual transition (missing feedback) — the user clicked, the state changed, but the interaction felt hollow and unconfirmed because the feedback component was never designed
