---
title: Guided Import with Template, Mapping, and Repair
category: Enterprise & B2B Patterns
tags: [wizard, enterprise, validation, error-handling]
priority: situational
applies_when: "When users need to import external data (CSV, Excel) into the system and need a guided flow with column mapping, validation, error repair, and preview."
---

## Principle
Provide a multi-step guided import experience that offers templates, automatic column mapping, data validation, error repair, and preview before committing, so users can confidently import data without fear of corrupting their system.

## Why It Matters
Data import is one of the highest-anxiety interactions in enterprise software. Users are bringing external data (from spreadsheets, other systems, CSV exports) into a system of record, and any error — wrong column mapping, invalid data formats, duplicate records — can have significant downstream consequences. A guided import flow reduces this anxiety by making every step transparent, every error fixable, and every result previewable before commitment.

## Application Guidelines
- Offer downloadable template files pre-formatted with the correct columns, data types, and example values
- Implement automatic column mapping that matches uploaded column headers to system fields, with manual override for unmatched columns
- Validate all data before import and present a clear error report: "Row 47: Invalid email format in column C"
- Allow users to fix errors inline within the import interface rather than requiring them to fix the source file and re-upload
- Show a preview of the first 10-20 records as they will appear in the system before committing the import
- Provide a summary after import: "Successfully imported 1,234 records. 3 records skipped due to duplicates. 0 errors."
- Support undo/rollback for imports so users can reverse a bad import without manual cleanup

## Anti-Patterns
- Providing a bare file upload with no guidance on expected format, column names, or data types
- Failing silently on invalid data — importing what works and silently dropping what doesn't, leaving users unaware of missing records
- Requiring a perfect source file with no tolerance for formatting variations, extra columns, or minor data issues
- Committing the import immediately with no preview, giving users no chance to catch mapping errors before they affect the system
