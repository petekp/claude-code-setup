---
title: Implementation Model vs. Mental Model — Bridge the Gap
category: Interaction Patterns
tags: [navigation, settings, mental-model, consistency]
priority: core
applies_when: "When structuring navigation, naming features, or organizing information and you need to ensure the interface matches how users think, not how the system is built."
---

## Principle
Design the interface to match the user's mental model of the task, not the system's internal implementation — the user should never need to understand how the software works internally to use it effectively.

## Why It Matters
Software is built on databases, APIs, state machines, and data structures. Users think in terms of tasks, goals, and real-world analogies. When an interface exposes its implementation model (showing database IDs, requiring users to understand table relationships, or structuring navigation around system modules rather than user tasks), it forces users to build a mental map of the software's internals before they can accomplish their goals. This creates a steep learning curve and persistent friction that scales with system complexity.

## Application Guidelines
- Structure navigation and information architecture around user tasks and goals ("Send an invoice") rather than system modules ("Accounts Receivable > Documents > Invoices > New")
- Use terminology from the user's domain, not technical jargon — "contacts" not "CRM records," "sent messages" not "outbound communication objects"
- Hide system-internal concepts (IDs, foreign keys, internal states, queue names) from the user interface unless they have explicit user value
- When the system model and user model diverge, build a translation layer in the UI — present a simplified view that maps to user expectations while the system handles complexity behind the scenes
- Test with users to discover their mental models before designing — card sorting, task analysis, and think-aloud protocols reveal how users expect information to be organized
- Allow the same data to appear in multiple navigation contexts if users would expect to find it in different places

## Anti-Patterns
- Organizing an HR application's navigation around database tables (Employees, Departments, Positions, Compensation_Records, Benefits_Enrollments) instead of user tasks (Hire someone, Process a raise, Manage benefits), forcing users to learn the database schema to accomplish routine tasks
