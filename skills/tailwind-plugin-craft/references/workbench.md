# The Workbench: a bespoke tuning lab for your plugin

A CSS plugin is a *feel*, not a feature. You cannot get the feel right by editing
the stylesheet and re-checking a demo page — you have to be able to grab a
parameter and drag it while watching the effect on real elements. The workbench
is the instrument that makes that loop tight. It is the single highest-leverage
artifact in this whole skill: build it early, and the plugin gets good fast.

> Sibling skill: `tuning-panel` covers React/Leva, SwiftUI, and Tweakpane/dat.GUI
> panels. Use it when you're tuning values *inside an app*. This file is about the
> **standalone, single-file, framework-free workbench** for a CSS plugin you're
> authoring — no build step, opens with `file://`, lives in the plugin repo.

## Principles

- **Utilitarian, all-function, zero-frills.** Monospace, dark, dense. This is an
  oscilloscope, not a landing page. Spend craft on the *effect under test*, not
  on the panel chrome.
- **Exhaustive parameters.** Surface *every* knob that could plausibly change the
  result — including ones the shipped plugin won't expose yet. Missing a
  parameter forces a context switch back to the stylesheet; an extra slider costs
  only scroll distance. (Same doctrine as the `tuning-panel` skill.)
- **Specimen matrix, not one hero.** The effect must be proven against the *range*
  of things it will be applied to (see below). A shimmer that looks great on one
  heading and breaks on a two-line button is not done.
- **Freeze the clock.** Scroll-driven and time-driven effects must be *scrubbable*
  statically — a lock + progress slider that pins the animation at any frame.
  This is the difference between guessing and seeing.
- **Export paste-ready output.** The end of a tuning session is a set of numbers.
  One button should copy them as something you can drop straight back into the
  stylesheet (custom-property values, a `@theme` block, or the literal utility
  string), showing only what changed from defaults.
- **Debug-only.** `<meta name="robots" content="noindex" />`. It never ships to
  users. It can ship in the repo (`demo/`, `workbench/`) as a maintainer tool.

## File shape

One self-contained `.html` file: inline `<style>`, inline `<script>`, and the
plugin pulled in however is fastest to iterate. Two ways to load the plugin:

- **Author the effect's CSS inline** in the workbench while spiking (fastest loop;
  copy into `src/` once it's right). This is what `tw-fade`'s `hero-lab.html`
  does — the effect under test is duplicated into the lab's `<style>`.
- **Link the compiled `dist/*.css`** once the plugin builds, so you tune the real
  artifact. Rebuild-on-save (`tailwindcss --watch`) closes the loop.

No bundler, no framework. `document.createElement`, `addEventListener`,
`element.style.setProperty('--x', v)`. It must open from the filesystem.

## Anatomy (mirrors `tw-fade/demo/hero-lab.html`)

```
┌─ specimen stage ────────────────┐  ┌─ control panel (fixed) ─────┐
│  the effect on many element     │  │  GROUP: core                │
│  types, sizes, surfaces, dirs   │  │   ├ slider  angle      32°  │
│  — the matrix you tune against  │  │   ├ slider  spread    120px │
│                                 │  │  GROUP: envelope (far→near) │
│                                 │  │   ├ pair   opacity .01 .14  │
│                                 │  │   └ pair   scale  .91 .99   │
│                                 │  │  GROUP: preview             │
│                                 │  │   ├ ☐ lock   ▸ progress ──  │
│                                 │  │   ├ color ink   color bg    │
│                                 │  │  [Export] [Reset] [presets] │
│                                 │  │  ▸ readout: derived + cost  │
└─────────────────────────────────┘  └─────────────────────────────┘
            press `h` to hide the panel and see the effect clean
```

### 1. The parameter model

Drive everything from one metadata object. The panel is *generated* from it, so
adding a knob is one line, and export/reset/sync all read the same source.

```js
// Each entry: label, range, step, unit, and the CSS custom property it sets.
const META = {
  angle:  { label: 'angle',        min: 0,   max: 180, step: 1,     unit: 'deg', css: '--sheen-angle'  },
  spread: { label: 'spread',       min: 8,   max: 320, step: 1,     unit: 'px',  css: '--sheen-spread' },
  speed:  { label: 'speed (px/s)', min: 20,  max: 600, step: 5,     unit: '',    css: '--sheen-speed'  },
};
const DEFAULTS = { angle: 32, spread: 120, speed: 200, locked: false, progress: 0 };
const params = structuredClone(DEFAULTS);

function apply(key) {
  const m = META[key];
  document.documentElement.style.setProperty(m.css, params[key] + m.unit);
}
```

### 2. Control types

- **Slider** (`input[type=range]`) for any scalar. Show the live value with
  `font-variant-numeric: tabular-nums` so it doesn't jitter.
- **Color** (`input[type=color]`) for ink/surface/accent. Tuning over the *wrong*
  background hides banding and halos — let the surface change.
- **Checkbox** for booleans (lock, reduced-motion emulation, dark mode).
- **Select / segmented buttons** for enums (which utility variant, blend mode).
- **far → near pairs** for *envelopes*: when an effect interpolates a value across
  N elements or across a gradient (depth stacks, eased falloffs), expose the two
  endpoints and let the lab interpolate. `hero-lab.html` tunes 8 envelopes this
  way (`{ far, near }` per property) and bakes the interpolation into each clone.

```js
function slider(key, onInput) {
  const m = META[key];
  const wrap = el('div', 'ctrl');
  const label = el('div', 'ctrl-label');
  label.append(text(m.label), valSpan(params[key]));
  const input = Object.assign(document.createElement('input'),
    { type: 'range', min: m.min, max: m.max, step: m.step, value: params[key] });
  input.addEventListener('input', () => { params[key] = +input.value; onInput(key); });
  wrap.append(label, input);
  return wrap;
}
```

### 3. The specimen matrix — the part people skip

This is where craft is won. Render the effect against the spread of real
conditions, all on screen at once, so a fix for one case can't silently break
another. For a **shimmer**, that means at minimum:

- Text: tiny caption, body, huge display weight; a 1-line and a wrapped 3-line
  block; ALL-CAPS and lowercase; a numeric/tabular string.
- Non-text: a skeleton bar, an avatar circle, a rounded card, an image, an icon.
- Context: light surface and dark surface; a *patterned/photo* background (reveals
  halos and premultiplied-alpha seams a flat bg hides); inside a narrow column and
  a wide one; an RTL container (`dir="rtl"`); a nested instance inside another.
- States: default, hovered, `prefers-reduced-motion` emulated, `forced-colors`
  emulated (DevTools → Rendering), zoomed to 200%.

Lay them out in a simple grid. Label each cell. The goal is that one glance tells
you whether the current parameter set holds up *everywhere*, not just on the hero.

### 4. Freeze the clock (non-negotiable for scroll/time effects)

You cannot tune a 1.2s animation or a scroll-linked mask by watching it fly past.
Add a **lock** that stops the animation and a **progress** slider that sets the
driving custom property by hand:

```js
function applyLock() {
  if (params.locked) {
    stage.classList.add('is-locked');                 // .is-locked { animation: none }
    stage.style.setProperty('--progress', params.progress); // scrub 0→1 by hand
  } else {
    stage.classList.remove('is-locked');
    stage.style.removeProperty('--progress');
  }
}
```

Because the effect is built on a `@property`-registered custom property (see the
core pattern in SKILL.md), pinning that property *is* freeze-framing the
animation. Drag `progress` and you walk the effect frame by frame — that's how you
catch the banding at 30%, the overshoot at 90%, the dead zone at the start.

### 5. Live readouts + cost meter

Show the *derived* quantities the params produce, and warn about cost. `hero-lab`
prints "opacity step", "y step", and "per-frame raster cost scales with clone
count; banding rises as steps grow." Surface things like:

- The computed gradient stop count / spread in px.
- The literal utility string the current params correspond to
  (`shimmer shimmer-angle-32 shimmer-spread-120`) — so you see the public API.
- A cost note when a knob crosses into expensive territory (large blur radius,
  many filter layers, huge `baseFrequency` octaves).

### 6. Presets, reset, export

- **Presets** for the regimes you care about (e.g. `Original (20)` vs `Lean (8)`
  in `hero-lab`): the named corners of the space you keep returning to.
- **Reset** re-clones `DEFAULTS` and re-syncs every widget.
- **Export** copies a paste-ready blob to the clipboard — and shows **only what
  changed** from defaults (token economy; same rule as the `tuning-panel` skill).
  Pick the format that drops straight back into the source:

```js
function exportChanged() {
  const changed = Object.keys(META).filter(k => params[k] !== DEFAULTS[k]);
  const css = changed.map(k => `  ${META[k].css}: ${params[k]}${META[k].unit};`).join('\n');
  const out = `/* tuned ${new Date().toISOString()} — paste into @theme or :root */\n:root {\n${css}\n}`;
  navigator.clipboard?.writeText(out).catch(() => {});
  show(out); // also drop it in a <textarea> for file:// where clipboard is blocked
}
```

For a value that maps to a Tailwind token, export the `@theme` line
(`--sheen-spread-md: 120px;`). For a one-off, export the arbitrary utility
(`sheen-spread-[120px]`). Always show the human-readable `default → current` diff
too, so handing it back to an agent is unambiguous.

### 7. Ergonomics

- `h` hides/shows the panel (so you can see the effect clean), with a tiny
  re-show affordance. Guard the key so it doesn't fire while typing in a field.
- Panel is `position: fixed`, scrollable, `backdrop-filter: blur()` so it floats
  over the specimens without hiding them.
- Everything updates on `input` (live), never on `change` (commit) — you're
  dragging, you want continuous feedback.

## What good looks like

`tw-fade/demo/hero-lab.html` (≈680 lines, one file) is the reference
implementation: a metadata-driven panel, eight far→near envelope tuners, a
lock+progress freeze, live cost readout, presets, clipboard export of both a
params JSON and paste-ready markup, and an `h`-to-hide affordance — all framework-
free, opening straight from disk. Study it before building your own; copy its
skeleton and swap the model.

## Anti-patterns

- Tuning by editing the stylesheet and reloading. Too slow; you'll stop at "fine".
- A single hero specimen. You'll ship something that only works on that one case.
- No freeze for animated effects. You'll never see the bad frame.
- Pretty panel, sparse parameters. Invert it: ugly panel, every knob.
- Exporting all values. Export the diff.
