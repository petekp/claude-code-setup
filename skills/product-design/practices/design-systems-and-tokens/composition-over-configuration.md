---
title: Composition Over Configuration in Design Systems
category: Design Systems & Tokens
tags: [card, button, layout, consistency]
priority: situational
applies_when: "When building design system components and you need small, composable primitives instead of monolithic components with dozens of configuration props."
---

## Principle
Build design system components as small, composable primitives that combine to create complex UI patterns, rather than building monolithic components with extensive configuration props.

## Why It Matters
Monolithic components with dozens of props (showHeader, showFooter, headerVariant, footerAction, iconPosition, labelAlignment...) become unmaintainable, hard to document, and difficult to extend for new use cases. Composable components — a Card that accepts any children, a Stack that handles layout, a Badge that can go anywhere — give developers the flexibility to build novel layouts from familiar building blocks without requesting new props or forking components. This approach scales better and produces more predictable results.

## Application Guidelines
- Build atomic primitives first: Box, Stack, Text, Icon, Badge, Button, Input — each responsible for one thing and composable with others
- Design compound components as compositions of primitives: a Card is a Box containing a Stack of Text, Badge, and Button children
- Use the "slots" pattern where complex components accept children or render props for customizable sections rather than configuration props
- Avoid boolean props that toggle features (showIcon, hasFooter); instead, compose the icon or footer as a child when needed
- Document both individual primitives and common composition recipes so developers know the building blocks and the recommended ways to combine them
- Test compositions, not just individual components — ensure that common combinations work well together visually and functionally

## Anti-Patterns
- Building a single Card component with 30+ props to handle every possible card layout variation
- Creating a new component for every visual variation rather than composing existing primitives in new arrangements
- Deeply nested prop hierarchies (card.header.icon.size) that are hard to discover and painful to configure
- Components that are so tightly composed they can't be separated — a TableRow that assumes a specific set of child columns with no ability to customize
