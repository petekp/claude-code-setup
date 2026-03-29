---
title: Three-Level Density System for Tables and Lists
category: Data Display & Tables
tags: [table, list, data-density, responsive, settings]
priority: situational
applies_when: "When designing a table or list that users will view on different screen sizes and for different tasks, needing comfortable, standard, and compact density levels."
---

## Principle
Offer three display density levels — comfortable, standard, and compact — so users can trade off between readability and information density based on their task, screen size, and personal preference.

## Why It Matters
Different users and different tasks demand different density tradeoffs. A user on a 13-inch laptop scanning a 500-row table needs compact density to see more rows without scrolling. The same user on a 27-inch monitor reviewing records one by one prefers comfortable density with larger text and more whitespace. Providing a density toggle is a low-cost, high-impact feature that accommodates diverse working conditions without requiring separate table designs. It signals respect for the user's autonomy and working context.

## Application Guidelines
- Define three density levels by adjusting **row height, font size, and cell padding** together as a coordinated set:
  - **Comfortable:** 48-56px row height, 14-16px font, generous padding. Best for focused reading and record-by-record work.
  - **Standard:** 36-44px row height, 13-14px font, moderate padding. The default — balanced for most tasks.
  - **Compact:** 28-32px row height, 12-13px font, minimal padding. Best for scanning, comparison, and high-volume data.
- Place the **density toggle** in the table toolbar, using a recognizable icon (horizontal lines with varying spacing) or a simple three-option segmented control.
- **Persist the user's density preference** across sessions and apply it consistently to all tables in the application.
- Adjust **row content adaptively** at different densities. In comfortable mode, show avatars, full names, and multi-line descriptions. In compact mode, show initials, truncated names, and single-line summaries.
- Ensure all density levels maintain **minimum touch target sizes** on touch devices (44x44px for interactive elements) even in compact mode.
- Test **readability** at each density level — compact mode should still be legible, not an illegible wall of tiny text crammed together.

## Anti-Patterns
- Only offering one fixed density that is either too spacious (wasting screen space and requiring excessive scrolling) or too dense (straining readability for sustained use).
- Adjusting only row height without also adjusting font size and padding, creating rows that are cramped but still use large text, or spacious but still use tiny text.
- Compact mode that shrinks interactive elements below usable touch target sizes, making selection and action impossible on tablets.
- A density toggle that is not persistent, resetting to the default every time the user reloads the page.
