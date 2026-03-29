# Evidence Digest: Internal System Surface -- Product Design Skill

## Facts (confirmed, high confidence)

### SKILL.md Mechanics
- **141 lines, ~13KB (~3,300 tokens).** Loaded in full on every invocation that triggers the skill.
- **Structure:** YAML frontmatter (name, description) -> usage instructions -> 30 "Essential Principles" inlined as prose -> Design Situation Router table -> Synthesis Example -> All Categories reference table.
- **Design Situation Router:** A 17-row markdown table mapping situations (e.g., "Form design", "Dashboard", "AI features") to practice directories and specific "key files to start with." It instructs the model to use `Glob` + `Read` to load relevant files.
- **23 of ~55 filenames referenced in the router do not exist.** The router was written with simplified filenames (e.g., `skeleton-screens.md`, `bulk-actions.md`, `wizards.md`) but the actual files have longer descriptive names (e.g., `skeleton-screens-for-full-page-loads.md`, `bulk-actions-for-power-users.md`, `wizards-for-novice-users.md`). This means the Glob-then-Read pattern works (the directory paths are correct), but the "Key files to start with" column is broken for 42% of its entries and would fail if taken literally.
- **30 "Essential Principles" are inlined** directly in SKILL.md as prose under six sub-sections (Foundational Laws, Cognitive Load, Visual & Layout, Interaction, Accessibility). These duplicate content that also exists as individual practice files in the practices directory.

### File Corpus
- **486 practice files across 25 category directories.** Total: ~1,012KB (~253,000 tokens).
- **Uniform file structure:** Every file uses exactly two frontmatter fields: `title` and `category`. Every file uses exactly four body sections: `## Principle`, `## Why It Matters`, `## Application Guidelines`, `## Anti-Patterns`. No exceptions found in 20+ files sampled.
- **Uniform file size:** Min 20 lines, max 28 lines, average 22.8 lines. Standard deviation is very low -- files are remarkably uniform at ~2,082 chars (~520 tokens) each.
- **Zero code examples** across the entire corpus. No fenced code blocks (tsx, jsx, html, css, swift, or any language) found in any practice file.
- **Zero "use this WHEN" decision criteria.** No files contain explicit conditional triggers like "use this when," "prefer this when," or "when to use." Guidance is structured as universal principles, not situational triggers.
- **No tagging system.** Frontmatter contains only `title` and `category` -- no `tags`, `keywords`, `related`, `difficulty`, `impact`, or any other metadata. The only retrieval mechanism is directory-based (category) + filename-based (glob match).

### Duplication Audit

**Exact filename duplicates (same filename, different categories):**
- 12 unique topics appear as duplicate files across categories, totaling 27 file instances:
  - `progressive-disclosure.md` -- 3 copies (cognitive-load, interaction-patterns, reading-psychology)
  - `peak-end-rule.md` -- 3 copies (behavioral-psychology, feedback-and-error-handling, human-biases)
  - `serial-position-effect.md` -- 3 copies (layout-and-visual-hierarchy, reading-psychology, human-biases)
  - `hicks-law.md` -- 2 copies (cognitive-load, cognitive-psychology)
  - `chunking.md` -- 2 copies (cognitive-load, reading-psychology)
  - `endowment-effect.md` -- 2 copies (behavioral-psychology, human-biases)
  - `von-restorff-effect.md` -- 2 copies (layout-and-visual-hierarchy, human-biases)
  - `zeigarnik-effect.md` -- 2 copies (behavioral-psychology, human-biases)
  - `choice-overload.md` -- 2 copies (cognitive-psychology, human-biases)
  - `goal-gradient-effect.md` -- 2 copies (cognitive-psychology, behavioral-psychology)
  - `fittss-law.md` -- 2 copies (interaction-patterns, reading-psychology)
  - `change-blindness.md` -- 2 copies (feedback-and-error-handling, human-biases)
- Each copy has a different title and body text, rewritten from the category's perspective, but the core principle is identical. Example: cognitive-load/chunking.md and reading-psychology/chunking.md both teach "group related info into meaningful units" with overlapping application guidelines and anti-patterns.

**Semantic duplicates (different filename, same concept):**
- Loss aversion: `human-biases/loss-aversion.md` + `behavioral-psychology/loss-aversion-engineering.md` + `behavioral-psychology/loss-aversion-framing.md` (3 files)
- Social proof: `human-biases/social-proof.md` + `behavioral-psychology/social-proof-patterns.md`
- Banner blindness: `human-biases/banner-blindness.md` + `cognitive-load/banner-blindness-prevention.md`
- Decision fatigue / Hick's Law: `cognitive-load/hicks-law.md` + `cognitive-psychology/hicks-law.md` + `behavioral-psychology/hicks-law-and-decision-fatigue.md` + `cognitive-load/decision-fatigue-reduction.md` (4 files)
- Working memory: `cognitive-load/working-memory-window.md` + `cognitive-psychology/short-term-memory-limits.md` + `reading-psychology/working-memory-constraints.md` + `cognitive-psychology/millers-law.md` (4 files)
- Gestalt principles: 52 files in `gestalt/` + 3 in `cognitive-psychology/` (gestalt-law-of-common-region, gestalt-law-of-similarity, gestalt-uniform-connectedness) + 1 in `reading-psychology/` (gestalt-principles.md) + overlap with `layout-and-visual-hierarchy/proximity-creates-grouping.md` and `layout-and-visual-hierarchy/von-restorff-effect.md`
- Framing: `human-biases/framing-effect.md` + `behavioral-psychology/framing-effects.md` + `behavioral-psychology/loss-aversion-framing.md`

**Conservative estimate:** At least 40-50 files are near-duplicates or heavily overlapping with files in other categories. This is ~8-10% of the total corpus.

### Category Balance

**Potentially over-indexed (many files, high overlap with other categories):**
| Category | Files | Issue |
|---|---|---|
| Gestalt | 52 | Largest category. Many niche applications of the same 7-8 core principles. Also has 4+ copies in other categories. |
| Human Biases | 40 | Broad catalog of biases. Heavy overlap with behavioral-psychology (22 files) -- at least 8 topics appear in both. |
| Enterprise & B2B | 33 | Large but mostly unique. Some files feel thin (general productivity advice rather than enterprise-specific design patterns). |
| Cognitive Load | 30 | Overlaps significantly with cognitive-psychology (19 files) and reading-psychology (28 files). |
| Reading Psychology | 28 | Overlaps with cognitive-load, gestalt, and layout-and-visual-hierarchy. |

**Potentially under-indexed (important but thin):**
| Category | Files | Issue |
|---|---|---|
| Gamification | 4 | Thin for a topic with many documented patterns. |
| Usability Heuristics | 4 | Nielsen's 10 is one file; other heuristic frameworks (Shneiderman's 8 Golden Rules, Norman's 7 Principles) absent. |
| Accessibility | 11 | Thin given the breadth of a11y concerns (motion, cognitive a11y, language, complex widget ARIA patterns). |
| Design Systems & Tokens | 9 | Thin for a topic that covers color, spacing, typography, component APIs, versioning, documentation, etc. |
| Loading & Performance | 8 | Thin given the depth of perceived performance patterns. |
| Cross-Cutting | 8 | Includes high-value frameworks (Cores and Paths, Tesler's Law, Inclusive Design) but undersized. |

### Cross-References
- **102 of 486 files (~21%) contain some kind of cross-reference** -- typically inline mentions of other concepts by name (e.g., "reinforce the Proximity relationship with a secondary cue like Common Region") but NOT as structured links to other files.
- No file uses explicit markdown links to other practice files.
- No dependency graph exists. Files are written as standalone documents.
- Cross-references are prose-level ("when Proximity alone is insufficient, use Common Region") not file-level ("see also: `common-region-semantic-containers.md`").

### Typical Invocation Token Footprint
- SKILL.md alone: ~3,300 tokens (always loaded)
- Per practice file: ~520 tokens
- Typical invocation (SKILL.md + 7 practice files): ~6,900 tokens
- Heavy invocation (SKILL.md + full category, e.g., gestalt at 52 files): ~30,300 tokens
- Full corpus: ~256,000 tokens (would never be loaded at once)

## Inferences (derived, medium confidence)

### The Router Is a Good Idea Poorly Maintained
The Design Situation Router is the right abstraction -- mapping user intent to file retrieval. But with 42% of its specific file references broken, the model must fall back to globbing the directory and guessing which files are relevant based on filenames alone. This degrades retrieval precision. The router was likely authored once from an earlier version of the filenames and never updated after files were renamed to more descriptive names.

### The Uniform File Size Suggests Batch Generation
Every file being 20-28 lines with the exact same four sections, no exceptions, suggests the entire corpus was generated programmatically (likely by an LLM) in a single pass. This explains both the consistency (good) and the duplication (bad) -- a generator working category-by-category would naturally produce overlapping files for cross-cutting concepts.

### The "Theory vs. Practice" Split Creates Noise
Categories fall into two types:
1. **Theoretical** (human-biases, behavioral-psychology, cognitive-psychology, cognitive-load, reading-psychology, gestalt) -- 191 files (39% of corpus) describing psychological principles
2. **Applied** (forms-and-input, dashboard-design, component-patterns, enterprise-and-b2b, etc.) -- 295 files (61% of corpus) describing concrete UI patterns

The theoretical categories are where nearly all the duplication lives. The applied categories have very little duplication and are generally higher quality -- they give concrete, actionable guidance specific to a domain.

### The "Why It Matters" Section Is Doing Double Duty
In theoretical files, "Why It Matters" explains the psychology. In applied files, "Why It Matters" explains the UX impact. Both are valuable, but the theoretical explanation is often repeated across 3-4 files for the same concept (e.g., prospect theory is explained in loss-aversion.md, loss-aversion-engineering.md, and loss-aversion-framing.md).

### The Essential Principles in SKILL.md Compete with Practice Files
The 30 inlined principles in SKILL.md overlap substantially with the practice files. For example, SKILL.md inlines "Chunking" under Cognitive Load, which duplicates cognitive-load/chunking.md and reading-psychology/chunking.md. This means the model may get 3 versions of the same concept: SKILL.md inline + 2 practice files.

### No Mechanism for Conflict Resolution
The skill tells the model "when principles conflict, explain the tradeoff" but provides no structured data about which principles commonly conflict or how to resolve them. The synthesis example in SKILL.md is the only guidance. Practice files are written as standalone absolutes with no "tension with" or "counter-indication" metadata.

## Unknowns (gaps that matter for decisions)

1. **Retrieval accuracy in practice.** How often does the model load the right practice files for a given query? The broken router references suggest imprecision, but without invocation logs we cannot quantify miss rate.

2. **Which files are actually used.** No usage analytics exist. Some files may never be retrieved (e.g., niche gestalt applications like `synchrony-state-changes.md` or `invariance-cross-platform-icons.md`). Without usage data, consolidation decisions are based on structural analysis, not empirical value.

3. **User perception of quality.** Do users find the current skill's output helpful? Does the duplication cause the model to emit redundant advice, or does it harmlessly load extra context that gets filtered during synthesis? This is a UX question we cannot answer from file analysis alone.

4. **How the model actually uses the Glob+Read pattern.** The SKILL.md says "Use Glob to find files, then Read the relevant ones." But does the model glob the whole directory and read all results, or does it selectively pick a few? The answer determines whether duplication causes wasted context or is benign.

5. **Whether the 30 Essential Principles obviate most practice file lookups.** If the inlined principles are sufficient for 80% of queries, the practice files are an expensive redundancy that rarely adds marginal value. If the inlined principles are too brief and the model needs practice files for depth, the inlining is wasting ~1,500 tokens of context on every invocation.

6. **Token budget sensitivity.** We do not know what percentage of the model's context window the skill consumes relative to the project code, conversation history, and other skills that may be active simultaneously. In a long conversation, ~7,000 tokens per design question could compound.

## Implications for This Feature

### Consolidation Opportunity Is Large
The theoretical categories (human-biases, behavioral-psychology, cognitive-psychology, cognitive-load, reading-psychology, gestalt) contain ~40-50 duplicate/near-duplicate files. Merging them into a single "Foundational Psychology & Perception" category or deduplicating into canonical entries with cross-references could reduce the corpus by ~30-50 files without losing information.

### The Router Needs Repair or Replacement
42% broken file references make the router unreliable. Options: (a) update filenames to match actual files, (b) change the router to reference directories only (which already works), or (c) implement a more robust retrieval mechanism (e.g., a manifest file with tags and search terms per practice).

### Tags Would Enable Better Retrieval
Adding frontmatter tags (e.g., `tags: [forms, validation, error-prevention, accessibility]`) would let the model match practices to user intent without relying solely on directory structure. This is especially valuable for cross-cutting concepts that apply to multiple domains.

### Code Examples Would Increase Actionability
Zero code examples is a significant gap for a skill that's meant to help with building UI. For applied categories (forms, components, tables, navigation), concrete React/HTML/CSS snippets would transform abstract principles into implementable patterns. This is where the skill could differentiate from generic design knowledge the model already has.

### The Essential Principles Section Is the Skill's Highest-Value Content
The 30 inlined principles in SKILL.md are well-written, concise, and always in context. They represent the skill's best ROI: ~1,500 tokens that cover the most universally applicable design knowledge. Expanding this section (or making it smarter about what to include) may be more impactful than adding more practice files.

### Gestalt's 52 Files Are Ripe for Consolidation
Many gestalt files are niche applications of 7-8 core principles (proximity, similarity, closure, continuity, common fate, common region, figure-ground, praegnanz). Files like `common-fate-drag-and-drop.md`, `common-fate-dropdown-accordion.md`, and `common-fate-animated-data-viz.md` could be consolidated into a single `common-fate.md` with application examples, reducing 52 files to ~10-15 without losing actionable content.

## Source Confidence

| Source | Confidence | Notes |
|---|---|---|
| SKILL.md content and structure | High | Read in full, every line analyzed |
| File counts per category | High | Verified by filesystem enumeration |
| File structure and frontmatter | High | Sampled 25+ files across all category types; pattern is perfectly uniform |
| Duplication audit | High for exact duplicates; Medium for semantic duplicates | Exact filename matches are definitive. Semantic overlaps identified by title/content grep and manual reading of sampled files. Some additional semantic duplication likely exists beyond what was identified. |
| Router broken references | High | Tested all ~55 referenced filenames against actual filesystem |
| Token estimates | Medium | Based on 4 chars/token heuristic. Actual tokenization may vary by ~15%. |
| Cross-reference analysis | Medium | Grep-based search for reference patterns; may miss informal references that don't match search patterns |
| Retrieval behavior inferences | Low | Based on reading the SKILL.md instructions, not observing actual model behavior |
