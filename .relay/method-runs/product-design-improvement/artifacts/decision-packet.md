# Decision Packet: Product-Design Skill Improvement

## Per-Option Risk Assessment

### Option 1: Compiled Index with Deduplication Sweep
**Weakest seam:** The index.md is a 2K-token flat file with ~445 one-line entries that the model must scan to pick 3-5 relevant files. This is a semantic search task performed via brute-force reading. The model has no ordering heuristic -- entries are alphabetical or by category, not by relevance to the current query. In practice, the model will skim the first ~100 entries carefully, then satisfice by picking the first plausible matches, biasing heavily toward files whose titles happen to start with A-F or that live in the first few categories listed. The "long tail" of the index (entries 200-445) will almost never be selected. This is not a hypothetical: context position bias is a documented LLM behavior, and a 2K-token flat list is the exact shape that triggers it. The index doesn't improve retrieval -- it moves the imprecision from "wrong directory" to "wrong index position."

**Survivability:** Wounds but doesn't kill. The index still outperforms broken router references, so retrieval gets somewhat better. But the core promise -- "the model picks the optimal 3-5 files from the full corpus" -- will not hold. The index becomes an expensive middleman that adds 2K tokens of overhead while delivering mediocre selection. The approach degrades to "slightly better than globbing" rather than the precision retrieval it advertises.

### Option 2: Intent-Based Restructure with Absorbed Theory
**Weakest seam:** The theory absorption process requires deciding the "primary home" for each of ~191 theoretical principles, many of which apply to 5+ applied categories. Hick's Law applies to forms, navigation, search, dashboards, and component selection. The constraints document acknowledges this but the option hand-waves it as "judgment calls." In practice, a single developer batch-processing 191 files will make these judgment calls inconsistently -- the first 50 files get careful placement, the last 50 get dumped wherever is fastest. The result: theoretical content is scattered unpredictably across 7-9 directories with no index or cross-reference. A query about "Hick's Law" that previously found `hicks-law.md` now has to guess which of 3-4 applied files contains the Hick's Law paragraph. The skill becomes *worse* at theoretical retrieval while only marginally better at applied retrieval. And there is no rollback -- the absorbed theory cannot be mechanically un-absorbed.

**Survivability:** Kills the option. The irreversibility is the fatal part. If absorption is done poorly (and doing it well across 191 files is a multi-day editorial project, not a scripting task), the skill permanently loses its theoretical depth -- violating hard invariant #2 (research depth must be preserved). The theoretical content still *exists* buried in applied files, but it is no longer *retrievable* as theory.

### Option 3: Fix the Router, Shrink the Principles, Leave the Corpus Alone
**Weakest seam:** This option fixes the router references today, but the router will break again the moment any practice file is renamed, moved, or deleted -- and there is no mechanism to detect the drift. The current 42% breakage rate didn't happen overnight; it accumulated because there is no CI check, no validation script, and no warning when SKILL.md references a file that doesn't exist. Option 3 fixes the symptom (bad references) without fixing the disease (no reference integrity enforcement). Based on the current rate of change visible in the git status (dozens of files being added, deleted, moved), the router will be 10-15% broken again within a month. This is the "clean your room without buying shelves" approach.

**Survivability:** Wounds but doesn't kill. The option delivers immediate, real value (fixing 42% broken references is significant). The re-drift problem is real but the fix is also re-applicable -- running the same audit again is cheap. The option survives if the developer accepts that "fix the router" is a recurring maintenance task, not a one-time fix. It fails only if the developer expects it to stay fixed.

### Option 4: Layered Playbooks Over a Frozen Corpus
**Weakest seam:** The playbook approach creates 8-12 curated reading lists, but the skill's constraints document notes that it competes for context with project code, conversation history, and other skills. The playbook model requires a *three*-document retrieval chain: SKILL.md (triggers) -> playbook (~400 tokens) -> 5 practice files (~2,600 tokens). Total: ~3K tokens, which sounds efficient -- until a query doesn't match any of the 8-12 playbooks. The option's own failure surface section admits there is "no good fallback" for uncovered situations. With 25 categories and combinatorial design questions (e.g., "accessible form with search in an enterprise dashboard"), 8-12 playbooks cover maybe 30-40% of real queries. The other 60-70% fall through to raw directory globbing with no router guidance (because the router was removed in favor of playbooks). The skill works beautifully for anticipated scenarios and fails completely for everything else. This creates a bimodal experience: great when it hits, terrible when it misses -- which is worse than the current uniformly mediocre experience because users lose trust when quality is unpredictable.

**Survivability:** Wounds seriously. The option is not dead because the 30-40% of queries that hit a playbook get genuinely excellent results. But the regression on the remaining 60-70% violates hard invariant #4 (existing well-handled situations must not regress). The "frozen corpus" philosophy also means no coverage gaps get filled and no practice files get improved, so the skill stagnates everywhere the playbooks don't reach.

### Option 5: Tag-and-Query with Aggressive Consolidation
**Weakest seam:** The option requires a controlled tag vocabulary designed upfront, applied consistently across ~350 files, and compiled into a 3K-token manifest. The constraints document flags this: "a bad schema wastes the entire enrichment effort." But the deeper problem is that designing a good tag vocabulary for 350 design practice files requires domain expertise that the batch-generation tooling does not have. Tags will be generated by Claude reading each file and guessing keywords -- the same model that will later try to match those tags to user queries. This is a closed loop with no external signal: the tag author and the tag consumer are the same model, which means the vocabulary will converge on whatever token patterns the model finds easiest to produce and match, not on what best discriminates between practices. The result is a manifest where 40% of files share the tags "usability," "cognitive-load," and "interaction" because those are the most commonly co-occurring concepts in the corpus. Tag-based retrieval degrades to "return whichever files have the most generic tags" -- the tag system fails at the exact task it was built for (distinguishing between similar files). This is the "everything is tagged 'important'" failure mode.

**Survivability:** Wounds seriously. The aggressive consolidation (191 -> 45 theoretical files) delivers independent value regardless of whether the tags work. But the tag-and-query mechanism -- the option's defining feature -- will underperform unless significant effort goes into vocabulary design, tag quality auditing, and iterative refinement. The 3K-token manifest also exceeds Option 1's 2K-token index while having the same position-bias problem, plus the additional failure mode of low-quality tags.

## Decision Matrix

| Dimension | Opt 1: Compiled Index | Opt 2: Intent Restructure | Opt 3: Fix Router | Opt 4: Playbooks | Opt 5: Tag-and-Query |
|---|---|---|---|---|---|
| Retrieval precision improvement | MEDIUM (better than broken refs, worse than advertised) | MEDIUM (good for applied, worse for theoretical) | HIGH (directly fixes the broken seam) | HIGH for covered situations, LOW for uncovered | MEDIUM (depends on tag quality) |
| Coverage gap filling | LOW (dedup only, no new content) | HIGH (30-50 new files in restructure) | NONE (zero new content) | NONE (corpus frozen) | MEDIUM (30-50 new files added) |
| Practice quality improvement | LOW (frontmatter only) | HIGH (theory woven into applied files) | NONE (files untouched) | NONE (files untouched) | MEDIUM (consolidation improves density) |
| Context bloat risk | HIGH (2K index added per invocation) | LOW (fewer files, right-sized dirs) | LOW (net token reduction from principle cut) | LOW (~3K total per hit) | HIGH (3K manifest per invocation) |
| Implementation effort | HIGH (~490 files touched) | VERY HIGH (every file rewritten) | LOW (~28 files touched) | MEDIUM (~40 files touched) | VERY HIGH (every file touched + tooling) |
| Maintenance burden | HIGH (index must stay in sync) | LOW (once done, structure is stable) | MEDIUM (router re-drifts without enforcement) | HIGH (12 playbooks must track file changes) | VERY HIGH (manifest + tags + vocabulary) |
| Rollback safety | HIGH (additive, easily reverted) | LOW (destructive, requires git restore) | HIGH (one file to revert) | HIGH (delete playbooks dir, revert SKILL.md) | MEDIUM (consolidation is destructive) |
| Risk of regression | LOW (files untouched) | HIGH (theoretical retrieval degrades) | LOW (only improves, nothing removed) | HIGH (uncovered situations regress) | MEDIUM (consolidation may lose nuance) |

## Recommendation and Rationale

**Primary recommendation: Option 3 (Fix the Router, Shrink the Principles, Leave the Corpus Alone)**

**Secondary recommendation: Combine Option 3 with the deduplication and frontmatter enrichment from Option 1, but skip the compiled index.**

Reasoning against the kill criteria:

- **Must not increase context bloat.** Option 3 is the only option that *decreases* per-invocation cost (cutting 20 principles saves ~1,000 tokens). Options 1 and 5 add 2-3K tokens of index/manifest overhead. Option 2 is roughly neutral. Option 4 is efficient when it hits but has no fallback.

- **Must not lose research depth.** Option 3 preserves all 459 practice files (after exact-dedup) untouched. Option 2 actively destroys standalone theoretical files. Option 5's aggressive consolidation risks nuance loss. Options 1 and 4 preserve files but don't improve them.

- **Must not become over-prescriptive.** Option 4's playbooks are inherently prescriptive -- they tell the model exactly which 5 files to read, which means a playbook author's judgment permanently overrides the model's situational reasoning. Option 3 preserves the model's ability to browse a directory and pick contextually.

- **Must not break existing flows.** Option 3 has the smallest blast radius (28 files). It directly fixes the 42% broken reference rate that is the single largest source of retrieval failures. Every other option introduces new retrieval mechanisms that could fail in untested ways.

The secondary recommendation (Option 3 + selective elements of Option 1) adds value without adding the index: enrich frontmatter with tags and priority across all files (scriptable, additive, no downside), merge the 27 exact duplicates and ~15 semantic duplicates, and expand the router from 17 to 25 rows. Skip the compiled index.md entirely -- the enriched frontmatter gives the model useful signals when it *does* glob a directory, without forcing a 2K-token index scan on every invocation.

To address Option 3's main weakness (router drift), add a validation script that checks every file reference in SKILL.md against the actual filesystem. Run it manually after any batch file changes. This is 20 lines of bash and closes the integrity gap.

## Unresolved Risks

1. **Cross-category queries remain unsolved.** None of the options elegantly handle "design an accessible form in an enterprise dashboard" -- a query spanning 3+ categories. Option 3's router maps situations to single directories. The model can follow up with additional directory reads, but there is no mechanism to surface the *intersection* of concerns. This is a real limitation for a developer whose design questions naturally span categories.

2. **The 12 duplicate-basename files are a latent conflict.** Files like `hicks-law.md` exist in both `cognitive-psychology/` and `cognitive-load/` (or similar). The router may direct to one while the other contains better content. Deduplication resolves this, but the "which survives?" decision requires reading both versions of all 12 pairs.

3. **No usage telemetry exists.** Every option makes assumptions about which queries are common, which categories are most accessed, and which retrieval failures matter most. Without any data on actual invocation patterns, all prioritization is guesswork. If the skill is mostly used for "review this UI" (a cross-cutting task), the router-per-category model may be fundamentally mismatched to real usage regardless of which option is chosen.

4. **The 30-to-10 principle reduction is an editorial judgment call with no objective criteria.** Which 10 principles are "truly universal"? The constraints document doesn't define this. The wrong 10 could remove the principles that provide the most value for situations that don't match any router row (the exact fallback scenario where always-on principles matter most).

5. **Batch-generated content quality is untested.** All options assume the existing 486 practice files are individually sound and that the problems are structural (routing, duplication, organization). If a significant fraction of practice files contain shallow or incorrect guidance, fixing the routing just delivers bad content more efficiently.

## Reopen Conditions

Fundamentally reconsider the approach if any of the following emerge:

1. **Usage data shows >50% of queries are cross-cutting.** If most real queries span 3+ categories, the per-directory routing model is wrong at its foundation, and Option 2's intent-based restructure (or a variant that preserves theoretical files as standalone) becomes necessary despite its risks.

2. **Practice file quality audit reveals >20% of files are shallow or incorrect.** If the corpus itself is the problem, not the routing, then Option 3's "leave the corpus alone" philosophy is optimizing the wrong layer. A content-quality-first approach (rewrite the worst 100 files, then fix routing) would be needed.

3. **The model consistently fails to pick the right files from a correctly-routed directory.** If giving the model the right directory of 15-30 files still produces bad file selection, then the directory-glob retrieval mechanism itself is broken, and some form of curated selection (playbooks, index) becomes necessary despite the maintenance cost.

4. **The frontmatter enrichment (from the secondary recommendation) proves sufficient for cross-category retrieval.** If tags in frontmatter enable the model to grep across directories effectively, it may be worth investing in an index after all -- but only after proving the tags are discriminating enough to be useful, not before.

5. **The skill is extended to multi-user or team use.** Option 3's "fix the router and run a validation script occasionally" approach works for a single developer who knows when files changed. It does not work for a shared skill where multiple people modify practice files. In that case, CI-enforced integrity checks (closer to Option 1's infrastructure approach) become essential.
