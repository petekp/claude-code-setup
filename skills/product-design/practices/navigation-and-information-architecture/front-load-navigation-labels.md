---
title: Front-Load Navigation Labels With Information-Rich Keywords
category: Navigation & Information Architecture
tags: [navigation, text, scanning, cognitive-load]
priority: situational
applies_when: "When writing navigation labels and ensuring the most distinctive keyword appears first for rapid F-pattern scanning."
---

## Principle
Navigation labels should begin with the most distinctive, information-carrying word so users can identify the correct destination by scanning only the first 1-2 words of each label.

## Why It Matters
Users scan navigation by reading the first word or two of each label — they do not read full labels sequentially. When multiple labels begin with the same word ("Manage Users," "Manage Projects," "Manage Billing"), the user must read deeper into each label to differentiate them, slowing scanning to a crawl. Front-loading labels with the distinctive keyword ("Users," "Projects," "Billing") enables instant differentiation during rapid scanning and aligns with the F-pattern left-edge scanning behavior.

## Application Guidelines
- Lead navigation labels with the noun (the thing) rather than the verb (the action): "Projects" not "Manage Projects," "Team Members" not "View Team Members"
- Avoid starting multiple labels with the same word — if several items share a prefix, restructure them as a group with the shared concept as the group header
- Use specific, concrete terms over abstract ones: "Invoices" not "Financial Documents," "API Keys" not "Developer Resources"
- Keep labels to 1-2 words when possible — every additional word dilutes the scanning speed of the entire navigation
- Test labels by covering everything after the first word — if users cannot differentiate items, the labels are not front-loaded enough

## Anti-Patterns
- Starting multiple navigation items with the same verb: "View Reports," "View Analytics," "View Logs" — the verb adds no differentiating information
- Using internal product jargon or branded feature names that users have not yet learned: "Pulse" instead of "Activity Feed," "Nexus" instead of "Integrations"
- Writing navigation labels as full sentences or phrases: "Set up your team's billing preferences" belongs in help text, not in navigation
- Abbreviating labels to the point of ambiguity: "Cfg" for "Configuration," "Perms" for "Permissions" — saving characters is not worth sacrificing clarity
