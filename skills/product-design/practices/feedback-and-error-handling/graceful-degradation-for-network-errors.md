---
title: Graceful Degradation for Network Errors
category: Feedback & Error Handling
tags: [notification, error-handling, performance, real-time]
priority: situational
applies_when: "When the application must handle network connectivity loss, server unavailability, or degraded connections without losing user data or showing blank screens."
---

## Principle
When network connectivity is lost or a server becomes unreachable, the application should preserve the user's work, communicate the situation clearly, and continue functioning to the greatest extent possible.

## Why It Matters
Network failures are inevitable — Wi-Fi drops on commuter trains, servers go down during deploys, API rate limits are hit during peak usage. An application that crashes, shows a blank screen, or silently loses data during a network hiccup destroys user trust. Graceful degradation means users can continue reading cached content, queue actions for later submission, and understand exactly what is and is not available. The experience of a network error should be an inconvenience, not a catastrophe.

## Application Guidelines
- Cache recently viewed content and data locally so the application remains navigable and readable during connectivity loss
- Queue user actions (form submissions, messages, edits) locally and automatically retry when connectivity is restored, with visible feedback about the queue status
- Show a persistent but non-blocking connectivity indicator ("You are offline — changes will sync when reconnected") rather than replacing the entire UI with an error page
- Differentiate between "offline" (no network), "degraded" (slow/partial connectivity), and "server error" (network fine, backend failing) in user-facing messaging
- Prevent data-destructive actions during offline states and explain why they are unavailable
- Test network failure scenarios explicitly — simulate offline, slow, and error states during QA

## Anti-Patterns
- Displaying a full-screen "No Internet Connection" error page that replaces all content and provides only a "Retry" button, even though the user could continue working with cached data, effectively making a temporary network blip feel like a complete application failure
