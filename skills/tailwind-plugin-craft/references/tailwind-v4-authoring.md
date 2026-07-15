# Authoring utilities in Tailwind CSS v4 (CSS-first)

Tailwind v4 plugins are written **in CSS**, not in a JS config. You declare
tokens with `@theme`, define utilities with `@utility`, and read user-supplied
values with `--value()` / `--modifier()`. No `tailwind.config.js`, no
`plugin()` function, no JavaScript. This file is the working reference for the
constructs you'll use; every pattern here is lifted from or verified against
`tw-fade` and `tw-shimmer`.

> Always confirm specifics against the current docs at tailwindcss.com — v4 is
> evolving. The data-type list for `--value()` in particular gains entries.

## The one pattern to internalize

> **Many small "knob" utilities each set a custom property. One "core" utility
> reads those properties and renders the effect.**

This is the architecture of both reference plugins and the starter example. It's
what makes an effect *composable* (knobs stack in any order), *overridable*
(arbitrary values and ancestor vars both work), and *cheap* (the core math is
declared once). Everything below is in service of it.

```css
@utility shimmer {            /* CORE: consumes the props */
  --_speed: var(--shimmer-speed, 200);
  background: /* …gradient computed from --_speed etc.… */;
}
@utility shimmer-speed-* {    /* KNOB: just sets a prop */
  --shimmer-speed: --value(number);
}
```

## `@theme` — design tokens that generate utilities + variables

Tokens declared in `@theme` do two things: expose a CSS variable, and (for
recognized namespaces) make matching utilities resolvable. `tw-fade` declares its
size scale here so `fade-size-md` works:

```css
@theme {
  --fade-size-md: calc(var(--spacing, 0.25rem) * 12);
  --fade-size-lg: calc(var(--spacing, 0.25rem) * 16);
}
```

- Namespaces map to utility families — `--color-*` powers color utilities,
  `--font-*` powers `font-*`, and a custom `--fade-size-*` namespace becomes
  resolvable via `--value(--fade-size-*)` in your own utility.
- **`@theme` vs `@theme inline`**: plain `@theme` emits the variable *and* keeps
  the indirection (utilities reference `var(--token)`); `@theme inline`
  substitutes the value directly into generated utilities (no intermediate var).
  Use `inline` when the token is a computed/composed value you don't want
  consumers overriding via the variable — `tw-shimmer` uses `@theme inline` to
  host its `@keyframes`.
- `@keyframes` can live inside `@theme` (emitted when referenced) or at top level.

## `@property` — ship registrations with your utilities

Register the custom properties your effect animates or type-checks, right in the
plugin CSS. This is what makes gradient/angle/number interpolation smooth (see
packaging-and-hardening.md for the footguns):

```css
@property --shimmer-angle {
  syntax: "<angle>";
  inherits: true;       /* let an ancestor set the angle for descendants */
  initial-value: 15deg;
}
```

## `@utility` — static and functional

**Static** utility (no value): a bare class.

```css
@utility fade-none {
  --tw-fade-t: 0 !important;
  --tw-fade-b: 0 !important;
}
```

**Functional** utility (the `-*` suffix): accepts a value the user supplies after
the dash. Inside, `--value(...)` resolves what they passed.

```css
@utility fade-size-* {
  --tw-fade-size: --value(--fade-size-*, [length], [percentage]);
}
```

You can nest, use `&`, and apply variants inside a utility (v4 supports CSS
nesting natively):

```css
@utility shimmer {
  &:not(.shimmer-bg) {
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  @variant dark {
    --_fg: oklch(from currentColor calc(l + 0.4) c h);
  }
}
```

## `--value()` — resolving the user's input

`--value()` tries each argument in order and uses the first that matches what the
user wrote. The forms you'll use most (all seen in the reference plugins):

| Form | Matches | Example utility → input |
|------|---------|--------------------------|
| `--value(--namespace-*)` | a theme key in that namespace | `fade-size-md` → `--fade-size-md` |
| `--value([length])` | an arbitrary length | `fade-size-[6rem]` |
| `--value([percentage])` | an arbitrary percentage | `fade-size-[12%]` |
| `--value([color])` | an arbitrary color | `shimmer-color-[#abc]` |
| `--value([angle])` | an arbitrary angle | `aurora-angle-[30deg]` |
| `--value(integer)` | a bare integer | `shimmer-spread-12` |
| `--value(number)` | a bare number (decimals) | `aurora-saturate-1.5` |
| `--value(--color, [color])` | palette key *or* arbitrary color | `shimmer-color-blue-500` / `-[#abc]` |

Key behaviors:

- **List multiple forms** to accept several input styles at once:
  `--value(--fade-size-*, [length], [percentage])` takes a token, a length, or a
  percentage.
- **Stacked declarations as fallbacks.** Writing the same property twice with
  different `--value()` forms lets the *valid* one win and the invalid one drop —
  `tw-fade` uses this so `fade-clear-4` (integer → spacing math) and
  `fade-clear-[2rem]` (length) both work from one utility:
  ```css
  @utility fade-clear-* {
    --tw-fade-clear: calc(var(--spacing, 0.25rem) * --value(integer));
    --tw-fade-clear: --value(--fade-clear-*, [length], [percentage]);
  }
  ```
- **`--modifier(...)`** captures the `/`-suffix (the opacity slot):
  `shimmer-color-blue-500/40` → `--modifier(integer)` is `40`.
- **`--alpha(color / amount)`** applies an alpha to a color:
  ```css
  @utility shimmer-color-* {
    --alpha: calc(--modifier(integer) * 1%);
    --shimmer-color: --alpha(--value(--color, [color]) / var(--alpha, 100%));
  }
  ```

## `@variant` / `@custom-variant`

Apply an existing variant inside a utility with `@variant` (`@variant dark { … }`,
`@variant hover { … }`). Define your own with `@custom-variant`:

```css
@custom-variant pointer-fine (@media (pointer: fine));
/* now usable as a variant and inside @utility via @variant pointer-fine { … } */
```

## `@apply` and `@reference`

`@apply` inlines existing utilities into a rule. In a separate file/module that
doesn't see your theme, pull it in with `@reference "…"` first so `@apply` knows
the tokens. Prefer plain CSS + custom properties inside plugins; reach for
`@apply` sparingly.

## Engine-specific escape hatches (still pure CSS)

The utility engine doesn't stop you from using raw at-rules for cross-engine
fixes — they ship in your plugin CSS as-is:

```css
@-moz-document url-prefix() {        /* Firefox-only correction (tw-shimmer) */
  .shimmer { --_duration: …; }
}
@supports (animation-timeline: scroll()) { /* feature gate (tw-fade) */ }
```

## How consumers use it

```css
@import "tailwindcss";
@import "tw-yourplugin";   /* your src/index.css; JIT generates only what's used */
```

Arbitrary values (`fade-size-[6rem]`) require this build path (the JIT). The
prebuilt `dist` drop-in (for no-build/CDN users) ships a fixed class set and does
*not* include arbitrary values — see packaging-and-hardening.md for the build that
produces it.

## Authoring checklist

- [ ] Core utility reads custom props; knobs only set them.
- [ ] `@property`-register everything you animate (typed) or want isolated
      (`inherits: false`).
- [ ] Theme tokens in the right namespace so `--value(--ns-*)` resolves.
- [ ] Each knob accepts both a token and an arbitrary value where it makes sense.
- [ ] `--modifier()`/`--alpha()` for the `/opacity` slot on color knobs.
- [ ] `@variant dark` (and others) retune, not redefine.
- [ ] Feature gates + reduced-motion live in the same file.
