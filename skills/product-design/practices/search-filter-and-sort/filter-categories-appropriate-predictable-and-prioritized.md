---
title: Filter Categories — Appropriate, Predictable, and Prioritized
category: Search, Filter & Sort
tags: [search, table, text, mental-model, hicks-law]
priority: situational
applies_when: "When choosing which filter categories to expose, ordering them by usage frequency, and labeling them in the user's vocabulary rather than database column names."
---

## Principle
Choose filter categories based on how users actually think about the data, order them by frequency of use, and ensure the filter labels match the user's mental model — not the database schema.

## Why It Matters
Filters are the user's primary tool for narrowing a large dataset to a relevant subset. When filter categories are poorly chosen (based on internal data structure rather than user intent), illogically ordered (alphabetical by database column name), or ambiguously labeled (technical jargon instead of plain language), users cannot find the filter they need or do not trust it to do what they expect. Well-chosen, well-ordered filters feel invisible — users reach for the one they need instinctively because it matches how they think about the domain.

## Application Guidelines
- Select filter categories by **observing how users describe their data needs** in interviews and support tickets. If users say "show me open tickets from last week," the filters are Status, Date Range — not database field names like `is_resolved` and `created_at`.
- **Prioritize filters by usage frequency**: the most-used filter should be first (or most prominent). Analyze filter usage analytics to determine order, and update quarterly.
- Use **plain-language labels** that match the user's vocabulary: "Status" not "state_enum," "Date Created" not "created_at," "Assigned To" not "owner_id."
- Group related filters logically: time-based filters together (Date Created, Date Modified, Due Date), entity-based filters together (Assigned To, Team, Department).
- Show **filter value counts** (e.g., "Status: Open (42), Closed (138)") so users can predict the result set size before applying the filter.
- Limit the **visible filters to 5-8** most common, with a "More filters" expansion for less common options. Showing 20 filters at once creates choice paralysis.
- Include a **"Clear all filters"** action that is always visible when filters are active, providing a fast path back to the unfiltered view.

## Anti-Patterns
- Filter categories that mirror database column names ("is_active," "fk_owner_id"), which are meaningless to non-technical users.
- Alphabetical ordering of filters where "Archived" (rarely used) appears before "Status" (used constantly).
- Showing all 25 possible filter dimensions at once in an overwhelming panel with no prioritization.
- Filter labels that are ambiguous: "Date" could mean created date, modified date, or due date — users should not have to guess.
