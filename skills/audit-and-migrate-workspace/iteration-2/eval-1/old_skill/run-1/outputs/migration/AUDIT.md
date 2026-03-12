# Analytics Migration Audit

## Method
Resumed from existing migration artifacts in `.claude/migration/` and `HANDOFF.md` dated 2026-02-28. Inspected all source files, configuration, documentation, and control plane artifacts to assess current state and remaining work.

## Current State

### Anti-Pattern Counts
| Pattern | Grep | Count | Problem |
|---|---|---|---|
| `trackLegacyPageView` | `trackLegacyPageView` | 1 | Dead export in legacy-analytics.ts (no call sites remain post slice-001) |
| `trackLegacySignup` | `trackLegacySignup` | 1 | Still-active legacy signup path in legacy-analytics.ts |
| `import.*legacy-analytics` | `import.*legacy-analytics` | 0–N | Any remaining call-site imports (need full grep to calibrate) |
| `LEGACY_ANALYTICS_WRITE_KEY` | `LEGACY_ANALYTICS_WRITE_KEY` | 2 | env.ts + docs reference; stale after migration completes |
| `ENABLE_LEGACY_ANALYTICS_BRIDGE` | `ENABLE_LEGACY_ANALYTICS_BRIDGE` | 1 | env.ts bridge flag; no longer needed once signup migrates |

### Ratchet Budgets
| Ratchet | Current Budget | Target |
|---|---|---|
| `trackLegacyPageView` references | 1 | 0 |
| `trackLegacySignup` references | 1 | 0 |
| `LEGACY_ANALYTICS_WRITE_KEY` references | 2 | 0 |
| `ENABLE_LEGACY_ANALYTICS_BRIDGE` references | 1 | 0 |
| `legacy-analytics.ts` file exists | 1 | 0 |

## Leverage Assessment

| File | Leverage | Rationale |
|---|---|---|
| `packages/web/src/lib/analytics-client.ts` | High | Canonical client; build on this |
| `packages/web/src/lib/legacy-analytics.ts` | Low | Entire file is deletion target |
| `packages/shared/src/env.ts` | Medium | Keep file but remove legacy keys |
| `docs/analytics-migration.md` | Low | Describes in-flight state; must be rewritten or removed |

## Hard Conclusions

1. **slice-001 (page views) is genuinely done.** The new client is in production, `trackPageView` exists in `analytics-client.ts`, and the HANDOFF confirms it.

2. **slice-002 (signup) was started but not completed.** `trackLegacySignup` still exists and is presumably still called. `analytics-client.ts` does not yet export a `trackSignup` function. The work remaining: add `trackSignup` to the new client, migrate call sites, delete `legacy-analytics.ts`.

3. **The env bridge was deferred and is now a discrete cleanup obligation.** `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` in `env.ts` serve no purpose once signup migration completes. This is tracked as slice-003.

4. **Docs are stale.** `docs/analytics-migration.md` describes "rough edges" that are either fixed (page view) or about to be fixed (signup). It references legacy event names. This must be updated as slice-004.

5. **`trackLegacyPageView` is vestigial.** It still exists in `legacy-analytics.ts` but has no consumers after slice-001. It will be removed when the entire file is deleted in slice-002.

## Guardrails Added
- Ratchet budgets defined for all legacy patterns (see table above)
- Denylist patterns defined in SLICES.yaml for slice-002 through slice-004
- SHIP_CHECKLIST.md defines residue sweep queries and manual verification steps

## Proposed Slices
1. **slice-002** (in_progress): Finish signup migration — add `trackSignup` to new client, migrate call sites, delete `legacy-analytics.ts`
2. **slice-003** (proposed): Remove `LEGACY_ANALYTICS_WRITE_KEY` and `ENABLE_LEGACY_ANALYTICS_BRIDGE` from `env.ts`
3. **slice-004** (proposed): Update `docs/analytics-migration.md`, remove README legacy references, final residue sweep
