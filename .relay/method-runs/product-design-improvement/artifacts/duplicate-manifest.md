# Duplicate Manifest

Generated: 2026-03-28

Base path: `~/.claude/skills/product-design/practices/`

---

## Exact-Filename Duplicates

### Set 1: progressive-disclosure.md
- `cognitive-load/progressive-disclosure.md` — Framed as cognitive load management. Unique: "Layered information architecture: summaries on surface, details on drill-down." Strong anti-patterns section covering inconsistent disclosure patterns (inline expand vs. page navigate). Notes reversibility requirement.
- `interaction-patterns/progressive-disclosure.md` — Framed as interaction design. Richest Application Guidelines of the three: 80/20 rule for feature surface, contextual reveal on user action (formatting on text select, filters on click, bulk actions on multi-select). Explicit "never hide critical functionality" guideline. Notes that this is how Photoshop/Excel/Figma serve beginners and experts.
- `reading-psychology/progressive-disclosure.md` — Framed as reading/scanning optimization. Unique: three-audience-layer model (first-time, regular, power user). Notes reversibility. Shortest overall.
- **Also related (not exact name match):**
  - `navigation-and-information-architecture/progressive-disclosure-for-complex-feature-sets.md` — Distinct enough to keep (focuses on navigation IA specifically: remembering disclosure state per user, expandable sections vs. separate pages, count badges on optional fields, max 2 nesting levels). Overlaps on 80/20 principle but adds navigation-specific guidance.
  - `gestalt/praegnanz-progressive-disclosure.md` — Distinct: applies Law of Praegnanz to progressive disclosure (collapsed state must be geometrically regular, expansion should extend rather than break spatial model). Keep as gestalt-specific application.
- **Survivor:** `interaction-patterns/progressive-disclosure.md`
- **Merge strategy:** Add cognitive-load version's "layered information architecture" guideline, anti-pattern about inconsistent disclosure patterns, and reading-psychology's three-audience-layer model. Keep nav-IA and gestalt files separate.

### Set 2: hicks-law.md
- `cognitive-load/hicks-law.md` — Titled "Minimize Choices at Decision Points." Guidelines: limit nav to 5-7 items, highlight recommended options, progressive disclosure, search/filter for large sets, break decisions into steps. Good anti-patterns on mega-menus and equal visual weight.
- `cognitive-psychology/hicks-law.md` — Titled "Reduce Choices at Decision Points." Unique: context-based option filtering, frequency-based ordering, "More" affordance for rare actions, creation forms showing only required fields by default. Slightly richer guidelines.
- **Also related:**
  - `behavioral-psychology/hicks-law-and-decision-fatigue.md` — Combines Hick's Law with decision fatigue as a compound concept. Unique: "Sequence decisions rather than presenting simultaneously," "Eliminate redundant options by merging with smarter default." Bridges the gap between choice count and temporal depletion.
  - `cognitive-load/decision-fatigue-reduction.md` — Distinct focus: temporal ordering of decisions (front-load critical choices when energy is highest). Not about option count but about when to present decisions. Keep separate.
- **Survivor:** `cognitive-psychology/hicks-law.md`
- **Merge strategy:** Add cognitive-load version's anti-patterns (mega-menus, equal visual weight, unfamiliar terminology). Fold behavioral-psychology version's sequencing and redundancy-elimination points into the survivor. Keep `decision-fatigue-reduction.md` separate as it addresses temporal ordering, not option count.

### Set 3: change-blindness.md
- `feedback-and-error-handling/change-blindness.md` — Titled "Mark State Changes Explicitly." Focuses on making changes visible through animation and highlighting. Unique: "changes since last visit" mode for dashboards, specific timing guidance (150-300ms transitions, 1-2 second fade highlights), "Data updated -- 3 new rows" notification pattern.
- `human-biases/change-blindness.md` — Broader framing as a perceptual bias. Unique: queue changes during transitions/modals and surface when user can see them, inline change indicators ("Updated 2 seconds ago"), anti-patterns on brief toasts for important outcomes, moving/reorganizing UI between loads.
- **Also related:**
  - `cognitive-load/change-blindness-prevention.md` — Near-duplicate. Titled "Make State Changes Unmistakable." Unique: explicit confirmation messages near action trigger ("Settings saved"), background saves needing success/failure indication. Shorter than the other two.
- **Survivor:** `human-biases/change-blindness.md`
- **Merge strategy:** Add feedback version's specific timing guidance (150-300ms, 1-2s fades), "changes since last visit" mode, and "Data updated -- 3 new rows" pattern. Add cognitive-load version's confirmation-message-near-trigger guideline. Delete the other two.

### Set 4: peak-end-rule.md
- `feedback-and-error-handling/peak-end-rule.md` — Framed around success states and error recovery. Unique: "Identify peak moments in key flows (moment of commitment, first value, completion) and polish disproportionately." Strong guidance on avoiding ending flows on error/ambiguous state.
- `behavioral-psychology/peak-end-rule.md` — Framed as session engineering. Unique: "Front-load unpleasant tasks, end with rewarding ones." "Show summary of accomplishments at session end." "Design error recovery to end on resolution." Duration neglect insight.
- `human-biases/peak-end-rule.md` — General bias framing. Unique: "Invest heavily in post-purchase experience," anti-pattern about support interactions ending with cold survey, ongoing/exit experience investment.
- **Survivor:** `behavioral-psychology/peak-end-rule.md`
- **Merge strategy:** Add feedback version's "identify peak moments at commitment/first-value/completion" framework and "never end on error" rule. Add human-biases version's post-purchase and exit-experience anti-patterns. Delete the other two.

### Set 5: serial-position-effect.md
- `layout-and-visual-hierarchy/serial-position-effect.md` — Focused on spatial layout. Unique: feature comparison table column positioning, "pinned/favorites" section for long lists, ordering by frequency vs. internal dev sequence anti-pattern.
- `reading-psychology/serial-position-effect.md` — Reading/memory framing. Unique: Ebbinghaus attribution, error messages putting critical action first, "cognitive dead zone" for middle items.
- `human-biases/serial-position-effect.md` — General bias framing. Unique: tab bars/toolbars put primary actions at edges, terms/feature lists put most persuasive first and second-most last, ending onboarding with low-value steps anti-pattern.
- **Survivor:** `layout-and-visual-hierarchy/serial-position-effect.md`
- **Merge strategy:** Add reading-psychology's guidance on error message ordering and cognitive dead zone framing. Add human-biases' tab bar edge-placement rule and persuasive ordering pattern. Delete the other two.

### Set 6: von-restorff-effect.md
- `layout-and-visual-hierarchy/von-restorff-effect.md` — Focused on visual isolation for CTAs. Unique: brand primary color used exclusively for primary CTA, consistency of CTA position across screens, "carnival effect" anti-pattern name, guidance on destructive vs. constructive action styling.
- `human-biases/von-restorff-effect.md` — General bias framing. Unique: "pre-attentive" processing explanation, anti-pattern about highlighting promotional content over functional content, relying solely on color (colorblind users).
- **Survivor:** `layout-and-visual-hierarchy/von-restorff-effect.md`
- **Merge strategy:** Add human-biases version's pre-attentive processing explanation, promotional-over-functional anti-pattern, and color-only accessibility concern. Delete the other.

### Set 7: choice-overload.md
- `cognitive-psychology/choice-overload.md` — Titled "Limit Visible Options." Unique: specific plan/pricing guidance (3 tiers, max 4), template selectors (6-8 curated), permission/role preset bundles, integration list anti-pattern.
- `human-biases/choice-overload.md` — General bias framing. Unique: cites jam study with numbers (24 vs 6, 10x purchases), "choose nothing, choose default, or choose and regret" framework, settings common vs. advanced separation.
- **Also related:**
  - `behavioral-psychology/paradox-of-choice.md` — Same core concept (Schwartz's paradox of choice, Iyengar/Lepper jam study). Unique: "Curation is a design service" framing, constrained choices over open-ended ("5 colors" vs "any hex code"), 3 optimal for pricing.
- **Survivor:** `cognitive-psychology/choice-overload.md`
- **Merge strategy:** Add human-biases version's jam study specifics and three-outcome framework. Merge paradox-of-choice's "curation as design service" framing and constrained-vs-open-ended guideline. Delete the other two.

### Set 8: chunking.md
- `reading-psychology/chunking.md` — Miller's research framing. Unique: "3-5 chunks for complex information" (revised from 7+/-2), phone number formatting example, form fields in labeled sections of 3-5.
- `cognitive-load/chunking.md` — Cognitive load framing. Unique: anti-patterns for dense data tables without row grouping, flat navigation with 20+ items, cards/bordered sections/background colors for visual reinforcement.
- **Also related:**
  - `cognitive-psychology/chunk-content-into-visually-distinct-groups.md` — Overlaps significantly but focuses on visual chunking for scanning (not memory). Unique: spatial memory for dashboard data, background color bands, visual grouping hierarchy matching informational hierarchy. Distinct enough to keep as it addresses the visual design implementation rather than the cognitive principle.
  - `cognitive-psychology/millers-law.md` — Related but focuses on the 5-7 guideline for organizing information. Keep separate as the canonical Miller's Law reference.
- **Survivor:** `cognitive-load/chunking.md`
- **Merge strategy:** Add reading-psychology's Miller's research context, 3-5 refinement for complex info, and form field section sizing. Keep `chunk-content-into-visually-distinct-groups.md` and `millers-law.md` as separate files.

### Set 9: endowment-effect.md
- `behavioral-psychology/endowment-effect.md` — Focused on onboarding and conversion. Unique: personalization during free trial, possessive language ("Your dashboard"), showing accumulated value ("12 documents this week"), upgrade prompts referencing specific customizations.
- `human-biases/endowment-effect.md` — General bias framing. Unique: migration handling (carry customizations visibly), sunsetting features (export tools, transition time), resistance to redesigns/upgrades, anti-patterns on forced migrations.
- **Survivor:** `behavioral-psychology/endowment-effect.md`
- **Merge strategy:** Add human-biases version's migration/sunsetting guidance and redesign-resistance framing. Delete the other.

### Set 10: goal-gradient-effect.md
- `cognitive-psychology/goal-gradient-effect.md` — Broader framing. Unique: endowed progress effect (start slightly ahead of zero), celebrate completion with success states, indeterminate spinner anti-pattern, stalled progress bar anti-pattern, estimated time remaining guidance.
- `behavioral-psychology/goal-gradient-effect.md` — Clark Hull attribution, digital validation. Unique: coffee shop loyalty card analogy (pre-stamped 2 of 12), specific counts over vague indicators, accelerate perceived progress by making early steps easier, break long processes into sub-goals with own arcs. "Dishonest progress bar is worse than no bar."
- **Survivor:** `behavioral-psychology/goal-gradient-effect.md`
- **Merge strategy:** Add cognitive-psychology's endowed progress effect detail, completion celebration guidance, estimated time remaining, and specific anti-patterns (stalled bar, "Step 3" without total). Delete the other.

### Set 11: fittss-law.md
- `interaction-patterns/fittss-law.md` — Comprehensive interaction design framing. Unique: screen edges/corners as infinite targets, grouping related actions to minimize travel, inverse Fitts's Law for destructive actions (smaller, farther), mobile thumb zone guidance. Specific size minimums (44x44 touch, 32x32 mouse).
- `reading-psychology/fittss-law.md` — Narrower focus on text targets and touch. Unique: extend clickable area of text links with padding, 8px minimum spacing between interactive elements, Apple HIG vs Material Design size standards, multiple inline links in text-heavy pages.
- **Survivor:** `interaction-patterns/fittss-law.md`
- **Merge strategy:** Add reading-psychology's text-link padding extension, 8px spacing minimum, and inline-link-in-text guidance. Delete the other.

### Set 12: zeigarnik-effect.md
- `behavioral-psychology/zeigarnik-effect.md` — Focused on return engagement. Unique: Bluma Zeigarnik 1927 attribution, "cognitive tension" framing, natural breaking points design, "open loop" terminology, manufactured incompleteness as anti-pattern.
- `human-biases/zeigarnik-effect.md` — General bias framing with ethical dimension. Unique: ethical use vs. exploitative use distinction, "checklists create visible open loops," anti-patterns on aggressive reminders creating anxiety, badges creating guilt, never-reaching-100% systems.
- **Also related (not exact name match):**
  - `gamification/progress-visualization-with-zeigarnik-effect.md` — Distinct enough to keep. Focuses specifically on progress visualization mechanics (XP bars, pre-seeding progress, milestone sub-goals, ambient visibility). Combines Zeigarnik with goal gradient.
  - `workflow-and-multi-step/zeigarnik-effect-persist-incomplete-tasks.md` — Distinct enough to keep. Focuses on implementation: auto-save drafts, "Drafts" section in navigation, "Continue where you left off" prompts, step-boundary saves, stale draft cleanup.
- **Survivor:** `behavioral-psychology/zeigarnik-effect.md`
- **Merge strategy:** Add human-biases version's ethical dimension, checklist open-loops, and anxiety/guilt anti-patterns. Keep gamification and workflow files as separate applied-context files.

---

## Semantic Duplicates

### Set 1: Loss Aversion
- `human-biases/loss-aversion.md` — General bias reference. Covers loss framing for messaging, trial conversions, critical warnings, accidental-loss protection, and balance with positive framing. Anti-patterns on fear-based trivial warnings, threatening data deletion, artificial scarcity, removing features to force upgrades.
- `behavioral-psychology/loss-aversion-engineering.md` — Focused on protecting user investment (data, customizations, streaks). Unique: auto-save, "You'll lose X" concrete warnings, undo over confirmation, churn-flow accumulated value display, data export and account pausing.
- `behavioral-psychology/loss-aversion-framing.md` — Focused on message framing. Unique: security warning framing ("account could be compromised"), expiring trial specifics ("3 active projects and 47 files become read-only"), deadline urgency framing, always pair loss with clear prevention action.
- **Survivor:** `human-biases/loss-aversion.md`
- **Merge strategy:** The two behavioral-psychology files are genuinely distinct applications of the same principle. However, they overlap heavily with the general reference. Merge loss-aversion-engineering's auto-save, undo-over-confirmation, and churn-flow guidelines into the survivor. Merge loss-aversion-framing's security/expiry/deadline framing examples into the survivor. Delete both behavioral-psychology files.
- **Exceptions:** None. All three cover the same concept with different lenses; a single comprehensive file serves better.

### Set 2: Social Proof
- `behavioral-psychology/social-proof-patterns.md` — Implementation-focused. Unique: real-time activity feeds ("Sarah from Denver just signed up"), peer-specific proof (segment by industry/role), aggregate ratings with review counts, authentic > polished testimonials.
- `human-biases/social-proof.md` — General bias reference. Unique: team adoption metrics ("8 of 10 team members activated"), anti-patterns on low-adoption backfire ("Join our 12 users!"), irrelevant demographics, off-peak activity count embarrassment.
- **Survivor:** `human-biases/social-proof.md`
- **Merge strategy:** Add behavioral-psychology version's real-time activity feed example, peer-specific proof segmentation, and aggregate-rating-with-count guideline. Delete the other.

### Set 3: Banner Blindness
- `cognitive-load/banner-blindness-prevention.md` — Cognitive load framing. Unique: "Test whether users actually notice" guideline, dismissible banners for non-dismissible information anti-pattern, using same visual treatment for marketing and system alerts.
- `human-biases/banner-blindness.md` — General bias reference. Unique: right-sidebar avoidance, decades of ad-exposure context, "break ad conventions" with left-aligned text and subdued colors, full-width banners training users to dismiss all banners.
- **Survivor:** `human-biases/banner-blindness.md`
- **Merge strategy:** Add cognitive-load version's "test real usage" guideline and dismissible-for-non-dismissible anti-pattern. Delete the other.

### Set 4: Hick's Law / Decision Fatigue (semantic overlap with exact duplicates)
- Already handled in Exact Set 2 above.
- `behavioral-psychology/hicks-law-and-decision-fatigue.md` — Merges into the Hick's Law survivor.
- `cognitive-load/decision-fatigue-reduction.md` — **Remains separate.** Distinct focus on temporal ordering of decisions (front-load critical choices), not option count. Unique: "Place most consequential decisions at beginning of onboarding," "Defer optional customization to after core task," "Batch related minor decisions."

### Set 5: Working Memory / Short-Term Memory / Miller's Law
- `cognitive-load/working-memory-window.md` — Focused on the 3-4 item limit (Cowan's revised estimate). Guidelines on comparison limits, visible decision context, visual indicators for categorization offloading, summary sidebars during checkout.
- `reading-psychology/working-memory-constraints.md` — Same 3-4 item limit, reading-psychology frame. Unique: verification code auto-fill example, recognition over recall (dropdowns over open text), inline immediate validation, side-by-side comparison.
- `cognitive-psychology/short-term-memory-limits.md` — Same concept. Unique: enterprise tool domain complexity overhead, max 4 distinct status states, filter option count limit (10+).
- `cognitive-psychology/millers-law.md` — The 5-7 item chunking guideline (original Miller). Unique: form field sections of 5-7, nav menu groups of max 7, phone/account number formatting, chart attribute chunking.
- **Survivor:** `cognitive-load/working-memory-window.md`
- **Merge strategy:** Add reading-psychology's verification code example and recognition-over-recall guideline. Add cognitive-psychology/short-term-memory's enterprise domain complexity note and status-state limit. Miller's Law file should remain separate -- it addresses the 5-7 chunking principle for organizing information, while working-memory-window addresses the 3-4 active-manipulation limit. These are complementary but distinct concepts (organizing vs. holding in mind).
- **Exceptions:** `cognitive-psychology/millers-law.md` remains separate as the canonical Miller's Law (7+/-2 chunking) reference. It is related but addresses a different cognitive constraint.

### Set 6: Framing Effect
- `behavioral-psychology/framing-effects.md` — Application-focused. Unique: positive framing for adoption, negative for warnings, pricing in smallest unit, success vs. failure rate framing, consistency within comparison context.
- `human-biases/framing-effect.md` — General bias reference. Unique: absolute vs. relative terms guidance (use absolute when numbers impress, relative when percentages compel), dashboard positive vs. negative metric consciousness, testing different frames, anti-patterns on selective positive-only metrics and obscuring annual costs.
- **Also related:**
  - `behavioral-psychology/loss-aversion-framing.md` — Framing applied specifically to loss aversion. Will be merged into loss-aversion survivor (Set 1 above).
- **Survivor:** `human-biases/framing-effect.md`
- **Merge strategy:** Add behavioral-psychology version's adoption positive framing, warning negative framing, pricing unit guidance, and within-comparison consistency rule. Delete the other.

### Set 7: Gestalt Principles Outside gestalt/ Directory
- `reading-psychology/gestalt-principles.md` — Compact summary of proximity, similarity, enclosure, continuity, common region applied to reading/layout. Single anti-pattern on label proximity.
- `cognitive-psychology/gestalt-law-of-common-region.md` — Detailed treatment of common region principle. Action button association, filter group enclosure, nested common regions for hierarchy.
- `cognitive-psychology/gestalt-uniform-connectedness.md` — Detailed treatment of uniform connectedness. Workflow lines, org chart trees, stepper tracks, data flow diagrams.
- `cognitive-psychology/gestalt-law-of-similarity.md` — Detailed treatment of similarity. Interactive affordance consistency, card style for clickable vs. informational.
- `cognitive-psychology/law-of-praegnanz.md` — Detailed treatment of Praegnanz. Simplest visual form, icon complexity, color palette limits, flat vs. skeuomorphic.
- `layout-and-visual-hierarchy/proximity-creates-grouping.md` — Detailed treatment of proximity. Label-input adjacency, 2:1 inter/intra-group spacing ratio.
- **Analysis:** The `gestalt/` directory contains 50+ specialized files covering every Gestalt principle with specific application contexts (dashboards, forms, data viz, dark mode, responsive, etc.). The cognitive-psychology files cover the same principles but as standalone general-purpose references. The reading-psychology file is a compact overview.
- **Survivor per sub-concept:**
  - Common Region: `cognitive-psychology/gestalt-law-of-common-region.md` -- the gestalt/ directory has `common-region-dashboard-kpi.md` and `common-region-semantic-containers.md` which are context-specific applications, not duplicates.
  - Uniform Connectedness: `cognitive-psychology/gestalt-uniform-connectedness.md` -- gestalt/ has `uniform-connectedness-object-identity.md` (context-specific, keep).
  - Similarity: `cognitive-psychology/gestalt-law-of-similarity.md` -- gestalt/ has `similarity-consistent-visual-attributes.md`, `similarity-anti-pattern-buttons.md`, etc. (context-specific, keep).
  - Praegnanz: `cognitive-psychology/law-of-praegnanz.md` -- gestalt/ has `praegnanz-simplest-interpretation.md`, `praegnanz-dashboard-density.md`, `praegnanz-icon-design.md`, `praegnanz-progressive-disclosure.md` (context-specific, keep).
  - Proximity: `layout-and-visual-hierarchy/proximity-creates-grouping.md` -- gestalt/ has `proximity-spatial-density.md`, `proximity-anti-pattern-misalignment.md`, `proximity-responsive-design.md`, `form-field-chunking-proximity.md` (context-specific, keep).
  - General overview: `reading-psychology/gestalt-principles.md`
- **Merge strategy:** The cognitive-psychology and layout files serve as general-purpose principle references, while the gestalt/ directory files are context-specific applications. These are not duplicates -- they serve different roles (reference vs. applied context). **Keep all of them.** However, `reading-psychology/gestalt-principles.md` is a thin summary that doesn't add value beyond what the individual principle files cover. Delete it and rely on the individual files.
- **Exceptions:** All cognitive-psychology gestalt files and all gestalt/ directory files remain separate. Only `reading-psychology/gestalt-principles.md` is redundant.

### Set 8: Recognition Over Recall
- `cognitive-load/recognition-over-recall.md` — Titled "Minimize Memory Requirements." Guidelines: dropdowns over free-text, recent items/favorites, breadcrumbs, visible instructions, thumbnails/previews.
- `cognitive-psychology/recognition-rather-than-recall.md` — Same concept, slightly richer. Unique: autocomplete and suggestion lists, contextual help with placeholder examples, command palette showing full names alongside shortcuts, reference value display (not just IDs).
- **Survivor:** `cognitive-psychology/recognition-rather-than-recall.md`
- **Merge strategy:** Add cognitive-load version's breadcrumb/progress indicator guideline and "hiding all menu items behind a single icon" anti-pattern. Delete the other.

### Set 9: Cognitive Fluency / Processing Fluency
- `reading-psychology/cognitive-fluency.md` — Titled "Easy to Read = Easy to Trust." Reber and Schwarz research citation. Unique: trust connection, pricing/permissions/security clarity at trust-sensitive points, decorative vs. functional font distinction, sentence simplification at decision points.
- `human-biases/processing-fluency.md` — Same core concept. Unique: "conflating easy-to-understand with good-and-trustworthy" framing, novel navigation patterns sacrificing usability for novelty, inconsistent button styles anti-pattern.
- **Survivor:** `reading-psychology/cognitive-fluency.md`
- **Merge strategy:** Add human-biases version's inconsistent-patterns anti-pattern and novelty-over-usability anti-pattern. Delete the other.

### Set 10: Inattentional Blindness
- `human-biases/inattentional-blindness.md` — General bias reference. Invisible gorilla citation. Unique: "displaying information does not mean perceiving it," form validation at point of input, post-state-change reorientation cues.
- `cognitive-load/inattentional-blindness-mitigation.md` — Prevention-focused. Unique: escalating alerts (start subtle, become prominent if unacknowledged), motion/animation for genuinely important events only, background process results surfaced in focal area.
- **Survivor:** `human-biases/inattentional-blindness.md`
- **Merge strategy:** Add cognitive-load version's escalating alerts pattern and motion-for-important-only guideline. Delete the other.

### Set 11: Dual-Process / System 1 Design
- `cognitive-load/dual-process-design.md` — Titled "Route Routine Actions to System 1." Unique: keyboard shortcuts for repeated workflows, matching interaction mode to stakes/frequency, consistent placement for muscle memory, explicit friction tiers (confirmation, type-to-confirm, undo).
- `behavioral-psychology/system-1-design.md` — Titled "Reducing Cognitive Load for Intuitive UIs." Unique: Kahneman attribution, "standard UI patterns and conventional layouts," "originality in layout forces System 2," visual affordances, reduce options to eliminate unnecessary System 2 analysis.
- **Survivor:** `cognitive-load/dual-process-design.md`
- **Merge strategy:** Add behavioral-psychology version's "standard patterns" guideline, "originality forces System 2" framing, and visual affordances point. Delete the other.

### Set 12: Present Bias / Hyperbolic Discounting
- `human-biases/present-bias.md` — Focused on the systematic preference for current state over improvement. Unique: automate beneficial actions, commitment devices, immediate feedback for future-oriented actions, "indefinitely postpone" anti-pattern.
- `behavioral-psychology/present-bias-and-immediate-value-delivery.md` — Focused specifically on onboarding. Unique: deliver value in first 2-5 minutes, templates/sample data for immediate experience, identify "aha moment" and engineer shortest path, "See your analytics now" vs "Track performance over time."
- `human-biases/hyperbolic-discounting.md` — Same underlying concept but emphasizes temporal discounting curve. Unique: "free trial that starts immediately over better deal with waiting period," skip 30-second security setup, "now > soon > later" gradient, real-time previews during setup.
- **Survivor:** `human-biases/present-bias.md`
- **Merge strategy:** Add behavioral-psychology's onboarding-specific guidance (first 2-5 minutes, templates, aha moment). Add hyperbolic-discounting's temporal gradient framing and "preview during setup" guideline. Delete the other two.
- **Exceptions:** None. All three describe the same cognitive bias with different application lenses.

### Set 13: Status Quo Bias / Default Effect
- `behavioral-psychology/status-quo-bias-and-strategic-default-settings.md` — Focused on default selection as a design decision. Unique: 70-90% statistic on users never changing defaults, "recommended/most popular" labels, audit defaults as user base evolves.
- `human-biases/default-effect.md` — Same concept, general framing. Unique: "defaults are policy" framing, smart defaults that adapt by context (locale, device, usage), double-negative opt-out language anti-pattern, "burying option to change defaults" anti-pattern.
- **Survivor:** `human-biases/default-effect.md`
- **Merge strategy:** Add behavioral-psychology version's 70-90% statistic, audit-defaults-regularly guideline, and "recommended" label guidance. Delete the other.

### Set 14: Choice Overload / Paradox of Choice (semantic overlap with exact duplicates)
- Already handled in Exact Set 7 above.
- `behavioral-psychology/paradox-of-choice.md` merges into `cognitive-psychology/choice-overload.md`.

### Set 15: Visual Hierarchy (borderline -- multiple distinct angles)
- `reading-psychology/visual-hierarchy.md` — Reading order through size/weight/contrast. Squint test.
- `cognitive-load/visual-hierarchy-cognitive-load.md` — Hierarchy as cognitive load reducer. Type scale limits, color parsimony.
- `layout-and-visual-hierarchy/visual-hierarchy-through-grouping-and-weight.md` — Grouping + weight combined approach. 3-4 visual layers, enclosure, alignment, button weight tiers.
- `layout-and-visual-hierarchy/visual-hierarchy-type-scale.md` — (Not read; likely type-scale specific.)
- **Analysis:** These are the same concept from three angles. The overlap is heavy but each adds genuinely different guidelines.
- **Survivor:** `layout-and-visual-hierarchy/visual-hierarchy-through-grouping-and-weight.md`
- **Merge strategy:** Add reading-psychology's reading-order and squint-test guidance. Add cognitive-load's type-scale limit and color parsimony rules. Delete the other two. Check `visual-hierarchy-type-scale.md` before final merge -- if it covers type scale specifically, keep it separate.

---

## Summary

- Total exact duplicate sets: **12**
- Total semantic duplicate sets: **15** (3 overlap with exact sets)
- Unique duplicate/overlap sets: **15**
- Files to delete: **35**
  - Exact duplicates to delete: 16 (non-survivors from 12 sets)
  - Semantic duplicates to delete: 19 (non-survivors from 15 semantic sets, minus overlaps)
- Files to keep (as merged survivors): **15**
- Files to remain separate (false duplicates): **11**
  - `navigation-and-information-architecture/progressive-disclosure-for-complex-feature-sets.md`
  - `gestalt/praegnanz-progressive-disclosure.md`
  - `cognitive-load/decision-fatigue-reduction.md`
  - `cognitive-psychology/millers-law.md`
  - `cognitive-psychology/chunk-content-into-visually-distinct-groups.md`
  - `cognitive-psychology/gestalt-law-of-common-region.md`
  - `cognitive-psychology/gestalt-uniform-connectedness.md`
  - `cognitive-psychology/gestalt-law-of-similarity.md`
  - `cognitive-psychology/law-of-praegnanz.md`
  - `layout-and-visual-hierarchy/proximity-creates-grouping.md`
  - `gamification/progress-visualization-with-zeigarnik-effect.md`
  - `workflow-and-multi-step/zeigarnik-effect-persist-incomplete-tasks.md`

---

## Deletion Checklist (files to remove after merging content into survivors)

### From exact-filename duplicates:
1. `cognitive-load/progressive-disclosure.md`
2. `reading-psychology/progressive-disclosure.md`
3. `cognitive-load/hicks-law.md`
4. `feedback-and-error-handling/change-blindness.md`
5. `cognitive-load/change-blindness-prevention.md`
6. `feedback-and-error-handling/peak-end-rule.md`
7. `human-biases/peak-end-rule.md`
8. `reading-psychology/serial-position-effect.md`
9. `human-biases/serial-position-effect.md`
10. `human-biases/von-restorff-effect.md`
11. `human-biases/choice-overload.md`
12. `reading-psychology/chunking.md`
13. `human-biases/endowment-effect.md`
14. `cognitive-psychology/goal-gradient-effect.md`
15. `reading-psychology/fittss-law.md`
16. `human-biases/zeigarnik-effect.md`

### From semantic duplicates:
17. `behavioral-psychology/loss-aversion-engineering.md`
18. `behavioral-psychology/loss-aversion-framing.md`
19. `behavioral-psychology/social-proof-patterns.md`
20. `cognitive-load/banner-blindness-prevention.md`
21. `behavioral-psychology/hicks-law-and-decision-fatigue.md`
22. `reading-psychology/working-memory-constraints.md`
23. `cognitive-psychology/short-term-memory-limits.md`
24. `behavioral-psychology/framing-effects.md`
25. `reading-psychology/gestalt-principles.md`
26. `cognitive-load/recognition-over-recall.md`
27. `human-biases/processing-fluency.md`
28. `cognitive-load/inattentional-blindness-mitigation.md`
29. `behavioral-psychology/system-1-design.md`
30. `behavioral-psychology/present-bias-and-immediate-value-delivery.md`
31. `human-biases/hyperbolic-discounting.md`
32. `behavioral-psychology/status-quo-bias-and-strategic-default-settings.md`
33. `behavioral-psychology/paradox-of-choice.md`
34. `reading-psychology/visual-hierarchy.md`
35. `cognitive-load/visual-hierarchy-cognitive-load.md`
