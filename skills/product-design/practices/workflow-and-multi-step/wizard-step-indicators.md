---
title: Wizard Step Indicators — Communicate the Full Process
category: Workflow & Multi-Step Processes
tags: [wizard, navigation, feedback-loop, motivation]
priority: situational
applies_when: "When implementing a wizard and users need a persistent step indicator showing total steps, current position, and completion status to gauge progress."
---

## Principle
Show a clear, persistent step indicator that communicates the total number of steps, the current position, and the completion status of each step so users can gauge their progress and plan their time.

## Why It Matters
Without a step indicator, wizards feel like tunnels with no visible end. Users don't know if they're on step 2 of 3 or step 2 of 15, and this uncertainty causes anxiety and abandonment. A well-designed step indicator provides three critical pieces of information: how far the user has come (motivation to continue), how far they have left (setting time expectations), and which steps are complete (confidence that their work is saved). This transparency directly reduces abandonment rates.

## Application Guidelines
- Display step indicators horizontally at the top of the wizard for processes with 3-7 steps; use a vertical sidebar for 8+ steps
- Label each step with a descriptive name ("Account Details," "Billing Setup," "Review") rather than just numbers
- Show three visual states for each step: completed (checkmark), current (highlighted/active), and upcoming (dimmed but visible)
- Indicate optional steps distinctly from required steps so users know which can be skipped
- Make completed steps clickable to allow review and editing without losing progress on subsequent steps
- Show an estimated time to completion: "About 5 minutes remaining" based on the remaining steps and historical completion data
- On mobile, condense the step indicator to show current/total ("Step 3 of 6") with step labels visible on tap

## Anti-Patterns
- No step indicator at all, leaving users blind to the scope and progress of the process
- Step indicators that only show the current step number without the total, providing no context ("Step 3" vs. "Step 3 of 5")
- Numbered-only indicators (1, 2, 3, 4, 5) without descriptive labels, giving no preview of what each step involves
- Step indicators that don't update to show completion, providing no visual reward for progress made
