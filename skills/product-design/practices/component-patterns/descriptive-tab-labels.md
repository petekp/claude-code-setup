---
title: Descriptive, Concise Tab Labels
category: Component Patterns
tags: [navigation, text, scanning, mental-model]
priority: situational
applies_when: "When writing tab labels that must be short enough to scan instantly yet descriptive enough to accurately predict the hidden content."
---

## Principle
Tab labels must be short enough to scan instantly and descriptive enough to accurately predict the content behind the tab without clicking.

## Why It Matters
Tab labels are the user's only information about hidden content. A vague or overly clever label forces users to click each tab exploratively, defeating the purpose of tabbed organization. A label that is too long creates visual clutter and makes scanning the tab bar slow. The ideal tab label is a precise, conventional noun or short noun phrase that maps to a clear mental category. Good tab labels make the interface self-documenting; bad tab labels make it a guessing game.

## Application Guidelines
- Use 1-3 word noun phrases that name the content category: "Settings," "Team Members," "Billing History," "Activity Log"
- Avoid verbs in tab labels — tabs describe what is inside, not what the user does (use "Notifications" not "Manage Notifications")
- Use parallel grammatical structure across all tabs in a set (all nouns, all noun phrases, or all adjective-noun pairs)
- Include counts in tab labels when the quantity is useful context: "Comments (12)," "Open Issues (5)"
- Test tab labels with users to verify they correctly predict which tab contains specific content
- Ensure tab labels remain readable at the narrowest supported viewport — truncation with ellipsis is a sign the label is too long or the design needs a responsive adaptation
- Avoid icons-only tabs without text; if space is extremely constrained, use icons with tooltip labels

## Anti-Patterns
- Generic labels like "General," "Other," or "Miscellaneous" that give no indication of content
- Tabs labeled with internal jargon or product-specific terminology that new users will not understand
- Inconsistent grammatical structure: "Overview" / "Managing Users" / "The Billing Section"
- Tab labels so long they wrap to two lines or require horizontal scrolling of the tab bar
