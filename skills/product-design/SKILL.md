---
name: product-design
description: >
  Expert product design knowledge for software interfaces — 451 practices across 25 categories,
  each with tags, priority (core/situational/niche), and applies_when metadata for precise retrieval.
  Use this skill whenever the user is designing, reviewing, building, or discussing any part of a
  software interface. This includes: building forms or input flows, designing dashboards or data tables,
  choosing UI components (modals vs. sidebars, tabs vs. accordions, toggles vs. checkboxes), planning
  navigation or information architecture, handling errors and feedback, designing onboarding or empty
  states, building enterprise/B2B admin panels, creating design systems, implementing accessibility,
  optimizing perceived performance, designing search/filter/sort, building multi-step workflows or
  wizards, or reviewing existing designs for usability issues. Also trigger when the user asks about
  design best practices, UX heuristics, cognitive load, Gestalt principles, Fitts's Law, Hick's Law,
  or any named design principle. Even if the user doesn't explicitly say "design" — if they're building
  UI and making layout, component, or interaction decisions, this skill applies.
---

# Product Design Knowledge Base

451 expert practices across 25 categories, grounded in established research and proven patterns. Each practice includes `tags`, `priority` (core/situational/niche), and `applies_when` frontmatter for precise retrieval. Match the user's situation to the router below, read the starter files, then explore the full category directory for deeper guidance.

## How to Use This Skill

1. Match the user's design situation to the router table below
2. Read the 3-4 starter files listed for that situation
3. Use Glob to explore the full category directory when deeper guidance is needed (e.g., `practices/forms-and-input/*.md`)
4. Use `priority` metadata to pick files when many match: **core** (read first) > **situational** > **niche**
5. When a situation spans multiple categories, use Grep across `practices/` to find cross-cutting practices by searching `applies_when` or `tags` in frontmatter

Every practice file includes `tags`, `priority`, and `applies_when` in its YAML frontmatter for targeted retrieval.

## Design Situation Router

| Situation | Directory | Key Starter Files |
|---|---|---|
| Form design | `practices/forms-and-input/` | `single-column-form-layouts-and-logical-field-sequencing.md`, `never-use-placeholder-text-as-label-substitute.md`, `inline-validation.md` |
| Dashboard | `practices/dashboard-design/` | `design-dashboards-around-user-goals.md`, `data-ink-ratio-and-anti-clutter.md`, `preattentive-attributes-for-fast-visual-processing-in-dashboards.md` |
| Data table | `practices/data-display-and-tables/` | `data-tables-support-all-four-core-user-tasks.md`, `frozen-headers-and-visual-anchors-in-large-tables.md`, `correct-data-alignment-in-tables.md` |
| Error handling | `practices/feedback-and-error-handling/` | `error-severity-categorization.md`, `inline-error-messages.md`, `graceful-degradation-for-network-errors.md` |
| Navigation / IA | `practices/navigation-and-information-architecture/` | `three-level-navigation.md`, `left-side-vertical-navigation.md`, `deep-linking-and-url-state-persistence.md` |
| Onboarding | `practices/onboarding-and-empty-states/` | `empty-states-communicate-system-status.md`, `first-run-experience-pre-populated-samples.md`, `progressive-onboarding.md` |
| Component selection | `practices/component-patterns/` | `modals.md`, `tooltips.md`, `nonmodal-side-panels.md`, `combobox-autocomplete.md` |
| AI features | `practices/interaction-patterns/` | `human-in-the-loop-copilot-pattern.md`, `appropriate-friction-for-ai-powered-actions.md`, `ai-suggestion-autocomplete-ghost-text.md`, `transparency-about-ai-limitations.md` |
| Interaction design | `practices/interaction-patterns/` | `affordances.md`, `direct-manipulation.md`, `design-every-interactive-state.md`, `undo-enables-exploration.md` |
| Enterprise / B2B | `practices/enterprise-and-b2b/` | `role-based-interface-adaptation.md`, `permission-based-ui-rendering.md`, `bulk-actions-for-power-users.md`, `hierarchical-settings-architecture.md` |
| Design system | `practices/design-systems-and-tokens/` | `8pt-grid-spatial-system.md`, `three-layer-design-token-architecture.md`, `typographic-scale-principles.md` |
| Search / filter | `practices/search-filter-and-sort/` | `faceted-search-show-filters-and-results-simultaneously.md`, `autocomplete-and-autosuggestion-in-search.md`, `saved-filters-and-search-views.md` |
| Wizard / workflow | `practices/workflow-and-multi-step/` | `wizards-for-novice-users.md`, `wizard-step-indicators.md`, `conditional-branching-workflows.md` |
| Loading states | `practices/loading-and-performance/` | `skeleton-screens-for-full-page-loads.md`, `doherty-threshold.md`, `progress-bars-for-deterministic-operations.md` |
| Desktop app | `practices/desktop-specific/` | `master-detail-layout.md`, `comprehensive-keyboard-shortcut-system.md`, `sovereign-posture-full-attention-apps.md` |
| Accessibility | `practices/accessibility/` | `semantic-html-and-aria-roles.md`, `full-keyboard-accessibility.md`, `color-contrast.md`, `visible-focus-indicators.md` |
| Visual layout | `practices/layout-and-visual-hierarchy/` | `visual-hierarchy-through-grouping-and-weight.md`, `proximity-creates-grouping.md`, `avoid-visual-clutter.md` |
| Gestalt principles | `practices/gestalt/` | `figure-ground-focal-layers.md`, `proximity-spatial-density.md`, `similarity-consistent-visual-attributes.md`, `praegnanz-simplest-interpretation.md` |
| Cognitive load | `practices/cognitive-load/` | `eliminate-extraneous-load.md`, `chunking.md`, `split-attention-effect.md`, `working-memory-window.md` |
| Reading / scanning | `practices/reading-psychology/` | `layer-cake-scanning.md`, `optimal-line-length.md`, `f-pattern-scanning.md`, `plain-language.md` |
| Cognitive psychology | `practices/cognitive-psychology/` | `millers-law.md`, `build-mental-models-through-consistent-pattern-reuse.md`, `hicks-law.md` |
| Human biases | `practices/human-biases/` | `default-effect.md`, `loss-aversion.md`, `anchoring-bias.md`, `framing-effect.md` |
| Persuasion / engagement | `practices/behavioral-psychology/` | `goal-gradient-effect.md`, `nudge-theory-and-choice-architecture.md`, `aesthetic-usability-effect.md` |
| Gamification | `practices/gamification/` | `flow-state-design.md`, `immediate-feedback-loops-and-celebratory-micro-interactions.md`, `progress-visualization-with-zeigarnik-effect.md` |
| Usability heuristics | `practices/usability-heuristics/` | `nielsens-10-usability-heuristics.md`, `user-control-and-freedom-undo-over-confirmation.md`, `match-between-system-and-real-world.md` |
| Cross-cutting concerns | `practices/cross-cutting/` | `goal-directed-design.md`, `teslers-law-absorb-complexity.md`, `design-for-perpetual-intermediate.md`, `inclusive-design.md` |

## All Categories

| Category | Directory | File Count |
|---|---|---|
| Human Biases | `practices/human-biases/` | 32 |
| Gestalt Principles | `practices/gestalt/` | 52 |
| Cognitive Load | `practices/cognitive-load/` | 23 |
| Reading Psychology | `practices/reading-psychology/` | 21 |
| Behavioral Psychology | `practices/behavioral-psychology/` | 13 |
| Gamification | `practices/gamification/` | 4 |
| Forms & Input | `practices/forms-and-input/` | 14 |
| Feedback & Error Handling | `practices/feedback-and-error-handling/` | 18 |
| Interaction Patterns | `practices/interaction-patterns/` | 32 |
| Layout & Visual Hierarchy | `practices/layout-and-visual-hierarchy/` | 13 |
| Onboarding & Empty States | `practices/onboarding-and-empty-states/` | 12 |
| Navigation & IA | `practices/navigation-and-information-architecture/` | 16 |
| Loading & Performance | `practices/loading-and-performance/` | 8 |
| Cognitive Psychology | `practices/cognitive-psychology/` | 17 |
| Component Patterns | `practices/component-patterns/` | 18 |
| Accessibility | `practices/accessibility/` | 11 |
| Dashboard Design | `practices/dashboard-design/` | 19 |
| Data Display & Tables | `practices/data-display-and-tables/` | 20 |
| Desktop-Specific | `practices/desktop-specific/` | 23 |
| Enterprise & B2B | `practices/enterprise-and-b2b/` | 33 |
| Design Systems & Tokens | `practices/design-systems-and-tokens/` | 9 |
| Search, Filter & Sort | `practices/search-filter-and-sort/` | 11 |
| Workflow & Multi-Step | `practices/workflow-and-multi-step/` | 20 |
| Usability Heuristics | `practices/usability-heuristics/` | 4 |
| Cross-Cutting | `practices/cross-cutting/` | 8 |
