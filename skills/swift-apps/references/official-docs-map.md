# Official Docs Map

Use this reference when API details are version-sensitive or when you need to verify the current Apple-sanctioned approach before making changes.

## State And Observation

- [Managing user interface state](https://developer.apple.com/documentation/swiftui/managing-user-interface-state/)
  Use for `@State`, `@Binding`, `@Bindable`, and source-of-truth questions.
- [EnvironmentValues](https://developer.apple.com/documentation/swiftui/environmentvalues)
  Use for built-in environment values and actions like `scenePhase`, `openWindow`, `dismiss`, and `openSettings`.
- [Migrating from the ObservableObject protocol to the Observable macro](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)
  Use when modernizing legacy observation code.
- [Discover Observation in SwiftUI (WWDC23)](https://developer.apple.com/videos/play/wwdc2023/10149/)
  Use for the current mental model around Observation.
- [Data Essentials in SwiftUI (WWDC20)](https://developer.apple.com/videos/play/wwdc2020/10040/)
  Use for source-of-truth, scene storage, app storage, and wrapper-selection fundamentals.

## SwiftData

- [ModelContainer](https://developer.apple.com/documentation/swiftdata/modelcontainer)
  Use for scene-level container setup, model context injection, and `@Query` dependencies.
- [Building a document-based app using SwiftData](https://developer.apple.com/documentation/swiftui/building-a-document-based-app-using-swiftdata)
  Use for `DocumentGroup`, `.modelContainer`, `@Query`, `@Bindable`, and `.modelContext` together.
- [Dive deeper into SwiftData (WWDC23)](https://developer.apple.com/videos/play/wwdc2023/10196/)
  Use for container and context behavior at scale.

## Navigation, Search, Tabs, And Lists

- [Adding a search interface to your app](https://developer.apple.com/documentation/swiftui/adding-a-search-interface-to-your-app)
  Use for `searchable`, placement rules, and split-view search behavior.
- [TabView](https://developer.apple.com/documentation/swiftui/tabview)
  Use for selection, badges, page style, `TabSection`, `sidebarAdaptable`, and tab customization persistence.
- [Lists](https://developer.apple.com/documentation/swiftui/lists)
  Use for structured scrollable collections, row behavior, selection, and refreshable list patterns.
- [SwiftUI cookbook for navigation (WWDC22)](https://developer.apple.com/videos/play/wwdc2022/10054/)
  Use for `NavigationStack`, `NavigationSplitView`, and path-driven navigation patterns.

## Scenes And Windows

- [Bringing multiple windows to your SwiftUI app](https://developer.apple.com/documentation/swiftui/bringing-multiple-windows-to-your-swiftui-app)
  Use for `WindowGroup` and multi-window app design.
- [Work with windows in SwiftUI (WWDC24)](https://developer.apple.com/videos/play/wwdc2024/10149/)
  Use for `openWindow`, `pushWindow`, sizing, placement, and single versus multi-window decisions.
- [Customizing window styles and state-restoration behavior in macOS](https://developer.apple.com/documentation/swiftui/customizing-window-styles-and-state-restoration-behavior-in-macos)
  Use when changing Mac window chrome or restoration behavior.
- [SwiftUI on the Mac: The finishing touches (WWDC21)](https://developer.apple.com/videos/play/wwdc2021/10289/)
  Use for `Settings` scenes, app-wide behavior, and Mac polish.

## Design And Liquid Glass

- [Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
  Use for the system overview and design goals.
- [Build a SwiftUI app with the new design (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/323/)
  Use for standard component behavior, search patterns, and SwiftUI-specific Liquid Glass APIs.
- [SwiftUI](https://developer.apple.com/swiftui/)
  Use for preview workflow and high-level platform resources.

## Performance

- [Performance analysis](https://developer.apple.com/documentation/swiftui/performance-analysis)
  Use for official profiling workflows and diagnosing long body updates or frequent invalidations.
- [Demystify SwiftUI performance (WWDC23)](https://developer.apple.com/videos/play/wwdc2023/10160/)
  Use for a mental model of invalidation, identity, and update cost.

## How To Use This Map

- Start here when you suspect an API or behavior changed across SDK releases.
- Prefer Apple docs and WWDC sessions over memory when naming APIs, modifiers, or scene behavior.
- When the docs conflict with a local codebase convention, call that out explicitly and choose intentionally.
