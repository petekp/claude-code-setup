---
title: Automation Bias
category: Human Biases in Interfaces
tags: [form, notification, trust]
priority: situational
applies_when: "When designing AI-generated suggestions, algorithmic recommendations, or automated decisions where users may over-trust system outputs without verification."
---

## Principle
Users tend to over-trust automated suggestions, AI recommendations, and system-generated outputs — accepting them uncritically even when they are wrong, incomplete, or contextually inappropriate.

## Why It Matters
As products increasingly incorporate AI, algorithmic recommendations, and automated decision-making, users develop a dangerous tendency to defer to the machine. An auto-complete suggestion gets accepted without reading. An AI-generated summary gets forwarded without verification. An automated fraud flag gets acted on without investigation. This is not laziness — it is a rational-seeming heuristic ("the system probably knows better than I do") that becomes dangerous when the system is wrong. The more sophisticated the automation appears, the less users question its outputs.

## Application Guidelines
- Always present automated suggestions as suggestions, not decisions — use language like "suggested" or "recommended" rather than presenting outputs as facts
- Provide confidence indicators alongside AI-generated content so users can calibrate their trust
- Design friction into high-stakes automated decisions: require human confirmation, show the reasoning, highlight uncertainty
- Make it easy to override, edit, or reject automated suggestions without penalty or extra steps
- Show the inputs and logic behind automated outputs so users can spot when the system has bad data or faulty reasoning

## Anti-Patterns
- Presenting AI-generated content without any indication that it was machine-generated
- Auto-applying algorithmic recommendations without user review (e.g., auto-categorizing transactions, auto-approving content)
- Hiding confidence scores or uncertainty indicators to make automation appear more authoritative than it is
- Making it harder to override automated decisions than to accept them, creating a path of least resistance toward uncritical acceptance
