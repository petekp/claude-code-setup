---
title: Contextual "Help for This Page" Auto-Surfacing
category: Navigation & Information Architecture
tags: [tooltip, sidebar, onboarding, enterprise]
priority: situational
applies_when: "When adding contextual help to a complex application where users need page-specific guidance without searching a generic help center."
---

## Principle
Every page in the application should offer a discoverable path to help content specifically relevant to that page, surfaced automatically based on context rather than requiring the user to search for it.

## Why It Matters
Users seeking help face a dual challenge: they need to find the help system, then they need to find the right article within it. Contextual page-level help eliminates the second challenge entirely by pre-filtering help content to match the user's current location. This reduces the time from "I'm confused" to "I found the answer" from minutes to seconds. It is especially valuable in complex B2B applications where a generic help center search may return dozens of articles across features the user has never used.

## Application Guidelines
- Include a help icon or "?" button on every page that opens a panel or popover showing help articles relevant to the current page
- Auto-populate the help panel with the 2-3 most relevant articles based on the current URL, feature area, or user action context
- Include a search field within the contextual help panel so users can search for related topics without leaving the page
- Surface common questions or troubleshooting steps for the current page: "Why am I seeing no data?" on a dashboard, "How do I invite users?" on a team page
- Track which help articles are accessed most frequently per page and use this data to improve the auto-surfacing priority

## Anti-Patterns
- Providing only a single global "Help" link that drops users at the help center homepage regardless of where they are in the product
- Auto-surfacing help articles that are irrelevant to the current page because the matching logic is based on keywords rather than page context
- Navigating the user away from the application to a separate help site, losing their in-product context and requiring them to navigate back after reading
- Hiding the contextual help trigger so that it is only visible to users who already know it exists — it should be consistently placed and always visible
