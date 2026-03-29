---
title: "Postel's Law — Accept Varied Input, Output Consistent Data"
category: Forms & Input
tags: [form, search, validation, i18n, mental-model]
priority: situational
applies_when: "When handling user input that may arrive in varied formats — phone numbers, dates, currencies, or addresses — and the system should normalize rather than reject."
---

## Principle
Be liberal in what you accept from users and conservative in what you output — parse and normalize varied input formats rather than rejecting them.

## Why It Matters
Users enter data in diverse formats based on habit, locale, and context: phone numbers with or without dashes, dates as "Jan 5" or "1/5/2025" or "2025-01-05," currency with or without symbols. Rigid format requirements create unnecessary friction and errors. Systems that gracefully accept variation and normalize it internally respect the user's intent rather than demanding conformity to an arbitrary format. This is especially important in international contexts where formats differ by locale.

## Application Guidelines
- Accept phone numbers in any format (with or without country code, dashes, dots, spaces, parentheses) and normalize to a canonical format on storage
- Parse dates from multiple formats and display in the user's locale format; when ambiguity exists (e.g., "01/02/2025" could be Jan 2 or Feb 1), prompt for clarification
- Strip whitespace, normalize capitalization, and handle common typos in email addresses (e.g., "gmail.con" -> suggest "gmail.com")
- Accept currency input with or without symbols, commas, and varying decimal separators; store as unformatted numbers and format for display
- Show the normalized/formatted version of the input back to the user after processing so they can verify it was interpreted correctly
- For search inputs, handle common misspellings, synonyms, and varied word orders rather than returning "no results" for near-misses

## Anti-Patterns
- Rejecting a valid phone number entry of "(555) 123-4567" because the system only accepts the format "5551234567," forcing the user to guess the expected format through trial and error
