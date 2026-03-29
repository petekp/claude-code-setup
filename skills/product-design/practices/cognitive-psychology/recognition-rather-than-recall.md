---
title: Recognition Rather Than Recall
category: Cognitive Psychology
tags: [search, form, navigation, icon, recognition, cognitive-load]
priority: core
applies_when: "When designing any input, navigation, or command interface where users could benefit from seeing available options instead of typing from memory."
---

## Principle
Users should be able to recognize what they need from visible options, labels, and cues rather than having to recall information from memory.

## Why It Matters
Recognition is a fundamentally easier cognitive operation than recall. Recognizing a familiar item from a list requires only a sense of familiarity, while recalling requires reconstructing information from memory with no external cues. Interfaces that demand recall — expecting users to remember command syntax, codes, or information from previous screens — create errors, slow users down, and punish infrequent users disproportionately. Recognition-based design makes products accessible to novices while still allowing expert shortcuts.

## Application Guidelines
- Provide visible labels, icons, and descriptions for all actions rather than relying on users to memorize unlabeled icon meanings
- Show recent items, recent searches, and recently visited pages to let users recognize and re-access rather than recall and re-navigate
- Use autocomplete and suggestion lists that let users recognize the correct entry rather than typing it from memory
- Display contextual help text and placeholder examples within form fields (e.g., "e.g., john@company.com")
- When referencing something the user configured earlier, show the actual value — not just a reference ID or code name
- In command palettes, show full command names alongside keyboard shortcuts so users can find commands by recognition
- Prefer dropdowns, radio buttons, and selection lists over free-text fields when the set of valid inputs is known
- Use breadcrumbs, progress indicators, and visible navigation to remind users where they are and how they got there
- Display previews and thumbnails so users can recognize content visually rather than by filename alone

## Anti-Patterns
- An icon-only toolbar with no labels or tooltips, requiring users to memorize what each icon does
- A "Enter your region code" field with no dropdown or reference list, expecting users to know the code system
- Requiring users to remember which of several similarly-named saved views contains the filters they need, rather than previewing filter contents
- A blank search box with no search history, suggestions, or example queries
- Hiding all menu items behind a single icon with no labels
- Instructions that say "as mentioned on the previous screen" without repeating the relevant information
