---
title: Toast Notification Best Practices
category: Feedback & Error Handling
tags: [notification, accessibility, animation, consistency]
priority: situational
applies_when: "When implementing toast notifications and defining their position, timing, stacking behavior, and accessibility for transient feedback."
---

## Principle
Toast notifications should be brief, non-blocking, consistently positioned, and used only for transient feedback that does not require user action to proceed.

## Why It Matters
Toasts occupy a unique niche in the notification spectrum: they acknowledge actions without interrupting workflow. When used correctly, they provide lightweight feedback that keeps users informed without demanding attention. When misused — for critical errors, for persistent information, or stacked in overwhelming quantities — they become either invisible (dismissed by reflex) or obstructive (covering content the user needs). Disciplined toast design maintains their effectiveness as a feedback channel.

## Application Guidelines
- Position toasts consistently across the application (bottom-center or top-right are common conventions) so users develop a reliable peripheral awareness of where to look
- Auto-dismiss informational toasts after 3-5 seconds; toasts with action buttons (like Undo) should persist for 5-10 seconds or until dismissed
- Limit to one toast visible at a time; queue additional toasts and display them sequentially to avoid stacking
- Keep toast text to a single line when possible; for longer messages, use a different notification pattern
- Never use toasts for errors that require user action — those need inline messages or modal alerts that persist until resolved
- Ensure toasts are accessible: announce to screen readers via aria-live regions, and never rely solely on color to convey meaning

## Anti-Patterns
- Stacking five or more toasts simultaneously in a corner of the screen, obscuring page content and overwhelming the user with competing messages that auto-dismiss before they can be read
