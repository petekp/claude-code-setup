---
title: Doherty Threshold — Target Sub-400ms Response for Interactive Operations
category: Loading & Performance Perception
tags: [button, form, performance, feedback-loop]
priority: core
applies_when: "When designing interactive operations (clicks, filters, navigation) and the response must be under 400ms to maintain user flow state."
---

## Principle
Interactive operations (clicks, form submissions, filter changes, navigation) must respond in under 400 milliseconds to maintain the user's sense of direct manipulation and flow state.

## Why It Matters
The Doherty Threshold, established through IBM research in the 1980s, demonstrated that when system response time drops below 400 milliseconds, user productivity increases dramatically and users enter a "flow state" where the interface feels like an extension of their intent. Above 400ms, users perceive a delay that breaks their cognitive thread — they pause, re-read the screen, and lose the fluid interaction rhythm. Above 1 second, users actively context-switch (checking another tab, reading another part of the page), and above 10 seconds, the risk of abandonment increases sharply. The 400ms threshold is not arbitrary; it is the point where the human perception system transitions from "instantaneous response" to "noticeable delay."

## Application Guidelines
- Target sub-100ms response for direct manipulation actions (dragging, resizing, typing, toggling) to maintain the illusion of physical responsiveness
- Target sub-400ms response for discrete actions (clicking a button, applying a filter, switching tabs, saving a form) to maintain flow state
- Use optimistic UI updates for actions that are highly likely to succeed: show the result immediately and reconcile with the server asynchronously
- Pre-fetch data for likely next actions (loading the detail view of the first list item, pre-loading the next pagination page) so the response feels instant when the user acts
- Instrument response times for all interactive operations and alert when any exceed the 400ms budget, treating it as a production incident

## Anti-Patterns
- Accepting 1-2 second response times for common interactive operations as "normal" without investigating optimization opportunities
- Waiting for the server response before showing any UI change (not even a loading state), creating a "dead click" experience where nothing happens for 500ms+
- Animating UI transitions with durations longer than 300ms, which adds artificial delay on top of the actual operation time
- Optimizing for initial page load time while ignoring in-page interaction times, creating a product that loads fast but feels sluggish to use
