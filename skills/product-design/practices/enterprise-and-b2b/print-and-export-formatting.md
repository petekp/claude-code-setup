---
title: Print and Export Formatting
category: Enterprise & B2B Patterns
tags: [table, enterprise, layout]
priority: niche
applies_when: "When enterprise users need to produce professional printed reports, PDF invoices, or presentation-ready exports and browser defaults produce ugly results."
---

## Principle
Design explicit print stylesheets and export layouts that produce professional, well-formatted output for paper, PDF, and presentation use cases — don't rely on browser print defaults.

## Why It Matters
Enterprise users frequently need to produce physical or PDF artifacts from application data: printed reports for meetings, PDF invoices for clients, exported summaries for board presentations, and compliance documentation for auditors. Browser default printing produces ugly results — navigation bars, sidebars, broken layouts, and truncated tables. Purpose-built print and export formatting transforms application data into professional documents that represent both the user and their organization well.

## Application Guidelines
- Create dedicated print CSS that hides navigation, sidebars, toolbars, and interactive elements while expanding content to fill the page
- Handle table printing correctly: repeat headers on each page, avoid page breaks mid-row, and show row numbers for reference
- Provide a "Print Preview" that shows exactly what will be printed, with page break indicators, before committing to print
- Include configurable print options: page orientation (portrait/landscape), paper size, columns to include, date range, and header/footer customization
- For PDF export, generate server-side PDFs that are consistently formatted regardless of the user's browser or OS
- Add print-specific metadata: report title, generation date, applied filters, page numbers, and "Confidential" watermarks when appropriate
- Support branded exports that include the organization's logo and color scheme per the white-label configuration

## Anti-Patterns
- No print stylesheet, resulting in printed pages that include navigation bars, buttons, and broken layouts
- Tables that overflow the page horizontally in print, truncating columns or printing microscopic text
- PDF exports that are screenshots of the screen rather than properly formatted documents
- No print preview, forcing users to waste paper and time discovering print formatting issues through trial and error
