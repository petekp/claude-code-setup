# Variable Fonts

Variable fonts pack multiple styles into a single file, enabling fluid typography and reducing HTTP requests.

## Table of Contents

- [What Are Variable Fonts](#what-are-variable-fonts)
- [Common Axes](#common-axes)
- [CSS Implementation](#css-implementation)
- [Fluid Typography with Variable Fonts](#fluid-typography-with-variable-fonts)
- [Performance Benefits](#performance-benefits)
- [Recommended Variable Fonts](#recommended-variable-fonts)
- [Browser Support](#browser-support)

---

## What Are Variable Fonts

A variable font is a single font file containing multiple styles, weights, and variations. Instead of loading separate files for regular, bold, italic, etc., one file provides infinite variations along defined axes.

**Traditional approach:**
```
inter-regular.woff2      (95KB)
inter-medium.woff2       (96KB)
inter-semibold.woff2     (97KB)
inter-bold.woff2         (98KB)
─────────────────────────────────
Total: 386KB, 4 HTTP requests
```

**Variable font approach:**
```
inter-variable.woff2     (310KB)
─────────────────────────────────
Total: 310KB, 1 HTTP request
+ infinite weight variations
```

---

## Common Axes

### Registered Axes (Standardized)

| Axis | Tag | Description | Typical Range |
|------|-----|-------------|---------------|
| Weight | `wght` | Thin to Black | 100–900 |
| Width | `wdth` | Condensed to Extended | 75–125 |
| Slant | `slnt` | Upright to oblique | -12–0 |
| Italic | `ital` | Roman to italic | 0–1 |
| Optical Size | `opsz` | Caption to display | 8–144 |

### Custom Axes

Font designers can define custom axes:
- `GRAD` — Grade (weight without width change)
- `XHGT` — x-height
- `CASL` — Casual (in Recursive)
- `CRSV` — Cursive
- `MONO` — Monospace

---

## CSS Implementation

### Basic Usage with font-weight

```css
/* Variable fonts respond to any weight value */
.light { font-weight: 300; }
.regular { font-weight: 400; }
.medium { font-weight: 500; }
.semibold { font-weight: 600; }
.bold { font-weight: 700; }

/* Non-standard weights work too */
.custom { font-weight: 450; }
```

### Using font-variation-settings

For axes beyond weight:

```css
.text {
  font-variation-settings:
    "wght" 400,
    "wdth" 100,
    "slnt" 0;
}

/* Optical sizing for small text */
.caption {
  font-size: 12px;
  font-variation-settings: "opsz" 12;
}

/* Optical sizing for display text */
.display {
  font-size: 72px;
  font-variation-settings: "opsz" 72;
}
```

### Automatic Optical Sizing

```css
/* Enable automatic optical sizing */
body {
  font-optical-sizing: auto;
}
```

### @font-face Declaration

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900; /* Declare weight range */
  font-style: normal;
  font-display: swap;
}

/* For variable fonts with italic axis */
@font-face {
  font-family: 'Source Sans';
  src: url('/fonts/SourceSans-Variable.woff2') format('woff2-variations');
  font-weight: 200 900;
  font-style: oblique 0deg 12deg; /* Slant range */
  font-display: swap;
}
```

---

## Fluid Typography with Variable Fonts

### Weight Tied to Viewport

```css
/* Weight increases smoothly from 400 to 700 as viewport grows */
.fluid-weight {
  font-weight: calc(400 + (700 - 400) * ((100vw - 320px) / (1200 - 320)));
}

/* Clamped version */
.fluid-weight-clamped {
  --min-weight: 400;
  --max-weight: 700;
  font-weight: clamp(
    var(--min-weight),
    calc(var(--min-weight) + (var(--max-weight) - var(--min-weight)) * ((100vw - 320px) / (1200 - 320))),
    var(--max-weight)
  );
}
```

### Width for Responsive Layouts

```css
/* Condense text on narrow viewports */
.responsive-width {
  font-variation-settings: "wdth" clamp(85, 75 + 10vw, 100);
}
```

### Animation

```css
.animated-weight {
  transition: font-weight 0.3s ease;
}

.animated-weight:hover {
  font-weight: 700;
}

/* Keyframe animation */
@keyframes breathe {
  0%, 100% { font-weight: 300; }
  50% { font-weight: 600; }
}
```

---

## Performance Benefits

### File Size Comparison

| Family | Static Files | Variable File | Savings |
|--------|-------------|---------------|---------|
| Inter (4 weights) | ~380KB | ~310KB | 18% |
| Source Sans (6 weights) | ~450KB | ~280KB | 38% |
| Roboto Flex (full) | ~1.2MB | ~450KB | 62% |

### Optimization Techniques

**Subsetting:** Remove unused characters:
```bash
# Using glyphhanger
glyphhanger --whitelist="US_ASCII" --subset=Inter-Variable.woff2
```

**Range limiting:** Only include needed weight range:
```css
/* If only using 400-700, subset to that range */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-subset.woff2') format('woff2-variations');
  font-weight: 400 700;
}
```

---

## Recommended Variable Fonts

### Sans-Serif

| Font | Axes | Best For |
|------|------|----------|
| **Inter** | wght, slnt, opsz | UI, apps, general purpose |
| **Source Sans 3** | wght, ital | Long-form reading, documents |
| **Roboto Flex** | wght, wdth, slnt, opsz, GRAD | Material Design, flexibility |
| **Work Sans** | wght | Headings, modern UI |
| **DM Sans** | wght, ital, opsz | Clean geometric look |

### Serif

| Font | Axes | Best For |
|------|------|----------|
| **Source Serif 4** | wght, ital, opsz | Editorial, long-form |
| **Fraunces** | wght, opsz, SOFT, WONK | Expressive headings |
| **Literata** | wght, ital, opsz | Ebook readers |
| **Newsreader** | wght, ital, opsz | News, editorial |

### Monospace

| Font | Axes | Best For |
|------|------|----------|
| **JetBrains Mono** | wght | Code editors |
| **Fira Code** | wght | Code with ligatures |
| **Source Code Pro** | wght | Documentation |
| **Recursive** | wght, slnt, CASL, MONO | Code + UI (versatile) |

### Display

| Font | Axes | Best For |
|------|------|----------|
| **Anybody** | wght, wdth, ital | Bold headlines |
| **Epilogue** | wght | Modern display |
| **Outfit** | wght | Geometric headlines |

---

## Browser Support

Variable fonts have excellent support (95%+ global):

| Browser | Support |
|---------|---------|
| Chrome | 66+ |
| Firefox | 62+ |
| Safari | 11+ |
| Edge | 17+ |

### Fallback Strategy

```css
/* Provide static fallback for very old browsers */
@supports not (font-variation-settings: normal) {
  body {
    font-family: 'Inter', system-ui, sans-serif;
    /* Static weights loaded separately */
  }
}

@supports (font-variation-settings: normal) {
  body {
    font-family: 'Inter Variable', system-ui, sans-serif;
  }
}
```

---

## Quick Reference

### Weight Guidelines

| Weight | Name | Use Case |
|--------|------|----------|
| 300 | Light | Avoid for body text <16px |
| 400 | Regular | Body text |
| 500 | Medium | UI labels, emphasis |
| 600 | Semibold | Subheadings |
| 700 | Bold | Headings, strong emphasis |
| 800-900 | Black | Display only |

### Dark Mode Adjustments

Reduce weight slightly in dark mode (text appears heavier on dark backgrounds):

```css
@media (prefers-color-scheme: dark) {
  body {
    font-weight: 350; /* Instead of 400 */
  }

  h1, h2, h3 {
    font-weight: 600; /* Instead of 700 */
  }
}
```
