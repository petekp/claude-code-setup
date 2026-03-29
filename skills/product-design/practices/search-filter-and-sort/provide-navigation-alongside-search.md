---
title: Provide Navigation Alongside Search — Not Search Alone
category: Search, Filter & Sort
tags: [search, navigation, onboarding, mental-model, recognition]
priority: situational
applies_when: "When designing information architecture and ensuring structured navigation (menus, categories, breadcrumbs) exists alongside search for users who cannot formulate a precise query."
---

## Principle
Always provide structured navigation (menus, categories, breadcrumbs, browsable hierarchies) alongside search, because search alone fails when users do not know what to search for, how to spell it, or what vocabulary the system uses.

## Why It Matters
Search requires the user to already know what they want and to formulate a query that matches the system's content. This fails in three common scenarios: the user is exploring and does not have a specific target ("What reports are available?"), the user does not know the system's vocabulary ("Is it called a 'client' or a 'customer' or an 'account'?"), or the user is a newcomer who does not yet know what the system contains. Navigation provides a browsable structure that supports all three scenarios — users can explore categories, learn the system's taxonomy, and discover content they did not know existed. Search and navigation are complementary, not substitutes.

## Application Guidelines
- Provide a **persistent navigation structure** (sidebar menu, top navigation, or breadcrumbs) that gives users an overview of the application's content architecture, independent of search.
- Use **category pages or landing pages** that let users browse within a domain (all reports, all customer segments, all integrations) without needing a specific search query.
- Include **breadcrumbs** on every page so users can understand where they are in the hierarchy and navigate up without using search.
- Show **related or "See also" links** on detail pages to support exploratory navigation between related items.
- On search results pages, show **category facets** that let users narrow results by section or type — this bridges the gap between search and navigation by letting users search broadly and then navigate within results.
- For new users, provide **guided entry points** (onboarding tours, "Getting started" sections, or featured/popular items) rather than relying on them to know what to search for.
- Ensure navigation and search are **always co-present**: the search bar should be visible on navigation pages, and navigation links should be accessible from search results pages.

## Anti-Patterns
- A homepage with only a search bar and no navigational structure, forcing every user to formulate a query before seeing any content (the "Google homepage" anti-pattern applied to an internal tool with 50 sections).
- Removing navigation menus in favor of "just search for it," which fails for exploration, discovery, and users who do not know the system's vocabulary.
- Search results with no category context, showing a flat list of items with no way to browse related content or navigate the hierarchy.
- Breadcrumbs or navigation that disappear on search results pages, stranding users in search with no way to switch to browsing.
