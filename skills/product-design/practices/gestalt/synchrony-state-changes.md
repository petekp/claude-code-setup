---
title: "Synchrony: Group Elements That Change State Simultaneously"
category: Gestalt Principles
tags: [dashboard, notification, animation, gestalt, feedback-loop]
priority: niche
applies_when: "When multiple UI elements change state in response to a single event and you need to synchronize their transitions so users perceive them as related."
---

## Principle
Elements that change state at the same moment (appear, disappear, change color, animate) are perceived as a group, so synchronized state changes should be reserved for semantically related elements.

## Why It Matters
Synchrony is one of the most powerful temporal grouping cues. When a notification badge appears on a bell icon at the same instant a toast message slides in, users perceive them as two manifestations of the same event. But if unrelated elements happen to change state simultaneously -- a spinner stopping, a sidebar collapsing, and a badge updating all at once -- users may falsely group these as a single event, misinterpreting causality and system behavior.

## Application Guidelines
- When a single user action should update multiple UI elements, animate all of them in the same frame or with imperceptible delay (under 50ms) to reinforce their connection
- Stagger state changes for unrelated updates by at least 200-300ms so the eye does not group them as a single event
- When loading multiple related widgets, use coordinated skeleton-to-content transitions rather than having each widget resolve independently at random times
- For error states that affect multiple fields (e.g., form validation), reveal all related error indicators simultaneously so the user perceives them as one validation result

## Anti-Patterns
- Triggering unrelated animations at the same moment, causing false grouping (e.g., a promotional banner animating in at the same time as a system notification)
- Loading related dashboard widgets asynchronously with no coordination, so they pop in one by one over several seconds, destroying the grouped perception
- Showing validation errors one at a time as the user tabs through fields rather than surfacing all errors together on submission
