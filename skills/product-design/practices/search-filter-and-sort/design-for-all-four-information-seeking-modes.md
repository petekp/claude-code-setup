---
title: Design for All Four Information-Seeking Modes
category: Search, Filter & Sort
tags: [search, navigation, onboarding, mental-model]
priority: niche
applies_when: "When designing search and navigation systems and ensuring support for known-item search, exploratory search, browsing, and re-finding behaviors."
---

## Principle
Support all four information-seeking behaviors identified by Gary Marchionini — known-item search, exploratory search, browsing, and re-finding — because users constantly shift between these modes even within a single session.

## Why It Matters
Most search and navigation systems are optimized for only one mode: known-item search (the user knows what they want and types a query). But users frequently need to explore ("what dashboards are available for marketing?"), browse ("let me scan recent activity to see if anything needs attention"), and re-find ("I saw a report last week but cannot remember its name"). A system that only supports known-item search forces users into artificial precision when they are still forming their intent, creates dead ends when they cannot recall the right query, and provides no path for discovery. Supporting all four modes makes the system resilient to the full range of human information-seeking behavior.

## Application Guidelines
- **Known-item search:** Provide a fast, forgiving search with autocomplete, fuzzy matching, and synonym support. The user types "quarterly revenue report" and gets it immediately, even if the actual title is "Q4 Revenue Dashboard."
- **Exploratory search:** Provide faceted filtering, suggested searches, and "related items" links that help users refine a vague intent into a concrete result. When a user searches "marketing" and gets 200 results, offer facets to narrow by type, date, author, and department.
- **Browsing:** Provide structured navigation (menus, categories, recently added sections, and curated collections) that let users scan available content without a query. This serves the "I'll know it when I see it" mode.
- **Re-finding:** Provide recent items, search history, favorites/bookmarks, and "recently viewed" lists that let users retrace their steps. The user who saw a report last Tuesday should be able to find it without remembering its name.
- Integrate all four modes into a **unified search experience**: the search dropdown can show recent items (re-find), popular searches (explore), category shortcuts (browse), and matching results (known-item) simultaneously.
- Observe which mode dominates for each user role and optimize accordingly — an analyst may primarily explore, while an admin primarily re-finds.
- Use analytics to identify **mode-switching friction**: if users frequently search, fail, then navigate manually, the search system is not supporting their mode transition.

## Anti-Patterns
- A search-only interface with no navigation, browsing, or history — failing every user who does not have a precise query ready.
- No search history or recent items, forcing users who need to re-find something to remember exact titles or retrace manual navigation paths.
- A navigation hierarchy with no search, forcing users who know exactly what they want to click through 4 levels of menus.
- Treating all searches as known-item lookups with no provision for exploratory refinement (facets, related items, suggested queries) when the initial query is vague.
