---
title: Visual Density Control (Application-Level)
category: Desktop-Specific Patterns
tags: [settings, layout, data-density, accessibility]
priority: situational
applies_when: "When users have diverse screen sizes and visual preferences and you need to provide compact, comfortable, and spacious layout density options."
---

## Principle
Provide an application-level density setting that lets users choose between compact, comfortable, and spacious layouts based on their visual preferences, expertise level, and monitor characteristics.

## Why It Matters
Users have dramatically different needs for visual density depending on their role, expertise, screen size, and visual ability. A data analyst on a 4K monitor wants maximum density to see more rows. A new user on a laptop benefits from spacious layouts with more breathing room. A user with low vision needs larger targets and more spacing. A single density level cannot serve all these needs. Giving users control over density respects their agency and eliminates a common source of frustration.

## Application Guidelines
- Offer three density presets: Compact (for power users and large monitors), Comfortable (balanced default), and Spacious (for new users and accessibility)
- Density changes should affect row heights, padding, font size, icon size, and spacing proportionally — not just one dimension
- Apply density settings globally across the application for consistency; partial density changes create visual dissonance
- Persist the density preference per user account and apply it immediately on login
- Preview density changes live before committing so users can see the impact without trial-and-error
- Ensure all density levels maintain WCAG AA accessibility standards — compact mode should not reduce touch targets below 24px or text below 11px

## Anti-Patterns
- Providing no density control and forcing all users into a single spacing system, which will be wrong for a significant portion of the user base
- Implementing density control that only adjusts one dimension (e.g., row height) while leaving everything else unchanged, creating an unbalanced layout
- Resetting density preferences on updates or across devices, forcing users to reconfigure repeatedly
- Making the density setting hard to find (buried in developer settings or advanced preferences) when it's a frequently-desired preference
