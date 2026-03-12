# Internationalization & RTL Typography

Typography considerations for multilingual content and right-to-left languages.

## Table of Contents

- [RTL Fundamentals](#rtl-fundamentals)
- [CSS Logical Properties](#css-logical-properties)
- [Font Selection for Multilingual](#font-selection-for-multilingual)
- [Arabic Typography](#arabic-typography)
- [Hebrew Typography](#hebrew-typography)
- [CJK Typography](#cjk-typography)
- [Bidirectional Text](#bidirectional-text)

---

## RTL Fundamentals

Right-to-left (RTL) languages include Arabic, Hebrew, Persian (Farsi), and Urdu. They affect layout direction, not just text direction.

### Basic Setup

```html
<!-- Set direction on html element -->
<html lang="ar" dir="rtl">

<!-- Or on specific sections -->
<div dir="rtl" lang="ar">
  المحتوى العربي هنا
</div>
```

### Always Use Both

**HTML `dir` attribute** — Affects browser behavior (form controls, tables, lists)
**CSS direction** — Affects layout and styling

```css
[dir="rtl"] {
  direction: rtl;
}
```

### What Changes in RTL

| LTR | RTL |
|-----|-----|
| Left-aligned text | Right-aligned text |
| Left sidebar | Right sidebar |
| Forward arrow → | Forward arrow ← |
| Horizontal scroll left-to-right | Horizontal scroll right-to-left |
| Progress bars fill left-to-right | Progress bars fill right-to-left |

### What Stays the Same

- Images (unless they convey direction)
- Icons indicating physical direction (phone handset, etc.)
- Brand logos
- Numeric digits within numbers
- Timestamps and dates (may need locale formatting)

---

## CSS Logical Properties

Logical properties adapt automatically to text direction.

### Margin and Padding

| Physical | Logical |
|----------|---------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |

```css
/* Instead of this */
.card {
  margin-left: 1rem;
  padding-right: 2rem;
}

/* Use this */
.card {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
}
```

### Position

| Physical | Logical |
|----------|---------|
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `top` | `inset-block-start` |
| `bottom` | `inset-block-end` |

```css
.tooltip {
  position: absolute;
  inset-inline-start: 100%;
  inset-block-start: 0;
}
```

### Border

| Physical | Logical |
|----------|---------|
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `border-top-left-radius` | `border-start-start-radius` |
| `border-top-right-radius` | `border-start-end-radius` |

```css
.sidebar {
  border-inline-end: 1px solid #ccc;
}
```

### Text Alignment

```css
/* Instead of */
.text { text-align: left; }

/* Use */
.text { text-align: start; }
```

| Physical | Logical |
|----------|---------|
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

### Flexbox and Grid

```css
/* Physical (doesn't flip) */
.flex { justify-content: flex-start; }

/* Already logical — works correctly */
.flex { justify-content: start; }
```

### Tailwind Logical Classes

Tailwind v3.3+ includes logical property utilities:

```html
<div class="ms-4">margin-inline-start: 1rem</div>
<div class="me-4">margin-inline-end: 1rem</div>
<div class="ps-4">padding-inline-start: 1rem</div>
<div class="pe-4">padding-inline-end: 1rem</div>
<div class="start-0">inset-inline-start: 0</div>
<div class="end-0">inset-inline-end: 0</div>
<div class="text-start">text-align: start</div>
<div class="text-end">text-align: end</div>
```

---

## Font Selection for Multilingual

### System Font Stacks by Script

```css
/* Arabic */
.arabic {
  font-family: 'Noto Naskh Arabic', 'Geeza Pro', 'Traditional Arabic', serif;
}

/* Hebrew */
.hebrew {
  font-family: 'Noto Sans Hebrew', 'Arial Hebrew', 'Lucida Grande', sans-serif;
}

/* Chinese (Simplified) */
.chinese-simplified {
  font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* Chinese (Traditional) */
.chinese-traditional {
  font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

/* Japanese */
.japanese {
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif;
}

/* Korean */
.korean {
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}
```

### Recommended Multilingual Fonts

**Google Noto Family:**
- Covers all Unicode scripts
- Consistent design across languages
- Free and open source

```css
/* Universal fallback */
body {
  font-family:
    'Inter',           /* Latin primary */
    'Noto Sans',       /* Latin fallback */
    'Noto Sans Arabic',
    'Noto Sans Hebrew',
    'Noto Sans SC',    /* Chinese Simplified */
    'Noto Sans JP',    /* Japanese */
    'Noto Sans KR',    /* Korean */
    system-ui,
    sans-serif;
}
```

### Font Features by Script

Not all scripts support the same OpenType features:

| Feature | Latin | Arabic | Hebrew | CJK |
|---------|-------|--------|--------|-----|
| Ligatures | ✓ | ✓ (required) | ✓ | — |
| Kerning | ✓ | — | ✓ | — |
| Small caps | ✓ | — | — | — |
| Tabular nums | ✓ | ✓ | ✓ | ✓ |

---

## Arabic Typography

Arabic has unique requirements due to its cursive nature.

### Essential Requirements

**Contextual forms:** Letters change shape based on position (initial, medial, final, isolated).

```
ب (isolated) → بـ (initial) → ـبـ (medial) → ـب (final)
```

**Ligatures:** Common letter combinations must ligate:
- لا (lam-alef)
- لله (allah)

**Diacritical marks:** Vowel marks (harakat) must be supported.

### CSS Considerations

**Never use letter-spacing:**

```css
/* ❌ Wrong — breaks Arabic connections */
.arabic {
  letter-spacing: 0.05em;
}

/* ✓ Correct — reset letter-spacing */
[lang="ar"], [dir="rtl"] {
  letter-spacing: 0;
}
```

**Line height:** Arabic text often needs more vertical space for diacritics:

```css
[lang="ar"] {
  line-height: 1.8; /* vs 1.5 for Latin */
}
```

**Font size:** Arabic is often more complex visually; consider slightly larger sizes:

```css
[lang="ar"] {
  font-size: 1.1em; /* Relative increase */
}
```

### Recommended Arabic Fonts

| Font | Style | Use Case |
|------|-------|----------|
| Noto Naskh Arabic | Serif/Naskh | Body text, formal |
| Noto Sans Arabic | Sans-serif | UI, modern |
| Amiri | Serif/Naskh | Editorial, books |
| Cairo | Sans-serif | Headlines, modern |
| Scheherazade New | Serif/Naskh | Traditional, religious |

---

## Hebrew Typography

Hebrew shares RTL direction with Arabic but has different characteristics.

### Key Differences from Arabic

- Letters don't connect (non-cursive)
- Simpler letter forms
- Vowel points (niqqud) used mainly in religious/educational texts

### CSS Considerations

```css
[lang="he"] {
  direction: rtl;
  text-align: start;
  /* Letter-spacing is acceptable in Hebrew */
  letter-spacing: normal;
}
```

### Recommended Hebrew Fonts

| Font | Style | Use Case |
|------|-------|----------|
| Noto Sans Hebrew | Sans-serif | UI, general |
| Noto Serif Hebrew | Serif | Editorial |
| Frank Ruhl Libre | Serif | Traditional |
| Heebo | Sans-serif | Modern UI |
| Assistant | Sans-serif | Clean UI |

---

## CJK Typography

Chinese, Japanese, and Korean have unique typographic needs.

### Character Spacing

CJK characters are monospaced by design — don't add letter-spacing:

```css
.cjk {
  letter-spacing: 0;
}
```

### Line Breaking

CJK text can break anywhere (no word boundaries):

```css
.cjk {
  word-break: normal;
  overflow-wrap: anywhere;
}
```

### Punctuation

CJK punctuation is full-width. Avoid mixing with half-width:

```
。、「」（）  /* Full-width — correct */
.,""()       /* Half-width — avoid in CJK */
```

### Vertical Text

Traditional CJK can be written vertically:

```css
.vertical-text {
  writing-mode: vertical-rl; /* Right to left columns */
  text-orientation: mixed;
}
```

### Font Size

CJK characters are visually complex — may need larger sizes:

```css
[lang="zh"], [lang="ja"], [lang="ko"] {
  font-size: 1.05em;
  line-height: 1.7;
}
```

---

## Bidirectional Text

When RTL and LTR content mix within the same text.

### Automatic Handling

Unicode's bidirectional algorithm handles most cases automatically:

```html
<p dir="rtl">
  النص العربي with English words يعود إلى العربية
</p>
```

Result: Arabic flows RTL, English words display LTR within the flow.

### Manual Control

Use `dir="auto"` for user-generated content:

```html
<input type="text" dir="auto">
```

For explicit control within mixed content:

```html
<p dir="rtl">
  النص العربي <span dir="ltr">https://example.com</span> يعود إلى العربية
</p>
```

### CSS Override

```css
/* Force LTR for code blocks regardless of page direction */
code, pre {
  direction: ltr;
  unicode-bidi: embed;
}
```

### Numbers in RTL

Numbers are always LTR, even in RTL text:

```html
<p dir="rtl">السعر: $1,234.56</p>
<!-- Displays correctly: 1,234.56$ :السعر -->
```

For phone numbers and codes:

```html
<p dir="rtl">
  الهاتف: <span dir="ltr">+1 (555) 123-4567</span>
</p>
```

---

## Quick Reference

### RTL Checklist

- [ ] `dir="rtl"` on html or container
- [ ] `lang` attribute set correctly
- [ ] Using logical properties (not left/right)
- [ ] Letter-spacing reset for Arabic
- [ ] Appropriate line-height for script
- [ ] Correct font family with script support
- [ ] Icons/arrows mirrored if directional
- [ ] Bidirectional content handled

### Essential CSS for Multilingual

```css
/* Base RTL support */
[dir="rtl"] {
  direction: rtl;
}

/* Arabic-specific */
[lang="ar"] {
  font-family: 'Noto Sans Arabic', sans-serif;
  letter-spacing: 0;
  line-height: 1.8;
}

/* Hebrew-specific */
[lang="he"] {
  font-family: 'Noto Sans Hebrew', sans-serif;
}

/* CJK-specific */
[lang="zh"], [lang="ja"], [lang="ko"] {
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans KR', sans-serif;
  letter-spacing: 0;
  line-height: 1.7;
}

/* Force LTR for code */
code, pre, .code {
  direction: ltr;
  unicode-bidi: embed;
  text-align: left;
}
```

### Tailwind RTL Setup

```html
<!-- Root element -->
<html lang="ar" dir="rtl" class="rtl">

<!-- Components using logical classes -->
<div class="ms-4 ps-2 border-e text-start">
  RTL-aware component
</div>
```
