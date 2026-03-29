---
title: Tree View for Hierarchical Data Navigation
category: Component Patterns
tags: [navigation, drag-drop, keyboard, accessibility, progressive-disclosure]
priority: situational
applies_when: "When data has a natural parent-child hierarchy (file systems, org charts, category taxonomies) and users need to browse or select items at any level."
---

## Principle
Tree views should be used when data has a natural parent-child hierarchy and users need to navigate, browse, or select items at any level of that hierarchy.

## Why It Matters
Flat lists cannot represent hierarchical relationships. Breadcrumbs show a single path but not the full structure. Tree views are the only standard UI pattern that exposes the complete hierarchical structure while allowing users to expand and collapse branches on demand. They are essential for file systems, organizational charts, category taxonomies, nested folder structures, and any data where understanding the parent-child relationship is critical to the user's task.

## Application Guidelines
- Use indentation and tree lines to clearly communicate depth levels — each level should be indented consistently (typically 16-24px per level)
- Provide expand/collapse controls (chevrons or plus/minus icons) on nodes that have children
- Support keyboard navigation: arrow keys to move between visible nodes, right arrow to expand, left arrow to collapse, Enter to select
- Highlight the selected node clearly and show the selection path (breadcrumb or highlighted ancestors) for deeply nested items
- Lazy-load children of unexpanded nodes when the tree is large, showing a loading indicator within the expanding node
- Support drag-and-drop for reordering and reparenting when the tree is editable
- For very deep hierarchies (more than 5-6 levels), consider whether a different visualization (nested panels, miller columns) would reduce the cognitive cost of deep nesting

## Anti-Patterns
- A tree with no tree lines or indentation, making it impossible to determine which nodes are children of which parents
- Expanding a tree node triggers full-page navigation instead of inline expansion, losing the user's place in the hierarchy
- A tree view for data that is actually flat (no parent-child relationships), adding unnecessary complexity to a simple list
- All nodes expanded by default in a large tree, creating an overwhelming wall of items that defeats the purpose of progressive disclosure
