---
name: react-change-review
description: "Review a React or TypeScript UI diff for concrete behavior, accessibility, and performance risks. Use when a React review or hardening pass is requested."
---

# React change review

Infer the review target from the request and Git state. Use the specified PR or range when given; otherwise inspect local changes and the branch's intended base. Read the diff and affected callers. Follow shared behavior beyond the changed files where it could break a consumer.

Load supporting guidance only for a relevant risk:

- `react-doctor`: running or interpreting React diagnostics. Prefer the repository's pinned command and reuse a current result for the same diff.
- `react-useeffect`: Effects, derived state, subscriptions, or cleanup.
- `vercel-composition-patterns`: component APIs or ownership changes.
- `vercel-react-best-practices`: suspected rendering, data-fetching, bundle, or server/client boundary issues.

Choose the canonical installed skill for each concern; do not load another vendor copy for the same guidance. Read individual rule references only when a suspected issue needs them.

Use [review checks](references/review-checks.md) for a substantial diff or an unfamiliar failure mode. Run required repository checks and additional verification that can resolve a concrete concern. A current successful check need not be repeated unless the diff or relevant environment changes.

Report evidence-backed findings in fix order. Each finding needs a failing condition, user or consumer impact, and a location. Merge findings with the same cause. Separate unresolved suspicions and verification gaps from confirmed defects. A clean review is a valid result.

Reviewing authorizes inspection and reporting. Fix only changes already authorized and within the immediate concern. Report unrelated diagnostics or cleanup as follow-ups; they do not expand scope.
