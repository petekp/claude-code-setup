---
title: Appropriate Friction for AI-Powered Actions
category: Interaction Patterns
tags: [modal, notification, undo, trust]
priority: situational
applies_when: "When an AI feature can take actions on behalf of the user and you need to decide how much review and confirmation to require before those actions take effect."
---

## Principle
Introduce deliberate friction before AI-generated actions take effect — proportional to the action's consequence, the AI's confidence, and the user's ability to verify correctness.

## Why It Matters
AI makes automation tempting: auto-generate emails, auto-approve requests, auto-categorize data, auto-apply code fixes. But AI errors often look plausible, making them harder to detect than human errors. Without appropriate friction, users default to blindly accepting AI outputs, and errors propagate silently until they cause visible damage. Friction is not always the enemy of usability — for AI-powered actions, deliberate pause points (review screens, confirmation prompts, preview modes) are essential safeguards that keep humans in meaningful control.

## Application Guidelines
- For low-stakes AI actions (auto-complete, smart sorting, suggested tags), allow instant application with easy undo — minimal friction
- For medium-stakes AI actions (drafting emails, generating summaries, code suggestions), show a preview that the user explicitly accepts — moderate friction
- For high-stakes AI actions (sending messages on behalf of the user, making financial decisions, modifying access controls), require explicit review, confirmation, and potentially a secondary approver — high friction
- Show what the AI changed: use diff views, highlighted additions, or before/after comparisons so users can verify AI output quickly
- Allow users to adjust the friction level over time as they build trust with the AI: "Always review" > "Review when confidence is low" > "Auto-apply and notify"
- Never let AI take irreversible actions without human approval, regardless of confidence level

## Anti-Patterns
- An AI feature that automatically sends emails drafted by the AI without showing the user the content first, then displaying a success toast "3 follow-up emails sent" — giving the user awareness of the action only after it has been irrevocably executed
