---
title: Design Dashboards Around User Goals — Not Available Data
category: Dashboard Design
tags: [dashboard, layout, mental-model, cognitive-load]
priority: core
applies_when: "When planning what metrics and charts to include on a dashboard, or when an existing dashboard feels cluttered and unfocused."
---

## Principle
Start every dashboard design by identifying the decisions users need to make and the questions they need answered, then surface only the data that serves those goals — never the reverse.

## Why It Matters
The most common dashboard failure is "data vomiting" — displaying every available metric because the data exists and engineers surfaced it. Users confronted with 40 charts and no narrative cannot extract meaning; they disengage or, worse, latch onto a misleading metric. Goal-driven dashboards reduce cognitive load, accelerate decision-making, and build trust because every element on screen earns its place by answering a question the user actually has.

## Application Guidelines
- Begin design with user research: interview each role that will use the dashboard and document their top 3-5 recurring questions (e.g., "Are we on track to hit this quarter's target?" not "Show me revenue data").
- Map each question to the minimum set of metrics, dimensions, and time ranges required to answer it. Remove everything else.
- Organize the dashboard layout so that questions are answered in priority order from top-left to bottom-right, matching natural scan patterns.
- Provide a clear narrative arc: the top of the dashboard should answer "How are things overall?" and lower sections should answer "Why?" and "What should I do about it?"
- Include drill-down paths for deeper investigation, but keep them off the default view. The first screen a user sees should answer their most frequent question without interaction.
- Revisit and prune the dashboard quarterly. Data needs evolve, and unused panels accumulate like sediment, degrading signal-to-noise ratio over time.

## Anti-Patterns
- Building a dashboard by listing all available API endpoints or database tables and creating a chart for each one.
- Adding a metric because a stakeholder casually asked "can we also see X?" without validating whether it serves a recurring decision.
- Designing a single "mega-dashboard" for all audiences instead of tailored views per role and goal.
- Displaying raw data (e.g., a 10,000-row event log) on a dashboard where the user's actual question is "Did anything unusual happen today?"
