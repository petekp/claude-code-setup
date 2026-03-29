---
title: Bulk Import Five-Stage Workflow
category: Workflow & Multi-Step Processes
tags: [wizard, enterprise, validation, error-handling]
priority: situational
applies_when: "When structuring a bulk data import as a guided Upload-Map-Validate-Preview-Import workflow with error-correction opportunities at each stage."
---

## Principle
Structure bulk data imports as a five-stage guided workflow — Upload, Map, Validate, Preview, Import — that gives users control, visibility, and error-correction opportunities at each stage before committing data to the system.

## Why It Matters
Bulk imports are high-stakes operations where errors can corrupt data, create duplicates, and require hours of manual cleanup. A single-step "upload and pray" import gives users no control and no recourse. The five-stage workflow provides multiple checkpoints where users can verify, correct, and confirm before any data is committed, dramatically reducing import errors and building user confidence in the process.

## Application Guidelines
- **Stage 1 — Upload:** Accept common file formats (CSV, Excel, TSV), show file validation (correct format, not empty, within size limits), and provide template downloads
- **Stage 2 — Map:** Auto-map uploaded columns to system fields with confidence indicators, and allow manual override for unmatched or incorrectly matched columns
- **Stage 3 — Validate:** Run all data validation rules and present a clear error report grouped by error type, with row-level detail and inline editing to fix issues without re-uploading
- **Stage 4 — Preview:** Show a sample of records exactly as they will appear in the system, with change indicators for updates to existing records
- **Stage 5 — Import:** Execute the import with real-time progress, handle errors gracefully (skip and report rather than abort), and provide a completion summary with success/failure counts
- Offer rollback capability for a configurable period after import so users can undo if they discover issues after committing

## Anti-Patterns
- Single-step imports that commit data immediately on upload with no mapping, validation, or preview
- Validation that reports only the first error, forcing users to fix and re-upload iteratively to discover all issues
- Import processes that abort entirely on the first error rather than processing valid records and reporting failures
- No rollback mechanism, requiring manual cleanup if an import introduces bad data
