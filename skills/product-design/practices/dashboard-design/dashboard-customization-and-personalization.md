---
title: Dashboard Customization and Personalization
category: Dashboard Design
tags: [dashboard, settings, drag-drop, enterprise]
priority: situational
applies_when: "When building a dashboard that serves multiple user personas who need to rearrange, add, or remove widgets to match their individual workflows."
---

## Principle
Allow users to rearrange, resize, show, and hide dashboard components to match their individual workflows, while providing a well-designed default layout that works without any customization.

## Why It Matters
No single dashboard layout serves every user equally. A sales manager cares about pipeline velocity; their colleague on the same team cares about quota attainment. Customization lets each user surface what matters to them and suppress what does not, dramatically increasing engagement and perceived value. However, customization without strong defaults creates a blank-canvas problem that paralyzes users who just want answers. The best dashboards ship with an opinionated default that works for 80% of users while giving the other 20% the tools to adapt.

## Application Guidelines
- Ship a **curated default layout** designed around the primary user persona's top goals. Never launch with an empty canvas requiring setup.
- Allow users to **add, remove, rearrange, and resize** dashboard widgets through direct manipulation (drag-and-drop) with clear affordances like a grip handle or an "Edit dashboard" toggle mode.
- Provide a **widget gallery or catalog** that lets users browse available metrics and visualizations, grouped by category, with previews.
- Support **saving multiple dashboard configurations** as named views or tabs so users can switch between different analytical perspectives without rebuilding.
- Allow **sharing custom layouts** with teammates via URL or a "save as team default" action for managers.
- Persist customizations server-side and tie them to the user account, not the browser, so settings follow users across devices.
- Include a **"Reset to default"** action that is easy to find but hard to trigger accidentally, providing a safety net for users who over-customize themselves into a corner.

## Anti-Patterns
- Launching with a blank dashboard and requiring every user to configure their own layout from scratch before seeing any data.
- Making customization so hidden (buried in settings) that users never discover it, or so prominent (constant "edit mode" UI) that it distracts from data consumption.
- Allowing infinite widget additions without warning about performance or readability degradation, letting users create a 50-widget dashboard that takes 30 seconds to load.
- Not persisting customizations, so users lose their layout on every login or browser refresh.
