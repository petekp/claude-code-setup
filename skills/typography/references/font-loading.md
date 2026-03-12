# Font Loading & Performance

Strategies for loading web fonts without compromising performance or user experience.

## Table of Contents

- [Understanding FOIT and FOUT](#understanding-foit-and-fout)
- [The font-display Property](#the-font-display-property)
- [Preloading Fonts](#preloading-fonts)
- [Optimal Loading Strategies](#optimal-loading-strategies)
- [Core Web Vitals Impact](#core-web-vitals-impact)
- [Self-Hosting vs CDN](#self-hosting-vs-cdn)
- [Font Subsetting](#font-subsetting)

---

## Understanding FOIT and FOUT

### FOIT (Flash of Invisible Text)

Browser hides text completely until the custom font loads.

**Behavior:** Blank space where text should be → text appears
**Problem:** Users see nothing; content is inaccessible during load
**Default in:** Older browsers, `font-display: block`

### FOUT (Flash of Unstyled Text)

Browser shows fallback font immediately, then swaps to custom font.

**Behavior:** System font visible → swap to custom font
**Problem:** Visual shift when fonts swap; can cause layout shifts
**Default in:** Modern browsers with `font-display: swap`

### Which is Better?

**FOUT is generally preferred** because:
- Content is immediately accessible
- Users can start reading right away
- Better for Core Web Vitals (LCP, CLS with mitigation)

---

## The font-display Property

Controls how fonts render during loading.

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap; /* or block, fallback, optional, auto */
}
```

### Values Explained

| Value | Block Period | Swap Period | Best For |
|-------|-------------|-------------|----------|
| `auto` | Browser decides | Browser decides | Letting browser optimize |
| `block` | 3s | Infinite | Critical branding fonts |
| `swap` | ~100ms | Infinite | Most use cases |
| `fallback` | ~100ms | ~3s | Balance of speed and design |
| `optional` | ~100ms | None | Performance-critical sites |

### Recommended Defaults

```css
/* For most fonts */
font-display: swap;

/* For critical above-the-fold fonts with preload */
font-display: optional;

/* For icon fonts (must not show fallback) */
font-display: block;
```

### Detailed Behavior

**`swap`**
- Shows fallback immediately
- Swaps to custom font whenever it loads
- Best for body text and most headings

**`optional`**
- Shows fallback immediately
- Only swaps if font loads very quickly (~100ms)
- If font misses window, fallback used for entire page visit
- Font cached for next visit
- Best with preloading for zero layout shift

**`fallback`**
- Brief invisible period (~100ms)
- Swaps only if font loads within ~3s
- Good middle ground

---

## Preloading Fonts

Tell the browser to fetch fonts early, before CSS is parsed.

### Basic Preload

```html
<head>
  <!-- Preload critical fonts -->
  <link
    rel="preload"
    href="/fonts/inter-var.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  >

  <!-- Then load CSS -->
  <link rel="stylesheet" href="/styles.css">
</head>
```

### Critical Points

**Always include `crossorigin`** — Even for same-origin fonts. Fonts are fetched with CORS, and omitting this causes double-fetching.

**Only preload critical fonts:**
- Above-the-fold fonts
- Primary body font
- 1-2 fonts maximum

**Don't preload:**
- Fonts used only below the fold
- Fonts for rare UI states
- More than 2-3 fonts

### Preload + font-display: optional

The most performant combination:

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: optional;
}
```

**Result:** Zero layout shift. Font either loads in time or fallback used for entire session.

---

## Optimal Loading Strategies

### Strategy 1: Simple Swap (Most Common)

Best for: Most websites

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
}
```

Pros: Simple, content always visible
Cons: Layout shift when font loads

### Strategy 2: Preload + Optional (Zero Layout Shift)

Best for: Performance-critical sites

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: optional;
}
```

Pros: No layout shift, great LCP
Cons: Users may see fallback on slow connections

### Strategy 3: FOUT with Class (Full Control)

Best for: Sites needing precise control

```html
<script>
  // Check if fonts are cached
  if (sessionStorage.fontsLoaded) {
    document.documentElement.classList.add('fonts-loaded');
  }
</script>
```

```css
/* Fallback styles */
body {
  font-family: system-ui, sans-serif;
}

/* Enhanced styles when fonts load */
.fonts-loaded body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

```javascript
// Load fonts and add class
if ('fonts' in document) {
  Promise.all([
    document.fonts.load('400 1em Inter'),
    document.fonts.load('700 1em Inter')
  ]).then(() => {
    document.documentElement.classList.add('fonts-loaded');
    sessionStorage.fontsLoaded = true;
  });
}
```

Pros: Complete control, can optimize fallback matching
Cons: More complex, requires JavaScript

### Strategy 4: Critical FOFT (Two-Stage Loading)

Best for: Large font families

Load a subset first (roman only), then full family:

```css
/* Stage 1: Critical subset */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-roman-subset.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-00FF; /* Basic Latin */
}

/* Stage 2: Full font (loaded async) */
@font-face {
  font-family: 'Inter Full';
  src: url('/fonts/inter-full.woff2') format('woff2');
  font-display: swap;
}
```

---

## Core Web Vitals Impact

### LCP (Largest Contentful Paint)

Fonts affect LCP when text is the largest element.

**Improve LCP:**
- Preload critical fonts
- Use `font-display: optional` or `swap`
- Self-host to reduce DNS/connection overhead

### CLS (Cumulative Layout Shift)

Font swapping causes layout shifts.

**Reduce CLS:**
- Use `font-display: optional` with preload
- Match fallback font metrics to custom font
- Use `size-adjust` in @font-face

### Fallback Font Matching

```css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}

body {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
```

**Tools for calculating overrides:**
- [Fallback Font Generator](https://screenspan.net/fallback)
- [fontpie](https://github.com/nickshanks/fontpie)

---

## Self-Hosting vs CDN

### Self-Hosting

**Pros:**
- Full control over caching
- No third-party requests
- Privacy (no Google/Adobe tracking)
- Consistent availability

**Cons:**
- You manage updates
- Initial setup effort

**Best for:** Production sites, privacy-focused projects

### Google Fonts / Adobe Fonts

**Pros:**
- Easy setup
- Automatic updates
- Wide font selection

**Cons:**
- Third-party dependency
- Privacy concerns (GDPR)
- Cross-origin requests add latency
- Cache partitioning reduces benefits

**Best for:** Prototypes, quick projects

### Modern Recommendation

**Self-host for production.** Cache partitioning in modern browsers means the "shared cache" benefit of CDNs no longer applies.

```bash
# Download Google Fonts for self-hosting
# Use google-webfonts-helper: https://gwfh.mranftl.com/fonts
```

---

## Font Subsetting

Remove unused characters to reduce file size.

### Common Subsets

| Subset | Characters | Use Case |
|--------|------------|----------|
| Latin | ~200 glyphs | English-only sites |
| Latin Extended | ~500 glyphs | European languages |
| Full | 1000+ glyphs | Multilingual |

### Tools

**glyphanger** (Node.js):
```bash
npm install -g glyphanger
glyphanger --whitelist="US_ASCII" --subset=font.woff2
```

**pyftsubset** (Python):
```bash
pip install fonttools
pyftsubset font.ttf --unicodes="U+0000-00FF" --output-file=font-subset.woff2
```

### Unicode Range in CSS

Only download fonts for characters actually used:

```css
/* Latin subset */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}

/* Cyrillic subset (only loaded if needed) */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-cyrillic.woff2') format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1;
}
```

---

## Quick Checklist

### Minimum Viable Font Loading

```html
<!-- 1. Preload critical font -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

```css
/* 2. Define with swap */
@font-face {
  font-family: 'MainFont';
  src: url('/fonts/main.woff2') format('woff2');
  font-display: swap;
}

/* 3. Use with fallback stack */
body {
  font-family: 'MainFont', system-ui, -apple-system, sans-serif;
}
```

### Performance Audit Checklist

- [ ] Using WOFF2 format?
- [ ] Only loading needed weights?
- [ ] Preloading above-the-fold fonts?
- [ ] Using appropriate font-display value?
- [ ] Self-hosting for production?
- [ ] Subsetting to remove unused characters?
- [ ] Fallback font metrics matched?
