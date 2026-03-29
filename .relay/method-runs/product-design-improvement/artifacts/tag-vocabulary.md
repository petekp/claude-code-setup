# Tag Vocabulary for Product-Design Skill

Controlled vocabulary for enriching 486 practice files with searchable, cross-cutting metadata. Designed for agent retrieval: when a developer describes what they are building, tags enable fast filtering to the most relevant practices.

---

## Domain Tags (22)

Tags describing what UI element, pattern, or product area a practice applies to.

| Tag | Definition | Example files |
|---|---|---|
| `form` | Form fields, inputs, validation, and data entry flows | appropriate-control-selection-for-form-inputs, inline-validation, smart-defaults-in-forms-and-configuration |
| `table` | Data tables, grids, column management, row actions, and tabular display | column-management-for-comparison-work, virtual-scrolling-for-large-datasets, inline-editing-with-friction-calibration |
| `navigation` | Sidebars, menus, breadcrumbs, tabs used for wayfinding, and information architecture | active-state-visibility-in-navigation, three-level-navigation, left-side-vertical-navigation |
| `search` | Search fields, autocomplete, faceted search, filters, and sort | autocomplete-and-autosuggestion-in-search, saved-filters-and-search-views, global-search-with-federated-results |
| `dashboard` | KPI displays, metrics cards, data visualizations, and monitoring views | alert-and-threshold-based-notifications, dashboard-information-hierarchy, sparklines-for-inline-trend-visualization |
| `modal` | Dialogs, confirmation prompts, and blocking overlays | modals, keyboard-navigable-modals, confirmation-dialogs-for-destructive-actions |
| `notification` | Toasts, alerts, badges, banners, and notification centers | toast-notifications, notification-center, unified-notification-and-feedback-system |
| `tooltip` | Tooltips, popovers, hover details, and contextual help overlays | tooltips, popovers, dashboard-hover-tooltips-for-contextual-detail-on-demand |
| `sidebar` | Side panels, slide-overs, and drawer patterns | nonmodal-side-panels, slide-over-panels, contextual-help-for-this-page |
| `button` | Buttons, CTAs, toggle switches, and clickable action targets | benefit-oriented-cta-labels, sticky-primary-ctas, toggle-switch |
| `list` | Lists, feeds, item collections, and scrollable item sets | pagination-vs-infinite-scroll-choose-by-task-type, scannable-lists, continuation-infinite-scroll |
| `card` | Card components, KPI tiles, and bounded content containers | card-component-anatomy-for-dashboard-kpis, tables-over-cards-for-dense-multi-variate-data, common-region-dashboard-kpi |
| `layout` | Page structure, grids, spacing, visual hierarchy, and spatial organization | 8pt-grid-spatial-system, master-detail-layout, resizable-split-pane-layout |
| `empty-state` | Zero-data screens, first-run experiences, and inbox-zero states | celebratory-empty-states, empty-states-communicate-system-status, first-run-experience-pre-populated-samples |
| `onboarding` | Product tours, progressive onboarding, first-use guidance, and setup flows | skippable-optional-product-tours, progressive-onboarding, role-based-onboarding-flows |
| `wizard` | Multi-step flows, steppers, and linear task sequences | wizard-step-indicators, self-sufficient-wizard-steps, wizards-for-novice-users |
| `toolbar` | Toolbars, action bars, ribbon menus, and contextual action surfaces | contextual-toolbar-actions, quick-access-toolbar, toolbars-frequency-context-grouping |
| `drag-drop` | Drag-and-drop reordering, reparenting, and direct manipulation of position | visible-drag-affordances-and-drop-zone-feedback, keyboard-accessible-drag-and-drop, common-fate-drag-and-drop |
| `icon` | Icons, badges, visual indicators, and symbolic representations | invariance-cross-platform-icons, praegnanz-icon-design, closure-icon-logo-design |
| `data-viz` | Charts, sparklines, treemaps, and graphical data representations | data-visualization-accessibility, treemap-for-hierarchical-quantitative-data, common-fate-animated-data-viz |
| `settings` | Configuration screens, preferences, permissions, and admin panels | hierarchical-settings-architecture, visual-density-control, dashboard-customization-and-personalization |
| `text` | Typography, microcopy, labels, headings, and written content in UI | typographic-scale-principles, layer-cake-scanning, microcopy |

## Concern Tags (18)

Tags describing what cross-cutting quality or technical concern a practice addresses.

| Tag | Definition | Example files |
|---|---|---|
| `accessibility` | WCAG compliance, screen readers, ARIA, color-blind safety, and inclusive interaction | color-contrast, visible-focus-indicators, semantic-html-and-aria-roles |
| `keyboard` | Keyboard navigation, shortcuts, focus management, and non-mouse interaction | comprehensive-keyboard-shortcut-system, full-keyboard-accessibility, keyboard-navigation-tab-focus |
| `performance` | Render speed, DOM efficiency, perceived speed, and technical responsiveness | virtual-scrolling-for-large-datasets, doherty-threshold, performance-budgeting-for-data-heavy-interfaces |
| `loading` | Loading states, skeleton screens, spinners, progress bars, and wait-time UX | skeleton-screens-for-full-page-loads, spinners-for-short-loading-states, perceived-progress-reduces-frustration |
| `error-handling` | Error messages, validation failures, recovery paths, and graceful degradation | inline-error-messages, error-messages-plain-language-with-constructive-solutions, graceful-degradation-for-network-errors |
| `validation` | Input validation, inline checking, constraint enforcement, and error prevention | inline-validation, error-prevention, postels-law |
| `responsive` | Screen-size adaptation, density switching, and layout flexibility across viewports | proximity-responsive-design, similarity-responsive-touch-targets, responsive-layout-for-enterprise-desktop |
| `animation` | Motion design, transitions, micro-interactions, and reduced-motion support | prefers-reduced-motion, subtle-micro-animations-for-live-data-updates, transitions-and-animations |
| `theming` | Dark mode, color tokens, white-labeling, and visual customization systems | dark-mode-dark-gray-not-pure-black, semantic-color-tokens-dark-mode, white-label-theme-customization |
| `mobile` | Touch targets, mobile layouts, and small-screen adaptations | mobile-aware-layouts-field-workers, minimum-target-size, similarity-responsive-touch-targets |
| `i18n` | Internationalization, locale formats, and cross-cultural design considerations | consistent-date-number-formatting, match-between-system-and-real-world |
| `data-density` | Information density, compact vs. spacious display, and expert-oriented layouts | high-information-density-for-experts, row-density-controls, three-level-density-system-for-tables-and-lists |
| `real-time` | Live data, streaming updates, presence indicators, and concurrent editing | data-freshness-indicators, presence-indicators-for-collaborative-editing, pause-freeze-option-for-live-data-streams |
| `collaboration` | Multi-user editing, shared views, approval chains, and team workflows | version-history-for-collaborative-content, delegation-and-backup-approvers, approval-status-visualization |
| `bulk-actions` | Multi-select, batch operations, and operating on many items at once | bulk-actions-for-power-users, cross-page-bulk-selection, eligibility-transparency-bulk-actions |
| `permissions` | Role-based access, permission-aware UI, and authorization visibility | permission-based-ui-rendering, role-resource-action-permission-matrix, graceful-permission-denial |
| `undo` | Reversibility, undo/redo, soft delete, and safe exploration | user-control-and-freedom-undo-over-confirmation, soft-delete-trash-pattern, context-aware-undo-scope |
| `enterprise` | B2B-specific concerns: multi-tenancy, audit trails, white-labeling, and admin patterns | tenant-isolation-and-context-clarity, comprehensive-audit-trail-architecture, admin-panel-multi-column-interface |

## Principle Tags (14)

Tags identifying the foundational cognitive or design principle a practice embodies.

| Tag | Definition | Example files |
|---|---|---|
| `cognitive-load` | Reducing mental effort through simplification, chunking, or offloading | working-memory-window, chunking, eliminate-extraneous-load |
| `fitts-law` | Target size and distance optimization for pointing/clicking | fittss-law, minimum-target-size, sticky-primary-ctas |
| `hicks-law` | Decision time increases with the number and complexity of choices | hicks-law, choice-overload, paradox-of-choice |
| `gestalt` | Perceptual grouping principles: proximity, similarity, closure, continuity, common fate | form-field-chunking-proximity, similarity-consistent-visual-attributes, figure-ground-focal-layers |
| `progressive-disclosure` | Reveal complexity gradually, showing only what is needed at each stage | progressive-disclosure, praegnanz-progressive-disclosure, accordion |
| `affordance` | Making interactivity visually self-evident through cues and signifiers | affordance-clarity, affordances, disabled-state-design-with-explanatory-tooltips |
| `feedback-loop` | Immediate system response to user action, closing the action-result gap | visibility-of-system-status, micro-interaction-feedback, feedback-loops-and-immediate-reinforcement |
| `mental-model` | Aligning the interface with how users think about their task and domain | implementation-model-vs-mental-model, mental-model-alignment, match-between-system-and-real-world |
| `recognition` | Leveraging recognition memory over recall to reduce cognitive effort | recognition-over-recall, recognition-rather-than-recall, exposing-options-vs-hiding-in-dropdowns |
| `consistency` | Using uniform patterns so users can transfer learning across the product | consistency-and-standards, jakobs-law, pattern-recognition-and-ui-consistency |
| `direct-manipulation` | Users act on objects directly rather than through abstract commands | direct-manipulation, inline-editing-with-friction-calibration, visible-drag-affordances-and-drop-zone-feedback |
| `scanning` | Optimizing for how users visually scan rather than read interfaces | f-pattern-scanning, z-pattern-layout, design-for-scanning |
| `trust` | Building user confidence through transparency, polish, and predictability | visual-appearance-determines-initial-trust, aesthetic-usability-effect, affect-heuristic |
| `motivation` | Leveraging psychological drivers: progress, autonomy, completion, and reward | zeigarnik-effect, goal-gradient-effect, autonomy-design |

---

## Priority Criteria

### `core` (target: 60-80 files)

Practices every developer building a software interface should know. These apply broadly across most UI work regardless of domain, product type, or user sophistication.

**Inclusion criteria (meet at least 2):**
- Applies to nearly every screen or interaction pattern (buttons, forms, navigation, feedback)
- Violating it causes measurable usability failures in testing
- Referenced by a Nielsen heuristic, WCAG guideline, or foundational design law
- A developer who ignores this will ship broken or hostile UX

**Examples:**
- `visible-focus-indicators` -- every interactive element needs this
- `affordance-clarity` -- universal, applies to all clickable/interactive elements
- `visibility-of-system-status` -- Nielsen's first heuristic, applies everywhere
- `color-contrast` -- WCAG requirement, affects all text
- `inline-error-messages` -- every form needs this
- `progressive-disclosure` -- fundamental technique for managing complexity

### `situational` (target: 200-260 files)

Valuable practices that apply when building a specific kind of UI, handling a specific interaction pattern, or addressing a specific user context. A developer needs these when they encounter the relevant situation.

**Inclusion criteria (meet at least 1):**
- Applies to a specific component type, workflow pattern, or product domain
- Requires a particular technical context to be relevant (tables, dashboards, wizards, etc.)
- Important for a specific user segment (enterprise, mobile, expert) but not universal

**Examples:**
- `virtual-scrolling-for-large-datasets` -- only when you have 200+ rows
- `approval-status-visualization` -- only when building approval workflows
- `white-label-theme-customization` -- only for B2B SaaS with branding needs
- `saved-filters-and-search-views` -- only for data-heavy search/filter UIs
- `three-level-navigation` -- only for complex multi-section applications

### `niche` (target: 120-160 files)

Specialized, theoretical, or narrow-application practices. These are the deep-dive material: named cognitive biases, gestalt micro-patterns, academic psychology principles, and highly specific interaction details.

**Inclusion criteria (meet at least 1):**
- Describes a named psychological bias or academic concept with narrow direct application
- Addresses a rare interaction pattern or edge case
- Primarily theoretical/explanatory rather than directly actionable
- Useful for understanding *why* other practices work, but rarely the first thing to reach for

**Examples:**
- `zero-risk-bias` -- named bias, useful to understand but rarely directly actionable
- `weber-fechner-law` -- academic perception principle
- `gestalt-anti-pattern-dark-pattern` -- niche ethical analysis of gestalt misuse
- `zeigarnik-effect` -- named effect, the *practices* that leverage it are situational, but the theory itself is niche
- `neumorphism-contrast-failure` -- specific to one visual style trend

---

## Enriched Frontmatter Schema

```yaml
---
title: "Human-readable title of the practice"
category: Original Category Name
tags:
  - domain-tag-1       # 1-3 domain tags (what UI element/pattern)
  - concern-tag-1      # 1-3 concern tags (what cross-cutting quality)
  - principle-tag-1    # 0-2 principle tags (what foundational concept)
priority: core | situational | niche
applies_when: >-
  1-2 sentence natural-language description of when a developer should
  reach for this practice. Written as a trigger condition.
---
```

**Field rules:**
- `tags`: 3-7 tags total. At least one domain tag. At least one concern or principle tag. Order: domain tags first, then concern tags, then principle tags.
- `priority`: Exactly one of `core`, `situational`, `niche`. Use the criteria above.
- `applies_when`: Written from the developer's perspective. Start with "You are..." or "The interface..." or a conditional like "When...". Should be specific enough to match against a task description.

---

## Test Enrichments

Ten diverse files with complete enriched frontmatter, proving the schema works consistently across categories.

### 1. color-contrast.md (Accessibility)

```yaml
---
title: Color Contrast — Minimum 4.5:1 for Normal Text
category: Accessibility
tags:
  - text
  - accessibility
  - theming
priority: core
applies_when: >-
  You are placing text on any background color, designing a color palette
  or theme, or auditing an interface for WCAG compliance.
---
```

### 2. visible-drag-affordances-and-drop-zone-feedback.md (Interaction Patterns)

```yaml
---
title: Visible Drag Affordances and Drop Zone Feedback
category: Interaction Patterns
tags:
  - drag-drop
  - accessibility
  - keyboard
  - affordance
  - direct-manipulation
priority: situational
applies_when: >-
  You are implementing drag-and-drop reordering, reparenting, or any
  direct manipulation where users move objects by dragging them.
---
```

### 3. virtual-scrolling-for-large-datasets.md (Data Display & Tables)

```yaml
---
title: Virtual Scrolling for Large Datasets
category: Data Display & Tables
tags:
  - table
  - list
  - performance
  - accessibility
priority: situational
applies_when: >-
  The interface displays a scrollable list or table with more than
  200 rows and pagination is not appropriate for the workflow.
---
```

### 4. visibility-of-system-status.md (Feedback & Error Handling)

```yaml
---
title: Visibility of System Status
category: Feedback & Error Handling
tags:
  - notification
  - loading
  - feedback-loop
  - consistency
priority: core
applies_when: >-
  You are designing any interaction where the user triggers an operation
  and needs to know whether it is in progress, succeeded, or failed.
---
```

### 5. zero-risk-bias.md (Human Biases)

```yaml
---
title: Zero-Risk Bias
category: Human Biases in Interfaces
tags:
  - settings
  - trust
  - motivation
priority: niche
applies_when: >-
  You are writing pricing copy, security guarantees, or feature
  comparisons where users evaluate risk trade-offs between options.
---
```

### 6. three-level-navigation.md (Navigation & Information Architecture)

```yaml
---
title: "Three-Level Navigation: Global / Contextual / Local"
category: Navigation & Information Architecture
tags:
  - navigation
  - sidebar
  - layout
  - consistency
  - mental-model
priority: situational
applies_when: >-
  You are designing the navigation structure for a complex application
  with multiple sections, each containing sub-areas and page-level views.
---
```

### 7. smart-defaults-in-forms-and-configuration.md (Forms & Input)

```yaml
---
title: Smart Defaults in Forms and Configuration
category: Forms & Input
tags:
  - form
  - settings
  - cognitive-load
  - recognition
priority: core
applies_when: >-
  You are designing any form, configuration screen, or setup flow where
  fields have a predictable most-common value.
---
```

### 8. master-detail-layout.md (Desktop-Specific)

```yaml
---
title: Master-Detail Side-by-Side Layout
category: Desktop-Specific Patterns
tags:
  - layout
  - sidebar
  - list
  - keyboard
  - scanning
priority: situational
applies_when: >-
  You are building a desktop interface where users browse a collection
  and review individual item details in a triage or review workflow.
---
```

### 9. gestalt-anti-pattern-dark-pattern.md (Gestalt Principles)

```yaml
---
title: "Gestalt Anti-Pattern: Similarity Exploited as a Dark Pattern"
category: Gestalt Principles
tags:
  - button
  - modal
  - gestalt
  - trust
priority: niche
applies_when: >-
  You are reviewing an interface for ethical design issues, or auditing
  opt-in/opt-out flows where visual styling may bias user choices.
---
```

### 10. eligibility-transparency-bulk-actions.md (Workflow & Multi-Step)

```yaml
---
title: Eligibility Transparency in Bulk Actions
category: Workflow & Multi-Step Processes
tags:
  - table
  - bulk-actions
  - error-handling
  - feedback-loop
priority: situational
applies_when: >-
  You are implementing a bulk action on a selection of items where
  some items may be ineligible due to state, permissions, or constraints.
---
```

---

## Tag Coverage Estimates

Rough expected usage counts per tag across 486 files (based on sampling). Every tag exceeds the 5-file minimum threshold.

### Domain Tags
| Tag | Est. files | Primary categories |
|---|---|---|
| `form` | 25-35 | forms-and-input, cognitive-load, validation-related |
| `table` | 30-40 | data-display-and-tables, enterprise-and-b2b |
| `navigation` | 25-35 | navigation-and-information-architecture, desktop-specific |
| `search` | 15-20 | search-filter-and-sort, navigation |
| `dashboard` | 25-35 | dashboard-design, data-viz, enterprise |
| `modal` | 10-15 | component-patterns, feedback, gestalt |
| `notification` | 15-25 | feedback-and-error-handling, component-patterns |
| `tooltip` | 8-12 | component-patterns, onboarding, enterprise |
| `sidebar` | 10-15 | component-patterns, desktop-specific, navigation |
| `button` | 15-25 | interaction-patterns, layout, gestalt |
| `list` | 15-20 | data-display, reading-psychology, component-patterns |
| `card` | 8-12 | dashboard-design, gestalt, layout |
| `layout` | 30-40 | layout-and-visual-hierarchy, design-systems, desktop-specific |
| `empty-state` | 8-12 | onboarding-and-empty-states |
| `onboarding` | 15-20 | onboarding-and-empty-states, behavioral-psychology |
| `wizard` | 12-18 | workflow-and-multi-step |
| `toolbar` | 8-12 | desktop-specific |
| `drag-drop` | 6-10 | interaction-patterns, gestalt |
| `icon` | 8-12 | gestalt, design-systems |
| `data-viz` | 10-15 | dashboard-design, gestalt, data-display |
| `settings` | 12-18 | enterprise-and-b2b, desktop-specific |
| `text` | 20-30 | reading-psychology, design-systems, accessibility |

### Concern Tags
| Tag | Est. files |
|---|---|
| `accessibility` | 30-45 |
| `keyboard` | 15-25 |
| `performance` | 10-15 |
| `loading` | 10-15 |
| `error-handling` | 20-30 |
| `validation` | 10-15 |
| `responsive` | 8-12 |
| `animation` | 12-18 |
| `theming` | 10-15 |
| `mobile` | 6-10 |
| `i18n` | 5-8 |
| `data-density` | 10-15 |
| `real-time` | 8-12 |
| `collaboration` | 8-12 |
| `bulk-actions` | 8-12 |
| `permissions` | 8-12 |
| `undo` | 8-12 |
| `enterprise` | 20-30 |

### Principle Tags
| Tag | Est. files |
|---|---|
| `cognitive-load` | 40-60 |
| `fitts-law` | 8-12 |
| `hicks-law` | 8-12 |
| `gestalt` | 50-60 |
| `progressive-disclosure` | 15-25 |
| `affordance` | 10-18 |
| `feedback-loop` | 15-25 |
| `mental-model` | 15-25 |
| `recognition` | 10-15 |
| `consistency` | 15-25 |
| `direct-manipulation` | 8-12 |
| `scanning` | 20-30 |
| `trust` | 15-25 |
| `motivation` | 12-18 |
