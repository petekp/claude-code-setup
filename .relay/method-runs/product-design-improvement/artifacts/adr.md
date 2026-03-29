# ADR: Product-Design Skill Improvement — Correctness-First Fix with Enrichment

## Decision

Implement Option 3 (Fix the Router, Shrink the Principles, Leave the Corpus Alone) augmented with deduplication and frontmatter enrichment from Option 1. Specifically:

1. **Fix all broken router references** in SKILL.md (42% of file references point to non-existent filenames)
2. **Remove the 30 Essential Principles entirely** from SKILL.md — saves ~1.5K tokens, SKILL.md becomes pure routing
3. **Expand the situation router** from 17 to ~25 rows to cover more categories
4. **Merge exact-filename duplicates** (27 files across 12 topics in 2-3 copies each)
5. **Merge semantic duplicates** (~15-20 files with different names but same concept)
6. **Enrich frontmatter** on all surviving practice files: add `tags`, `priority`, `applies_when`
7. **Create a validation script** that checks SKILL.md file references against the filesystem to prevent drift

## Rationale (user's tradeoff reasoning)

- **Correctness over coverage.** Fixing what exists takes priority over adding new content. A working router with correct references and deduplicated files is a better foundation than new coverage areas built on a broken retrieval layer.
- **Remove principles entirely.** The 30 inlined principles are 1.5K tokens of always-on duplication that the practice files handle. Removing them makes SKILL.md purely functional (routing) rather than encyclopedic. Trust the practice files.
- **Full scope enrichment.** Frontmatter enrichment (tags, priority, applies_when) across all files is worth the scripting effort because it establishes the metadata foundation for any future retrieval improvements.

## Accepted Risks

1. **Cross-category queries stay unsolved.** The router maps situations to single directories. Multi-concern queries (e.g., "accessible form in an enterprise dashboard") won't get automatic cross-category surfacing. The enriched frontmatter may help the model grep across directories manually, but there's no formal mechanism.
2. **Coverage gaps deferred.** Missing domains (responsive, animation, dark mode, mobile, AI patterns, notifications) are not addressed in this pass. Future iteration.
3. **Router re-drift.** The validation script catches it, but only when run manually. No CI enforcement.
4. **Removing all 30 principles is aggressive.** If the model frequently relied on the always-on principles for situations outside the router, removing them could degrade quality for edge-case queries. Mitigation: the expanded router (17→25 rows) covers more situations.

## Rejected Alternatives (and why)

1. **Option 1: Compiled Index** — The 2K-token index triggers LLM position bias. A flat list of 445 entries won't produce precision retrieval. The index adds token overhead without delivering the promised selection accuracy.
2. **Option 2: Intent-Based Restructure** — Theory absorption is irreversible and scatters theoretical content unpredictably. Violates the research-depth constraint. Multi-day editorial project with high risk.
3. **Option 4: Layered Playbooks** — Creates bimodal quality: great for covered situations (~30-40%), regression for everything else (~60-70%). Violates the no-regression constraint.
4. **Option 5: Tag-and-Query with Aggressive Consolidation** — Closed-loop tag generation (same model authors and consumes tags) produces undifferentiated vocabulary. 3K manifest has same position-bias issues as Option 1's index. Destructive consolidation is risky.

## Scope Cuts

- No new practice files for coverage gaps (deferred to future pass)
- No compiled index file (frontmatter enrichment provides some retrieval metadata without the overhead)
- No directory restructuring (25-category layout stays as-is)
- No code examples added to practice files (deferred)

## Non-Goals (carried from intent brief)

- Must not increase context bloat
- Must not lose research depth
- Must not become over-prescriptive
- Must not break existing flows

## Reopen Conditions

1. If removing all 30 Essential Principles causes measurable quality degradation for queries outside the router
2. If the enriched frontmatter proves insufficient and cross-category retrieval becomes a blocking need
3. If practice file content quality is the real bottleneck (not routing)
4. If usage patterns show >50% of queries are cross-cutting
