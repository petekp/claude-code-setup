---
title: Ambiguity Effect
category: Human Biases in Interfaces
tags: [button, settings, loading, trust]
priority: situational
applies_when: "When labeling buttons, describing pricing outcomes, or designing any interaction where unclear consequences cause users to avoid taking action."
---

## Principle
Users avoid options where the outcome is uncertain or unclear, preferring known probabilities over unknown ones — even when the ambiguous option has a higher expected value.

## Why It Matters
In software, ambiguity manifests as vague feature descriptions, unclear pricing outcomes, unspecified consequences of actions, and uncertain processing times. Users will choose a plan with clearly stated limitations over a "flexible" plan with unclear boundaries. They will prefer a slower but predictable process over a faster but uncertain one. Ambiguity is not neutral — it is actively aversive. Every element of an interface where the user thinks "I am not sure what will happen if I click this" is a conversion killer and a trust eroder.

## Application Guidelines
- Make outcomes explicit before users commit to actions: what exactly will happen, how long will it take, what will it cost, and what can they undo
- In pricing interfaces, eliminate ambiguity about what is included and what costs extra — users will choose a slightly more expensive clear option over a cheaper ambiguous one
- For processes with uncertain durations, provide ranges with explanation rather than no estimate at all
- Label buttons and actions with outcome descriptions ("Save and publish") rather than vague labels ("Submit," "Continue," "Go")
- In settings and configuration, show previews of what each option will produce before the user commits

## Anti-Patterns
- Buttons labeled "Submit" or "Continue" that give no indication of what happens next
- Pricing pages that say "Contact us for pricing" when self-serve pricing would convert better by eliminating ambiguity
- Feature descriptions that use marketing language ("intelligent automation") without explaining what the feature actually does
- Destructive actions that do not clearly state what will be lost or whether the action can be reversed
