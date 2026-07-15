# CSS & SVG Arsenal for Pure-CSS Tailwind Plugins

A reference for authoring zero-JS Tailwind v4 plugins of unusual craft. Each entry: what it enables, minimal snippet, support note, and the edge it buys. `[gate behind @supports]` marks anything not yet Baseline-wide.

---

## 1. Gradients & color

### Many-stop sine-eased gradient
Replaces a 2-stop linear ramp with 14-17 stops tracing an easeInOutSine curve, killing the Mach-band "shoulder" the eye sees in linear alpha.
```css
.fade-bottom {
  -webkit-mask-image: linear-gradient(to bottom,
    rgb(0 0 0/1) 0%, rgb(0 0 0/.987) 8.1%, rgb(0 0 0/.951) 15.5%,
    rgb(0 0 0/.896) 22.5%, rgb(0 0 0/.825) 29%, rgb(0 0 0/.741) 35.3%,
    rgb(0 0 0/.648) 41.2%, rgb(0 0 0/.55) 47.1%, rgb(0 0 0/.45) 52.9%,
    rgb(0 0 0/.352) 58.8%, rgb(0 0 0/.259) 64.7%, rgb(0 0 0/.175) 71%,
    rgb(0 0 0/.104) 77.5%, rgb(0 0 0/.049) 84.5%, rgb(0 0 0/.013) 91.9%,
    rgb(0 0 0/0) 100%);
          mask-image: linear-gradient(to bottom, /* same stops */);
}
```
Baseline: Widely available (multi-stop gradients universal; as mask needs `-webkit-` for old Safari). Generate stops programmatically; ~15 is the sweet spot.
Edge: The single signature that separates "CSS default" from "designed" — core of every scrim, vignette, and fade mask.

### Gradient interpolation color space (`in oklch`)
An interpolation method controls the path colors take between stops; `in oklch` keeps perceived lightness/chroma constant for vivid transitions with no grey dead-zone.
```css
.bg     { background: linear-gradient(in oklch 90deg, magenta, cyan); }
.rainbow{ background: linear-gradient(in oklch longer hue, red, red); } /* full spectrum from 1 hue */
```
Baseline: Widely available (Chrome 111, Firefox 113, Safari 16.2). Provide a plain sRGB fallback for ancient engines.
Edge: One token (`in oklch longer hue`) turns a 2-color gradient into a perceptually-uniform spectrum.

### color-mix() falloff & transparent fades
Mixes two colors in a chosen space; `in oklch` to `transparent` fades a color without sRGB premultiply greying, and builds tints/alpha steps from one source color.
```css
.edge { background: linear-gradient(90deg, currentColor,
          color-mix(in oklch, currentColor 0%, transparent)); }
.tint { background: color-mix(in oklch, var(--accent) 12%, white); }
```
Baseline: Widely available (Chrome 111, Firefox 113, Safari 16.2).
Edge: A single `--color` knob generates an entire eased, perceptually-correct falloff.

### Relative color syntax (`oklch(from currentColor …)`)
Destructures an origin color's channels and recombines via calc; with `currentColor` an effect auto-inherits the consumer's text color while you bend L/C/alpha.
```css
.shimmer { background: linear-gradient(90deg,
  oklch(from currentColor l c h / 0),
  oklch(from currentColor calc(l * 1.4) c h / calc(alpha * .9)),
  oklch(from currentColor l c h / 0)); }
```
Baseline: Newly available (Chrome 119, Safari 16.4, Firefox 128). `@supports (color: rgb(from white r g b))`. Channels resolve to unitless numbers — write `calc(l * 1.2)`, not `120%`.
Edge: currentColor-origin makes an effect chameleonic — drop it anywhere and it themes itself.

### Color hints, hard stops & double-position shorthand
Three terse stop tricks: a bare `%` between two colors moves the midpoint; two colors at one position make a hard line; `color a b` sets start+end in one stop.
```css
.a { background: linear-gradient(90deg, #f06, 20%, #09f); }      /* midpoint hint */
.b { background: linear-gradient(90deg, #f06 50%, #09f 50%); }   /* hard stop */
.c { background: linear-gradient(90deg, #f06 0 50%, #09f 50% 100%); } /* bands */
```
Baseline: Widely available (CSS Images 4, all current engines).
Edge: Double-position stops express N bands in N stops, keeping generated CSS tight.

### Animatable conic-gradient via `@property <angle>`
A typed `<angle>` makes a conic gradient's `from` start animatable — spinning rings, angular gradients, progress arcs.
```css
@property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.spinner { background: conic-gradient(from var(--a),
  oklch(.7 .2 0), oklch(.7 .2 120), oklch(.7 .2 240), oklch(.7 .2 0));
  animation: turn 3s linear infinite; }
@keyframes turn { to { --a: 360deg; } }
```
Baseline: conic-gradient Widely available (2020); smooth animation needs `@property` (2024). Duplicate the start color at the end to hide the 0/360 seam.
Edge: Cleanest pure-CSS rotating-gradient primitive; same angle math drives shimmer bands.

### Multi-radial mesh / aurora field
Layers 3-6 transparent-edged radial blobs over a base in one `background`, each positioned independently, for an Apple-style mesh gradient with zero DOM.
```css
.mesh-glow {
  background-color: var(--mesh-base, oklch(18% .03 280));
  background-image:
    radial-gradient(40% 50% at var(--m1,20% 25%), var(--c1, oklch(72% .2 320/.55)), transparent 70%),
    radial-gradient(45% 55% at var(--m2,80% 20%), var(--c2, oklch(75% .18 230/.5)),  transparent 72%),
    radial-gradient(50% 60% at var(--m3,65% 80%), var(--c3, oklch(78% .21 160/.5)),  transparent 75%);
}
```
Baseline: Widely available. Use `%` sizes + `at <pos>` so blobs scale; end stops on a hue-matched `/0` to avoid grey halos.
Edge: One utility + N position/color knobs reproduces a paid mesh-gradient generator.

### Many-stop sine-eased OKLCH iridescent ramp
Hue advances linearly while L/C follow a sine curve, giving perceptually-even foil banding that stays saturated through transitions.
```css
.iri { background: linear-gradient(var(--iri-angle,110deg),
  oklch(62% .18 0) 0%, oklch(70% .20 40) 9%, oklch(80% .16 90) 18%,
  oklch(72% .20 140) 27%, oklch(64% .22 190) 36%, oklch(70% .20 240) 50%,
  oklch(78% .17 290) 64%, oklch(68% .21 330) 78%, oklch(62% .18 360) 100%);
  background-size: 200% 100%; }
```
Baseline: Widely available (OKLCH gradients, 2023).
Edge: Same sine-easing discipline as the fade mask, applied to color — even iridescence, not lumpy rainbow.

### background-blend-mode (single-element duotone/foil)
Blends an element's OWN background layers against each other — duotone, tinted, or multi-gradient foil with no child elements and no stacking-context juggling.
```css
.duotone {
  background:
    linear-gradient(oklch(.3 .12 250), oklch(.3 .12 250)),
    linear-gradient(oklch(.85 .15 90), oklch(.85 .15 90)),
    url(photo.jpg);
  background-size: cover;
  background-blend-mode: lighten, multiply, normal;
}
```
Baseline: Widely available (~2020). The list maps 1:1 to layers; last value hits the base. Never reaches the page behind the element.
Edge: Full multi-layer blended duotone/foil in one class on one element — no wrappers, no isolation footguns.

---

## 2. Masking & compositing

### Four-edge fade via `mask-composite: intersect`
Stacks two directional gradient masks and keeps only where BOTH are opaque, fading all four edges at once.
```css
.fade-all {
  --e: 2rem;
  -webkit-mask-image:
    linear-gradient(to right,  #0000, #000 var(--e), #000 calc(100% - var(--e)), #0000),
    linear-gradient(to bottom, #0000, #000 var(--e), #000 calc(100% - var(--e)), #0000);
          mask-image: /* same two */;
  -webkit-mask-composite: source-in;  /* legacy WebKit keyword */
          mask-composite: intersect;  /* standard */
}
```
Baseline: Widely available since Dec 2023; WebKit prefix uses DIFFERENT keywords (`source-in` ≠ `intersect`) — emit both. Default composite is `add`, which won't fade corners.
Edge: Two gradients + intersect replace a hand-drawn corner mask; each edge can carry its own sine easing.

### Gradient border via `mask-composite: exclude`
Paints a gradient only in the border band of a rounded box — full border-box layer minus padding-box layer — so the gradient follows the radius (unlike `border-image`).
```css
.grad-border {
  border-radius: 1rem; border: 2px solid transparent;
  background: linear-gradient(135deg, #f0a, #0af) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;      /* legacy */
          mask-composite: exclude;  /* standard */
}
```
Baseline: Newly available (Chrome 120 / Dec 2023, Safari 15.4, Firefox 53+). Ship both `xor` and `exclude`.
Edge: The ONLY way to get a gradient/conic ring that respects border-radius AND any backdrop behind it. (No-mask alternative: layer a `padding-box` solid fill over a `border-box` gradient when the interior is opaque.)

### mask-mode luminance + inline-SVG data-URI masks
`mask-mode: luminance` uses brightness (white=show, black=hide) so you author masks as opaque B/W SVG art — far easier than alpha — embedded with zero requests.
```css
.knockout {
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="white"/></svg>');
  mask-mode: luminance; mask-size: contain; mask-repeat: no-repeat;
}
```
Baseline: Widely available (mask-image Dec 2023; mask-mode Chrome 120+, FF 53+, Safari 15.4+). URL-encode `#` as `%23` inside the SVG.
Edge: Complex reveal shapes as white-on-black art are dramatically more intuitive than alpha, and stay self-contained in CSS.

### background-clip: text (the load-bearing primitive)
Pours any paintable background into glyph shapes; the foundation for gradient text, image-filled text, and animated shimmer text.
```css
.clip-text {
  color: var(--clip-fallback, currentColor);      /* readable fallback FIRST */
  background-image: linear-gradient(90deg, #f0f, #0ff);
}
@supports ((background-clip: text) or (-webkit-background-clip: text)) {
  .clip-text {
    background-clip: text; -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
  }
}
```
Baseline: Near-Baseline (unprefixed Chrome 120 / Dec 2024; Safari 14+, Firefox 49+; `-webkit-` alias everywhere). Gate the transparent fill or Firefox renders invisible text. `text-shadow` paints over the fill and ruins it.
Edge: One core utility consuming a `--gradient` knob delivers gradient text, image text, and shimmer text with zero extra plumbing.

### Knockout text (`mix-blend-mode` + `isolation`)
The inverse of clip-text: letters become transparent windows onto the backdrop while the surrounding block stays opaque — over images or video.
```css
.knockout { background: url(photo.avif) center/cover; isolation: isolate; }
.knockout > .band { background:#000; color:#fff; mix-blend-mode: multiply; }
/* screen variant: white band + black text */
```
Baseline: Widely available (mix-blend-mode + isolation, years). `multiply` needs black band + white text; `isolation:isolate` is non-negotiable or it blends the whole page.
Edge: Accessible, selectable cutout text over animated backdrops from one blend declaration.

### Clip-to-text masking (effect stacking)
When one background isn't enough, `mask-image` confines an arbitrary effect layer (blur, grain, second gradient) to the text silhouette, combinable with edge-fade via intersect.
```css
.text-masked-fx {
  -webkit-mask-image: linear-gradient(#000 0 100%);
          mask-image: linear-gradient(#000 0 100%);
  -webkit-mask-composite: source-in; mask-composite: intersect;
}
```
Baseline: Widely available (mask-image 2023; composite as above). Real text-shaped masking needs an SVG `<text>`/alpha source.
Edge: Bridges fade + shimmer — a clipped headline can ALSO carry edge falloff and text-shaped blurs/glows no single background can produce.

### mix-blend-mode lighting (`screen`, `plus-lighter`, `color-dodge`)
Additive light compositing for glows, light-leaks, and self-masking sheen — contained by `isolation:isolate`.
```css
.glow-stack { isolation: isolate; }
.glow-stack > .layer { mix-blend-mode: plus-lighter; } /* true additive light */
/* color-dodge sheen: black source regions pass through (the blend IS the mask) */
.specular { mix-blend-mode: color-dodge;
  background: linear-gradient(115deg,#000 35%, oklch(85% .12 280) 50%, #000 65%); }
```
Baseline: `screen`/`color-dodge` Widely available; `plus-lighter` Newly available (~2024) — `@supports (mix-blend-mode: plus-lighter)`, fall back to `screen`.
Edge: `plus-lighter` is the physically-correct "add light" op most authors skip; `color-dodge` with black brackets gives a maskless self-masking sweep.

---

## 3. Filters & backdrop

### Inline SVG filter as a data-URI fragment
References an SVG `<filter>` from CSS with no separate file or DOM — the whole pipeline (turbulence, displacement, lighting) ships inside the CSS bundle.
```css
.gooey {
  filter: url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg">\
  <filter id="goo">\
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>\
    <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/>\
  </filter>\
</svg>#goo');
}
```
Baseline: `filter: url()` Widely available. The trailing `#goo` MUST stay a literal `#`; any `#` INSIDE the SVG (hex colors) must be `%23` — prefer named/`rgb()` colors. `feImage` data-URIs fail in WebKit.
Edge: The single highest-leverage move — unlocks the entire SVG filter pipeline from a zero-JS, single-file plugin.

### backdrop-filter + mask (edge-confined frosted glass)
Blurs page content behind an element, then masks the blur to a shape or fades one edge; over-extend + mask back to let neighbouring colors bleed in like real glass.
```css
.backdrop {
  position:absolute; inset:0; height:200%;       /* over-extend to sample neighbours */
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  -webkit-mask-image: linear-gradient(to bottom, #000 0 50%, transparent 50% 100%);
          mask-image: linear-gradient(to bottom, #000 0 50%, transparent 50% 100%);
  pointer-events: none;
}
```
Baseline: backdrop-filter Newly available (Sep 2024); keep `-webkit-`. Nested backdrop-filters sample the parent's already-filtered output (fix: `isolation:isolate`). Firefox bug: breaks under ancestor with both `overflow` + `border-radius`.
Edge: Pair with the sine-eased mask instead of a 2-stop linear and the glass fades perceptually; intersect four edges to shape it with zero clip-path.

### backdrop-filter: url(#svg) — Chromium liquid-glass `[gate behind @supports]`
Applies an SVG displacement filter to the backdrop for true Apple-style lensing, degrading to plain blur elsewhere.
```css
@supports (backdrop-filter: blur(1px)) {
  .lens { backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
}
@supports (backdrop-filter: url(#glass)) and (not (-moz-appearance: none)) {
  .lens { backdrop-filter: url(#glass) blur(2px); }
}
```
Baseline: SVG-on-backdrop is Chromium-ONLY (WebKit/Firefox drop the SVG, keep blur). Pure progressive enhancement.
Edge: A "liquid-glass" tier that lights up in Chromium and degrades to frosted glass everywhere — the @supports-gated, static-fallback pattern.

### filter: drop-shadow() following alpha geometry
Casts a shadow from the actual non-transparent silhouette (text, cutouts, masked shapes) — impossible with box-shadow.
```css
.cutout { filter: drop-shadow(0 4px 6px rgb(0 0 0 / .4)); }
.sticker{ filter: drop-shadow(1px 0 0 #fff) drop-shadow(-1px 0 0 #fff)
                  drop-shadow(0 1px 0 #fff) drop-shadow(0 -1px 0 #fff); }
```
Baseline: Widely available (2016). No inset/spread; re-rasterizes (pricier than box-shadow); fully `@property`-drivable.
Edge: Four orthogonal drop-shadows = a 1px alpha-following stroke; many soft ones = a contour glow.

### @property-typed customs as live filter knobs
Registers filter params (`<length>` blur, `<angle>` hue) as typed customs so a core utility consumes them AND they animate in keyframes (raw `var()` in filter cannot).
```css
@property --blur{ syntax:"<length>"; inherits:false; initial-value:0px; }
@property --hue { syntax:"<angle>";  inherits:false; initial-value:0deg; }
.fx{ filter: blur(var(--blur)) hue-rotate(var(--hue)); }
@keyframes spin{ to{ --hue:360deg; } }
```
Baseline: @property Newly available (2024). Unregistered customs can't interpolate in keyframes. SVG-filter *attributes* still aren't CSS-animatable.
Edge: The core-utility-plus-knobs architecture applied to filters — surprising depth from a tiny API.

### Filter ordering & inputs
CSS filter functions compose left-to-right; SVG inputs `SourceGraphic`/`SourceAlpha`/named results branch the graph. Backdrop access is `backdrop-filter` ONLY — the `BackgroundImage` filter input was never implemented.
```css
.a{ filter: drop-shadow(4px 4px 0 red) hue-rotate(180deg); } /* shadow gets recolored */
.b{ filter: hue-rotate(180deg) drop-shadow(4px 4px 0 red); } /* shadow stays red */
```
Baseline: Widely available. Don't use `in="BackgroundImage"` — renders nothing.
Edge: Treating filter order as a composition operator is a cheap source of distinct utilities.

---

## 4. SVG filter primitives

All ride the data-URI bridge to stay single-file. Set `color-interpolation-filters="sRGB"` on color work — the `linearRGB` default shifts thresholds and tints. SVG attributes (`baseFrequency`, `scale`, `radius`, `kernelMatrix`) are NOT CSS-animatable.

### feTurbulence — procedural noise / grain / texture
`fractalNoise` = clouds/paper/marble; `turbulence` = veins/flame. `baseFrequency` sets scale (2 values = anisotropic), `numOctaves` adds detail, `stitchTiles="stitch"` tiles seamlessly.
```svg
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0"/>
</filter>
```
Baseline: Widely available (2015). The universal displacement source downstream.
Edge: A zero-asset, infinitely-scalable, seamlessly-tiling texture generator in a few hundred bytes.

### feDisplacementMap — liquid warp / glass / heat-haze
Pushes pixels by the color channels of a displacement map; feed it turbulence for ripple/refraction.
```svg
<filter id="warp" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="m"/>
  <feDisplacementMap in="SourceGraphic" in2="m" scale="28" xChannelSelector="R" yChannelSelector="G"/>
</filter>
```
Baseline: Widely available on `filter`; CHROMIUM-ONLY on `backdrop-filter`. Pad the filter region or warp clips at edges.
Edge: The "how is this even CSS" primitive — water, flag wave, heat shimmer, melting type, chromatic aberration.

### feColorMatrix — duotone / channel remap / luminanceToAlpha
4×5 matrix remapping RGBA; `type="luminanceToAlpha"` turns brightness into an alpha stencil.
```svg
<filter id="duo" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values="0.6 0.6 0.6 0 0  0.1 0.1 0.1 0 0  0.4 0.4 0.4 0 0  0 0 0 1 0"/>
</filter>
```
Baseline: Widely available (2015). `hue-rotate()` is luminance-preserving, NOT a true HSL shift — use the matrix for accuracy.
Edge: `luminanceToAlpha` derives masks from rendered content (emboss→mask, gradient→cutout) inside the filter graph.

### feComponentTransfer — posterize / threshold / solarize / curves
Per-channel transfer functions: `discrete` quantizes (posterize/threshold), descending `table` solarizes, `gamma`/`linear` do levels.
```svg
<filter id="poster" color-interpolation-filters="sRGB">
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 .25 .5 .75 1"/>
    <feFuncG type="discrete" tableValues="0 .25 .5 .75 1"/>
    <feFuncB type="discrete" tableValues="0 .25 .5 .75 1"/>
  </feComponentTransfer>
</filter>
<!-- 1-bit threshold: feFuncA discrete "0 1" -->
```
Baseline: Widely available (2015). Band boundaries sit at `k/n`, not at the values.
Edge: `feFuncA discrete "0 1"` binarizes anti-aliased alpha into a crisp stencil — foundation for cutout text and 1-bit dither.

### feMorphology — dilate/erode outlines & sticker edges
Grows/shrinks the alpha silhouette; dilate→flood→composite-original gives an even outline at any thickness.
```svg
<filter id="sticker">
  <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="spread"/>
  <feFlood flood-color="white" result="c"/>
  <feComposite in="c" in2="spread" operator="in" result="border"/>
  <feMerge><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```
Baseline: Widely available (2015). Square kernel blocks corners at large radius — soften with a tiny blur.
Edge: The only robust way to put a thick even outline around arbitrary shapes AND text — `text-stroke` maxes out thin and uneven.

### feSpecular/feDiffuseLighting — bevels, glass, emboss
Treats a blurred alpha as a height map and lights it with a distant/point/spot light.
```svg
<filter id="bevel" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="h"/>
  <feSpecularLighting in="h" surfaceScale="4" specularConstant=".9" specularExponent="20"
     lighting-color="#fff" result="spec"><fePointLight x="-50" y="-100" z="120"/></feSpecularLighting>
  <feComposite in="spec" in2="SourceAlpha" operator="in" result="clip"/>
  <feComposite in="SourceGraphic" in2="clip" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
</filter>
```
Baseline: Widely available (SVG 1.1). Clip specular back to `SourceAlpha` or light spills past the shape.
Edge: A real lighting model — glassy edge highlights and letterpress emboss no box/inset-shadow stack can reproduce.

### feConvolveMatrix — emboss / sharpen / edge-detect
Arbitrary NxM convolution kernel; the browser's image-processing engine.
```svg
<filter id="emboss" color-interpolation-filters="sRGB">
  <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="1 0 0  0 0 0  0 0 -1" divisor="1" bias="0.5"/>
</filter>
<!-- sharpen: "0 -1 0  -1 5 -1  0 -1 0"  | edge-detect: "0 1 0  1 -4 1  0 1 0" -->
```
Baseline: Widely available. The most expensive primitive — keep `order="3"` and the element small; set `preserveAlpha="true"`.
Edge: Photoshop-grade convolution with no canvas/JS — reads as "how did they do that" on a small hero/icon.

### Gooey / metaball threshold (blur → alpha contrast)
Blurs a group so shapes bleed, then `feColorMatrix` snaps alpha back to a hard edge, fusing blobs with organic necks; RGB untouched.
```svg
<filter id="goo">
  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/>
  <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
  <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
</filter>
```
Baseline: Widely available. Keep `stdDeviation`/matrix STATIC; animate children's cheap transforms. (CSS-only approximation: `filter: blur(10px) contrast(20)`, but contrast shifts color too.)
Edge: Converts cheap CSS-transform motion into expensive-looking fluid metaball physics.

### Compositing toolkit — feFlood/Composite/Merge/Blend/Offset/Tile/Image
The plumbing: `feFlood`+`feComposite operator="in"` against `SourceAlpha` recolors any shape; `feTile` repeats a tiny noise patch across the viewport; `operator="arithmetic"` is the precise-blend escape hatch.
```svg
<filter id="recolor">
  <feFlood flood-color="oklch(0.7 0.18 30)" result="c"/>
  <feComposite in="c" in2="SourceAlpha" operator="in" result="tint"/>
</filter>
```
Baseline: Widely available (2015). `feImage` with a data-URI is refused by WebKit — the #1 "works in Chrome, blank in Safari" cause.
Edge: Asset-free brand-color tinting (incl. OKLCH) from a shape's own alpha; tiling backbone of every texture recipe.

### SVG dithering — Bayer & noise threshold
Ordered dither: a tiny Bayer matrix via `feImage`+`feTile`, added to source, then `discrete "0 1"`. Noise dither (WebKit-safe, no `feImage`): turbulence + `luminanceToAlpha` + arithmetic + threshold.
```svg
<filter id="noisedither" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" stitchTiles="stitch" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="nm"/>
  <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lum"/>
  <feComposite in="lum" in2="nm" operator="arithmetic" k1="0" k2="1" k3="1" k4="-0.5"/>
  <feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
</filter>
```
Baseline: Noise dither Widely available. Bayer `[gate behind @supports]` — `feImage` data-URI unreliable in Safari; ship the noise variant as default.
Edge: Quantizes tone through noise to authentic 1-bit/Game-Boy stipple, self-contained and asset-free.

---

## 5. Animation & timelines

### @property typed customs — the interpolation substrate
Registering a custom property with a typed `syntax` makes the browser interpolate it; one from/to keyframe on ONE number then drives an arbitrarily complex multi-stop gradient/mask/transform via calc.
```css
@property --pos { syntax: "<length>"; inherits: false; initial-value: 0px; }
.shimmer { background: linear-gradient(45deg, transparent, white 50%, transparent);
  background-position: var(--pos) 0; animation: sweep 2s linear infinite; }
@keyframes sweep { to { --pos: var(--shimmer-track-width, 100%); } }
```
Baseline: Newly available (Chrome 85, Safari 16.4, Firefox 128 / Jul 2024) — the most portable piece of the arsenal. **Footgun:** a `syntax`/`initial-value` mismatch (e.g. `<number>` with `0px`) drops the ENTIRE rule silently, so the animation goes dead. `inherits:false` scopes knobs and stops nested-effect leakage; set `true` only for container broadcast vars.
Edge: Decouples "what interpolates" (one number) from "what renders" (dozens of stops) — one keyframe fans out to a 17-stop sine gradient.

### Keyframes that set custom properties (signal generator)
Keyframes can assign typed customs at each stop; one animation emits a `--t` that N downstream utilities each consume differently.
```css
@property --t { syntax: "<number>"; inherits: true; initial-value: 0; }
@keyframes phase { 0%{--t:0} 50%{--t:1} 100%{--t:0} }
.el { animation: phase 3s linear infinite;
  filter: blur(calc(var(--t)*4px)); opacity: calc(1 - var(--t)*.5); }
```
Baseline: Composition of Baseline features. Unregistered customs snap at 50%.
Edge: One animation, one typed signal, many consumers — maximal effect per line.

### Scroll-driven timeline → typed knobs `[gate behind @supports]`
`animation-timeline: scroll()/view()` drives keyframes by scroll/visibility, not time. Used as a *value sampler* (not animator), it converts scroll position into typed customs that masks/gradients consume.
```css
@property --fade { syntax: "<number>"; inherits: true; initial-value: 1; }
.fade { mask-image: none; }               /* static fallback */
@supports (animation-timeline: scroll()) {
  .fade { mask-image: linear-gradient(/* sine stops */);
    animation: edge linear both; animation-timeline: scroll(self block); }
  @keyframes edge { from { --fade: 0; } to { --fade: 1; } }
}
```
Baseline: NOT Baseline — Chrome 115+, Safari 26; Firefox behind flag mid-2026. MUST gate; probe the function `scroll()`, not just `animation-timeline: auto`. Firefox needs non-zero `animation-duration` (1ms). `animation-duration` is ignored; use `fill-mode: both`.
Edge: Pure-CSS scroll reactivity with zero JS — the exact pattern behind tw-fade's reveal.

### View-progress timeline & named ranges `[gate behind @supports]`
`view()` + `animation-range` (entry/cover/exit) replaces IntersectionObserver thresholds with declarative range strings.
```css
.card { animation: reveal linear both; animation-timeline: view(block);
  animation-range: entry 0% entry 80%; }
@keyframes reveal { to { --reveal: 1; } }
.card { opacity: calc(0.2 + 0.8 * var(--reveal)); }
```
Baseline: NOT Baseline (same engines as scroll()).
Edge: "Animate during entry, hold during cover, reverse during exit" is three words, not a JS observer.

### Named timelines + timeline-scope `[gate behind @supports]`
`scroll-timeline-name`/`view-timeline-name` publish a timeline; `timeline-scope: --name` on a common ancestor lets non-descendant siblings be driven by it (progress bars, scroll-spy rails).
```css
.wrap { timeline-scope: --page; }
.article { scroll-timeline: --page block; overflow-y: auto; }
.progress-bar { animation: grow linear both; animation-timeline: --page; transform-origin: left; }
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```
Baseline: NOT Baseline; `timeline-scope` narrower than the timeline names.
Edge: The only pure-CSS way to let a knob element react to a different element's scroll.

### linear() custom easing — springs / bounce / overshoot
Approximates arbitrary curves (incl. values >1 for overshoot) anywhere ease/cubic-bezier works.
```css
.pop { transition: transform .5s linear(0, 0.25, 0.7, 1.05, 1.2 55%, 1.12, 1.0, 0.98, 1.0); }
.pop:hover { transform: scale(1.1); }
```
Baseline: Newly available (Chrome 113, Firefox 112, Safari 17.2). Generate points from a spring sim.
Edge: GSAP-style springs in pure CSS; ease a typed `--t` with a spring and every consumer inherits the bounce.

### Multiple timelines & animation-composition
`animation-*` are comma-lists: one element can run a time-based idle motion AND a scroll-driven transform, combined with `animation-composition: add|accumulate`.
```css
.hero {
  animation: idle-float 6s ease-in-out infinite, scroll-tilt linear both;
  animation-timeline: auto, view(block);
  animation-composition: accumulate, accumulate;
}
```
Baseline: Multi-animation + composition Widely available (2023); per-list scroll timeline gated as above. The time-based entry runs everywhere.
Edge: One element, two clocks — scroll reaction stacked on ambient motion without a precomputed combined keyframe.

---

## 6. Layout, shape & container

### Size container queries + container units
`cqi/cqb/cqw` resolve against the query container, so effect geometry scales to the component (logical units are RTL/vertical correct for free).
```css
.wrap { container-type: inline-size; }
.shimmer { --track: 100cqi; background-size: var(--track) 100%; }
@container (min-width: 40ch) { .shimmer { --spread: 30cqi; } }
```
Baseline: Widely available (2023). `container-type: size` needs explicit block size; containment can clip overflow effects.
Edge: One core utility produces a perceptually identical effect at any component scale, no media queries.

### Style container queries — `style(--x: y)` `[gate behind @supports for FF<151]`
A descendant restyles itself on the COMPUTED value of an ancestor custom property — a pure-CSS state machine / mode switchboard.
```css
.card { container-name: card; --tone: cool; }
.card:hover { --tone: warm; }
@container card style(--tone: warm) { .fx { --grad: linear-gradient(oklch(.7 .18 40), transparent); } }
@container card style(--tone: cool) { .fx { --grad: linear-gradient(oklch(.7 .14 250), transparent); } }
.fx { background-image: var(--grad); }
```
Baseline: Baseline May 2026 (Firefox 151 completed it). Discrete switch — put an animatable `@property` inside the branch for smooth transitions.
Edge: Turns knob utilities into a declarative mode switchboard — dozens of named modes, no JS.

### corner-shape + superellipse() — squircles/scoops/notches `[gate behind @supports]`
Replaces the elliptical corner arc with any superellipse; the `k` parameter animates round↔notch.
```css
@property --k { syntax: "<number>"; inherits: false; initial-value: 2; }
.btn { border-radius: 24px; corner-shape: superellipse(var(--k)); transition: --k .3s; }
.btn:hover { --k: -1; }                        /* squircle -> scoop */
.ticket { border-radius: 16px; corner-shape: scoop round scoop round; }
```
Baseline: NOT Baseline — Chrome 139+ only (2025). No effect unless `border-radius` is non-zero.
Edge: An animatable squircle/scoop/notch knob set — impossible before 2025 without SVG masks.

### shape() — responsive animatable clip paths
A `path()`-style geometry language accepting `%`, `calc()`, and custom properties — fluid blobs, flag waves, morphing reveals.
```css
@property --wave { syntax: "<length>"; inherits: false; initial-value: 20px; }
.flag { clip-path: shape(from 0% var(--wave),
  curve to 100% var(--wave) with 25% 0% / 75% calc(var(--wave)*2),
  vline to calc(100% - var(--wave)),
  curve to 0% calc(100% - var(--wave)) with 75% 100% / 25% calc(100% - var(--wave)*2), close);
  animation: flap 3s ease-in-out infinite alternate; }
@keyframes flap { to { --wave: 40px; } }
```
Baseline: Newly available (Chrome 135, Safari 18.4, Firefox 148 / Feb 2026). Both keyframes need the same command structure to interpolate.
Edge: Replaces inline SVG clipPath + viewBox math with CSS that responds to container units.

### offset-path / motion path
Moves an element along a path via animatable `offset-distance`; pairs with scroll timelines for scrub-along-path.
```css
@property --d { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
.comet { offset-path: shape(from 0 0, curve to 200px 0 with 100px -80px / 100px 80px);
  offset-distance: var(--d); offset-rotate: auto; animation: travel 4s linear infinite; }
@keyframes travel { to { --d: 100%; } }
```
Baseline: Core Widely available (~2022); `shape()` in offset-path newer — gate that variant.
Edge: Pure-CSS "scrub a sprite along a custom curve" most authors still reach for JS to do.

### CSS anchor positioning `[gate behind @supports for old tails]`
Tethers a positioned element to any other's box without shared ancestry — tooltips, connector underlines, spotlight-follows-element.
```css
.btn { anchor-name: --btn; }
.tip { position: absolute; position-anchor: --btn; position-area: top center;
  min-width: anchor-size(--btn width); position-try-fallbacks: flip-block; }
```
Baseline: Baseline 2026 (Chrome 125, Firefox 147, Safari 26).
Edge: `anchor-size()` makes a glow/underline inherit the trigger's geometry — defined once, re-anchors to anything.

### @scope — donut-scoped effect islands `[gate behind @supports for old tails]`
Scopes rules to a subtree with an optional lower boundary; proximity-weights by DOM closeness, not specificity.
```css
@scope (.fx-island) to (.fx-stop) {
  :scope { --grad-angle: 135deg; }
  .title { background: linear-gradient(var(--grad-angle), currentColor, transparent);
    -webkit-background-clip: text; color: transparent; }
}
```
Baseline: Newly available Jan 2026 (Firefox 146 completed it). Unsupported browsers drop the whole block — keep sane unscoped defaults.
Edge: An `fx-island` wrapper whose descendants pick up effect vars by proximity — nested theming with no JS or BEM.

### :has() — parent/sibling/state reactivity
The relational selector WRITES a custom property based on descendant/sibling state; `@property` + transition gives smooth consequences.
```css
.panel:has(input:checked) { --glow: 1; }
.grid:has(.card:hover) .card:not(:hover) { opacity: .5; }
.fx { filter: drop-shadow(0 0 calc(var(--glow,0) * 12px) currentColor); }
```
Baseline: Widely available since Dec 2023. Wrap risky sub-selectors in `:where()` so a typo doesn't drop the rule.
Edge: With style queries, the second pillar of JS-free reactivity — interaction state drives effect variables.

### Form & typography polish
`field-sizing: content` shrink-wraps inputs `[gate, no Firefox]`; `text-wrap: balance` evens heading lines (`pretty` degrades harmlessly).
```css
textarea, input, select { field-sizing: content; min-width: 4ch; max-width: 40ch; }
h1, .badge { text-wrap: balance; }
p { text-wrap: pretty; }
```
Baseline: `balance` Widely available; `pretty` no-op in Firefox; `field-sizing` Chrome 123+/Safari 26+, no Firefox.
Edge: Effects keyed to live text metrics (underline as wide as typed text); a shimmer heading with `balance` reads as hand-set type.

### Emerging value/function logic `[gate behind @supports — Chromium-only]`
`if()` branches inline on `style()/media()/supports()`; `@function` defines reusable parameterized math; `interpolate-size: allow-keywords` animates to `auto`; `sibling-index()` enables JS-free staggering.
```css
padding: if(media(width < 700px): 0.5rem; else: 1rem);
li { animation-delay: calc(sibling-index() * 60ms); }
:root { interpolate-size: allow-keywords; }   /* height:0 -> auto now animates */
```
Baseline: All NOT Baseline (Chromium-only, 2025). Always write a plain fallback declaration first.
Edge: Chromium-only sugar over already-working calc/custom-property implementations — treat as enhancement.

### ::details-content & ::scroll-marker carousels
`::details-content` animates native disclosures (Baseline); `::scroll-marker`/`::scroll-button` build accessible JS-free carousels `[gate]`.
```css
details::details-content { opacity: 0; transition: opacity .3s, content-visibility .3s allow-discrete; }
details[open]::details-content { opacity: 1; }
.track { scroll-snap-type: x mandatory; scroll-marker-group: after; }
.track > li::scroll-marker { content:""; width:.6em; height:.6em; border-radius:50%; background:#bbb; }
.track > li::scroll-marker:target-current { background:#111; }
```
Baseline: `::details-content` Newly available; carousel pseudos Chrome 135+/Safari 18.2, no Firefox — gate.
Edge: JS-free accessible carousel + animated accordion — the headline "how is this pure CSS" demos.

### CSS 3D scene primitives
`perspective` on a PARENT shares one vanishing point; `transform-style: preserve-3d` keeps children in real depth; `backface-visibility` enables flip cards.
```css
.scene { perspective: 800px; perspective-origin: 50% 30%; }
.flip-inner { display: grid; transform-style: preserve-3d; transition: transform .6s; }
.flip:hover .flip-inner, .flip:focus-within .flip-inner { transform: rotateY(180deg); }
.flip-face { grid-area: 1/1; backface-visibility: hidden; }
.flip-back { transform: rotateY(180deg); }
```
Baseline: Widely available. **Major footgun:** `overflow≠visible`, `opacity<1`, `filter`, `mask-image`, `isolation` all silently force `preserve-3d` back to flat — split into outer-clips / inner-preserves-3d. Drive rotation through `@property <angle>` customs to animate smoothly; pair `:hover` with `:focus-within` for keyboard access.
Edge: Knowing the flattening rule (and the two-element split) avoids the #1 "why is my cube flat" bug; `@property` angles make tilt tactile, not janky.

---

## 7. Text outline & dimensional type

### Non-eroding outline (`paint-order: stroke fill`)
Paints the centered stroke first and the fill on top, hiding the inner half so the stroke reads as a clean outside edge that never thins glyphs.
```css
.text-outline {
  color: var(--ink, #fff);
  -webkit-text-stroke: var(--stroke-w, 3px) var(--stroke-c, #000);
  paint-order: stroke fill;
}
```
Baseline: `paint-order` Newly available (2024); `-webkit-text-stroke` everywhere under prefix. `paint-order` is discrete (can't tween).
Edge: The one-line fix for "thick stroke makes type anemic" — lets an outline-width knob scale to 6-8px razor-sharp. For double-strokes/halo rings, escape to inline SVG `<text>` with stacked `<use>`.

### Loop-generated long-shadow & retro bevel
Stacked hard (`blur 0`) `text-shadow` copies on a 45° vector make a continuous extrusion; alternating light/dark OKLCH stops add a bevel.
```css
.text-bevel { color: oklch(92% .12 95);
  text-shadow: -1px -1px 0 oklch(100% 0 0/.7),
    1px 1px 0 oklch(60% .14 50), 2px 2px 0 oklch(55% .14 50), 3px 3px 0 oklch(50% .14 50),
    4px 4px 0 oklch(45% .14 50), 6px 6px 8px oklch(20% .05 50/.55); }
```
Baseline: Widely available. Generate the stack at build time. `forced-colors` strips `text-shadow` — keep the base glyph legible.
Edge: Step OKLCH lightness so one base color yields a perceptually-even ramp: `oklch(from var(--c) calc(l - .07*N) c h)`.

### Neon tube (stroke core + stacked OKLCH glow)
A thin bright stroke + near-white fill + progressively-blurred same-hue shadows, all derived from one `--tube` color.
```css
.neon {
  --tube: oklch(80% .26 200);
  color: oklch(from var(--tube) 96% .08 h);
  -webkit-text-stroke: 1px var(--tube); paint-order: stroke fill;
  text-shadow: 0 0 4px oklch(from var(--tube) l c h/.9), 0 0 10px oklch(from var(--tube) l c h/.8),
               0 0 24px oklch(from var(--tube) l c h/.6), 0 0 48px oklch(from var(--tube) l c h/.4);
}
@media (forced-colors: active) { .neon { text-shadow: none; } }
```
Baseline: Relative color needs Firefox 128+ — `@supports (color: oklch(from red l c h))`.
Edge: One `--tube` knob recolors AND dims the whole tube + bloom coherently.

---

## 8. Highlight pseudo-elements

Restricted palette for ALL highlights: `color`, `background-color` (NOT `background`/`background-image`), `text-decoration` family, `text-shadow`, `-webkit-text-stroke` (Chromium). Everything else silently no-ops. Variables resolve against the ORIGINATING element. Gate non-`::selection` pseudos with `@supports selector(...)`.

### Branded ::selection
```css
:root { --sel-bg: oklch(.8 .15 250); --sel-fg: oklch(.2 0 0); }
:root::selection { background-color: var(--sel-bg); color: var(--sel-fg); }
```
Baseline: Works everywhere but poorly `@supports`-detectable — treat as progressive enhancement. Use `:root::selection` (preserves highlight inheritance) not `*::selection` (severs it).
Edge: Selection as a first-class brand surface, themeable by var knobs.

### ::target-text, ::spelling-error, ::highlight()
`::target-text` brands scroll-to-text-fragment landings; `::spelling-error`/`::grammar-error` brand squiggles with free UA-supplied ranges; `::highlight(name)` styles Custom Highlight ranges (CSS-only; range creation needs one line of JS).
```css
@supports selector(::target-text) {
  ::target-text { background-color: oklch(.92 .16 95); color: oklch(.25 0 0); }
}
@supports selector(::highlight(x)) {
  ::highlight(brand-find) { background-color: oklch(.9 .16 95 / .45); color: oklch(.2 0 0); }
}
```
Baseline: `::target-text` Newly available (late 2024); `::highlight()` ~June 2025; spelling/grammar Chromium-leaning.
Edge: Rare polish surfaces — branded deep-link emphasis and find-in-page overlays for a few properties behind one gate.

### caret-color & accent-color theming
Animated brand caret (`caret-animation: manual` disables UA blink `[gate]`; or `caret-color: transparent` + faux `::after` for portability); `accent-color` themes native controls from one var.
```css
@keyframes caret { 0%,49%{caret-color: oklch(.7 .2 250)} 50%,100%{caret-color: transparent} }
.editor { caret-animation: manual; animation: caret 1.06s steps(1,end) infinite; }
:root { --accent: oklch(.62 .2 265); }
input[type=checkbox], input[type=range], progress { accent-color: var(--accent); }
```
Baseline: `caret-color`/`accent-color` Widely available; `caret-animation` Chromium-only 2025. `forced-colors` → `accent-color: auto`.
Edge: One var line themes an entire form; `caret-animation` is bleeding-edge polish almost nobody ships.

---

## 9. Tailwind v4 authoring foundation

### @utility — static and functional (`-*`)
Registers first-class utilities in the `utilities` cascade layer; a trailing `-*` makes it functional, its suffix parsed by `--value()`.
```css
@utility fade {
  -webkit-mask-image: var(--tw-fade-mask); mask-image: var(--tw-fade-mask);
  mask-composite: intersect;
}
@utility fade-* { --fade-size: --value(--fade-size-*, [length], [percentage]); }
```
Edge: One static core utility reads vars; every knob becomes a tiny functional utility with free variant coverage (hover:, dark:, lg:, rtl:).

### --value() / --modifier() / --alpha() / --spacing()
Stack resolution modes (theme key, bare type, arbitrary, literal, passthrough) — Tailwind keeps the first that resolves. `--modifier()` parses the `/xxx` slash as a second axis. `--alpha()` compiles to `color-mix(in oklab, …)`.
```css
@utility shimmer-* {
  --shimmer-color: --value(--color-*, [color]);
  --shimmer-alpha: --modifier(integer, [percentage], --default(100));
  --shimmer-tint: --alpha(var(--shimmer-color) / var(--shimmer-alpha));
}
/* usage: shimmer-sky-400/40 , shimmer-[#bada55]/[15%] */
```
Edge: One `*-size-*` utility supports tokens, arbitrary CSS, AND raw numbers; call `--alpha()` at sine-spaced percentages to synthesize a whole eased ramp from one color.

### Knob-sets / core-consumes composition
The architectural backbone: a core utility reads everything via `var()` with `@property` defaults; tiny functional knobs only SET those customs; variants compose orthogonally because they just re-set a var.
```css
@utility fade { --tw-fade-mask: linear-gradient(to bottom, transparent 0, #000 var(--fade-size, 2rem));
  -webkit-mask-image: var(--tw-fade-mask); mask-image: var(--tw-fade-mask); }
@utility fade-sm { --fade-size: 1rem; }
@utility fade-lg { --fade-size: 4rem; }
@utility fade-size-* { --fade-size: --value([length], --fade-size-*); }
/* class="fade fade-lg lg:fade-size-[8rem]" */
```
Edge: The complex effect lives once in the core; responsive/stateful tuning is free because variants flip a single custom property.

### @property registration shipped in the plugin
Ship `@property` at top level so effect customs are typed, animatable, and interpolable. (Same footgun as §5 — `syntax`/`initial-value` mismatch drops the rule.)
```css
@property --shimmer-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@property --fade-progress { syntax: "<number>"; inherits: false; initial-value: 0; }
```
Edge: The enabler — a registered `<number>` animates along `scroll()`, a registered `<angle>` lets `tan()` recompute geometry every frame.

### @custom-variant / @variant — bake in a11y & RTL
Mint reusable variants and apply them inside utilities so the effect ships its own dark/RTL/reduced-motion correctness.
```css
@custom-variant rtl (&:where(:dir(rtl), [dir=rtl] *));
@custom-variant motion-ok (@media (prefers-reduced-motion: no-preference));
@utility fade {
  mask-image: var(--tw-fade-mask);
  @variant rtl { --tw-fade-mask: linear-gradient(to left, transparent 0, #000 var(--fade-size)); }
  @variant motion-ok { animation: fade-scroll linear; animation-timeline: scroll(self y); }
}
```
Edge: Reduced-motion/RTL/dark as variants (not buried if/else) means the same effect ships its own i18n + a11y, still overridable per-element.

### @theme, @theme inline, @source inline(), cascade layers, packaging
`@theme` tokens emit a var AND generate namespace utilities; `@theme inline` substitutes the value so consumer overrides win; `@source inline("…")` safelists dynamically-composed knobs; `@utility` output lands in the overridable `utilities` layer. Ship as one importable `.css`.
```css
@theme inline { --color-accent: var(--brand, oklch(.7 .15 250)); }
@source inline("shimmer-speed-{1,2,3,4,5}");
```
```json
{ "name": "tw-fade", "style": "./index.css",
  "exports": { ".": "./index.css" }, "sideEffects": ["**/*.css"],
  "peerDependencies": { "tailwindcss": ">=4" } }
```
Edge: A pure-CSS plugin is a single `@import`-able file — no JS, no build step, no runtime, identical across every v4 toolchain.

---

## 10. Accessibility & performance gating

### Static-by-default, motion as enhancement
Author the calm state unconditionally; ADD motion inside `@media (prefers-reduced-motion: no-preference)` nested with `@supports` — one shape covers reduced-motion AND unsupported-browser stories.
```css
.shimmer { background-position: 50% 0; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) { .shimmer { animation: sweep 3s linear infinite; } }
}
```
Edge: Reduced-motion users still get the color falloff/fade, just without the slide — distinguishing "motion" from "effect" is the craft signal.

### forced-colors & reduced-transparency hardening
`mask-image` keeps clipping in High Contrast (can swallow text) and gradient `background-image` isn't auto-stripped — neutralize decorative masks/filters explicitly and yield to system colors.
```css
@media (forced-colors: active) {
  .fade { mask-image: none; }                 /* don't hide text */
  .glass, .fx { filter: none; backdrop-filter: none; background: Canvas; color: CanvasText; }
}
@media (prefers-reduced-transparency: reduce) { .glass { backdrop-filter: none; background: Canvas; } }
@media print { .fade, .shimmer { mask-image:none; background:none; filter:none; color:#000; } }
```
Baseline: forced-colors / prefers-contrast Widely available; prefers-reduced-transparency Chromium-only — keep an opaque-enough default. `background-clip:text` vanishes in print (invisible text bug) — reset color.
Edge: Resetting masks that clip content (and print color) is a real a11y fix most effect plugins forget.

### Compositor budget
Animate `transform`/`opacity`/`background-position` (cheap), keep stop count and blur radius constant; never animate `blur()` radius or gradient stop positions (re-tessellates every frame). `will-change` narrowly, never on a broadly-applied base; `content-visibility: auto` skips offscreen effect cost.
```css
@keyframes sweep { to { --x: 100%; } }
.shimmer { background-position: var(--x) 0; }       /* texture cached, just translated */
.heavy-section { content-visibility: auto; contain-intrinsic-size: auto 600px; }
```
Baseline: All Widely available; content-visibility Newly available (Sep 2025). `content-visibility` containment can clip a mask meant to bleed past the box.
Edge: Luxurious 14-17 stop gradients are affordable precisely because you animate a position scalar, not the stops.

### RTL via :where(:dir(rtl)) + logical start/end
Author edge effects logically; branch mask direction on `:dir()` at zero specificity so utilities still win.
```css
.fade-inline { mask-image: linear-gradient(to right, transparent, #000 var(--fade-start),
                #000 calc(100% - var(--fade-end)), transparent); }
:where(:dir(rtl)) .fade-inline { mask-image: linear-gradient(to left, transparent, #000 var(--fade-start),
                #000 calc(100% - var(--fade-end)), transparent); }
```
Baseline: Logical props Widely available; `:dir()` Newly available (Chrome 120 / Dec 2023) — `@supports selector(:dir(rtl))` or `[dir=rtl]` fallback. Mask directions are physical, so you must branch.
Edge: Zero-specificity `:where(:dir(rtl))` lets RTL correctness coexist with Tailwind's utility-wins cascade.

### @supports discipline (gate, not(), selector())
Write the degraded baseline unconditionally, wrap the enhanced effect in a feature query for the riskiest primitive, and probe the function value.
```css
@supports not (mask-composite: intersect) { /* WebKit-keyword path */ }
@supports selector(:has(*)) { /* safe to rely on :has() */ }
```
Baseline: `@supports`/`not()` Widely available; `selector()` Newly available (Chrome 83, FF 69, Safari 16).
Edge: Inverting the default (static baseline, motion enhancement) makes one code path double as the no-JS and reduced-motion story.

---

## Recipes

Each combines primitives into a ready effect in the core-utility + knobs + @property shape.

### 1. Film-grain overlay
```css
@property --grain-density { syntax: "<number>"; inherits: false; initial-value: 0.8; }
@utility grain { position: relative; isolation: isolate; }
@utility grain {
  &::after {
    content: ""; position: absolute; inset: -50%; pointer-events: none;
    mix-blend-mode: soft-light; opacity: var(--grain-opacity, .12);
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 128px 128px;
  }
}
@utility grain-opacity-* { --grain-opacity: --value([percentage], number); }
/* animated jitter: overscan + steps(); gate with prefers-reduced-motion */
@media (prefers-reduced-motion: no-preference) {
  @keyframes grain-jit { 0%{transform:translate(0,0)} 30%{transform:translate(3%,-15%)} 70%{transform:translate(6%,3%)} 100%{transform:translate(0,0)} }
  .grain.animate::after { animation: grain-jit .8s steps(6) infinite; }
}
```

### 2. Gooey text merge
```css
@utility goo { filter: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>#goo'); }
/* children animate via cheap transforms only; keep stdDeviation static */
@utility goo-soft { filter: blur(8px) contrast(18); }  /* no-SVG fallback */
```

### 3. Duotone image
```css
@property --duo-hue { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@utility duotone {
  background:
    linear-gradient(var(--duo-shadow, oklch(.3 .12 250)) 0 0),
    linear-gradient(var(--duo-light, oklch(.85 .15 90)) 0 0),
    var(--duo-img) center/cover;
  background-blend-mode: lighten, multiply, normal;
  filter: hue-rotate(var(--duo-hue));   /* animatable tint knob */
}
@utility duotone-shadow-* { --duo-shadow: --value(--color-*, [color]); }
@utility duotone-light-*  { --duo-light:  --value(--color-*, [color]); }
```

### 4. Edge-confined frosted glass
```css
@property --glass-blur { syntax: "<length>"; inherits: false; initial-value: 16px; }
@utility glass {
  position: relative; isolation: isolate;
  &::before {
    content:""; position:absolute; inset:0;
    backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur));
    -webkit-mask-image: var(--glass-mask, linear-gradient(to bottom,#000 0 60%, transparent));
            mask-image: var(--glass-mask, linear-gradient(to bottom,#000 0 60%, transparent));
    pointer-events: none;
  }
}
@utility glass-blur-* { --glass-blur: --value([length]); }
@media (prefers-reduced-transparency: reduce) { .glass::before { backdrop-filter: none; background: Canvas; } }
```

### 5. Heat-haze / refraction
```css
@utility haze { filter: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="h" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></svg>#h'); }
/* pure-CSS motion: translate content through the fixed warp, or cross-fade two seeds */
@media (prefers-reduced-motion: no-preference) {
  @keyframes haze-drift { to { transform: translateY(-6px); } }
  .haze.animate > * { animation: haze-drift 2.5s ease-in-out infinite alternate; }
}
```

### 6. Animated conic aurora glow
```css
@property --aurora-rot { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@utility aurora {
  position: relative; overflow: hidden; isolation: isolate;
  &::before {
    content:""; position:absolute; inset:-20%;
    background:
      radial-gradient(40% 50% at 20% 25%, oklch(72% .2 320/.55), transparent 70%),
      radial-gradient(45% 55% at 80% 20%, oklch(75% .18 230/.5),  transparent 72%),
      conic-gradient(from var(--aurora-rot), oklch(78% .21 160/.4), transparent, oklch(70% .19 30/.4));
    filter: blur(var(--aurora-blur, 60px)); mix-blend-mode: plus-lighter;
    animation: aurora-spin var(--aurora-speed, 18s) linear infinite;
  }
}
@utility aurora-speed-* { --aurora-speed: --value([number])s; }
@keyframes aurora-spin { to { --aurora-rot: 360deg; } }
@supports not (mix-blend-mode: plus-lighter) { .aurora::before { mix-blend-mode: screen; } }
@media (prefers-reduced-motion: reduce) { .aurora::before { animation: none; } }
@media (forced-colors: active) { .aurora::before { display: none; } }
```

### 7. Squircle card `[gate behind @supports]`
```css
@property --sq-k { syntax: "<number>"; inherits: false; initial-value: 2; }
@utility squircle { border-radius: var(--sq-radius, 24px); }
@supports (corner-shape: superellipse(2)) {
  @utility squircle { corner-shape: superellipse(var(--sq-k)); transition: --sq-k .3s; }
}
@utility squircle-scoop  { --sq-k: -1; }
@utility squircle-notch  { --sq-k: -8; }
@utility squircle-bevel  { --sq-k: 0; }
```

### 8. Knockout / gradient text
```css
@property --clip-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@utility clip-text {
  color: var(--clip-fallback, currentColor);
  background-image: var(--clip-grad, conic-gradient(from var(--clip-angle), #f0f, #0ff, #f0f));
}
@supports ((background-clip:text) or (-webkit-background-clip:text)) {
  @utility clip-text {
    background-clip: text; -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
  }
}
@utility clip-spin { animation: clip-spin var(--clip-speed,4s) linear infinite; }
@keyframes clip-spin { to { --clip-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .clip-spin { animation: none; } }
@media (forced-colors: active) { .clip-text { -webkit-text-fill-color: CanvasText; color: CanvasText; background: none; } }
/* knockout variant: .knockout{background:url(img)center/cover;isolation:isolate} .band{background:#000;color:#fff;mix-blend-mode:multiply} */
```

### 9. Dither / halftone
```css
@property --dot-cell  { syntax: "<length>"; inherits: true; initial-value: 8px; }
@property --screen-angle { syntax: "<angle>"; inherits: true; initial-value: 45deg; }
@utility halftone {
  rotate: var(--screen-angle);
  background: radial-gradient(closest-side, #000, #fff) 0/var(--dot-cell) var(--dot-cell) round, var(--tone, currentColor);
  background-blend-mode: lighten;
  filter: blur(calc(var(--dot-cell)/8)) contrast(40);
}
@utility halftone-cell-* { --dot-cell: --value([length]); }
@supports (animation-timeline: scroll()) {
  @utility halftone-scroll { animation: ink linear; animation-timeline: scroll(self y); }
  @keyframes ink { from { --dot-cell: 14px; } to { --dot-cell: 4px; } }
}
@media (prefers-reduced-motion: reduce) { .halftone-scroll { animation: none; } }
/* crisp 1-bit variant: filter: url(#onebit) with feFuncA discrete "0 1" */
```

### 10. Scroll-reveal mask `[gate behind @supports]`
```css
@property --reveal-end { syntax: "<number>"; inherits: true; initial-value: 1; }
@utility scroll-reveal { /* static fallback: fully visible, no mask */ }
@supports (animation-timeline: scroll()) {
  @utility scroll-reveal {
    -webkit-mask-image: linear-gradient(to bottom,
      transparent, rgb(0 0 0/.02) 8%, rgb(0 0 0/.21) 25%, rgb(0 0 0/.61) 45%,
      rgb(0 0 0/.92) 70%, #000 calc(var(--reveal-end)*100%));
            mask-image: linear-gradient(to bottom, transparent, /* same sine stops */ #000 calc(var(--reveal-end)*100%));
    animation: reveal linear both; animation-timeline: scroll(self block); animation-range: 0 100%;
    animation-duration: 1ms;   /* Firefox */
  }
  @keyframes reveal { from { --reveal-end: 0; } to { --reveal-end: 1; } }
}
@media (forced-colors: active) { .scroll-reveal { mask-image: none; } }
```

### 11. Holographic foil
```css
@property --foil-rot { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@utility holofoil {
  position: relative; isolation: isolate;
  background:
    repeating-linear-gradient(115deg, oklch(100% 0 0/.06) 0 2px, transparent 2px 5px),
    conic-gradient(from var(--foil-rot), oklch(70% .2 0), oklch(70% .2 120), oklch(70% .2 240), oklch(70% .2 0)),
    radial-gradient(70% 70% at 30% 20%, oklch(95% .05 280/.5), transparent 60%),
    oklch(22% .04 280);
  background-blend-mode: overlay, color-dodge, screen, normal;
  animation: foil-spin var(--foil-speed, 7s) linear infinite;
}
@utility foil-speed-* { --foil-speed: --value([number])s; }
@keyframes foil-spin { to { --foil-rot: 360deg; } }
@media (prefers-reduced-motion: reduce) { .holofoil { animation: none; } }
@media (forced-colors: active) { .holofoil { display: none; } }
```

### 12. Rotating gradient border
```css
@property --ring-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@utility ring {
  --c: currentColor;
  border: var(--ring-w, 2px) solid transparent; border-radius: 1rem;
  background: conic-gradient(from var(--ring-angle),
    oklch(from var(--c) l c h), oklch(from var(--c) l c h / .15), oklch(from var(--c) l c h)) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: ring-spin var(--ring-speed, 3s) linear infinite;
}
@utility ring-w-* { --ring-w: --value([length]); }
@keyframes ring-spin { to { --ring-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .ring { animation: none; } }
@media (forced-colors: active) { .ring { mask: none; -webkit-mask: none; background: none; border-color: CanvasText; animation: none; } }
```

---

## Provenance & verification

This arsenal was synthesized from a deep web-research pass (June 2026): ~165
techniques surveyed across the CSS spec surface and narrowed to the entries here,
each cross-checked for browser support. **Baseline tags reflect support as of
mid-2026 — re-verify anything load-bearing** (MDN, the web.dev Baseline widget,
caniuse) before you ship it; the front matter moves quarter to quarter, and the
`[gate behind @supports]` items especially.

Primary sources (284 pages, 65 domains; most-cited): developer.mozilla.org (94), css-tricks.com (25), caniuse.com (20), web.dev (15), developer.chrome.com (11), web-platform-dx.github.io (8), w3.org (8), github.com (8), blog.logrocket.com (5), webkit.org (5), tailwindcss.com (5), joshwcomeau.com (4), tympanus.net (4), smashingmagazine.com (4). Specs and browser
bug trackers (w3.org, webkit.org, bugs.webkit.org, bugzilla.mozilla.org) were
used to confirm primitive behavior and known engine quirks.

