---
title: Smart Defaults for Sort Order
category: Data Display & Tables
tags: [table, list, recognition, cognitive-load]
priority: situational
applies_when: "When setting the initial sort order of a table to match users' most likely intent — newest first, highest priority, or alphabetical — rather than database insertion order."
---

## Principle
Set the default sort order of every table to match the user's most likely intent — newest first for time-based data, alphabetical for name-based lookups, highest priority first for task lists — rather than arbitrary database insertion order.

## Why It Matters
The default sort order is the first impression a table makes. If a user opens an order management table and sees orders from 2019 at the top (sorted by creation date ascending), they must immediately sort by date descending to see recent activity — an unnecessary step that every user pays on every page load. A smart default anticipates the most common need and presents the data in a ready-to-use order, eliminating a mandatory interaction that adds friction without value. Over time, across hundreds of daily table views, this saves significant cumulative time and mental overhead.

## Application Guidelines
- **Time-based data** (orders, events, logs, messages): default to newest first (descending by date). Users almost always care about recent activity more than historical.
- **Name-based data** (contacts, products, categories): default to alphabetical ascending (A-Z). This is the universal expectation for named lists and supports scanning for known items.
- **Priority-based data** (tasks, tickets, incidents): default to highest priority first, then by recency within priority. This surfaces the most urgent items at the top.
- **Numerical data** (leaderboards, rankings, performance metrics): default to descending by the primary metric so the top performers or most significant values appear first.
- **Search results**: default to relevance scoring, not alphabetical or chronological, since the user's query implies an intent to find the most relevant match.
- Always **indicate the default sort visually** with a sort arrow on the active column, so users know the sort is intentional and not random.
- Allow users to **override and persist** their preferred sort order across sessions, but make the default good enough that most users never need to.

## Anti-Patterns
- Defaulting to database insertion order (often effectively random), which provides no useful structure and forces every user to sort on first interaction.
- Defaulting a log or event table to oldest-first (ascending date), burying the most relevant recent entries at the bottom.
- Defaulting a task list to alphabetical when users care about urgency, making them sort by priority or due date every time.
- Showing no sort indicator on the default sort, making users wonder whether the table is sorted at all and if so, by what.
