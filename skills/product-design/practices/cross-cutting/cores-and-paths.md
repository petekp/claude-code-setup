---
title: Cores and Paths — Design From the Core Content Outward
category: Cross-Cutting Principles
tags: [navigation, layout, search, mental-model]
priority: situational
applies_when: "When starting a design and deciding where to invest effort first — prioritize the core content screens users spend the most time on, then design the navigation paths between them."
---

## Principle
Identify the core content or object that each screen serves, design that core first to be excellent, and then design the paths (navigation, actions, related content) that connect cores to each other — rather than starting with navigation and chrome.

## Why It Matters
Jared Spool's "Cores and Paths" framework recognizes that users spend most of their time on core content screens (a specific record, a document, a message, a report) and relatively little time in navigation. Yet many design processes start with navigation — the sidebar, the header, the menu — and treat content screens as templates to fill. This inverted priority produces applications with beautiful navigation shells and mediocre content experiences. Starting with cores ensures that the screens where users spend the most time receive the most design investment.

## Application Guidelines
- Identify the core objects in your application: the entities users spend most of their time viewing, creating, and editing (patients, orders, projects, documents, cases)
- Design each core object's detail view first: optimize it for the primary tasks users perform on that object, with the right information density, layout, and actions
- Then design the paths between cores: navigation that connects objects, links between related records, and search that finds specific cores quickly
- Evaluate navigation by its effectiveness at getting users to cores: "Can a user reach the patient record they need in 2 clicks or less?"
- Design list views (the path to a core) to surface enough information for users to identify the right core without opening every record
- Ensure cores can be reached through multiple paths: search, navigation, direct links, recent items, and related-record links from other cores

## Anti-Patterns
- Spending 80% of design effort on the shell (sidebar, header, dashboard) and 20% on the core content screens where users actually work
- Navigation-centric design where every feature is organized around menus rather than around the objects users care about
- Core content screens that are generic templates filled with data rather than purpose-designed experiences optimized for the specific object type
- No direct paths between related cores, forcing users to return to navigation to move between related records (e.g., can't jump from an order to its customer without going through the sidebar)
