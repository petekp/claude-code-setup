# Instructional Prompt Guide

Generate a prompt the user can paste alongside the zip file when handing off to any reviewer. Customize based on review type, focus areas, and analyzer findings.

## Template

Adapt this structure — don't copy verbatim:

---

I'm sharing a code review package. Please review it thoroughly.

**Instructions:**
1. Start with README.md — it contains project context, architecture notes, focus areas, and pre-identified concerns
2. Review the core files first: [list primary files]
3. Reference supporting files as needed for context
4. Focus on: [user's selected focus areas]

**Deliverable — structure your review as:**
- **Critical** — Must fix before shipping (bugs, security issues, data loss risks)
- **Important** — Should address soon (performance, error handling gaps)
- **Suggestions** — Nice-to-have improvements (clarity, extensibility)
- **Questions** — Clarifications needed about design decisions
- **Positive** — What's working well (patterns to reinforce)

[If concerns were identified:]
The README lists [N] pre-identified concerns. Please validate, challenge, or add nuance to each — I want a second opinion.

[If architecture review:]
Evaluate whether the patterns and structure support long-term maintainability and extensibility.

[If code review:]
Flag bugs, edge cases, or error handling gaps that could cause production issues.

---

## Guidelines

- Write for any reviewer — don't assume specific model capabilities
- Reference specific files by name, not generic placeholders
- Mention the concern count so the reviewer knows to look for them
- Keep it under 200 words — the README carries the detail
