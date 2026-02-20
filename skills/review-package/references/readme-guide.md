# README Structure Guide

Generate the review package README with these sections. Adapt content to the project — write naturally, don't fill in blanks mechanically.

## Required Sections

### Header
- Package generation date
- Review type (Code / Architecture / Both)
- Focus area or "Current work"

### What's Being Reviewed
Expand WORK_SUMMARY from analysis. Give the reviewer enough context to understand what changed and why.

### Reviewer Focus Areas
Based on user's selected concerns. Convert each into specific, actionable checklist items relevant to the actual code (not generic placeholders).

### Project Context
From PROJECT_CONTEXT. Include tech stack and key patterns.

### Files Included
Organize into tables by category:
- **Core files** — primary review targets, with purpose
- **Supporting context** — dependencies/utilities, with why included
- **Tests** — what's covered

### Architecture Notes
From ARCHITECTURE_NOTES. Critical for architecture reviews. For code-only reviews, keep brief or omit.

### Known Concerns
From POTENTIAL_CONCERNS. These are pre-identified areas the reviewer should validate or challenge.

### Review Instructions
Tailor to the review type:

**Code review emphasis:** Start with core files, check tests for gaps, flag bugs/edge cases/error handling/performance.

**Architecture review emphasis:** Understand context first, evaluate structure and separation of concerns, flag coupling/abstraction/scalability issues.

### Suggested Response Format
Ask the reviewer to structure feedback as:
- **Critical** — Must fix before shipping
- **Important** — Should address soon
- **Suggestions** — Nice-to-have improvements
- **Questions** — Clarifications needed

## Guidelines

- Write for any reviewer (human or AI) — avoid assuming capabilities
- Be specific to this project, not generic
- Keep file descriptions actionable ("validates auth tokens" not "authentication file")
- If architecture review, give more weight to Architecture Notes and Project Context
- If code review, give more weight to Files Included and Known Concerns
