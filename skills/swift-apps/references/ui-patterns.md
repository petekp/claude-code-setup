# UI Patterns

Use this reference when designing a new screen, choosing containers, or wiring navigation and presentation.

## Table Of Contents

- Choose the right container
- Start from the app archetype
- Build screens from reusable primitives
- Route modals and navigation explicitly
- Place search where the scope is clear
- Design tabs for adaptation, not just iPhone
- Build adaptive layouts
- Prefer tokenized design decisions
- Use previews as a design loop
- Review the UI before shipping

## Choose The Right Container

| Container | Use For |
|-----------|---------|
| `List` | Large datasets, selection, edit mode, swipe actions, settings-style rows |
| `ScrollView` + `LazyVStack` | Custom card surfaces, mixed content, bespoke layouts |
| `Form` | Structured input and settings forms |
| `Grid` / `LazyVGrid` | Dense structured content and responsive galleries |
| `NavigationStack` | Push-based navigation on iPhone or per-tab flows |
| `NavigationSplitView` | iPad and Mac hierarchical apps with sidebars and detail panes |
| `TabView` | Top-level mode switching, not deep workflow branching |
| `Table` | Mac-first dense data views where column behavior matters |

Use `List` when you want a structured, scrollable one-dimensional collection with platform row behavior.
Use `Table` when rows and columns, selection, or sorting are part of the mental model.

## Start From The App Archetype

Pick the archetype before composing screens:

- **Document-based**: Files are primary units; design for open, save, duplicate, undo, and window management. Prefer `DocumentGroup` when the app is truly document-centric.
- **Library plus detail**: Sidebar or list drives a detail pane; prefer `NavigationSplitView` on iPad and Mac.
- **Utility**: One primary window or focused flow; keep chrome minimal.
- **Menu bar app**: Optimize for quick glanceable actions and small surfaces.
- **Pro tool**: Dense workflows, command coverage, inspectable state, keyboard fluency.

## Build Screens From Reusable Primitives

Start new features with these primitives before inventing special cases:

1. Screen scaffold
2. Section header
3. Primary and secondary buttons
4. Card or row surface
5. Empty state
6. Loading placeholder
7. Error banner or recovery state
8. Form field row
9. Filter chip or segmented control

## Route Modals And Navigation Explicitly

- Prefer enum-driven routing over clusters of booleans.
- Prefer `.sheet(item:)` when the state represents a selected model or route.
- Let a sheet own its save and dismiss behavior instead of forwarding `onCancel` and `onConfirm` closures through many layers.
- Keep each tab’s history separate when using `TabView`.

```swift
@State private var selectedDraft: Draft?

.sheet(item: $selectedDraft) { draft in
    EditDraftSheet(draft: draft)
}
```

```swift
struct EditDraftSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(DraftStore.self) private var store

    let draft: Draft
    @State private var isSaving = false

    var body: some View {
        Button(isSaving ? "Saving..." : "Save") {
            Task { await save() }
        }
    }

    private func save() async {
        isSaving = true
        await store.save(draft)
        dismiss()
    }
}
```

## Place Search Where The Scope Is Clear

- Apply `searchable` to a `NavigationStack`, `NavigationSplitView`, or a view inside one when search belongs to that navigation context.
- Put the modifier on the split view itself when the search spans the whole structure.
- Put it on a specific column when the search only covers that column's content.
- Let the system choose placement by default unless the search scope truly demands an explicit placement.

## Design Tabs For Adaptation, Not Just iPhone

- Use `Tab` selection values when the app needs programmatic tab changes.
- Use badges for status, not as the only way to communicate critical information.
- Use `.tabViewStyle(.sidebarAdaptable)` and `TabSection` for iPadOS and macOS experiences that need both a tab bar and a sidebar hierarchy.
- Persist tab customization with `@AppStorage` or `@SceneStorage` when people can rearrange or hide tabs.
- Use `.tabViewStyle(.page)` for paged content, not as the default app-shell pattern.

If search is a first-class mode in a multi-tab app, consider a dedicated search tab and put `searchable` on the `TabView` instead of burying search in a random detail screen.

## Build Adaptive Layouts

- Let hierarchy change across platforms instead of forcing one layout everywhere.
- Allow rows to become stacks and columns to collapse when Dynamic Type grows.
- Use safe areas intentionally; do not hide bars or backgrounds without a strong reason.
- Use matched transitions and custom animations only when they clarify causality.

## Prefer Tokenized Design Decisions

- Establish spacing, radius, type, motion, and color tokens before spreading literals.
- Use semantic names that survive redesigns.
- Let content create hierarchy first; use decoration only to reinforce it.

## Use Previews As A Design Loop

- Add `#Preview` coverage for loading, empty, error, and populated states.
- Preview multiple environments: light and dark mode, larger text sizes, locale, and compact versus regular width when relevant.
- Use interactive previews to tune layout and motion quickly, then confirm scene, window, and performance behavior in Simulator or on device.

## Review The UI Before Shipping

- Is the primary action obvious?
- Does every state have a purposeful layout?
- Do navigation and modals match the platform?
- Are gestures, focus behavior, and keyboard interaction predictable?
- Does the interface stay legible at larger text sizes and different window sizes?
