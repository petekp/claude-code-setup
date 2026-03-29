---
title: "Dual-Process Design: Route Routine Actions to System 1"
category: Cognitive Load
tags: [button, keyboard, affordance, cognitive-load, consistency]
priority: situational
applies_when: "When deciding how much friction to add to an action, balancing efficiency for routine operations against safety for high-stakes or destructive actions."
---

## Principle
Design routine, repeated interactions to be fast, automatic, and effortless (System 1), while reserving deliberate, attention-demanding interfaces (System 2) for high-stakes or novel decisions.

## Why It Matters
Dual-process theory (Daniel Kahneman) describes two modes of thinking: System 1 (fast, automatic, pattern-based) and System 2 (slow, deliberate, effortful). Users default to System 1 for the vast majority of interactions — they rely on visual patterns, spatial memory, and learned habits rather than reading and reasoning. Interfaces that force System 2 engagement for routine actions — requiring careful reading, multiple confirmations, or precise targeting for everyday tasks — exhaust users unnecessarily. Conversely, interfaces that allow System 1 autopilot on high-stakes actions (like deleting important data) create dangerous errors. Matching the interaction mode to the action's stakes and frequency optimizes both efficiency and safety.

## Application Guidelines
- Make frequent, low-risk actions achievable in one click or keystroke with minimal targeting precision
- Use consistent placement and styling for recurring actions so they become muscle memory
- For high-stakes actions (delete, publish, send money), introduce deliberate friction: confirmation dialogs, type-to-confirm, or undo windows
- Provide keyboard shortcuts for repeated workflows that power users perform on autopilot
- Reserve visual complexity and novel interaction patterns for situations that genuinely warrant careful attention
- Use standard UI patterns and conventional layouts — originality in layout forces System 2 engagement for basic navigation
- Use visual affordances (buttons that look clickable, inputs that look editable, links that look tappable) so users can act without thinking
- Reduce options to eliminate unnecessary System 2 analysis; if 95% of users choose option A, do not force everyone through a 5-option decision

## Anti-Patterns
- Confirmation dialogs on routine, low-risk actions that users dismiss without reading
- High-stakes destructive actions (permanent deletion, public publishing) that execute on a single unprotected click
- Constantly changing the position or appearance of frequently used buttons
- Requiring precise mouse targeting (tiny click zones, tightly packed buttons) for high-frequency actions
- Requiring users to read a tooltip or help text to understand what a button does on every interaction
