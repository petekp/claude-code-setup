---
title: People Can't Multitask — Minimize Interruptions
category: Cognitive Psychology
tags: [notification, modal, cognitive-load]
priority: situational
applies_when: "When designing notification systems, modals, or any interruptive element that could break the user's focus during a task."
---

## Principle
Humans cannot truly multitask on cognitive work — every interruption forces a context switch that destroys focus and increases error rate.

## Why It Matters
Research consistently shows that after an interruption, it takes an average of 23 minutes to fully regain the previous depth of focus. In software interfaces, unnecessary modals, intrusive notifications, and forced context switches shatter the user's flow state. Each interruption doesn't just cost the seconds spent dismissing it; it costs the much larger penalty of cognitive re-orientation. Products that protect user focus outperform products that constantly demand attention, especially for complex knowledge work.

## Application Guidelines
- Use non-intrusive notification patterns (toasts, badge counts, subtle banners) for information that doesn't require immediate action
- Never interrupt a user mid-task with a modal unless the interruption is genuinely urgent and requires their immediate decision
- Batch non-critical notifications and surface them at natural break points rather than in real-time
- Allow users to configure notification preferences and "Do Not Disturb" modes
- When a background process completes, indicate completion through subtle visual changes (badge, status text) rather than stealing focus with a dialog
- Auto-save and auto-recover so that accidental navigation or crashes don't create a secondary interruption of lost-work anxiety
- Place promotional or non-essential content (feature announcements, surveys) at the edges of workflows, never in the middle

## Anti-Patterns
- A modal popup promoting a new feature that appears while the user is in the middle of filling out a form
- Real-time notification toasts for every action taken by every team member, creating a constant stream of visual distractions
- Forcing the user to acknowledge a non-critical system announcement before they can continue their work
- Chat notifications that bounce the dock icon, play a sound, and display a banner simultaneously for every message in a busy channel
