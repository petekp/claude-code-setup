# OpenType Features

OpenType features enable advanced typography: ligatures, alternate characters, numeric formatting, and more.

## Table of Contents

- [What Are OpenType Features](#what-are-opentype-features)
- [Common Features Reference](#common-features-reference)
- [CSS Implementation](#css-implementation)
- [Numeric Features](#numeric-features)
- [Stylistic Features](#stylistic-features)
- [Feature Support by Font](#feature-support-by-font)
- [Debugging & Discovery](#debugging--discovery)

---

## What Are OpenType Features

OpenType features are optional typographic enhancements built into fonts. They're identified by four-letter tags and can be enabled via CSS.

**Examples of what features do:**
- Convert "fi" to a proper ligature (liga)
- Adjust punctuation based on surrounding letters (calt)
- Use old-style figures in running text (onum)
- Access alternate character designs (ss01, cv01)

---

## Common Features Reference

### Enabled by Default

| Tag | Name | Description |
|-----|------|-------------|
| `kern` | Kerning | Adjusts spacing between specific letter pairs |
| `liga` | Standard Ligatures | Common ligatures like fi, fl, ff |
| `calt` | Contextual Alternates | Context-aware glyph substitution |
| `locl` | Localized Forms | Language-specific glyph variants |

### Commonly Used

| Tag | Name | Description |
|-----|------|-------------|
| `tnum` | Tabular Figures | Fixed-width numbers for alignment |
| `pnum` | Proportional Figures | Variable-width numbers for prose |
| `lnum` | Lining Figures | Numbers aligned to cap height |
| `onum` | Old-style Figures | Numbers with ascenders/descenders |
| `zero` | Slashed Zero | Distinguishes 0 from O |
| `frac` | Fractions | Converts 1/2 to proper fraction |
| `case` | Case-Sensitive Forms | Adjusts punctuation for all-caps |
| `smcp` | Small Caps | Lowercase as small capitals |
| `c2sc` | Caps to Small Caps | Converts capitals to small caps |

### Stylistic Features

| Tag | Name | Description |
|-----|------|-------------|
| `ss01`–`ss20` | Stylistic Sets | Predefined alternate style groups |
| `cv01`–`cv99` | Character Variants | Alternates for specific characters |
| `salt` | Stylistic Alternates | Access all available alternates |
| `swsh` | Swash | Decorative flourishes |
| `dlig` | Discretionary Ligatures | Optional/decorative ligatures |

---

## CSS Implementation

### Modern Approach: font-variant-*

```css
/* Ligatures */
.ligatures-all {
  font-variant-ligatures: common-ligatures discretionary-ligatures;
}

.ligatures-none {
  font-variant-ligatures: none;
}

/* Numeric features */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.oldstyle-nums {
  font-variant-numeric: oldstyle-nums;
}

.fractions {
  font-variant-numeric: diagonal-fractions;
}

/* Caps */
.small-caps {
  font-variant-caps: small-caps;
}

.all-small-caps {
  font-variant-caps: all-small-caps;
}
```

### Low-Level: font-feature-settings

Use for features not covered by font-variant-*:

```css
/* Enable slashed zero */
.code {
  font-feature-settings: "zero" 1;
}

/* Enable stylistic set 1 */
.alternate-style {
  font-feature-settings: "ss01" 1;
}

/* Multiple features */
.enhanced {
  font-feature-settings:
    "kern" 1,
    "liga" 1,
    "calt" 1,
    "tnum" 1,
    "zero" 1;
}

/* Disable a default feature */
.no-ligatures {
  font-feature-settings: "liga" 0;
}
```

### Inheritance Gotcha

`font-feature-settings` replaces (doesn't merge) when overridden:

```css
/* Parent */
.parent {
  font-feature-settings: "kern" 1, "liga" 1;
}

/* Child - this REPLACES parent, doesn't add to it */
.child {
  font-feature-settings: "tnum" 1;
  /* kern and liga are now OFF */
}

/* Correct: include all needed features */
.child-correct {
  font-feature-settings: "kern" 1, "liga" 1, "tnum" 1;
}
```

**Prefer font-variant-* when possible** — it cascades properly.

---

## Numeric Features

### Tabular vs Proportional

| Type | Tag | Use Case |
|------|-----|----------|
| Tabular | `tnum` | Tables, prices, anything that should align |
| Proportional | `pnum` | Running text, body copy |

```css
/* Tables with aligned numbers */
table {
  font-variant-numeric: tabular-nums;
}

/* Or */
table {
  font-feature-settings: "tnum" 1;
}
```

### Lining vs Old-Style

| Type | Tag | Appearance | Use Case |
|------|-----|------------|----------|
| Lining | `lnum` | 0123456789 (cap height) | Headings, UI, tables |
| Old-style | `onum` | Varies (with descenders) | Body text, editorial |

```css
/* Old-style figures for prose */
.prose {
  font-variant-numeric: oldstyle-nums;
}

/* Lining figures for UI */
.ui-numbers {
  font-variant-numeric: lining-nums;
}
```

### Slashed Zero

Distinguishes zero from the letter O — essential for code and data:

```css
.code, .data {
  font-feature-settings: "zero" 1;
}
```

### Fractions

```css
.fractions {
  font-variant-numeric: diagonal-fractions;
}

/* 1/2 becomes ½, 3/4 becomes ¾ */
```

### Combined Numeric Styles

```css
/* Financial data: lining + tabular */
.financial {
  font-variant-numeric: lining-nums tabular-nums;
}

/* Editorial: old-style + proportional */
.editorial {
  font-variant-numeric: oldstyle-nums proportional-nums;
}

/* Code/data: tabular + slashed zero */
.code {
  font-variant-numeric: tabular-nums slashed-zero;
}
```

---

## Stylistic Features

### Stylistic Sets (ss01–ss20)

Predefined groups of alternate glyphs. Each font defines differently:

**Inter's stylistic sets:**
- `ss01`: Alternate digits
- `ss02`: Disambiguation (different l and 1)
- `ss03`: Curved r

```css
/* Enable Inter's disambiguation set */
.disambiguation {
  font-feature-settings: "ss02" 1;
}
```

### Character Variants (cv01–cv99)

Alternates for specific characters:

**Inter's character variants:**
- `cv01`: Alternate 1
- `cv02`: Alternate 4
- `cv03`: Alternate 6
- `cv04`: Alternate 9
- `cv05`: Lowercase L with tail
- `cv06`: Lowercase L with serif

```css
/* Use Inter's alternate lowercase L */
.code {
  font-feature-settings: "cv05" 1; /* L with tail */
}
```

### Case-Sensitive Forms

Adjusts punctuation for all-caps text:

```css
.all-caps {
  text-transform: uppercase;
  font-feature-settings: "case" 1;
}
```

**What it does:** Raises hyphens, brackets, and other punctuation to optically center with capitals.

---

## Feature Support by Font

### Inter

```css
.inter-recommended {
  font-feature-settings:
    "kern" 1,   /* Kerning */
    "liga" 1,   /* Ligatures */
    "calt" 1,   /* Contextual alternates: arrows, emoticons */
    "ss02" 1;   /* Disambiguation: distinct l, 1, I */
}

.inter-code {
  font-feature-settings:
    "kern" 1,
    "calt" 1,
    "tnum" 1,   /* Tabular numbers */
    "zero" 1,   /* Slashed zero */
    "cv05" 1;   /* L with tail */
}
```

### Source Sans / Source Serif

```css
.source-serif-editorial {
  font-feature-settings:
    "kern" 1,
    "liga" 1,
    "onum" 1,   /* Old-style figures */
    "pnum" 1;   /* Proportional figures */
}
```

### JetBrains Mono

```css
.jetbrains-mono {
  font-feature-settings:
    "kern" 1,
    "liga" 1,   /* Coding ligatures: ->, =>, != */
    "calt" 1,
    "zero" 1;   /* Slashed zero */
}
```

### Checking What's Available

Use these tools to discover font features:

- **[Wakamai Fondue](https://wakamaifondue.com/)** — Drag and drop font file
- **[Axis-Praxis](https://www.axis-praxis.org/)** — Variable font playground
- **Font specimen pages** — e.g., rsms.me/inter

---

## Debugging & Discovery

### Browser DevTools

1. Select text element
2. In computed styles, look for `font-feature-settings`
3. Toggle features to see effect

### CSS for Testing

```css
/* Test all common features */
.test-features {
  font-feature-settings:
    "kern" 1,
    "liga" 1,
    "calt" 1,
    "dlig" 1,
    "ss01" 1,
    "ss02" 1,
    "tnum" 1,
    "onum" 1,
    "zero" 1,
    "frac" 1,
    "case" 1,
    "smcp" 1;
}
```

### Test Strings

```
Ligatures: fi fl ff ffi ffl
Contextual: -> --> => ==> :: != !==
Numbers: 0123456789 / 0O Il1
Fractions: 1/2 3/4 1/3 2/3
Caps test: (HELLO) [WORLD] {TEST}
```

---

## Quick Reference

### Recommended Defaults

```css
body {
  /* Enable standard features */
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;

  /* Or use higher-level properties */
  font-kerning: normal;
  font-variant-ligatures: common-ligatures contextual;
}

/* Tables and data */
table, .data {
  font-variant-numeric: tabular-nums lining-nums;
}

/* Code blocks */
code, pre {
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "zero" 1;
  font-variant-numeric: tabular-nums slashed-zero;
}

/* All-caps labels */
.label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-feature-settings: "case" 1;
}
```

### Tailwind CSS

```html
<!-- Tabular numbers -->
<span class="tabular-nums">$1,234.56</span>

<!-- Old-style numbers -->
<span class="oldstyle-nums">1234</span>

<!-- Proportional numbers -->
<span class="proportional-nums">1234</span>

<!-- Lining numbers -->
<span class="lining-nums">1234</span>

<!-- Slashed zero -->
<span class="slashed-zero">0O</span>

<!-- Fractions -->
<span class="diagonal-fractions">1/2</span>
```
