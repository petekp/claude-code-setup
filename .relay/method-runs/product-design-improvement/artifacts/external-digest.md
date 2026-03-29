# Evidence Digest: External Patterns for Design Knowledge Retrieval

Research conducted 2026-03-28. Scope: how large design knowledge bases are organized and retrieved by AI coding assistants, with specific focus on the product-design skill (486 practices, 25 categories).

---

## Facts (confirmed, high confidence)

### 1. Design System Taxonomies in the Wild

**Material Design 3** organizes ~30+ components into 5 functional categories: Actions, Containment, Communication, Navigation, Selection, and Text Input. This is a *purpose-based* taxonomy ("what does this help the user do?") rather than a visual taxonomy ("what does it look like?"). Each component page then layers: overview, guidelines, specs, and accessibility -- progressive depth within a single topic.

**GitHub Primer** presents 80+ components in a flat alphabetical list but implicitly groups them by function (Action components, Form Controls, Display/Content, Layout, Overlays, Data Display). It supplements components with three parallel taxonomies: Primitives (color, size, typography tokens), UI Patterns (forms, navigation, loading, data viz), and CSS Utilities. The key insight: Primer separates "what to build with" (components) from "how to compose them" (patterns) from "foundational decisions" (primitives).

**Storybook** recommends organizing by functionality type (form controls, layout, navigation, cards), by status (ready, experimental, deprecated), or by a "development kitchen" namespace for experimentation. Spotify Backstage, Grommet, and Monday.com Vibe all group by functionality.

**Atomic Design (Brad Frost)** provides a hierarchical composition model: Atoms > Molecules > Organisms > Templates > Pages. The actual labels matter less than the principle -- understand how smaller building blocks combine into larger structures. This maps well to Claude's need to understand which *level* of design advice to surface.

**Key finding:** Successful design taxonomies use 5-7 top-level categories based on user intent or functional purpose, not 25. They then use depth within each category, not breadth across categories.

### 2. Progressive Disclosure for AI Agents is a Solved Pattern

**Anthropic's official guidance** (platform.claude.com/docs) explicitly defines a three-tier progressive disclosure architecture:
- **Tier 1 -- Metadata** (~100 tokens): name + description, always in system prompt. Used for skill discovery.
- **Tier 2 -- SKILL.md body** (loaded on trigger): should be under 500 lines. Acts as a table of contents and core rules.
- **Tier 3 -- Bundled resources** (loaded as needed): unlimited size, zero context cost until accessed.

**Official best practice:** "Keep references one level deep from SKILL.md." Claude partially reads nested references (using `head -100`), so deeply nested file structures degrade retrieval quality.

**Official best practice:** "For reference files longer than 100 lines, include a table of contents at the top."

**Official best practice:** "Split content into separate files when approaching 500 lines in SKILL.md."

The existing product-design SKILL.md is 142 lines, well within budget. But the *real* issue is at Tier 3: 486 files with no intermediate routing layer between the situation router (17 rows) and individual practice files.

### 3. What Makes Practice Files Maximally Useful for AI

**Optimal file length for retrieval:** RAG research converges on 200-512 tokens per chunk for factoid retrieval, with 512-1024 tokens for analytical/contextual queries. The current practice files average ~23 lines (~200-250 tokens), which is on the short end but appropriate for their role as "principles with anti-patterns."

**The vercel-react-best-practices pattern** (62 rules) uses a format that works well:
- YAML frontmatter: `title`, `impact` (CRITICAL/HIGH/MEDIUM/LOW), `impactDescription`, `tags`
- Short body: incorrect example, correct example, brief explanation
- Total: 20-70 lines per rule

**The clean-architecture pattern** (42 rules) uses a similar format with `impact` and `tags` in frontmatter, plus code examples.

**Current product-design practice files** use only: `title` and `category` in frontmatter. They lack:
- `tags` for cross-category discovery (e.g., a form practice tagged `accessibility, error-handling, mobile`)
- `impact` or `priority` to help Claude decide which 3-5 to pick
- `situations` or `triggers` to map practices to concrete UI tasks
- Any code examples (these are concept-only files)

**The Anthropic skill-creator guidance** specifies: frontmatter with title, code examples inline, and self-contained chunks that are independently understandable.

### 4. Patterns from the Local Skill Ecosystem

**swift-apps SKILL.md** (63 lines) uses a "Choose The Track" pattern: 7 branches (new feature, refactor, bug fix, performance, liquid glass, macOS, version-sensitive) each pointing to 1-2 reference files. This is an explicit decision tree. There are only 6 reference files total, each large and comprehensive.

**typography SKILL.md** (445 lines) embeds substantial content directly in SKILL.md (core principles, scales, CSS, dark mode) and uses 7 reference files for deep dives. It works because the total knowledge surface is small enough to fit mostly in Tier 2.

**clean-architecture SKILL.md** (114 lines) uses a priority-ordered quick reference (8 categories, 42 rules) with impact levels and prefixes. Each rule links to a reference file. The SKILL.md is essentially a prioritized index.

**vercel-react-best-practices SKILL.md** (141 lines) follows the same pattern as clean-architecture: priority-ordered categories with individual rule links. Additionally publishes a compiled AGENTS.md (3,254 lines) as an alternative "dump everything" format.

**method-router SKILL.md** (61 lines) is a pure routing skill: match signals to methods using explicit match/exclude criteria. This is the closest analog to what product-design needs for routing to the right 3-5 practices.

**frontend-design SKILL.md** (43 lines) is a short, opinionated guide with zero reference files. Works because the knowledge is judgmental/aesthetic rather than encyclopedic.

**Key pattern:** Skills with <50 items put everything in SKILL.md or a compiled AGENTS.md. Skills with 40-62 items use a categorized index in SKILL.md linking to individual files. No existing skill in this ecosystem manages 486 items -- this is an unprecedented scale.

### 5. How the Current Product-Design Skill Routes

The current routing mechanism is a "Design Situation Router" table (17 rows) in SKILL.md that maps situations to directories and "key files to start with." Claude must:
1. Match the user's request to one of 17 situations
2. Glob for files in the right directory
3. Read the suggested "key files" (typically 3)
4. Optionally read more from the same directory

This is a single-level, situation-to-directory mapping. It does not support:
- Cross-category retrieval (e.g., "accessible form with loading states" spans 3 categories)
- Priority-based retrieval (no way to know which practices are highest-impact)
- Tag-based retrieval (no tags in frontmatter)
- Compositional queries (designing a settings page touches forms + navigation + enterprise + feedback)

---

## Inferences (derived, medium confidence)

### A. The 25-Category Taxonomy is Too Granular for Routing

The current 25 categories are organized like an academic textbook (gestalt principles, cognitive psychology, behavioral psychology, human biases, reading psychology -- five psychology categories alone). For an AI coding assistant, the question isn't "which psychological principle applies?" but "I'm building a form -- what do I need to know?"

Material Design's 5-7 intent-based categories are a better model for Tier 2 routing. The 25 categories should remain as the file system organization (Tier 3) but should not be the primary routing dimension.

A task-based routing layer would serve better:
- "Building a form" -> pulls from forms-and-input, cognitive-load, feedback-and-error-handling, accessibility
- "Designing a dashboard" -> pulls from dashboard-design, data-display-and-tables, layout-and-visual-hierarchy, loading-and-performance
- "Adding AI features" -> pulls from interaction-patterns, feedback-and-error-handling, cognitive-load

This is essentially what the Synthesis Example in the current SKILL.md demonstrates for a settings page -- but it's a static example, not a general mechanism.

### B. Tags Would Enable Cross-Category Retrieval Without Restructuring Files

Adding tags to each practice file's frontmatter (e.g., `tags: [form, validation, accessibility, error-handling, mobile]`) would allow Claude to grep for tags across all 486 files and surface the right subset for compositional queries. This is the lowest-cost, highest-impact improvement.

The vercel-react-best-practices and clean-architecture skills both use tags in their practice files. The product-design skill does not.

### C. Impact/Priority Scoring Would Help Claude Pick 3-5 from a Larger Set

When a situation matches 15-30 potentially relevant practices, Claude needs a signal for which 3-5 to prioritize. Both vercel-react-best-practices and clean-architecture use impact levels (CRITICAL, HIGH, MEDIUM, LOW). Product-design practices have no such signal.

Adding a `priority` or `impact` field to each practice's frontmatter would let Claude sort results by importance before loading full content.

### D. The "Essential Principles" Section is the Right Instinct, Wrong Granularity

The 30 "Essential Principles" inlined in SKILL.md (Fitts's Law, Hick's Law, etc.) are an effective always-in-context layer. But they're all foundational laws -- they don't help with task-specific decisions like "should I use a modal or a side panel?" or "how should I handle bulk import errors?"

A second tier of "high-frequency situation patterns" (10-15 composite patterns for the most common tasks) between the Essential Principles and the full 486-file library would dramatically improve routing accuracy.

### E. The Practice File Format is Good But Could Be More Actionable

The current format (Principle, Why It Matters, Application Guidelines, Anti-Patterns) is well-structured and at a good token length (~200-250 tokens). However:
- No code examples means Claude must translate principles to code on its own
- No "applies when" metadata means Claude must infer relevance from the title/body
- No "conflicts with" or "pairs well with" metadata means Claude can't do the multi-principle synthesis the SKILL.md says is the goal

### F. A Compiled Index File Would Enable Faster Scanning

The vercel-react-best-practices AGENTS.md (3,254 lines compiling all 62 rules inline) suggests a pattern: compile all 486 practice titles + 1-line summaries into a single index file. Claude can grep or scan this index to find relevant practices without globbing 25 directories. This would be ~500-1000 tokens, well within Tier 2 budget.

---

## Unknowns (gaps that matter for decisions)

### U1. Does Claude actually read the suggested "key files" from the router table?
The SKILL.md says "Use Glob to find files: practices/{category-dir}/*.md, then Read the relevant ones" but we don't know if Claude reliably follows the router table vs. loading random files or too many files. Observing actual behavior (per Anthropic's guidance: "Watch for unexpected exploration paths") would inform whether the router needs to be more directive.

### U2. How often do user requests span multiple categories?
If most requests map cleanly to one category, the current single-directory routing is adequate. If most requests are compositional (touching 2-4 categories), then cross-cutting tags and composite situation patterns become critical. We need usage data or representative scenarios.

### U3. What is the actual token budget when this skill fires?
When product-design triggers, the SKILL.md body (~142 lines, ~2000 tokens) loads. Each practice file adds ~200-250 tokens. Reading 5 practices costs ~1000-1250 tokens. Reading 15 costs ~3000-3750. What's the practical ceiling before context contention with code, conversation history, and other loaded skills?

### U4. Are all 486 practices equally useful, or is there a power law?
If 50-80 practices cover 90% of situations (a typical Pareto distribution), then identifying and marking these "core" practices would dramatically simplify routing. We don't have usage data to confirm this.

### U5. Should practice files include code examples?
The current files are concept-only. Adding React/SwiftUI code examples would make them more directly actionable for this user (per CLAUDE.md: React/Next.js + SwiftUI). But it would also 2-3x the token cost per file and narrow the skill's applicability. This is a design decision, not an evidence question.

---

## Coverage Gap Analysis: Missing Design Domains

Based on the user's stack (React/Next.js + SwiftUI, per CLAUDE.md) and the existing 25 categories, these domains are genuinely important but absent or underrepresented:

### Clearly Missing
1. **Responsive/Adaptive Design** -- No dedicated category. A React/Next.js developer constantly makes responsive decisions. Mobile-first layout, breakpoint strategy, touch vs. pointer, responsive typography, container queries. Only tangentially covered in cross-cutting.

2. **Animation and Motion Design** -- No category despite being a major design dimension. Timing, easing, entrance/exit transitions, loading transitions, micro-interactions, reduced motion, animation performance. The deleted `design-motion-principles` skill suggests this was recognized but removed.

3. **Dark Mode / Theming** -- Only 1 file (semantic-color-tokens-dark-mode.md in design-systems-and-tokens). A developer building for both light and dark themes needs substantial guidance: contrast in dark mode, image handling, elevation/shadow in dark mode, user preference detection.

4. **Mobile/Touch-Specific Patterns** -- No mobile-specific category (there is desktop-specific with 23 files). Gesture design, bottom sheet patterns, pull-to-refresh, swipe actions, reachability zones, safe areas, mobile navigation (tab bar vs. hamburger).

5. **Real-Time / Collaborative UI** -- No coverage of multiplayer cursors, presence indicators, conflict resolution UI, optimistic updates in collaborative contexts, real-time notification design.

### Underrepresented
6. **AI/LLM Interface Patterns** -- Only 4 files in interaction-patterns cover AI. Given the explosion of AI features, this deserves expansion: streaming text display, confidence indicators, prompt input design, AI-generated content attribution, human-AI handoff patterns, conversational UI.

7. **Content Strategy / Writing** -- No coverage of microcopy, error message writing, button label writing, notification copy, tone of voice. The reading-psychology category (28 files) covers how people read but not what to write.

8. **Data Visualization** -- Only covered within dashboard-design. No standalone guidance for chart selection, axis design, color in data viz, annotation patterns, interactive charts, sparklines, maps.

9. **Settings and Preferences UI** -- Despite the synthesis example in SKILL.md being about a settings page, there's no dedicated coverage of settings organization, toggle behavior, preference inheritance, feature flags UI.

10. **Notification and Messaging Patterns** -- No dedicated coverage of notification design, badge behavior, toast vs. banner vs. modal, notification preferences, do-not-disturb, notification grouping.

---

## Implications for This Feature

### The core challenge is routing, not content volume
486 practice files is not too many -- it's the right depth for a comprehensive design knowledge base. The problem is that the routing mechanism (17-row situation table) is too coarse to reliably surface the right 3-5 from 486. This is a retrieval problem, not a content problem.

### Three improvements ranked by impact-to-effort ratio

**1. Add structured frontmatter to all practice files (HIGH impact, MEDIUM effort)**
Add `tags`, `priority` (1-3), and `applies_when` to each file's YAML frontmatter. This enables grep-based cross-category retrieval, priority-based filtering, and situation matching. This is the foundation everything else builds on.

Example enriched frontmatter:
```yaml
---
title: Inline Validation - Validate on Field Blur, Not on Keystroke
category: Forms & Input
tags: [form, validation, error-handling, accessibility, input]
priority: 1
applies_when: [building forms, adding validation, handling form errors, input design]
pairs_with: [error-prevention, never-use-placeholder-text, error-messages-plain-language]
---
```

**2. Build a compiled index (HIGH impact, LOW effort)**
Generate a single `practices/_index.md` file listing all 486 practices with title, category, tags, and priority. Claude can scan this index (~1000 tokens) to identify the right 3-5 files before reading them. This replaces the current pattern of globbing directories.

**3. Replace the situation router with a composite routing table (HIGH impact, MEDIUM effort)**
Expand from 17 situations to ~30-40, with each situation pointing to specific practice files (not directories) across multiple categories. Include the method-router's "match/exclude" pattern to improve precision.

Example:
```markdown
| Situation | Match signals | Read these practices (by priority) |
|---|---|---|
| Building a form | form, input, field, validation | forms-and-input/inline-validation.md, forms-and-input/single-column-form-layouts.md, feedback-and-error-handling/error-messages-plain-language.md, accessibility/full-keyboard-accessibility.md, cognitive-load/progressive-disclosure.md |
```

### What NOT to do
- Do not compile all 486 files into a single AGENTS.md. At ~11,000 lines, this would consume the entire context window.
- Do not restructure the directory layout. The 25-category structure is fine for file organization; routing should be a separate layer on top.
- Do not reduce the number of practice files. The depth is an asset, not a liability.

---

## Source Confidence

| Source | Type | Confidence | Notes |
|---|---|---|---|
| Anthropic official skill docs (platform.claude.com) | Primary documentation | HIGH | Official best practices, directly applicable |
| Local skill ecosystem (~50 skills examined) | Primary evidence | HIGH | Direct code examination of working patterns |
| Product-design SKILL.md + 486 practice files | Primary evidence | HIGH | Full content examined |
| Plugin-dev skill-development guide | Primary documentation | HIGH | Detailed progressive disclosure guidance |
| Material Design 3, Primer, Storybook taxonomies | External design systems | HIGH | Well-documented public systems |
| RAG chunking research (NVIDIA, Pinecone, Milvus) | Academic/industry research | MEDIUM-HIGH | Transferable principles, not directly about Claude skills |
| Anthropic 2026 Agentic Coding Trends Report | Industry report | MEDIUM | High-level trends, not implementation-specific |
| Medium/blog posts on progressive disclosure for AI | Community writing | MEDIUM | Reflects emerging patterns, some speculation |
| Atomic Design (Brad Frost) | Published methodology | HIGH | Established since 2013, widely adopted |
| Web search results on AI+design tools | Mixed web results | MEDIUM | Directional, not definitive |
