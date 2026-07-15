# Hardening & packaging a pure-CSS Tailwind v4 plugin

The effect is the fun part; this is the part that makes it *shippable*. A plugin
is a public API other people put in production — it has to degrade gracefully on
old engines, respect user preferences, survive RTL, stay cheap to paint, and
install in one line. This file is the checklist and the packaging recipe, both
grounded in how `tw-fade` and `tw-shimmer` ship.

---

## Part 1 — Hardening

### Progressive enhancement with `@supports`

Anything not Baseline-wide must be *gated*, with a sane fallback as the default
and the enhancement layered on top. `tw-fade` wraps its entire scroll engine:

```css
@supports (animation-timeline: scroll()) {
  .fade { animation-timeline: scroll(self y); /* …the real effect… */ }
}
@supports not (animation-timeline: scroll()) {
  .fade { --tw-fade-t: 1; --tw-fade-b: 1; /* static fade, no scroll gating */ }
}
```

Rules of thumb:
- Author the **fallback first** (the plain, always-works version), then enhance.
- Test the *actual* feature you depend on, not a proxy
  (`@supports (mask-composite: intersect)`, not "is this a modern browser").
- `@supports selector(...)` exists for selector features (`:has()`, etc.).
- For JS-free feature detection of a property *value*, `@supports` is the only
  honest tool. Don't sniff user agents.

### The `@property` footguns (these bite silently)

`@property` registration is the spine of these plugins, and it fails *quietly*
when you get the syntax wrong — the registration is dropped and your animation
just doesn't interpolate. From the `tw-fade` source comments:

- A **typed** `syntax` (`"<length>"`) will **reject a fallback of the wrong type**
  and drop the whole registration in some engines. When you need to accept a
  `var(--x, 1rem)`-style fallback, register with `syntax: "*"` (untyped) instead
  of a strict type. `tw-fade` registers its animatable scalars as `"<number>"`
  but its *config* properties (sizes, masks) as `"*"` precisely for this reason.
- Set `inherits: false` on config properties so a nested instance of your effect
  doesn't **leak** size/state into its children. (Set `inherits: true` only when
  you *want* an ancestor knob to cascade — `tw-shimmer` does this so you can set
  `--shimmer-angle` on a parent.)
- Only `@property`-registered customs interpolate in `@keyframes`. An unregistered
  `--x` animates as a discrete swap at 50%, not a smooth tween. If a gradient
  "snaps" instead of sweeping, you forgot to register the driving property.

### Accessibility

- **`prefers-reduced-motion`** — kill or calm every animation. For a continuously
  moving effect (shimmer), the honest reduced-motion state is *static*:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .shimmer { animation: none; }
  }
  ```
  For a reveal, jump to the end state instead of animating to it.
- **`forced-colors` (Windows High Contrast)** — the OS replaces your palette.
  Filters, masks, and gradient text can vanish or turn into solid blocks. Test
  with DevTools → Rendering → "Emulate forced-colors". Provide a legible fallback
  (`forced-color-adjust: none` only where you're certain, otherwise let the
  system win and ensure the content is still readable without the effect).
- **`prefers-reduced-transparency`** — back off heavy `backdrop-filter`/opacity
  glass toward something more opaque.
- **`prefers-contrast: more`** — strengthen the effect or step aside; never let a
  decorative gradient drop text contrast below WCAG.
- **Never carry meaning in the effect alone.** A shimmer means "loading" only
  alongside a real `aria-busy`/text cue; a color shift must not be the only
  signal.

### RTL & logical properties

If the effect has a direction, it must flip under `dir="rtl"`. `tw-fade` does this
properly: it offers logical `fade-start`/`fade-end` utilities (not just
`left`/`right`), and re-maps its edge variables under `:where(:dir(rtl))`:

```css
.fade-start { /* maps to the inline-start edge in both LTR and RTL */ }
.fade:where(:dir(rtl)) { --tw-fade-edge-size-l: var(--tw-fade-size-end, …); }
```

- Prefer logical dimensions/positions (`inline-size`, `inset-inline-start`,
  `margin-inline`) over physical ones.
- Use `:dir(rtl)` (matches the *resolved* direction) over `[dir=rtl]` (only the
  attribute). Wrap in `:where()` to keep specificity flat so user utilities win.
- Put an RTL specimen in the workbench so you actually see it.

### Performance

- **Animate compositor-friendly properties.** `transform`, `opacity`, and
  `filter` are cheap; animating `width`/`top`/`background-position` triggers
  layout/paint each frame. (Note `background-position` *is* what `tw-shimmer`
  animates — acceptable because it's a single layer; profile before assuming.)
- **Filters and `backdrop-filter` are paint-expensive**, and large blur radii
  scale super-linearly. A full-viewport `backdrop-filter: blur(40px)` will drop
  frames on weak GPUs. Confine the area (mask/clip), cap the radius, and consider
  `will-change` *sparingly* (it allocates a layer — promoting everything defeats
  the purpose; remove it after the animation).
- **SVG filters (`filter: url()`) are the most expensive** — `feTurbulence` and
  `feDisplacementMap` recompute on resize and can stutter if animated naively.
  Prefer a *static* turbulence baked once, animate cheaply on top, and gate behind
  reduced-motion.
- **Many-stop gradients** are cheap to paint *static*; re-rasterizing one every
  frame (via animated `@property` stops) costs more — fine for one element, watch
  it on a list of 50.
- `content-visibility: auto` and `contain` help when the effect is on many
  offscreen items.

### Cross-engine quirks

- **Firefox** often needs a nudge: `tw-shimmer` ships a `@-moz-document
  url-prefix()` block to recompute its duration differently. Test all three
  engines (Chromium, WebKit/Safari, Gecko/Firefox) — `-webkit-` prefixes still
  matter for `background-clip: text` (`-webkit-text-fill-color: transparent`).
- **Safari** lags on some `mask-composite` values and `backdrop-filter` nesting;
  verify, don't assume.

---

## Part 2 — Packaging & distribution

### `package.json` for a CSS-only plugin

The plugin ships **CSS, not JS**. The keys that matter (from `tw-fade` and
`tw-shimmer`):

```jsonc
{
  "name": "tw-yourplugin",
  "version": "0.1.0",
  "description": "…what + zero-JS + Tailwind v4…",
  "keywords": ["tailwindcss", "tailwind-plugin", "tailwindcss-v4", "css", "…"],
  "license": "MIT",
  "type": "module",
  "style": "./dist/tw-yourplugin.css",          // classic CSS entry (CDN/no-build)
  "main": "./src/index.css",                      // some tools look here
  "exports": {
    ".": {
      "style": "./src/index.css",                 // Tailwind v4 source of truth
      "default": "./src/index.css"
    },
    "./css": "./dist/tw-yourplugin.css",          // prebuilt, framework-free
    "./package.json": "./package.json"
  },
  "sideEffects": ["./src/index.css"],             // it's all side effects; don't tree-shake away
  "files": ["src", "dist", "README.md", "LICENSE"],
  "peerDependencies": { "tailwindcss": ">=4.0.0" },
  "peerDependenciesMeta": { "tailwindcss": { "optional": true } },
  "publishConfig": { "access": "public", "provenance": true }
}
```

- The **`src` CSS is the source of truth**, authored for Tailwind v4's CSS-first
  pipeline (`@utility`/`@theme`/`--value()`); consumers on v4 do
  `@import "tw-yourplugin"` after `@import "tailwindcss"` and the JIT generates
  exactly the utilities they use.
- The **`dist` CSS is a prebuilt, self-contained drop-in** for people with no
  Tailwind build (plain `<link>`/CDN). It contains a fixed, pre-generated set of
  classes.
- `peerDependencies` keeps Tailwind out of your install; `optional: true` (as in
  `tw-fade`) lets pure-`dist` consumers install without it.

### The build: source CSS → framework-free `dist`

You can't drop `@utility`/`--value()` CSS into a `<link>` — it must be compiled.
The maintainer build runs the Tailwind v4 CLI over the source and emits a
self-contained stylesheet. The two tricks that keep the output clean (from
`tw-fade/scripts/build-css.mjs`):

1. **Import only `tailwindcss/utilities.css`**, not the full `tailwindcss` — no
   Preflight reset, no theme dump, just the utility engine.
2. **Compile in an isolated temp dir** and name every class via
   `@source inline("…")`. Tailwind's auto source-detection would otherwise scan
   your repo and pull in any `.flex`/`.grid` it finds; in an empty temp dir it
   finds nothing, so the inline safelist is the *only* thing generated — exactly
   your utilities and their foundations.

```js
// scripts/build-css.mjs (essence)
const entry = `@import "${utilitiesCss}";\n@import "${srcCss}";\n@source inline("${CLASSES}");\n`;
// CLASSES enumerates every public class incl. scale variants, e.g.:
//   "sheen sheen-{x,y} sheen-angle-{0,15,30,45} sheen-spread-{sm,md,lg}"
execFileSync(node, [tailwindCli, '-i', entryFile, '-o', outFile]);
```

Arbitrary values (`sheen-spread-[120px]`) are intentionally **absent** from the
prebuilt dist — those need the JIT and belong to the v4 source path. Document that.

### Verification (catch regressions before publish)

`tw-fade` runs a battery of `node --test` + Playwright scripts (`verify-*.mjs`):
it builds the dist, loads the demo in a real browser, and asserts the effect
actually renders (computed `mask-image`, screenshot diffs, RTL correctness,
runtime errors === 0). At minimum:

- A **build test**: compile the source, assert the dist contains each public class
  and no Preflight/theme leakage.
- A **render test**: open a fixture in Playwright across Chromium + WebKit +
  Firefox; assert the key computed property is set and no console errors fire.
- A **fallback test**: emulate the missing feature (or an old engine) and assert
  the `@supports not` path still produces a sane result.
- A **a11y emulation pass**: reduced-motion and forced-colors don't break it.

```jsonc
"scripts": {
  "build": "node scripts/build-css.mjs",
  "test": "node --test",
  "verify": "node build/verify.mjs && node build/verify-fallback.mjs",
  "prepublishOnly": "node scripts/build-css.mjs && node --test"
}
```

### README essentials

Install (`npm i` + the two `@import` lines), a usage snippet, and a **utility
table** (`tw-shimmer`'s README is a good model: one row per utility with its
effect and default). Note browser support, the `@supports` fallbacks, the
accessibility behavior, and that arbitrary values need the v4 build path. Lead the
description with the differentiators: *pure CSS, zero JS, Tailwind v4*.
