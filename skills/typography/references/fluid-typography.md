# Fluid Typography & Modern CSS

Responsive typography that scales smoothly across viewports, plus modern CSS text features.

## Table of Contents

- [Fluid Type with clamp()](#fluid-type-with-clamp)
- [Building a Fluid Type Scale](#building-a-fluid-type-scale)
- [Text Wrapping: balance and pretty](#text-wrapping-balance-and-pretty)
- [Text Truncation](#text-truncation)
- [Vertical Rhythm](#vertical-rhythm)
- [Font Smoothing](#font-smoothing)
- [Optical Adjustments](#optical-adjustments)

---

## Fluid Type with clamp()

`clamp(min, preferred, max)` creates font sizes that scale smoothly between breakpoints.

### Basic Syntax

```css
/* Font scales from 1rem to 1.5rem based on viewport */
h1 {
  font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem);
}
```

**How it works:**
- Below ~320px: Uses minimum (1rem)
- Above ~768px: Uses maximum (1.5rem)
- Between: Scales linearly with viewport

### The Formula

```
clamp(min, preferred, max)

preferred = base + (viewport-unit * multiplier)
```

**Calculating the preferred value:**

```
preferred = min + (max - min) * ((100vw - min-viewport) / (max-viewport - min-viewport))
```

Simplified to:
```css
/* For 1rem at 320px to 2rem at 1200px */
font-size: clamp(1rem, 0.636rem + 1.82vw, 2rem);
```

### Practical Examples

```css
/* Body text: 16px → 18px */
body {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
}

/* H1: 32px → 64px */
h1 {
  font-size: clamp(2rem, 1rem + 4vw, 4rem);
}

/* H2: 24px → 40px */
h2 {
  font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem);
}

/* Small text: 14px → 16px */
.small {
  font-size: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
}
```

### Line Height That Scales

```css
h1 {
  font-size: clamp(2rem, 1rem + 4vw, 4rem);
  /* Tighter line-height at larger sizes */
  line-height: clamp(1.1, 1.3 - 0.1vw, 1.3);
}
```

---

## Building a Fluid Type Scale

### CSS Custom Properties Approach

```css
:root {
  /* Fluid scale based on Minor Third (1.2) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1rem + 2vw, 2rem);
  --text-3xl: clamp(1.875rem, 1rem + 3vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1rem + 4vw, 3rem);
  --text-5xl: clamp(3rem, 1rem + 5vw, 4rem);
}

/* Usage */
body { font-size: var(--text-base); }
h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }
.caption { font-size: var(--text-sm); }
```

### Tools for Generating Scales

- **[Utopia](https://utopia.fyi/type/calculator)** — Fluid type scale generator
- **[Fluid Type Scale](https://www.fluid-type-scale.com/)** — CSS clamp generator
- **[Type Scale](https://typescale.com/)** — Visual scale builder

### Fluid Spacing to Match

```css
:root {
  /* Fluid spacing that matches type scale rhythm */
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  --space-xl: clamp(2rem, 1rem + 4vw, 4rem);
}
```

---

## Text Wrapping: balance and pretty

Modern CSS properties for better text layout.

### text-wrap: balance

Balances line lengths for short text blocks (headings, captions).

```css
h1, h2, h3, blockquote {
  text-wrap: balance;
}
```

**Before:**
```
This is a really long headline that
wraps
```

**After:**
```
This is a really long
headline that wraps
```

**Limitations:**
- Only works on blocks ≤6 lines (Chrome) or ≤10 lines (Firefox)
- Computationally expensive — don't use on body text
- May create awkward layouts in cards/containers with borders

**When NOT to use:**
- Inside bordered containers (creates visual imbalance with container)
- On body paragraphs (performance)
- When text should fill available width

### text-wrap: pretty

Prevents orphans (single words on last line) in paragraphs.

```css
p {
  text-wrap: pretty;
}
```

**Before:**
```
This is a paragraph with some text that ends with a single
word.
```

**After:**
```
This is a paragraph with some text that
ends with a single word.
```

**When to use:**
- Body paragraphs
- Any multi-line text where orphans look bad
- Safe for all text (minimal performance impact)

### Combined Usage

```css
/* Headings: balance */
h1, h2, h3, h4, h5, h6,
blockquote,
figcaption {
  text-wrap: balance;
}

/* Body text: prevent orphans */
p, li {
  text-wrap: pretty;
}
```

### Browser Support

- `text-wrap: balance` — Chrome 114+, Firefox 121+, Safari 17.4+
- `text-wrap: pretty` — Chrome 117+, Firefox 125+, Safari TP

Both are progressive enhancements — safe to use without fallbacks.

---

## Text Truncation

### Single Line

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Multi-Line (Line Clamping)

```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Tailwind Classes

```html
<p class="truncate">Single line truncation...</p>
<p class="line-clamp-2">Multi-line truncation...</p>
<p class="line-clamp-3">Three line truncation...</p>
```

### Accessibility Consideration

Truncated text hides information. Consider:
- Providing full text on hover/focus (tooltip)
- Using `aria-label` with full content
- "Read more" links for important content

```css
.truncate {
  /* Truncation styles */
}

.truncate:hover,
.truncate:focus {
  white-space: normal;
  -webkit-line-clamp: unset;
}
```

---

## Vertical Rhythm

Consistent spacing based on a baseline unit.

### Basic Vertical Rhythm

```css
:root {
  --baseline: 1.5rem; /* 24px at 16px base */
}

body {
  line-height: var(--baseline);
}

h1, h2, h3, h4, h5, h6, p, ul, ol {
  margin-top: 0;
  margin-bottom: var(--baseline);
}

h1 { margin-bottom: calc(var(--baseline) * 2); }
section { margin-bottom: calc(var(--baseline) * 3); }
```

### Modern Approach with cap Unit

The `cap` unit equals the cap height of the first available font:

```css
/* Align text to baseline using cap height */
h1 {
  margin-top: 1cap;
  margin-bottom: 0.5cap;
}
```

**Browser support:** Chrome 87+, Firefox 97+, Safari 17+

### Practical Rhythm System

```css
:root {
  --rhythm: 0.5rem; /* 8px base unit */
}

/* Everything is a multiple of 8px */
.space-1 { margin-bottom: var(--rhythm); }       /* 8px */
.space-2 { margin-bottom: calc(var(--rhythm) * 2); } /* 16px */
.space-3 { margin-bottom: calc(var(--rhythm) * 3); } /* 24px */
.space-4 { margin-bottom: calc(var(--rhythm) * 4); } /* 32px */
.space-6 { margin-bottom: calc(var(--rhythm) * 6); } /* 48px */
.space-8 { margin-bottom: calc(var(--rhythm) * 8); } /* 64px */
```

---

## Font Smoothing

Control text rendering, especially on macOS.

### The Properties

```css
.smoothed {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### What It Does

- **Default (subpixel):** Uses RGB subpixels for sharper text
- **Antialiased/grayscale:** Uses whole pixels; text appears lighter

### When to Use

**Apply smoothing on dark backgrounds:**

```css
/* Text appears too bold on dark backgrounds without smoothing */
.dark-bg {
  background: #1a1a1a;
  color: #f5f5f5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Consider for entire dark mode:**

```css
@media (prefers-color-scheme: dark) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### Caution

- Only affects macOS (Chrome/Safari use -webkit, Firefox uses -moz)
- Windows/Linux ignore these properties
- Don't apply globally on light backgrounds — reduces clarity

---

## Optical Adjustments

Manual tweaks for visual harmony.

### Optical Centering

Mathematical center ≠ visual center. Text often needs to move up:

```css
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Nudge text up slightly for optical centering */
  padding-top: 0;
  padding-bottom: 2px;
}
```

### Kerning Adjustments

Most fonts have good built-in kerning, but headlines may need tweaks:

```css
/* Tighten large headlines */
h1 {
  font-size: 4rem;
  letter-spacing: -0.02em;
}

/* Loosen all-caps */
.label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### Problematic Letter Pairs

These often need manual kerning:
- AV, AW, AT, AY
- To, Tr, Ta, Te
- LT, LV, LW, LY
- VA, Vo, Vu
- Yo, Ya

### Overshoot Understanding

Round and pointed letters extend slightly beyond baseline/cap-height to appear equal:

- O, C, G, Q — extend above and below
- A, V, W — points extend above/below
- This is intentional — don't "fix" it

### Leading Adjustments by Size

```css
/* Tighter leading for larger text */
h1 { font-size: 4rem; line-height: 1.1; }
h2 { font-size: 2.5rem; line-height: 1.2; }
h3 { font-size: 1.5rem; line-height: 1.3; }
body { font-size: 1rem; line-height: 1.6; }
```

---

## Quick Reference

### Complete Fluid Typography Setup

```css
:root {
  /* Fluid type scale */
  --text-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  --text-xl: clamp(1.5rem, 1rem + 2vw, 2rem);
  --text-2xl: clamp(2rem, 1rem + 3vw, 3rem);
  --text-3xl: clamp(2.5rem, 1rem + 4vw, 4rem);
}

body {
  font-size: var(--text-base);
  line-height: 1.6;
}

h1 { font-size: var(--text-3xl); line-height: 1.1; text-wrap: balance; }
h2 { font-size: var(--text-2xl); line-height: 1.2; text-wrap: balance; }
h3 { font-size: var(--text-xl); line-height: 1.3; text-wrap: balance; }

p { text-wrap: pretty; }

@media (prefers-color-scheme: dark) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```
