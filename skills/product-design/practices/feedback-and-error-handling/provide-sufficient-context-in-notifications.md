---
title: Provide Sufficient Context in Notifications
category: Feedback & Error Handling
tags: [notification, text, collaboration, cognitive-load]
priority: situational
applies_when: "When writing notification content and ensuring each notification includes enough who/what/where context for users to decide how to act without clicking through."
---

## Principle
Every notification must include enough context for the user to understand what happened, why it matters, and what action (if any) to take — without requiring them to navigate elsewhere first.

## Why It Matters
Notifications that lack context force users to interrupt their current task to investigate. "You have a new message" requires clicking through to discover who sent it and whether it is urgent. "Build failed" without a reason requires navigating to logs. Each context-hunting detour breaks flow, wastes time, and increases the chance that users will start ignoring notifications altogether. Contextual notifications respect the user's attention by front-loading the information needed to decide whether and how to act.

## Application Guidelines
- Include the who, what, and where: "Sarah commented on your pull request #142 in project Atlas" rather than "New comment"
- For error or warning notifications, include the reason and a recommended action: "Deploy to staging failed: test suite timed out. View logs or retry."
- Show a preview of the content when possible — the first line of a message, the title of a document, the name and avatar of a person
- For aggregated notifications, summarize meaningfully: "4 new comments on 2 pull requests" rather than a count alone
- Provide a direct action link or button within the notification so users can respond without navigating through multiple screens
- Respect the notification medium — push notifications and email subjects have limited space, so lead with the most critical context

## Anti-Patterns
- Sending a push notification that says only "Action required" with no indication of what action, where, or why — forcing the user to open the app and hunt for what triggered the alert
