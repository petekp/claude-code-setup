---
title: Inattentional Blindness
category: Human Biases in Interfaces
tags: [notification, form, validation, feedback-loop]
priority: situational
applies_when: "When placing important warnings or status changes and users are deeply focused on a task, making them likely to miss peripheral information."
---

## Principle
Users who are focused on a specific task will fail to notice unexpected elements or changes in the interface — even prominent ones — because attention is a finite, narrowly directed resource.

## Why It Matters
The famous "invisible gorilla" experiment demonstrated that people counting basketball passes completely missed a person in a gorilla suit walking through the scene. The same phenomenon occurs in interfaces: a user focused on completing a form will not notice a banner that appeared at the top of the page. A user scanning for a specific menu item will not see the new feature badge next to an unrelated item. Task-focused attention creates a tunnel that excludes everything outside the immediate goal. Interfaces cannot assume that displaying information means users will perceive it.

## Application Guidelines
- Place critical information and warnings in the direct path of the user's current task, not in peripheral areas they are not attending to
- For important notifications that arrive while users are task-focused, use interruptive patterns (inline alerts, blocking modals for critical issues) rather than passive indicators
- In complex forms, surface validation errors immediately at the point of input rather than in a summary at the top or bottom of the page
- After major state changes, use visual cues in the task-relevant area to reorient users to what changed
- Do not rely on persistent but non-interruptive indicators (badge counts, status bar changes) for time-sensitive information
- Use motion or animation to draw attention to important state changes, but reserve motion for genuinely important events only
- For time-sensitive information (session expiry, sync conflicts), use escalating alerts — start subtle, become more prominent if unacknowledged
- After important background processes complete, surface results in the user's current focal area, not just in a notification badge

## Anti-Patterns
- Displaying important system notifications in a corner of the screen while users are focused on content in the center
- Assuming users will notice sidebar updates while working in a main content area
- Placing critical warnings in headers or footers that are outside the user's attentional spotlight during task execution
- Using subtle visual changes (icon swaps, color shifts) to communicate important state transitions that users need to act on immediately
