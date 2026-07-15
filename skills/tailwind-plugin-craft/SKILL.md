---
name: tailwind-plugin-craft
description: >-
  Design and build pure-CSS (zero-JavaScript) Tailwind CSS v4 plugins of
  unusual depth and craft. Use when the user wants to create, architect, or
  refine a Tailwind utility plugin or CSS effect — e.g. "make a tailwind
  plugin", "build a tw-* plugin", "a CSS-only shimmer/fade/glow/grain/noise
  utility", "tailwind v4 @utility", "package this effect as a plugin", or wants
  an effect with surprising visual depth (gradients, masks, filters, SVG
  filter tricks, scroll-driven animation). Pairs deep CSS/SVG technique
  research with a bespoke tuning workbench for dialing the effect in. Inspired
  by tw-fade and tw-shimmer.
license: MIT
metadata:
  author: petekp
  version: "0.1.0"
---

# Crafting pure-CSS Tailwind plugins

A great CSS plugin is a small, sharp tool: one idea, expressed as a family of
composable utilities, that produces an effect with more depth than its size
suggests — and **zero JavaScript**. This skill is how you get there. It pairs
*deep research into what CSS can actually do* with a *bespoke workbench* for
tuning the effect until it feels inevitable, then hardens and packages it for
other people to depend on.

The bar is set by two reference plugins. Read their source before you start:

- **tw-fade** (`~/Code/tw-fade/src/tw-fade.css`) — scroll-edge fade masking.
  `@property`-registered scalars driven by **scroll-driven animations**, four
  edge gradients composed with `mask-composite: intersect`, a **14–17-stop
  sine-eased** falloff, full **RTL/logical** correctness, gated behind
  `@supports` with a static fallback.
- **tw-shimmer** (`~/Code/aui/assistant-ui/packages/tw-shimmer/src/index.css`) —
  text & skeleton shimmer. Trig (`tan()`) to derive gradient geometry from an
  angle, a **17-stop sine-eased** highlight, **OKLCH relative color**
  (`oklch(from currentColor …)`) + `color-mix`, container queries, a Firefox
  fix, and copious knob utilities via `@utility` + `--value()`.

Neither uses a line of JavaScript. That is the standard.

## When to use this skill

- Creating a new Tailwind v4 utility plugin or CSS effect from scratch.
- Pushing an existing effect from "fine" to "remarkable" — more depth, smoother
  motion, better edge-case handling.
- Packaging a CSS effect as an installable, hardened npm plugin.

**When not to:** if the effect genuinely needs runtime measurement, pointer
tracking, or per-frame JS state, this skill's zero-JS constraint is the wrong
fit — say so and reach for a JS approach. If a stock Tailwind utility already
does it, don't wrap it.

## The spine: one core utility, many knobs

> **Small "knob" utilities each set a custom property. One "core" utility reads
> those properties and renders the effect.** Register the animated properties
> with `@property`.

This single pattern is the architecture of every plugin here. It makes effects
composable (knobs stack in any order), overridable (arbitrary values *and*
ancestor variables both work), and cheap (the core math is declared once).

```css
@property --glow-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

@utility glow {                 /* CORE — consumes the props, renders the effect */
  --_hue: var(--glow-hue, oklch(0.72 0.18 255));
  background: conic-gradient(from var(--glow-angle), …var(--_hue)… );
  animation: glow-spin var(--glow-speed, 14s) linear infinite;
}
@utility glow-hue-*   { --glow-hue:   --value(--color, [color]); }  /* KNOB */
@utility glow-speed-* { --glow-speed: calc(--value(integer) * 1s); } /* KNOB */
```

See `examples/starter-plugin.css` for a complete, annotated worked example
(`tw-aurora`), and `references/tailwind-v4-authoring.md` for the full `@utility`
/ `@theme` / `--value()` mechanics.

## What "surprising depth and craft" actually means

These are the signatures that separate a remarkable plugin from a generic one.
Treat them as the craft checklist:

1. **Perceptually-eased gradients, not 2-stop ramps.** A naive
   `linear-gradient(black, transparent)` bands and looks cheap. Both reference
   plugins use **14–17 stops following a sine/ease curve** so the falloff reads
   as light, not a CSS default. This is the single biggest tell of craft.
2. **`@property`-registered animatable customs.** Registration is what lets a
   single keyframe smoothly interpolate a whole gradient, angle, or number.
   Unregistered customs snap at 50%.
3. **OKLCH / relative color.** Mix and derive colors in a perceptual space
   (`color-mix(in oklch, …)`, `oklch(from currentColor l c h / …)`) so highlights
   and tints stay even across hues and adapt to `currentColor`.
4. **Effects expressed as math over custom properties** — the spine above — so
   the public API is just "set these props."
5. **Pure CSS with honest fallbacks.** Author the always-works version first,
   then layer the enhancement behind `@supports`. Never ship an effect that
   blanks out on a browser that lacks one feature.
6. **Logical-property / RTL correctness, reduced-motion, and forced-colors
   awareness** baked in from the start, not bolted on.
7. **Reach for the esoteric.** SVG filter primitives (`feTurbulence` grain,
   `feDisplacementMap` refraction, `feColorMatrix` duotone, gooey via blur +
   alpha-contrast), `mask-composite`, conic/`@property`-animated gradients,
   scroll/view timelines, style container queries. The depth comes from
   combining primitives most people never open. The catalog is
   `references/css-arsenal.md`.

## The workflow

Work the phases in order. Don't skip the workbench — it's where the craft is won.

### 1 — Conceive & scope
Name the effect and its one job. Decide the public surface: the core utility and
the 3–8 knobs that matter (speed, size, color, angle, intensity…). Sanity-check
the zero-JS constraint holds. Write the one-line README description now — if you
can't, the scope is fuzzy.

### 2 — Research the CSS surface
Open `references/css-arsenal.md` and find the primitives and recipes for your
effect family (grain, glow, duotone, glass, distortion, fade, shimmer, …). For
anything you're unsure is current, **verify Baseline/support on the web** (MDN,
web.dev Baseline, caniuse) — support moves fast. Note which features need an
`@supports` gate. For a genuinely novel effect, run a focused research pass
(the `deep-research` skill) before committing to an approach.

### 3 — Spike the core effect
Get the effect working *once*, hard-coded, on a single element — in a scratch
HTML file or straight in the workbench's `<style>`. Prove the central trick (the
mask composite, the displacement map, the eased gradient) before generalizing it
into utilities. Don't build the plugin API around an effect you haven't seen
render.

### 4 — Build the workbench
Stand up the bespoke tuning lab (`references/workbench.md`; copy
`examples/workbench.html` as the skeleton). Wire every knob to a slider, render
the effect across a **specimen matrix** (many element types, sizes, surfaces,
LTR/RTL, light/dark, nested), and add a **lock + progress** control to
freeze-frame any animation for scrubbing. This is the instrument that turns
guessing into seeing.

### 5 — Iterate to craft
Tune in the workbench against the matrix until it holds up *everywhere*, not just
the hero. Push the gradient to enough eased stops to kill banding. Check the bad
frames (lock + scrub). Tune over a patterned background to expose halos. Apply
the craft checklist above. Export the dialed-in values.

### 6 — Harden & package
Bake the tuned values into the `@utility`/`@theme` source. Add `@supports`
fallbacks, `prefers-reduced-motion`, forced-colors behavior, and RTL. Then
package it: `package.json` `style`/`exports`, the framework-free `dist` build,
verification, and a README with a utility table. Full recipe in
`references/packaging-and-hardening.md`.

## Decision shortcuts

- **Effect won't animate smoothly?** The driving custom property isn't
  `@property`-registered, or its `syntax` is typed and rejecting a fallback.
- **Gradient looks banded/cheap?** Too few stops, or linear instead of eased,
  or mixing in sRGB instead of OKLCH.
- **Effect leaks into nested instances?** Set `inherits: false` on the config
  `@property` registrations.
- **Need a value the user passes both as a token and a raw number?** Stack two
  `--value()` declarations (see authoring reference).
- **Effect is expensive on a list?** It's probably a filter, `backdrop-filter`,
  or an animated many-stop gradient re-rasterizing per frame — profile and
  confine it.

## Files in this skill

- `references/css-arsenal.md` — the catalog of pure-CSS + SVG techniques and
  ready-made recipes, organized by effect family. **Your edge.**
- `references/tailwind-v4-authoring.md` — `@utility`, `@theme`, `--value()`,
  `--modifier()`, `@variant`, `@property`; the CSS-first plugin API.
- `references/workbench.md` — how to build the bespoke tuning lab.
- `references/packaging-and-hardening.md` — fallbacks, a11y, RTL, performance,
  `package.json`, the dist build, and verification.
- `examples/starter-plugin.css` — a complete, annotated `tw-aurora` plugin
  showing the full architecture end to end.
- `examples/workbench.html` — a self-contained, framework-free workbench wired
  to the starter, ready to copy and re-point.
