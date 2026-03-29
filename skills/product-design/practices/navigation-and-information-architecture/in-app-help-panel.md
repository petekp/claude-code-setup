---
title: In-App Help Panel (Help Hub)
category: Navigation & Information Architecture
tags: [sidebar, search, onboarding, enterprise]
priority: situational
applies_when: "When building an in-app help experience that overlays the current page, providing searchable, contextual help without navigating to an external documentation site."
---

## Principle
A dedicated in-app help panel that overlays the current page provides a centralized, searchable, and contextually aware help experience without requiring users to leave the application.

## Why It Matters
Traditional help systems route users to external documentation sites, breaking their workflow context and requiring them to context-switch between the application and a browser tab. An in-app help panel (slide-over panel, sidebar, or modal hub) keeps the user in the application, allows them to read help content while viewing the relevant UI, and provides a single entry point for articles, videos, contact support, and onboarding checklists. This pattern has become standard in modern SaaS products because it dramatically reduces the friction between "I need help" and "I found the answer."

## Application Guidelines
- Position the help panel as a right-side slide-over that does not obscure the full page — users should be able to reference both the help content and the UI simultaneously
- Include a search bar at the top of the panel that searches across all help content (articles, FAQs, changelogs, video tutorials)
- Organize the panel into sections: "Suggested for this page" (contextual), "Getting Started" (onboarding), "What's New" (changelog), and "Contact Support" (escalation)
- Allow the panel to remain open as users navigate between pages, with the contextual suggestions updating automatically to match the current page
- Track user engagement with help content to identify pages with the highest help-seeking rates, which signals usability issues that should be addressed in the product itself

## Anti-Patterns
- Opening help content in a new browser tab that fully replaces the user's context, requiring tab-switching to apply what they learned
- Providing a help panel that only links to external documentation URLs, negating the benefit of an in-app experience
- Building a help panel with no search capability, forcing users to browse categories to find answers
- Making the help panel full-screen or full-width, obscuring the interface the user is trying to learn about
