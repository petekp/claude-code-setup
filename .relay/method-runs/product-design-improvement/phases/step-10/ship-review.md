# Ship Review: Product-Design Skill Improvement

**Reviewer:** Ship review agent
**Date:** 2026-03-28
**Scope:** Full audit of all 7 slices against execution packet, intent brief, and implementation handoff

---

## Contract Compliance (execution packet vs actual)

### Slice completion: 7/7

| Slice | Status | Notes |
|---|---|---|
| 1. Audit duplicates | Done | `duplicate-manifest.md` produced in `.relay/` artifacts |
| 2. Merge duplicates | Done | 486 -> 451 files (35 removed). Handoff claimed 35 merged, actual count confirms 451 |
| 3. Router fix + expansion | Done | 26 router rows covering all 25 categories. All 88 referenced files exist on disk |
| 4. Tag vocabulary | Done | 54-tag vocabulary in `tag-vocabulary.md`. 22 domain + 18 concern + 14 principle |
| 5. Frontmatter enrichment | Done | All 451 files have `tags`, `priority`, `applies_when` |
| 6. Validation script | Done | `scripts/validate-skill-references.sh` runs clean: 0 broken refs, 0 missing frontmatter, 0 dup basenames |
| 7. SKILL.md polish | Done | 91 lines, ~2.2K estimated tokens (down from ~3.3K) |

### Invariant checks

| Invariant | Status | Evidence |
|---|---|---|
| No net token increase per invocation | PASS | SKILL.md dropped from ~3.3K to ~2.2K tokens. Essential Principles section removed (~1.5K saved). Practice files gained ~3 lines of frontmatter each, but only loaded files are affected. |
| All practice content preserved | PASS | Spot-checked 3 merged survivors (progressive-disclosure, change-blindness, hicks-law). Each contains unique content from all non-survivors per the merge strategy in the manifest. |
| Research depth intact | PASS | "Why It Matters" sections with cognitive science grounding survive in all sampled files (20 files checked). |
| Existing routing still works | PASS | All 17 original router situations are present in the expanded 26-row table. Referenced files verified on disk. |
| Frontmatter additions are additive only | PASS | All sampled files retain original `title` and `category` fields alongside new `tags`, `priority`, `applies_when`. |

---

## Findings

### Critical (must fix before ship)

None found.

### High (should fix)

**H1: One tag (`menu`) used in practice files is not in the controlled vocabulary.**
- File: `practices/cognitive-psychology/hicks-law.md` uses `menu` tag
- The tag-vocabulary.md defines 54 tags; 55 unique tags appear in practice files
- Impact: Low in practice (a grep for `menu` would still find the file), but violates the stated contract that "every tag used is in the vocabulary"
- Fix: Either add `menu` to the vocabulary or replace with `navigation` in the one file

### Low (acceptable debt)

**L1: 363 of 451 files are not directly referenced in the router table.**
This is by design -- the router lists 3-4 "starter files" per category, and users are directed to explore the full directory. The validation script correctly labels these as informational, not errors. However, the sheer ratio (80% orphaned) means the router is more of a category index with curated entry points than a comprehensive file map.

**L2: Priority distribution slightly exceeds stated targets.**
- Execution packet (Slice 4) targeted core at ~50 files. Actual: 108 core (24% of 451)
- Tag vocabulary doc targeted core at 60-80. Actual: 108
- Situational: 271 (target 200-260). Niche: 72
- Core is 35-80% above the stated targets. This is not necessarily wrong (the vocabulary doc's criteria are reasonable), but worth noting the drift from plan.

**L3: `duplicate-manifest.md` and `tag-vocabulary.md` live only in `.relay/` artifacts, not in the skill directory.**
The execution packet said `tag-vocabulary.md` should be kept as a reference for future enrichment. It is accessible but not co-located with the skill. Someone adding new practice files later would need to know to look in the relay directory for the tag vocabulary.

**L4: The SKILL.md description says "451 practices" -- this is a hardcoded number that will drift if files are added or removed in the future.**
Appears in the frontmatter description (line 5) and the opening paragraph (line 20). Not a bug today, but a maintenance hazard.

---

## Intentional Debt (deferred with rationale)

1. **Coverage gaps not addressed.** Missing domains (responsive, animation, dark mode, mobile, AI/ML patterns beyond the 4 in interaction-patterns) are explicitly deferred per the ADR and non-goals. The intent brief ranked this as outcome #3 and the execution packet listed it as a non-goal for v1.

2. **No compiled index or automated cross-category retrieval.** SKILL.md gives grep instructions for cross-cutting searches but there is no programmatic index. This was an accepted risk per the ADR.

3. **No CI/hook integration for the validation script.** Router drift is possible if files are renamed without re-running the script manually. Flagged in the implementation handoff.

4. **No code examples in practice files.** Explicitly listed as a non-goal in the execution packet.

5. **No directory restructuring.** 25 categories preserved as-is per non-goals.

---

## Fit-to-Intent Assessment (compare to intent-brief.md)

| Intent Brief Outcome | Result | Assessment |
|---|---|---|
| **1. Smarter retrieval** | Each file now has `tags`, `priority`, and `applies_when` frontmatter. SKILL.md instructs the agent to prefer core-priority files and grep tags for cross-cutting situations. | **Achieved.** The metadata enables targeted file selection instead of category dumps. The 54-tag vocabulary with natural-language `applies_when` triggers gives the agent meaningful filtering signals. |
| **2. Better trigger precision** | Router expanded from 17 to 26 rows. All file references verified. Priority metadata lets the agent surface core files first. | **Achieved.** More situations route correctly, and within each category the agent has priority signals to pick the best 3-5 files. |
| **3. Fill critical coverage gaps** | Not attempted (deferred per ADR). | **Expected: not in v1.** Correctly scoped out. |
| **4. Sharper practice format** | 4-section structure preserved (Principle, Why It Matters, Application Guidelines, Anti-Patterns). Merged survivors are richer. No code examples added. | **Partially achieved.** Merged files are denser and higher quality. Format is preserved but not transformed (no decision trees or code patterns added). This was explicitly scoped out. |
| **5. Structural improvements** | 35 duplicates eliminated. Frontmatter enriched. Router fixed and expanded. Validation script created. | **Achieved.** The structural work that was in scope is complete and verified. |

### Kill criteria check

| Kill Criterion | Status |
|---|---|
| Improvements dump MORE text into context | CLEAR -- SKILL.md is smaller; practice files gained ~3 frontmatter lines each but invocation load is net-negative |
| Sharpening strips cognitive science foundations | CLEAR -- all "Why It Matters" sections preserved in sampled files |
| Skill becomes over-prescriptive | CLEAR -- practice files still present principles with guidelines, not mandates |
| Existing well-handled situations regress | CLEAR -- all 17 original situations present and routing to verified files |

---

## Summary Statistics

| Metric | Before | After | Target | Status |
|---|---|---|---|---|
| Practice files | 486 | 451 | ~440-445 | Close (451, 6 more than target midpoint) |
| SKILL.md lines | ~170 (est.) | 91 | <150 | PASS |
| SKILL.md tokens | ~3.3K | ~2.2K | <2K | Close (slightly over 2K target) |
| Router rows | 17 | 26 | ~25 | PASS |
| Broken references | unknown | 0 | 0 | PASS |
| Files with complete frontmatter | 0 | 451/451 | 451/451 | PASS |
| Duplicate basenames | 27+ | 0 | 0 | PASS |
| Tag vocabulary size | n/a | 55 used (54 defined) | 40-60 | PASS (1 off-vocab tag) |
| Validation script | did not exist | exists, runs clean | exists, runs clean | PASS |

---

## Verdict: SHIP-READY

All 7 slices are complete. All 5 invariants hold. No critical issues found. The one high-severity finding (a single off-vocabulary tag) is trivial to fix but does not block shipping. The low-severity findings are either by-design limitations or minor maintenance hazards that can be addressed incrementally.

The implementation faithfully executes the execution packet, respects the ADR constraints, and meaningfully advances all four in-scope outcomes from the intent brief.
