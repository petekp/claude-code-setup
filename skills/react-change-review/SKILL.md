---
name: react-change-review
description: Review recent React, Next.js, or TypeScript UI code changes for hardening before merge or commit. Use when asked to review recent React code changes, audit a React diff, harden a feature, check a PR or branch for React issues, or produce a stack-ranked list of nonredundant findings and a recommended fix plan using react-doctor, Vercel React best practices, Vercel composition patterns, and React useEffect guidance.
---

# React Change Review

Review the most relevant recent React code changes, consolidate all signal from the React specialist skills, and return a stack-ranked hardening plan. Treat every valid finding as something that should be fixed; do not frame fixes as optional cleanup unless the evidence shows a real tradeoff.

## Load Supporting Skills

Before reviewing, load and apply these skills:

- `$react-doctor`: run or interpret diff-based React diagnostics.
- `$vercel-react-best-practices`: performance, data fetching, rendering, bundle, and server/client boundary review.
- `$vercel-composition-patterns`: component API and composition review.
- `$react-useeffect`: Effect, derived state, event logic, dependency, and cleanup review.

In this skill repository, the supporting skills normally exist as sibling folders:

- `../react-doctor/SKILL.md`
- `../vercel-react-best-practices/SKILL.md`
- `../vercel-composition-patterns/SKILL.md`
- `../react-useeffect/SKILL.md`

If a support skill is missing, continue with the available guidance and state the gap in the final review.

## Scope The Recent Changes

Determine the review scope intelligently from context. Prefer explicit user scope, then local git evidence.

Use this precedence:

1. User-provided PR, branch, commit range, files, or feature area.
2. Staged and unstaged changes in the working tree.
3. Current branch diff against the best base branch.
4. Recent commits on the current branch when the working tree is clean.
5. Ask one concise question only if no reasonable scope can be inferred.

Useful commands:

```bash
git status --short
git diff --name-only --diff-filter=ACMR
git diff --cached --name-only --diff-filter=ACMR
git merge-base HEAD origin/main || git merge-base HEAD main || git merge-base HEAD origin/master || git merge-base HEAD master
git diff --name-only --diff-filter=ACMR "$base"...HEAD
git log --oneline --decorate -n 10
```

Include files that can affect React behavior:

- `.tsx`, `.jsx`, React-facing `.ts`/`.js`
- hooks, providers, stores, query/data modules, server actions, route loaders, API handlers used by React UI
- package, lint, build, or framework config changes that affect React runtime or bundling

Exclude generated files, snapshots, lockfile-only churn, and unrelated backend-only files unless they feed the changed UI behavior.

State the chosen scope briefly in the final answer so the reader can see what was reviewed.

## Review Workflow

1. Read the changed files and their immediate callers or component consumers. Follow behavior, not just filenames.
2. Run `npx -y react-doctor@latest . --verbose --diff` when feasible. If it cannot run, capture the reason and continue manually.
3. Inspect package scripts and run the cheapest relevant checks when they materially improve confidence, such as typecheck, lint, or targeted tests.
4. Apply each support skill to the scoped diff. Load individual rule files from the Vercel skills only when a suspected issue needs detail.
5. Separate confirmed findings from weak suspicions. Do not report a suspicion unless there is a concrete next verification step.
6. Coalesce duplicates by root cause before writing the final report.

## Audit Checklist

Prioritize user-impacting correctness and performance over style.

Check for:

- Hook rule violations, stale closures, unstable dependencies, missing cleanup, unnecessary Effects, derived state stored in state, and event logic hidden in Effects.
- Server/client boundary mistakes, avoidable client components, hydration hazards, excessive serialized props, mutable module state in SSR/RSC paths, and unauthenticated server actions.
- Async waterfalls, missed parallelization, unnecessary sequential awaits, and fetches started too late.
- Bundle growth from barrel imports, heavy eager imports, avoidable third-party hydration, or large client-only dependencies.
- Re-render risks from unstable object/function props, overbroad context values, expensive render work, inline component definitions, and incorrect memoization.
- Component API drift: boolean prop proliferation, mode flags, render-prop APIs where children composition is clearer, provider state leaking through consumers, and variants that should be explicit components.
- Accessibility or interaction regressions found by tools or direct inspection.
- Tests or examples that no longer cover the changed behavior.

## Deduplication Rules

Produce a clean list, not a raw dump.

- Merge findings that share the same root cause and fix, even when multiple skills flag them.
- Keep separate findings when they have different user impact, failure mode, owner, or fix path.
- Prefer one finding with multiple locations over repeated near-identical findings.
- Do not list formatting, naming, or preference issues unless they create maintainability risk in the changed React surface.
- If `react-doctor` and manual review disagree, explain the evidence and rank the finding by actual risk.

## Finding Format

Lead with findings. Stack-rank by severity and likely user impact.

Use this shape:

```markdown
**Findings**
1. `[Severity] Short title`
   - Location: `path:line` or `path` when line is unavailable
   - Evidence: exact code behavior, command output, or failing check
   - Why it matters: user-visible risk or engineering invariant
   - Source: support skill or rule family, if applicable
   - Recommended fix: smallest credible fix
   - Verification: targeted check after the fix
```

Severity scale:

- `Critical`: breaks build, data integrity, auth/security, or a primary user path.
- `High`: likely runtime bug, stale UI, hydration issue, major performance regression, or brittle API that blocks safe extension.
- `Medium`: meaningful maintainability, render, bundle, accessibility, or test coverage risk in touched React code.
- `Low`: small hardening item worth fixing after higher-severity work.

Include confidence only when uncertainty matters:

- `Confirmed`: demonstrated by code, failing check, or reproducible path.
- `Likely`: strong static evidence, not reproduced.
- `Needs follow-up`: incomplete evidence; include the exact next check.

## Recommended Course Of Action

After findings, provide one consolidated fix plan.

The plan must:

- Fix findings in severity order.
- Batch related fixes by shared files or root cause.
- Mention tests, lint, typecheck, `react-doctor`, or manual verification needed after each batch.
- Avoid asking whether findings should be fixed; the premise of this skill is hardening the React change.
- Call out any findings that should be fixed first because later work depends on them.

If there are no findings, say that directly and include:

- scope reviewed
- commands or checks run
- residual risks or unverified surfaces
- one recommended next verification step

## Output Rules

- Lead with the stack-ranked findings.
- Keep methodology brief and only after findings or in a scope note.
- Include exact file paths and line numbers whenever possible.
- Do not start fixing code unless the user explicitly asks to address the findings.
- If asked to fix findings, implement in the recommended order and rerun the relevant checks.
