---
title: Progressive Disclosure — Show Core Features First, Defer Specialized Options
category: Interaction Patterns
tags: [form, settings, cognitive-load, progressive-disclosure]
priority: core
applies_when: "When a screen, form, or feature has both commonly-needed and advanced options and you need to manage complexity by showing essentials first."
---

## Principle
Present the most commonly needed information and actions first, and progressively reveal more specialized, advanced, or infrequently used options as users need them.

## Why It Matters
Every feature and option added to a screen increases cognitive load for all users, even those who will never use it. Progressive disclosure manages this tradeoff by optimizing the default view for the majority use case while ensuring advanced capabilities remain accessible. New users see a clean, learnable interface; power users can access advanced features when they need them. This principle is how complex software (Photoshop, Excel, Figma) can serve both beginners and experts without compromising either experience.

## Application Guidelines
- Default views should show the 20% of features used by 80% of users; hide the remaining 80% behind expandable sections, "Advanced" tabs, or overflow menus
- Use progressive disclosure in forms: show essential fields by default and optional/advanced fields behind an "Additional options" expansion
- Layer settings screens: simple mode first, "Advanced settings" behind a toggle or separate section
- Reveal complexity in response to user actions: show formatting options when text is selected, show filter controls when the user clicks a filter icon, show bulk actions when items are multi-selected
- Ensure disclosed content is discoverable — use clear labels and visual affordances ("Show more options," a chevron, a link) so users know additional content exists
- Never hide critical functionality behind progressive disclosure — if every user needs it, it should be visible by default
- Use layered information architecture: summaries on the surface, details on drill-down
- Ensure progressive disclosure is reversible — users should be able to collapse expanded sections to reduce complexity again
- Design for three audience layers: first-time users see guidance and defaults, regular users see the core workflow, power users can access advanced configuration
- Use contextual help (tooltips, inline expandable text) rather than loading all documentation into the primary view

## Anti-Patterns
- Showing every possible setting, option, and configuration on a single screen with no hierarchy or grouping, overwhelming new users with dozens of controls they do not understand while forcing experienced users to scan past irrelevant options to find the one they need
- Hiding essential features so deeply that even experienced users can't find them
- Requiring multiple clicks to access frequently used functionality
- Progressive disclosure that feels like a scavenger hunt — users shouldn't have to guess what's hidden
- Inconsistent disclosure patterns where some sections expand inline and others navigate to new pages
