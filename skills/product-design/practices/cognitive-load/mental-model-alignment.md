---
title: "Mental Model Alignment: Bridge the Gap Between User Expectations and System Behavior"
category: Cognitive Load
tags: [navigation, settings, mental-model, cognitive-load]
priority: core
applies_when: "When organizing information architecture, naming navigation items, or any time users report confusion about where to find things or what labels mean."
---

## Principle
The interface's conceptual structure should match how users think about their tasks, not how the system is technically implemented.

## Why It Matters
Users approach software with a mental model of how things should work, built from real-world experience and prior software use. When the interface mirrors this model — files go in folders, messages appear in chronological order, undo reverses the last action — interaction feels intuitive and effortless. When the interface reflects internal system architecture instead (database tables, API structures, microservice boundaries), users must translate between their mental model and the system's model on every interaction, creating persistent cognitive friction.

## Application Guidelines
- Use language that reflects the user's domain, not technical implementation (e.g., "your projects" not "workspace instances")
- Organize information architectures around user tasks and goals, not around system modules or database schemas
- Ensure that cause-and-effect relationships in the UI match user expectations (clicking "delete" removes the item; it doesn't archive it)
- When the system model must diverge from the user's mental model, provide clear explanatory bridges (e.g., "this may take a few minutes because...")
- Conduct card sorting and tree testing to validate that your information architecture matches how users think

## Anti-Patterns
- Exposing internal system states or error codes to users (e.g., "Error 500: null pointer exception")
- Navigation structures that mirror the org chart or engineering team boundaries
- Terminology that requires training or a glossary to understand
- System behaviors that surprise users because they violate task-domain expectations
