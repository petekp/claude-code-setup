---
title: Progressive Disclosure for Complex Feature Sets
category: Navigation & Information Architecture
tags: [navigation, settings, progressive-disclosure, cognitive-load]
priority: core
applies_when: "When an interface has many options or advanced features and you need to show only the commonly needed ones by default while making advanced capabilities discoverable."
---

## Principle
Present only the most commonly needed options and information by default, and provide clear, discoverable paths to access advanced capabilities when users need them.

## Why It Matters
Complex applications serve users with vastly different expertise levels and task frequencies. Displaying every option, setting, and advanced feature at all times overwhelms novice users and clutters the interface for everyone. Progressive disclosure manages this complexity by layering the interface: the default view serves 80% of use cases with a simple, scannable set of options, while advanced capabilities are accessible through deliberate user action (expanding a section, clicking "Advanced," opening a configuration panel). This approach does not remove capabilities — it sequences their visibility.

## Application Guidelines
- Identify the 20% of options used by 80% of users and make these the default visible set; place the remaining 80% behind an "Advanced" or "More options" expansion
- Use expandable sections, drawers, or popovers rather than separate pages for progressive disclosure — keep the advanced options in the same context as the basic ones
- Provide clear affordances for expansion: "Show advanced options" with a chevron, "More filters" with a count badge, "Configure" with a gear icon — never hide the path to advanced features
- Remember the user's disclosure state: if a user regularly expands the advanced section, consider defaulting to expanded for that user
- For forms, show required fields by default and optional/advanced fields behind a disclosure toggle, labeled with a count ("5 optional fields")

## Anti-Patterns
- Displaying every possible option in a single, scrollable form with 40+ fields — no progressive disclosure at all
- Hiding advanced features so well that users do not know they exist — progressive disclosure requires a visible, labeled trigger
- Using progressive disclosure inconsistently: some sections use it, others show everything, creating an unpredictable interface
- Nesting progressive disclosure more than 2 levels deep (expanding a section that contains another expandable section that contains another), creating a matryoshka-doll frustration
