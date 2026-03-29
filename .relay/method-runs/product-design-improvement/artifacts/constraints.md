# Constraints: Product-Design Skill Improvement

## Hard Invariants (must not violate)

1. **[fact] Total invocation token cost must not increase.** Current typical invocation: ~7K tokens (SKILL.md + ~7 practice files). Improvements that add metadata, indices, or coverage must offset by improving retrieval precision (fewer irrelevant files loaded). Target: same or lower total tokens with higher relevance.

2. **[fact] Research depth must be preserved.** The "Why It Matters" sections grounding practices in cognitive science are a differentiator. Sharpening format or consolidating duplicates must not strip these foundations.

3. **[fact] The three-tier progressive disclosure architecture must be respected.** Tier 1: skill description (~100 tokens, always loaded). Tier 2: SKILL.md body (<500 lines, loaded on trigger). Tier 3: practice files (loaded as needed, zero cost until accessed). No approach should collapse tiers or dump Tier 3 content into Tier 2.

4. **[fact] Existing well-handled design situations must not regress.** The skill already works for straightforward single-category queries (e.g., "form design" → forms-and-input). Any routing changes must preserve this baseline.

5. **[fact] The skill must remain domain-agnostic in its principles.** While adding code examples for React/SwiftUI would help the current user, the practices themselves should stay framework-neutral. Code examples, if added, should be separate or optional.

## Seams and Integration Points

1. **[fact] SKILL.md ↔ Practice files.** The Design Situation Router in SKILL.md is the primary seam. Currently broken: 42% of specific file references don't match actual filenames. The Glob+Read fallback works but degrades precision.

2. **[fact] 30 Essential Principles ↔ Practice files.** The 30 inlined principles in SKILL.md duplicate content in practice files. The model may get 2-3 versions of the same concept. This is the highest-friction seam — do the inlined principles make practice file lookups redundant, or do they just waste tokens?

3. **[inference] Category taxonomy ↔ Retrieval routing.** The 25-category directory structure serves as both file organization AND retrieval routing. Successful design systems use 5-7 intent-based top-level categories. Decoupling file organization from retrieval routing would allow the taxonomy to remain detailed while routing becomes task-based.

4. **[inference] Theoretical categories ↔ Applied categories.** 39% of files (191) are theoretical (psychology/perception) and 61% (295) are applied (concrete UI patterns). Nearly all duplication is in theoretical categories. The theoretical/applied boundary determines consolidation strategy.

5. **[inference] product-design ↔ Adjacent skills.** The `frontend-design`, `typography`, `interaction-design`, and `swift-apps` skills have overlapping concerns. The product-design skill should focus on design principles and patterns, not implementation specifics that other skills handle.

6. **[assumption] Practice file frontmatter ↔ Retrieval mechanism.** Adding tags/priority to frontmatter is only valuable if there's a mechanism to query it. Options: (a) compiled index file that Claude scans, (b) instructions in SKILL.md to grep frontmatter, (c) enhanced situation router referencing specific files by tag query.

## Contradictions Between Sources

1. **Depth vs. Token budget.** The user wants sharper practices with code examples AND wants no context bloat. Code examples would 2-3x per-file token cost. Resolution: code examples only in applied categories, not theoretical. Or: code examples in a separate companion file loaded only when building.

2. **Coverage expansion vs. Duplication reduction.** The user wants to fill coverage gaps (add new domains) AND reduce structural bloat. Adding 50-80 new practice files while deduplicating 40-50 existing files is roughly net-neutral, but only if the new files are genuinely non-overlapping.

3. **Smarter retrieval vs. Skill simplicity.** A compiled index, enriched frontmatter, and expanded situation router add mechanical complexity to the skill. The simplest retrieval pattern (glob a directory) already works for single-category queries. Over-engineering retrieval could make the skill harder to maintain.

4. **Essential Principles overlap vs. Always-on value.** The 30 inlined principles duplicate practice files but provide "always available" baseline knowledge. Removing them saves ~1,500 tokens per invocation but loses the zero-lookup benefit. Keeping them wastes tokens when practice files are also loaded.

## Open Questions (ranked by decision impact)

1. **[HIGH] Should we build a compiled index, or improve the situation router, or both?** The index enables bottom-up retrieval (scan all practices, pick best). The router enables top-down retrieval (match situation, go to prescribed files). The highest-impact path may be to do both: a better router for common situations, with a fallback to index scanning for novel queries.

2. **[HIGH] How aggressively should theoretical categories be consolidated?** Options range from light deduplication (merge exact duplicates only, saving ~30 files) to heavy consolidation (merge all 6 theoretical categories into 1-2, saving ~80-100 files). The aggressive path risks losing category-specific framing. The light path preserves noise.

3. **[HIGH] Should code examples be added to practice files?** Zero code examples is a clear gap for actionability. But adding them to all 486 files is massive scope and would change the skill's character. A middle path: add examples only to the ~100 most-used applied practices.

4. **[MEDIUM] Should the 30 Essential Principles be kept, expanded, or replaced?** They're the highest-value content but also the highest duplication. Options: (a) keep as-is, (b) expand to 40-50 with better coverage, (c) replace with a dynamic "top N for this situation" mechanism, (d) remove and rely entirely on practice files.

5. **[MEDIUM] Which coverage gaps are highest priority?** The evidence identified 10 missing/underrepresented domains. For a React/Next.js + SwiftUI developer: responsive/adaptive, animation/motion, dark mode/theming, and mobile/touch are likely highest priority. AI interface patterns and notification design are emerging but less foundational.

6. **[LOW] Should the practice file format change?** The current 4-section format is consistent and well-sized (~520 tokens). Adding frontmatter fields (tags, priority, applies_when) is low-cost. Changing the body structure (e.g., adding "Decision Criteria" or "Code Examples" sections) would require touching all 486 files.

## Performance and Operational Constraints

1. **[fact] Skill maintenance burden.** 486 files with only title+category frontmatter are hard to maintain. Enriching frontmatter (tags, priority) enables automated validation but increases per-file maintenance. A compiled index must be regenerated when files change.

2. **[fact] Batch generation implications.** The uniform structure strongly suggests batch generation. Any changes to file format or frontmatter schema should be designed for batch application (script-driven), not manual editing of 486 files.

3. **[inference] Context window competition.** In a real session, the product-design skill competes with project code, conversation history, and other skills (frontend-design, typography, etc.) for context. Keeping per-invocation cost under ~8K tokens is prudent.

4. **[assumption] The skill will be invoked frequently.** Given the user works on React/Next.js + SwiftUI, design guidance is relevant to most UI work. High frequency means per-invocation efficiency matters more than one-time setup cost.
