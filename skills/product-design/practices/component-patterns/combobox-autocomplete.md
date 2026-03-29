---
title: Combobox / Autocomplete for Long-List Dropdowns
category: Component Patterns
tags: [form, search, keyboard, performance]
priority: situational
applies_when: "When a selection list exceeds 10-15 items and a standard dropdown becomes unusable, requiring a searchable combobox with type-ahead filtering."
---

## Principle
When a selection list exceeds roughly 10-15 items, replace the standard dropdown with a combobox (searchable dropdown) that lets users type to filter options.

## Why It Matters
Standard dropdowns become unusable as list length grows. A dropdown with 50 countries, 200 products, or thousands of users forces painful scrolling and visual scanning. Comboboxes solve this by letting users narrow the list with a few keystrokes, combining the discoverability of a dropdown (users can see available options) with the efficiency of direct text input. This pattern is now a baseline user expectation in any data-rich application.

## Application Guidelines
- Implement type-ahead filtering that matches against the beginning of the string and contains matches, highlighting the matching portion of each result
- Show the full dropdown list when the input is focused but empty, so users can browse if they are unsure what to type
- Display a "No results found" message when the filter matches nothing, rather than showing an empty list
- Support keyboard navigation: arrow keys to move through filtered results, Enter to select, Escape to close
- For very large datasets (1000+ items), implement server-side filtering with a loading indicator rather than loading all options upfront
- Show the selected value clearly in the input after selection, and provide a clear/reset affordance to change the selection
- Support multi-select variants where appropriate, showing selected items as removable chips/tags above or within the input

## Anti-Patterns
- A plain dropdown with 100+ items that requires users to scroll through the entire list to find their selection
- A combobox that only matches from the beginning of the string, so users searching for "United States" cannot type "States" to find it
- Filtering that is case-sensitive, requiring users to match the exact capitalization of the option
- A combobox with no empty-state message, leaving users confused about whether no results exist or the component is broken
