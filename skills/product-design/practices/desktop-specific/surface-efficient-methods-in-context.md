---
title: Surface Efficient Methods In Context — Combat the Productivity Plateau
category: Desktop-Specific Patterns
tags: [tooltip, onboarding, keyboard, progressive-disclosure]
priority: situational
applies_when: "When users are performing repetitive tasks inefficiently and you want to proactively surface faster methods like shortcuts, bulk actions, or automation at the moment of need."
---

## Principle
Proactively surface faster ways to accomplish tasks (shortcuts, bulk actions, automation) at the moment users are performing those tasks inefficiently, preventing the "productivity plateau" where users settle on a suboptimal workflow and never discover better ones.

## Why It Matters
Research on software usage consistently shows that most users learn just enough of an application to complete their tasks and then stop exploring. They never discover the keyboard shortcut, batch operation, or template that could cut their task time in half. This is the productivity plateau — users are productive but far from efficient. The application itself must actively bridge this gap by surfacing better methods in context, because documentation and training alone don't reach users in the moment of need.

## Application Guidelines
- When a user performs the same action three or more times in a session, show a non-intrusive suggestion: "Tip: You can select multiple items and apply this action in bulk"
- Display keyboard shortcuts in toast notifications after a user completes an action via the mouse: "Pro tip: Cmd+Shift+A does this instantly"
- Offer to create automation rules when a user performs a repetitive pattern: "You've moved 5 items to this folder today. Would you like to create a rule?"
- Place "Did you know?" tips in contextually relevant locations — not random splash screens, but inline with the feature being used
- Track suggestion dismissals per user and don't repeat dismissed tips; respect the user's choice to decline
- Provide a "Tips & Shortcuts" summary accessible from the help menu for users who want to proactively learn

## Anti-Patterns
- Showing random productivity tips in pop-ups that interrupt workflow, like Clippy-era help that appeared at the worst possible moments
- Never surfacing accelerators at all, assuming users will read documentation or explore on their own
- Showing the same tip repeatedly after the user has dismissed it, creating an annoying experience that trains users to ignore all suggestions
- Placing efficiency tips only in onboarding flows that new users click through without absorbing, rather than surfacing them in the workflow context where they're relevant
