---
title: Consistent Date and Number Formatting
category: Enterprise & B2B Patterns
tags: [text, i18n, enterprise, consistency]
priority: situational
applies_when: "When an application used globally needs uniform, locale-aware formatting for dates, times, numbers, and currencies across all screens."
---

## Principle
Apply uniform, locale-aware formatting for dates, times, numbers, and currencies throughout the entire application, driven by a single configuration source that respects the user's locale and organizational preferences.

## Why It Matters
Enterprise applications used globally must handle dates, times, numbers, and currencies correctly across locales. Inconsistent formatting — showing MM/DD/YYYY on one screen and DD/MM/YYYY on another — creates confusion and can cause serious data entry errors (is 03/04/2025 March 4th or April 3rd?). Consistent formatting builds trust and prevents costly mistakes, especially in financial, logistics, and healthcare applications where date and number precision is critical.

## Application Guidelines
- Implement a centralized formatting service that all UI components use; never format dates or numbers with ad-hoc code in individual components
- Default to the user's browser/OS locale but allow explicit override at the organization and user level
- For dates, use unambiguous formats when possible (e.g., "Mar 4, 2025" rather than "3/4/25") or follow the configured locale strictly
- Display relative timestamps for recent events ("2 hours ago") and absolute timestamps for historical data, with the full date/time available on hover
- Format numbers with the locale-appropriate thousands separator and decimal marker (1,234.56 vs. 1.234,56)
- Always display currency codes or symbols with monetary values and clarify the currency when the application handles multiple currencies
- Show timezone information explicitly for timestamps that span timezones, and let users configure their display timezone

## Anti-Patterns
- Displaying raw ISO timestamps (2025-03-28T14:30:00Z) in the UI instead of human-readable formatted dates
- Using ambiguous numeric date formats (03/04/25) without consistent locale context
- Formatting dates inconsistently across different screens, with some showing "March 4" and others showing "3/4" or "04-Mar"
- Displaying times without timezone context in applications used across time zones, causing scheduling confusion
