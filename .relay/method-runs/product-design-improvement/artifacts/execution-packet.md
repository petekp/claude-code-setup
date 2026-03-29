# Execution Packet: Product-Design Skill Improvement

## Invariants (from constraints + ADR)

1. **No net token increase per invocation.** Current: ~7K tokens (SKILL.md + ~7 files). Target: ~5.5K or less (SKILL.md with no principles + ~7 files with enriched frontmatter).
2. **All practice file content preserved.** Duplicate merging must keep the richer version. No practice is deleted without its content being preserved in a surviving file.
3. **Research depth intact.** The "Why It Matters" sections with cognitive science grounding must survive deduplication.
4. **Existing single-category routing must work or improve.** Every situation the current router handles must still work after changes.
5. **Frontmatter additions are additive only.** New fields (tags, priority, applies_when) never replace existing title/category fields.

## Interface Boundaries (what changes, what must not)

### Changes
- `SKILL.md` — Complete rewrite of routing table; removal of 30 Essential Principles; expanded router from 17→25 rows
- `practices/**/*.md` — Frontmatter enrichment (all files); deletion of exact/semantic duplicates (~40-45 files)
- New: `scripts/validate-skill-references.sh` — Validation script for router reference integrity

### Must Not Change
- Practice file body content (Principle, Why It Matters, Application Guidelines, Anti-Patterns sections)
- Directory structure (25 categories stay as-is)
- SKILL.md frontmatter (name, description fields)
- SKILL.md trigger behavior

## Slice Order (implementation sequence)

### Slice 1: Audit and catalog duplicates
- Enumerate all 27 exact-filename duplicates (same basename in different category dirs)
- Enumerate all ~15-20 semantic duplicates (different names, same core concept)
- For each pair/triple, identify which version is richest (most detailed Application Guidelines, best Anti-Patterns)
- Output: `duplicate-manifest.md` listing every duplicate with survivor designation

### Slice 2: Merge duplicates
- For each exact duplicate: keep the richest version, delete others
- For each semantic duplicate: merge unique content from the weaker version into the stronger, delete the weaker
- Verify: file count drops by ~40-45 files
- Verify: no content lost (diff each deleted file against its survivor)

### Slice 3: Fix and expand the Design Situation Router
- Audit every filename reference in the current router against the actual filesystem
- Fix all broken references (map simplified names to actual descriptive filenames)
- Expand from 17 to ~25 rows to cover all 25 categories (currently missing: gamification, usability-heuristics, cross-cutting, design-systems-and-tokens, reading-psychology, cognitive-psychology, behavioral-psychology, human-biases)
- Each row: situation description, directory path, 3-4 verified starter files
- Remove the 30 Essential Principles section entirely
- Keep the "All Categories" reference table at the bottom

### Slice 4: Define tag vocabulary and enrichment schema
- Design a controlled tag vocabulary (~40-60 tags) organized by:
  - Domain tags: `form`, `dashboard`, `table`, `navigation`, `search`, `modal`, `enterprise`, `onboarding`, `settings`, `notification`, etc.
  - Concern tags: `accessibility`, `performance`, `error-handling`, `loading`, `validation`, `responsive`, `animation`, `theming`
  - Principle tags: `cognitive-load`, `fitts-law`, `hicks-law`, `gestalt`, `progressive-disclosure`, `affordance`
- Define priority levels: `core` (top ~50 practices every developer should know), `situational` (valuable in specific contexts), `niche` (specialized or theoretical)
- Define `applies_when` format: 1-2 sentence trigger condition
- Output: `tag-vocabulary.md` with all tags, definitions, and usage rules

### Slice 5: Enrich frontmatter across all surviving practice files
- Script-driven: for each file, add `tags`, `priority`, and `applies_when` to YAML frontmatter
- Tags must come from the controlled vocabulary (Slice 4)
- Priority assigned based on: frequency of the concept in applied design work, breadth of applicability
- `applies_when` is a natural-language trigger: "When designing form validation", "When building a data-heavy dashboard"
- Verify: every file has all three new frontmatter fields
- Verify: every tag used is in the vocabulary

### Slice 6: Create validation script
- `scripts/validate-skill-references.sh`: checks every file path in SKILL.md against the filesystem
- Reports: missing files, orphaned files (in practices/ but not referenced anywhere), duplicate basenames
- Exit code 1 on any broken reference
- Run after Slices 1-5 to verify integrity

### Slice 7: Final SKILL.md rewrite
- Incorporate expanded router (Slice 3)
- Remove Essential Principles (already done in Slice 3 but verify)
- Add retrieval instructions: "When a situation spans multiple categories, grep frontmatter tags across `practices/` to find cross-cutting practices"
- Add instructions for using the new frontmatter: "Each practice file includes `priority` (core/situational/niche) and `applies_when` metadata. Prefer core-priority files when multiple matches exist."
- Verify total SKILL.md is under 150 lines

## Test Obligations (what must be tested and how)

1. **Router reference integrity:** Run validation script — zero broken references
2. **Duplicate elimination:** Verify file count reduction matches expected (~40-45 fewer files)
3. **Content preservation:** For each deleted duplicate, verify its unique content exists in the surviving file
4. **Frontmatter completeness:** Script check that every `.md` file in `practices/` has `tags`, `priority`, `applies_when` in frontmatter
5. **Tag vocabulary compliance:** Script check that every tag used in frontmatter appears in the vocabulary
6. **Token budget:** Estimate SKILL.md token count (target: <2K tokens, down from ~3.3K)
7. **Regression check:** Manually verify that each of the original 17 router situations still routes to valid, relevant files

## Artifact Expectations (what the implementer must produce)

1. Modified `SKILL.md` — rewritten with expanded router, no principles
2. Modified practice files — enriched frontmatter on all surviving files
3. Deleted duplicate files — ~40-45 files removed
4. `scripts/validate-skill-references.sh` — reference integrity checker
5. `duplicate-manifest.md` (working artifact, can be discarded after merge)
6. `tag-vocabulary.md` (working artifact, keep as reference for future enrichment)

## Rollback Triggers (when to stop and escalate)

1. If more than 60 files need deletion (suggests deeper problems than expected)
2. If the tag vocabulary cannot be kept under 80 tags (suggests over-engineering)
3. If SKILL.md exceeds 200 lines after expansion (suggests the router is too detailed)
4. If frontmatter enrichment produces inconsistent tagging despite controlled vocabulary

## Non-Goals (from intent brief and ADR)

- No new practice files for coverage gaps
- No compiled index file
- No directory restructuring
- No code examples in practice files
- No cross-category retrieval mechanism (beyond frontmatter grep hints)

## Verification Commands

```bash
# Check router reference integrity
bash scripts/validate-skill-references.sh

# Count practice files (should be ~440-445 after dedup)
find practices/ -name "*.md" | wc -l

# Verify all files have required frontmatter
grep -rL "^tags:" practices/
grep -rL "^priority:" practices/
grep -rL "^applies_when:" practices/

# Check SKILL.md line count (target: <150 lines)
wc -l SKILL.md

# Estimate token count (rough: chars/4)
wc -c SKILL.md | awk '{print $1/4 " estimated tokens"}'
```
