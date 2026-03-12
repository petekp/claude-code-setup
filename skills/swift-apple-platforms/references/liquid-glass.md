# Liquid Glass

Use this reference when adopting Apple’s Liquid Glass APIs or reviewing whether a feature uses them correctly.

## Use Liquid Glass In The Right Layer

Use it for navigation, controls, floating chrome, and grouped interactive elements.
Do not apply it to the content layer of documents, tables, lists, or reading surfaces.

## Follow The Core Rules

- Prefer native Liquid Glass APIs over custom blur stacks.
- Wrap related glass elements in `GlassEffectContainer`.
- Apply `glassEffect` after layout and appearance modifiers.
- Use interactive glass only for tappable, clickable, or focusable elements.
- Keep shapes, prominence, and tinting consistent across a feature.
- Gate usage with availability checks and provide a clean fallback.

## Start With Safe Defaults

```swift
if #available(iOS 26, macOS 26, *) {
    Button("Confirm") { }
        .buttonStyle(.glassProminent)
} else {
    Button("Confirm") { }
        .buttonStyle(.borderedProminent)
}
```

```swift
if #available(iOS 26, macOS 26, *) {
    Text("Filter")
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .glassEffect(.regular.interactive(), in: .capsule)
}
```

## Group Related Glass

```swift
if #available(iOS 26, macOS 26, *) {
    GlassEffectContainer(spacing: 24) {
        HStack(spacing: 24) {
            Image(systemName: "scribble.variable")
                .frame(width: 72, height: 72)
                .glassEffect()

            Image(systemName: "eraser.fill")
                .frame(width: 72, height: 72)
                .glassEffect()
        }
    }
}
```

## Use Morphing Transitions Sparingly

- Add `glassEffectID` with a shared namespace only when hierarchy changes and the motion clarifies continuity.
- Avoid decorative morphing that competes with the user’s task.

## Review Before Shipping

- Is the effect in the controls layer, not the content layer?
- Are grouped glass elements using `GlassEffectContainer`?
- Is modifier order correct?
- Is there a fallback for older OS versions?
- Does the effect improve hierarchy or interactivity instead of adding noise?
