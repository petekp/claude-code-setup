---
title: Tabs — Use Only for Clear Independent Content Groupings
category: Component Patterns
tags: [navigation, layout, responsive, mental-model, consistency]
priority: core
applies_when: "When organizing page content into tabbed views and ensuring tabs represent clearly distinct, mutually exclusive categories."
---

## Principle
Tabs should organize content into clearly distinct, mutually exclusive categories that users can understand from their labels alone, where only one category needs to be visible at a time.

## Why It Matters
Tabs work well when they map to obvious mental categories (Settings / Billing / Team Members). They fail when used as a substitute for vertical scrolling, when tab labels are ambiguous, or when users need to compare content across tabs. Tabs hide content — every hidden tab is content users must actively seek out. If users frequently need information from multiple tabs simultaneously, the tab pattern is the wrong choice. When tabs work, they dramatically simplify complex pages; when they don't, they bury important content.

## Application Guidelines
- Use tabs when content divides naturally into 3-7 distinct categories that are mutually exclusive and collectively exhaustive
- Write tab labels that are short (1-3 words), descriptive, and clearly differentiated from each other
- Never nest tabs within tabs — if the information hierarchy is that deep, use a different navigation pattern
- Preserve tab state: if a user applies filters or makes edits within a tab, switching away and back should not lose that state
- Use a visible active-tab indicator (underline, background color, bold text) that clearly shows which tab is currently selected
- Place tabs at the top of their content area and align the tab bar with the content width
- For responsive layouts, convert horizontal tabs to a dropdown or scrollable tab bar on narrow screens rather than wrapping to multiple lines

## Anti-Patterns
- Using tabs to break up a long form into sections when a single scrollable page with section anchors would let users see the full picture
- Tab labels like "Tab 1," "Tab 2," "Tab 3" or cryptically abbreviated labels that users cannot understand without clicking
- More than 7 tabs, which overwhelms the tab bar and suggests the content grouping is too granular
- Tabs that contain only a few lines of content, making the tab overhead disproportionate to the content
