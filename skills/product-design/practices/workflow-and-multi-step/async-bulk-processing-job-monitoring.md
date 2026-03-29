---
title: Asynchronous Bulk Processing with Job Monitoring
category: Workflow & Multi-Step Processes
tags: [bulk-actions, loading, notification, enterprise, feedback-loop]
priority: situational
applies_when: "When bulk operations on hundreds or thousands of records take minutes or hours and users need a job monitoring interface instead of a blocked browser session."
---

## Principle
Process large-scale bulk operations asynchronously with a dedicated job monitoring interface that shows progress, status, errors, and results, rather than blocking the user's session during long-running operations.

## Why It Matters
Bulk operations on hundreds or thousands of records — mass imports, batch updates, report generation, data exports — can take minutes or hours. Blocking the user's browser session during processing is hostile: they can't do other work, a browser refresh loses their progress, and a network interruption wastes the entire operation. Asynchronous processing with job monitoring lets users initiate the operation, continue with other work, and check back on progress at their convenience.

## Application Guidelines
- After initiating a bulk operation, immediately show a confirmation with a job ID and estimated completion time, then release the user's session
- Provide a Jobs or Tasks panel accessible from the application header that lists all active and recent async operations
- Show real-time progress for each job: progress bar, percentage, records processed/total, estimated time remaining, and current phase
- Support job cancellation for operations that haven't completed, with a clear indication of what will happen to partially-processed items
- When a job completes, deliver a notification (in-app, email, or both) with a summary and link to results
- For jobs with errors, provide a detailed error report: which records failed, why, and how to fix them, with the option to retry failed items only
- Persist job history for reference: users should be able to review past operations and their results

## Anti-Patterns
- Blocking the user's browser with a spinner during multi-minute operations, preventing them from doing anything else
- Async operations with no progress visibility — the user initiates the job and has no way to check status until completion
- Bulk operations that fail entirely if a single record has an error, rather than processing valid records and reporting failures
- No notification when async jobs complete, forcing users to repeatedly check a status page
