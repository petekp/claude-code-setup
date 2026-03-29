---
title: Goal-Directed Design — Design for Goals, Not Tasks
category: Cross-Cutting Principles
tags: [navigation, form, mental-model, cognitive-load]
priority: core
applies_when: "When designing a feature or workflow and you need to focus on the user's desired outcome rather than digitizing the existing step-by-step process."
---

## Principle
Design interfaces that help users achieve their goals — the outcomes they care about — rather than merely facilitating the tasks that are currently required to reach those goals, because goals are stable while tasks are implementation details that should be minimized.

## Why It Matters
Alan Cooper's Goal-Directed Design distinguishes between goals (what users want to accomplish) and tasks (the steps currently required). A user's goal is "hire the right candidate," not "post a job listing, screen 200 resumes, schedule 15 interviews, and coordinate feedback from 4 interviewers." Tasks are the current process; goals are the enduring purpose. When designers focus on tasks, they digitize existing bureaucracy. When they focus on goals, they can reimagine the process to reach the goal more efficiently, often eliminating unnecessary tasks entirely.

## Application Guidelines
- Start design by identifying user goals through research: what outcome does the user ultimately want? What would success look like to them?
- For each feature, ask: "Does this help the user reach their goal, or does it add a task?" Eliminate tasks that don't directly serve the goal
- Design around the goal workflow, not the system architecture: if the goal is "approve a purchase," show all relevant information (request details, budget impact, policy compliance) in one view rather than requiring navigation to multiple subsystems
- Automate or eliminate intermediate tasks: if the system can derive information, don't ask the user to enter it; if a step can be skipped for most cases, make it optional
- Measure success by goal completion, not task completion: the metric is "time to hire the right person" not "number of resumes reviewed"
- Create personas with specific goals to anchor design decisions: "Marcus, the hiring manager, wants to fill the role quickly with a strong candidate who will stay"

## Anti-Patterns
- Digitizing paper processes step-by-step without questioning whether each step is necessary for the goal
- Designing features around system capabilities ("We have a database of records, so we'll build CRUD screens") rather than user goals
- Adding steps to a process because the system needs them, not because the user's goal requires them
- Measuring feature success by usage metrics (clicks, page views) rather than goal achievement (outcomes, satisfaction)
