---
title: Linear vs. Selective Undo Models
category: Workflow & Multi-Step Processes
tags: [undo, keyboard, direct-manipulation, mental-model]
priority: niche
applies_when: "When choosing between linear undo (reverse chronological) and selective undo (reverse a specific action) based on whether user actions are dependent or independent."
---

## Principle
Choose between linear undo (reversing actions in reverse chronological order) and selective undo (reversing a specific action regardless of what came after) based on the nature of the content and the independence of user actions.

## Why It Matters
Linear undo — the standard Cmd+Z behavior — reverses the most recent action, then the one before that, and so on. This works well when actions build on each other (like typing text). But in many enterprise contexts, actions are independent: changing a record's status and updating its description are unrelated, and undoing the status change shouldn't require undoing the description change first. Selective undo lets users reverse any specific action from the history, which matches the mental model of enterprise data manipulation far better than linear undo.

## Application Guidelines
- Use linear undo for content creation contexts where each action builds on previous ones: text editing, drawing, code writing
- Use selective undo for record management contexts where actions are independent: form field changes, status updates, configuration adjustments
- Present the undo history as a list of discrete actions, each with an individual "Undo" button, for selective undo interfaces
- When implementing selective undo, detect and warn about dependencies: "Undoing 'Set status to Approved' will also undo 'Sent approval notification' — continue?"
- Show the history of actions with enough detail to distinguish them: "Changed status from Draft to In Review" not just "Updated record"
- For hybrid contexts, default to linear undo but allow users to access selective undo through an undo history panel

## Anti-Patterns
- Using linear undo in contexts where actions are independent, forcing users to undo wanted changes to reach an unwanted one
- Implementing selective undo without dependency checking, allowing users to create inconsistent states by undoing actions that subsequent actions depend on
- Providing undo history with insufficient detail to distinguish actions: "Change" repeated 10 times with no differentiation
- No undo history visibility at all, making linear undo a blind operation where users don't know what they're about to reverse
