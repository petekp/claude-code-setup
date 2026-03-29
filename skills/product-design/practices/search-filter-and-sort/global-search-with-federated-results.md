---
title: Global Search with Federated Results
category: Search, Filter & Sort
tags: [search, navigation, keyboard, enterprise, recognition]
priority: situational
applies_when: "When building a single global search bar that queries across all entity types and returns categorized, ranked results so users can find anything from anywhere."
---

## Principle
Provide a single, persistent search bar that queries across all entity types and content categories in the application, returning categorized, ranked results so users can find anything from anywhere without knowing where it lives.

## Why It Matters
Enterprise applications typically contain many entity types — customers, orders, products, documents, users, settings — spread across different sections. When search is siloed per section, users must first navigate to the correct section and then search within it: "Is the customer record under Accounts or Contacts? Let me search both." A global federated search eliminates this navigational tax entirely: the user types what they are looking for, and the system finds it regardless of which database table, microservice, or navigation section contains it. This is how people expect search to work in 2026 — one box, all results.

## Application Guidelines
- Place the global search bar in a **fixed, prominent position** — typically top-center or top-left of the application header, accessible from every page. Support a keyboard shortcut (Cmd/Ctrl+K) for instant access.
- Return results **grouped by entity type** (e.g., "Customers (3)," "Orders (7)," "Products (2)") so users can scan the right category without mixing entity types in a flat list.
- **Rank results by relevance** within each category, using signals like match quality (exact vs. partial), recency, and the user's interaction history (recently viewed items rank higher).
- Show a **rich result preview** for each item: the name/title, a subtitle with key attributes (e.g., customer email, order date, product SKU), and the entity type icon. Users should be able to identify the right result without clicking through.
- Support **search-as-you-type** with results appearing after 2-3 characters, updating as the user continues typing. Show a loading indicator during the search.
- Include **recent searches** and **recent items** in the search dropdown before the user types, providing quick navigation to frequently accessed records.
- Support **query modifiers** for power users: "customer: Acme" to scope to a specific entity type, or "status:open priority:high" for field-specific searches.

## Anti-Patterns
- Separate search bars on each page that only search within that section, forcing users to navigate first and search second.
- A global search that returns a flat, unstructured list mixing customers, products, and documents with no grouping or type indication.
- Search results that show only a title with no preview information, forcing users to click each result to determine if it is what they need.
- A global search that is slow (2+ seconds per keystroke) or does not support type-ahead, making it unusable for frequent searches.
