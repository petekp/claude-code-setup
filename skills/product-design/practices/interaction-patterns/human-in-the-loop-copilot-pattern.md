---
title: Human-in-the-Loop Copilot Pattern for AI
category: Interaction Patterns
tags: [notification, modal, undo, trust]
priority: situational
applies_when: "When designing an AI-powered feature that generates content, recommendations, or actions that need human review before taking effect."
---

## Principle
AI-powered features should assist and suggest rather than act autonomously — keep the human in the decision loop by presenting AI outputs as proposals that users review, modify, and approve before they take effect.

## Why It Matters
AI systems make mistakes, hallucinate, and lack the contextual judgment that humans bring. When AI acts autonomously, errors propagate unchecked — auto-sent emails, auto-published content, or auto-applied code changes can cause damage before anyone reviews them. The copilot pattern positions AI as a capable assistant that drafts, suggests, and recommends while preserving human agency over the final decision. This builds trust, reduces error propagation, and gives users the benefits of AI augmentation without the risks of full automation.

## Application Guidelines
- Present AI outputs as suggestions or drafts, not as completed actions: "Here is a draft response — review and send" rather than auto-sending
- Show AI-generated content in a visually distinct container (a suggestion card, a diff view, a ghost-text preview) so users can clearly see what the AI produced versus what they authored
- Provide easy mechanisms to accept, modify, or reject AI suggestions — ideally with a single keystroke (Tab to accept, Escape to dismiss)
- Allow partial acceptance: let users accept part of an AI suggestion and modify the rest
- Include a confidence or explanation indicator when the AI's recommendation involves judgment calls, so users can calibrate how much scrutiny to apply
- Log AI suggestions and user decisions to improve the model and provide an audit trail

## Anti-Patterns
- Having an AI feature that automatically rewrites user-authored text, sends emails, or modifies data without showing the user what was changed or giving them an opportunity to approve — treating AI as an autonomous agent rather than a collaborative tool
