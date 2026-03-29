---
title: Autocomplete and Autosuggestion in Search
category: Search, Filter & Sort
tags: [search, form, keyboard, performance, recognition]
priority: situational
applies_when: "When implementing a search field that should show real-time autocomplete suggestions as the user types to reduce typos and guide toward successful queries."
---

## Principle
Provide real-time autocomplete suggestions as the user types in a search field, offering matching results, popular queries, and contextual recommendations that reduce typing effort and guide users toward successful queries.

## Why It Matters
Every character a user types is a chance for a typo, a misspelling, or a query formulation that returns zero results. Autocomplete prevents these failures by offering correct, productive completions before the user finishes typing. It also exposes discoverable content: a user typing "re" sees suggestions like "refund policy," "returns dashboard," and "recent orders" — surfacing content they might not have known existed. Autocomplete transforms search from a recall task (users must know the exact term) into a recognition task (users choose from presented options), which is fundamentally easier for human cognition.

## Application Guidelines
- Begin showing suggestions after **2-3 characters** to avoid overwhelming the user with too-generic completions while still being responsive.
- Include **multiple suggestion types** in the dropdown: matching records (actual data results), suggested queries (popular or recent searches), and category/section suggestions (navigational shortcuts).
- **Visually distinguish** the different suggestion types with icons, labels, or grouping: a document icon for records, a clock icon for recent searches, a magnifying glass for suggested queries.
- **Highlight the matching portion** of each suggestion (bold the characters matching the user's input) so users can quickly scan which suggestions match their intent.
- Return suggestions within **100-200ms** of each keystroke. Slower suggestions feel laggy and may arrive after the user has already typed past the point where they are useful.
- Support **keyboard navigation** of the suggestion list: arrow keys to move between suggestions, Enter to select, Escape to dismiss. The first suggestion should be auto-highlighted for Enter-to-select efficiency.
- Handle **zero-match states** gracefully: when no suggestions match, show "No results for [query]" with alternatives like "Did you mean...?" or "Try searching for..." rather than silently showing an empty dropdown.

## Anti-Patterns
- Autocomplete that takes 1+ seconds per keystroke, causing suggestions to lag behind the user's typing and appear after they have already moved on.
- Showing only exact prefix matches, missing relevant results that contain the search term in the middle (e.g., searching "smith" should match "John Smith," not just "Smithfield").
- A suggestion list with 50+ items and no categorization, forcing users to scroll through an overwhelming list that is worse than typing the full query.
- No keyboard navigation support, requiring mouse interaction to select a suggestion, which breaks the typing flow.
