---
title: Nonmodal Side Panels as Default for Non-Critical Interactions
category: Component Patterns
tags: [sidebar, layout, keyboard, direct-manipulation]
priority: situational
applies_when: "When building detail views or editing interfaces where users need to reference the parent list or context alongside the detail content."
---

## Principle
Side panels that slide in without blocking the main content should be the default pattern for detail views, editing, and supplementary interactions that benefit from maintaining context.

## Why It Matters
Most interactions in data-rich applications — viewing a record's details, editing properties, reviewing related items — benefit from keeping the list or parent view visible alongside the detail view. Side panels provide focused space for these interactions without the context destruction of a full-page navigation or the forced attention of a modal. Users can reference the list while editing a record, compare items visually, and maintain spatial awareness of where they are in the information hierarchy. This pattern has become a standard in modern SaaS applications for good reason.

## Application Guidelines
- Use side panels for viewing and editing entity details when the user needs to reference the parent list or context
- Size the panel proportionally: narrow (30-40% width) for simple details, wider (50-60%) for complex editing, but never so wide that the main content is unreadable
- Include a clear close mechanism (X button, Escape key) and allow the user to click the main content area to dismiss when there are no unsaved changes
- Support keyboard navigation into and out of the panel without trapping focus (unlike modals, side panels are nonmodal)
- Animate the panel in from the appropriate edge (typically right in LTR layouts) with a brief, smooth transition
- Allow the side panel content to scroll independently from the main content
- Consider making the panel resizable for power users who want to control the split

## Anti-Patterns
- Using a full-page navigation to view a record's details when the user will immediately need to return to the list, creating unnecessary back-and-forth
- Using a modal for an editing interaction where the user needs to reference information visible in the background
- A side panel that covers the entire main content area, defeating the purpose of maintaining context
- Opening a side panel that cannot be dismissed without explicit save/cancel, turning a nonmodal pattern into a blocking one
