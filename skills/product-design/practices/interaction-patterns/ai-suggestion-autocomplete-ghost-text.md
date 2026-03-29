---
title: AI Suggestion Autocomplete — Ghost Text Pattern
category: Interaction Patterns
tags: [form, text, keyboard, cognitive-load]
priority: situational
applies_when: "When building an AI-assisted input field where suggestions should appear inline as the user types, such as code editors, email compose, or writing tools."
---

## Principle
Show AI-generated suggestions as semi-transparent "ghost text" inline with the user's cursor, allowing instant acceptance with Tab or continued typing to override the suggestion.

## Why It Matters
Ghost text autocomplete (popularized by GitHub Copilot and now common in email, code editors, and writing tools) is one of the most effective AI interaction patterns because it has near-zero friction: the suggestion appears passively, does not block the user's flow, can be accepted with a single keystroke, and disappears silently if ignored. This pattern respects the user's primary task (typing) while augmenting it with AI predictions. The key to its success is that ignoring it costs nothing — the suggestion never gets in the way.

## Application Guidelines
- Render suggestions in a visually distinct but subtle style: reduced opacity (40-50%), italic text, or a lighter color that is clearly different from user-authored text
- Accept the full suggestion with Tab; accept word-by-word with Ctrl+Right; dismiss by continuing to type or pressing Escape
- Show suggestions only when the model has sufficient confidence — frequent low-quality suggestions train users to ignore the feature
- Debounce suggestion requests: wait 300-500ms after the user stops typing before fetching a suggestion to avoid distracting flicker
- Never auto-accept suggestions — the user must take an explicit action to incorporate AI-generated text
- Provide a clear way to disable the feature for users who find it distracting, ideally with a keyboard toggle for quick on/off

## Anti-Patterns
- Showing AI suggestions in a popup tooltip or dropdown that requires clicking to accept, interrupting the user's typing flow and adding friction that negates the speed benefit of autocomplete — or worse, auto-inserting suggestions without explicit user acceptance
