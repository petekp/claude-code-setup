# Architecture And State

Use this reference when the main question is where state should live, how dependencies should flow, or whether a view model is warranted.

## Table Of Contents

- Default architecture
- Choose the right state owner
- Prefer SwiftUI-native flow
- Use view models deliberately
- Structure views consistently
- Wire app shells simply
- Handle async work predictably
- Verify the architecture

## Default Architecture

- Let the app shell own global services, app-wide routing, persistence containers, and scene-level lifecycle work.
- Let each feature own local presentation state close to the view that renders it.
- Let services, models, and stores own business logic, persistence, and side effects.
- Let views orchestrate user intent, async loading, and state transitions without becoming mini-frameworks.

## Choose The Right State Owner

| Tool | Use For |
|------|---------|
| `@State` | Local ephemeral UI state and root-owned `@Observable` models |
| `@Binding` | Child mutation of parent-owned state |
| `@Environment` | Shared services, stores, routers, themes, and system dependencies |
| `@Observable` | Reference types with observable app or feature state |
| `@Query` | SwiftData-backed reads that belong in the view layer |
| `.task` / `.task(id:)` | Async loading and refresh tied to view lifetime or input changes |
| `@SceneStorage` / `@AppStorage` | Small persisted UI state, not full domain models |

## Prefer SwiftUI-Native Flow

- Default to Model-View, not ViewModel-first architecture.
- Reach for `@State`, `@Environment`, `.task`, `onChange`, and `@Query` before creating a view model.
- Split a large view into smaller views before introducing another reference type.
- Inject shared services through the environment instead of threading them through every initializer.

## Use View Models Deliberately

Introduce a view model only when at least one of these is true:

- The existing codebase already centers features around view models.
- A reference type must coordinate long-lived work that does not fit naturally in the view.
- The feature needs a test seam around orchestration that would otherwise become awkward.

If a view model already exists:

- Make it non-optional when possible.
- Initialize it in the view `init` and store it as `@State` at the root view.
- Avoid `bootstrapIfNeeded` and other “initialize later” patterns.
- Pass narrow inputs into child views rather than handing the entire model to the whole subtree.

```swift
@State private var store: ProfileStore

init(client: APIClient, userID: String) {
    _store = State(initialValue: ProfileStore(client: client, userID: userID))
}
```

## Structure Views Consistently

Order members from top to bottom like this:

1. Environment dependencies
2. `let` properties
3. `@State` and other stored properties
4. Non-view computed properties
5. `init`
6. `body`
7. View-building helpers
8. Private actions and async helpers

When a view file grows large:

- Keep the main type focused on stored properties, `init`, and `body`.
- Extract repeated or branching sections into local subviews.
- Group helper functions by purpose in small extensions if the file becomes hard to scan.

## Wire App Shells Simply

- Keep one root shell responsible for tabs, split views, or top-level windows.
- Give each tab or column its own navigation path when independent history matters.
- Centralize sheets and full-screen covers with small enums instead of scattered booleans.
- Install the global dependency graph in one place so services are not forgotten at call sites.

```swift
enum SheetDestination: Identifiable {
    case composer
    case settings

    var id: Self { self }
}

@State private var presentedSheet: SheetDestination?

.sheet(item: $presentedSheet) { destination in
    switch destination {
    case .composer:
        ComposerView()
    case .settings:
        SettingsView()
    }
}
```

## Handle Async Work Predictably

- Use `.task` for initial loads tied to view appearance.
- Use `.task(id:)` when work should restart after a specific input changes.
- Use `refreshable` for user-initiated refresh on supported containers.
- Keep mutation on the main actor when updating UI-observed state.
- Move durable background work into services, not views.

## Verify The Architecture

- Can a reader explain where each piece of state lives in one pass?
- Are dependencies explicit and narrow?
- Does the feature preserve behavior while reducing indirection?
- Are models and services testable without spinning up the whole UI?
