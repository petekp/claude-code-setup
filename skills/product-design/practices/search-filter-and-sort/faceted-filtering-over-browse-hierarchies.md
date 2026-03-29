---
title: Faceted Filtering Over Browse Hierarchies
category: Search, Filter & Sort
tags: [search, navigation, data-density, mental-model]
priority: situational
applies_when: "When users need to query data by multiple independent attributes and rigid browse hierarchies prevent cross-cutting queries."
---

## Principle
Prefer faceted filtering (multiple independent filter dimensions applied simultaneously) over rigid browse hierarchies (Category > Subcategory > Sub-subcategory) when users need to query by multiple attributes that do not nest cleanly.

## Why It Matters
Browse hierarchies force a single navigation path: "Clothing > Men's > Shirts > Casual." But what if the user wants all casual clothing across men's and women's? Or all shirts under $50 regardless of gender? Hierarchies make cross-cutting queries impossible without backtracking and re-browsing. Faceted filtering treats each attribute (Gender, Type, Style, Price) as an independent dimension that can be combined freely: Gender=Any, Type=Shirts, Style=Casual, Price=$0-$50. This gives users exponentially more query flexibility with the same number of filter controls. Facets map to how users actually think — in attributes, not in one fixed taxonomy.

## Application Guidelines
- Use faceted filtering when the data has **3+ independent attributes** that users commonly query in different combinations. Typical facets: status, category, date range, owner, priority, price range, location.
- When a hierarchy does exist in the data (e.g., Department > Team > Person), expose it as a **drillable facet** (select Department, then see Teams within that Department) rather than as the primary navigation structure.
- Let users **combine any facet values across dimensions** freely. The interface should never force a selection order (e.g., "you must select a Category before you can filter by Price").
- Show **result counts dynamically** on each facet value so users can predict which combinations are productive vs. empty.
- Support **clearing individual facets** independently — removing one filter should not reset the others.
- When the data does have a natural hierarchy, offer both: a **faceted filter panel** for flexible cross-cutting queries and a **browse hierarchy** (breadcrumbs, tree navigation) for users who prefer structured drill-down.
- For long facet value lists, provide **in-facet search** (type to filter within a facet, e.g., search within a list of 200 brands) and **show more/fewer** toggles.

## Anti-Patterns
- A rigid browse hierarchy as the only navigation method, making cross-cutting queries impossible without multiple round-trips.
- Facets that force a selection order (e.g., "select a Category first," then graying out other facets until the user complies).
- No result counts on facet values, leading users into dead-end filter combinations that return zero results.
- Faceted filters that reset all other selections when one facet is changed, breaking the independent-dimension model.
