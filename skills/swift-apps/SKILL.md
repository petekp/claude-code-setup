---
name: swift-apps
description: Build, refactor, review, and debug native Apple-platform software in Swift. Use when working on `.swift` files, SwiftUI views, Observation-based state, `@Bindable` and binding flow, SwiftData-backed UI, scenes and windows, search/navigation structures, UIKit/AppKit interop, Liquid Glass adoption, macOS-native UX, or SwiftUI performance/accessibility. Trigger on requests to create or polish iOS, iPadOS, macOS, or visionOS features; clean up SwiftUI view structure; diagnose jank or invalidation storms; review app quality; or make a feature feel like a good Apple-platform citizen.
---

# Swift Apps

Engineer native-feeling Apple-platform software with SwiftUI-first patterns, clear state ownership, platform fidelity, accessibility, and performance discipline.
Default to direct, readable code that works with Apple frameworks instead of layering web-style abstractions onto SwiftUI.

## Choose The Track

- **New feature or screen**: Define the target platform, app archetype, primary action, core states, navigation model, and data ownership before writing code. Then load [references/architecture-and-state.md](references/architecture-and-state.md) and [references/ui-patterns.md](references/ui-patterns.md).
- **Refactor or cleanup**: Preserve behavior, simplify structure, reduce indirection, and make state ownership obvious. Then load [references/architecture-and-state.md](references/architecture-and-state.md).
- **Bug fix**: Reproduce first with a failing test when the project has a workable test harness. Enumerate 2-3 hypotheses before changing code. Then load [references/performance-and-debugging.md](references/performance-and-debugging.md) and any domain-specific reference.
- **Performance or jank**: Start code-first, then move to profiling if review is inconclusive. Load [references/performance-and-debugging.md](references/performance-and-debugging.md).
- **Liquid Glass or new design-system APIs**: Use native materials and availability gating, not custom blur imitations. Load [references/liquid-glass.md](references/liquid-glass.md).
- **macOS-specific work**: Treat menu commands, keyboard flows, windows, sidebars, toolbars, and text behavior as product requirements, not polish. Load [references/macos-quality-bar.md](references/macos-quality-bar.md).
- **Version-sensitive API questions**: When the exact current API shape matters, load [references/official-docs-map.md](references/official-docs-map.md) first and trust Apple docs over memory.

## Apply The Core Rules

1. Prefer system structure before custom structure.
   Use `NavigationStack`, `NavigationSplitView`, `TabView`, `List`, `Form`, `Table`, `Commands`, and built-in materials before custom containers.

2. Design for states, not screenshots.
   Every feature should account for loading, empty, error, offline, partial, and permission-restricted states.

3. Keep state close to the view that owns it.
   Use `@State`, `@Binding`, `@Bindable`, `@Environment`, `@Observable`, `@Query`, and `.task` as the default toolset. Introduce a view model only when the existing codebase already relies on them or when non-view orchestration truly needs a reference type.

4. Keep `body` cheap and identity stable.
   Do not sort, filter, format, decode images, create UUIDs, or perform I/O in `body`. Precompute or cache expensive work, and use stable IDs.

5. Compose small views with explicit inputs.
   Prefer narrow data and bindings over passing large models everywhere. Split large bodies into focused subviews instead of piling more logic into one type.

6. Treat accessibility and motion as first-class constraints.
   Verify Dynamic Type, VoiceOver, reduced motion, reduced transparency, contrast, focus order, and touch target size.

7. Match the platform.
   iPhone, iPad, Mac, and Vision Pro have different interaction contracts. Preserve platform idioms unless the product has a measured reason to diverge.

## Load The Right Reference

| Need | Load |
|------|------|
| State ownership, Observation, async flow, routing, dependency injection | [references/architecture-and-state.md](references/architecture-and-state.md) |
| Container choice, component composition, sheets, navigation, app-shell wiring | [references/ui-patterns.md](references/ui-patterns.md) |
| Jank, invalidation storms, layout thrash, profiling, bug triage, verification | [references/performance-and-debugging.md](references/performance-and-debugging.md) |
| Menu bar, shortcuts, windows, sidebars, toolbars, Mac polish, AppKit escape hatches | [references/macos-quality-bar.md](references/macos-quality-bar.md) |
| Liquid Glass placement, modifier order, containers, availability, transitions | [references/liquid-glass.md](references/liquid-glass.md) |
| Official Apple docs and WWDC sessions for state, navigation, scenes, Liquid Glass, and performance | [references/official-docs-map.md](references/official-docs-map.md) |

## Deliver The Result

- Start by naming the target platform, app archetype, and primary interaction model.
- Call out the chosen state and data-flow approach whenever the architecture is non-obvious.
- Use previews for fast iteration, but verify critical behavior in Simulator or on device when scenes, windows, focus, animation, or performance are involved.
- When reviewing, report the highest-risk issues first: correctness, platform mismatch, accessibility gaps, performance risks, then style.
- When debugging, share the leading hypotheses, the evidence that ruled them in or out, and the final root cause.
- Finish with verification steps: tests, build or lint commands, profiling passes, and any manual checks still needed.
