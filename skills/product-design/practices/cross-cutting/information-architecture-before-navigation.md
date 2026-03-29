---
title: Define Information Architecture Before Designing Navigation
category: Cross-Cutting Principles
tags: [navigation, sidebar, mental-model, consistency]
priority: core
applies_when: "When designing or restructuring an application's navigation and you need to establish the conceptual structure of content before deciding on the wayfinding system."
---

## Principle
Establish the conceptual structure, relationships, and organization of content and features before designing the navigation system that provides access to them — the architecture must exist before the wayfinding.

## Why It Matters
Navigation is a representation of information architecture, not a replacement for it. When teams design navigation first — "let's put these items in the sidebar and those in the header" — they're making organizational decisions based on screen layout rather than conceptual structure. The result is navigation that reflects engineering modules or designer assumptions rather than user mental models. Starting with information architecture — how users conceptualize the domain, what belongs together, what relates to what — produces navigation that feels intuitive because it matches how users already think.

## Application Guidelines
- Conduct card sorting exercises with real users to understand how they naturally group and relate the concepts in your application
- Create a site map or content hierarchy that organizes all features and content based on user mental models, not system architecture
- Identify the primary organizational axis: is the application organized by object type (Customers, Orders, Products), by workflow phase (Plan, Build, Review, Ship), by role (My Work, My Team, Organization), or by something else?
- Define relationship types between entities: what belongs inside what, what relates to what, what leads to what
- Only after the information architecture is stable, design the navigation system (sidebar, tabs, breadcrumbs) as a way to traverse the architecture
- Validate the architecture with tree testing: can users find features using only the hierarchy labels, with no visual design cues?

## Anti-Patterns
- Designing the navigation bar first and fitting content into it, resulting in organizational decisions driven by layout constraints
- Organizing navigation by engineering team or code module (each team "owns" a nav section) rather than by user-meaningful groupings
- Copying a competitor's navigation structure without understanding whether it matches your users' mental model
- Navigation that grows organically by adding items wherever there's space, with no underlying organizational principle
