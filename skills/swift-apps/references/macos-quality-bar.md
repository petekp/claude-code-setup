# macOS Quality Bar

Use this reference when the feature runs on macOS or when a user asks for a “native-feeling” Mac experience.

## Pass The Good Mac Citizen Test

| Area | Expectation |
|------|-------------|
| Menu bar | Standard app menus exist and primary commands are discoverable |
| Keyboard | Core workflows are reachable without a pointer and standard shortcuts still work |
| Windows | Resizing, fullscreen, minimize, and multi-window behavior feel natural |
| Sidebar | Top-level navigation is scannable and stable |
| Toolbar | Primary actions are visible; secondary actions are grouped instead of cluttering the bar |
| Text | Standard editing, selection, drag-and-drop, and services behave normally |
| Accessibility | VoiceOver, full keyboard access, contrast, and reduced motion hold up |

## Choose The Right Mac Structure

- Use sidebars for top-level information architecture.
- Use split views when the app has a list-plus-detail or inspector-style mental model.
- Use commands and toolbar items to expose primary actions; do not bury everything in context menus.
- Support multiple windows when it improves the workflow instead of forcing one global workspace.

Use scenes and environment actions instead of custom window plumbing when SwiftUI already models the behavior:

- `WindowGroup` for primary or repeatable windows
- `Settings` for the settings window
- `openWindow`, `pushWindow`, and `dismissWindow` for programmatic window flow
- `supportsMultipleWindows` to gate multi-window affordances per platform

## Respect Mac Interaction Contracts

- Prefer a `Settings` scene so SwiftUI supplies the standard Settings menu item and Command-comma shortcut for you.
- Do not override standard editing shortcuts such as copy, paste, undo, redo, and find.
- Keep toolbar groups purposeful and sparse.
- Prefer system text controls over custom editors unless the feature truly requires custom behavior.
- Treat drag and drop, Quick Look, sharing, and Services as first-class integrations where relevant.

## Use SwiftUI First, AppKit Second

Prefer SwiftUI for most structure, navigation, commands, settings, and general UI.
Reach for AppKit when the feature is genuinely AppKit-native, such as:

- Advanced text editing or rich text behaviors
- Highly customized collection or outline views
- Menu bar extras or deep menu validation
- Window management that exceeds SwiftUI’s current APIs
- Performance-sensitive dense data views that need mature AppKit controls

Keep any bridge thin and isolated so AppKit does not leak across the codebase.
When adopting Liquid Glass in AppKit-backed surfaces, prefer native container views over home-grown blur stacks.

## Review Before Shipping

- Does the app feel keyboard fluent?
- Can the user discover major actions from menus and toolbars?
- Does the window model match the user’s mental model?
- Does the Mac version use Mac patterns instead of enlarging the iPhone UI?
- Are Liquid Glass or other bar materials confined to navigation and control layers?
