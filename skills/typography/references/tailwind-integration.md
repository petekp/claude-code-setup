# Tailwind CSS Typography

Using Tailwind's typography utilities and the @tailwindcss/typography prose plugin.

## Table of Contents

- [Core Typography Utilities](#core-typography-utilities)
- [Typography Plugin (Prose)](#typography-plugin-prose)
- [Customizing Prose](#customizing-prose)
- [Building Type Systems](#building-type-systems)
- [Common Patterns](#common-patterns)

---

## Core Typography Utilities

### Font Size

```html
<p class="text-xs">0.75rem / 12px</p>
<p class="text-sm">0.875rem / 14px</p>
<p class="text-base">1rem / 16px</p>
<p class="text-lg">1.125rem / 18px</p>
<p class="text-xl">1.25rem / 20px</p>
<p class="text-2xl">1.5rem / 24px</p>
<p class="text-3xl">1.875rem / 30px</p>
<p class="text-4xl">2.25rem / 36px</p>
<p class="text-5xl">3rem / 48px</p>
<p class="text-6xl">3.75rem / 60px</p>
<p class="text-7xl">4.5rem / 72px</p>
<p class="text-8xl">6rem / 96px</p>
<p class="text-9xl">8rem / 128px</p>
```

### Font Weight

```html
<p class="font-thin">100</p>
<p class="font-extralight">200</p>
<p class="font-light">300</p>
<p class="font-normal">400</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
<p class="font-black">900</p>
```

### Line Height

```html
<p class="leading-none">1</p>
<p class="leading-tight">1.25</p>
<p class="leading-snug">1.375</p>
<p class="leading-normal">1.5</p>
<p class="leading-relaxed">1.625</p>
<p class="leading-loose">2</p>

<!-- Fixed line heights -->
<p class="leading-3">0.75rem</p>
<p class="leading-4">1rem</p>
<p class="leading-5">1.25rem</p>
<p class="leading-6">1.5rem</p>
<p class="leading-7">1.75rem</p>
<p class="leading-8">2rem</p>
```

### Letter Spacing

```html
<p class="tracking-tighter">-0.05em</p>
<p class="tracking-tight">-0.025em</p>
<p class="tracking-normal">0</p>
<p class="tracking-wide">0.025em</p>
<p class="tracking-wider">0.05em</p>
<p class="tracking-widest">0.1em</p>
```

### Text Wrapping

```html
<h1 class="text-balance">Balanced heading text</h1>
<p class="text-pretty">Paragraph without orphans</p>
<p class="text-nowrap">No wrapping</p>
<p class="text-wrap">Normal wrapping</p>
```

### Font Features

```html
<!-- Numeric variants -->
<span class="tabular-nums">1,234,567</span>
<span class="proportional-nums">1234</span>
<span class="lining-nums">1234</span>
<span class="oldstyle-nums">1234</span>
<span class="slashed-zero">0</span>
<span class="diagonal-fractions">1/2</span>
<span class="stacked-fractions">1/2</span>

<!-- Normal (reset) -->
<span class="normal-nums">1234</span>
```

### Font Smoothing

```html
<p class="antialiased">Antialiased text (for dark backgrounds)</p>
<p class="subpixel-antialiased">Subpixel antialiased (default)</p>
```

---

## Typography Plugin (Prose)

The `@tailwindcss/typography` plugin provides beautiful defaults for vanilla HTML.

### Installation

**Tailwind v4:**
```css
/* In your CSS file */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

**Tailwind v3:**
```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Basic Usage

```html
<article class="prose">
  <h1>Article Title</h1>
  <p>This paragraph gets beautiful typography automatically.</p>
  <ul>
    <li>List items are styled</li>
    <li>With proper spacing</li>
  </ul>
  <blockquote>Quotes look great too.</blockquote>
</article>
```

### Size Modifiers

```html
<article class="prose prose-sm">Small prose</article>
<article class="prose prose-base">Base prose (default)</article>
<article class="prose prose-lg">Large prose</article>
<article class="prose prose-xl">Extra large prose</article>
<article class="prose prose-2xl">2XL prose</article>
```

### Responsive Sizing

```html
<article class="prose prose-sm md:prose-base lg:prose-lg xl:prose-xl">
  Responsive article sizing
</article>
```

### Color Themes

```html
<article class="prose prose-slate">Slate gray theme</article>
<article class="prose prose-gray">Gray theme (default)</article>
<article class="prose prose-zinc">Zinc theme</article>
<article class="prose prose-neutral">Neutral theme</article>
<article class="prose prose-stone">Stone theme</article>
```

### Dark Mode

```html
<article class="prose dark:prose-invert">
  Inverted colors in dark mode
</article>

<!-- With color theme -->
<article class="prose prose-slate dark:prose-invert">
  Slate theme with dark mode
</article>
```

---

## Customizing Prose

### Element Modifiers

Override specific elements within prose:

```html
<article class="prose
  prose-headings:text-blue-600
  prose-a:text-blue-500
  prose-a:no-underline
  prose-a:hover:underline
  prose-strong:text-gray-900
  prose-code:text-pink-500
  prose-code:before:content-none
  prose-code:after:content-none
  prose-img:rounded-xl
  prose-img:shadow-lg
  prose-blockquote:border-blue-500
  prose-blockquote:italic
  prose-li:marker:text-blue-500
">
  <!-- Content -->
</article>
```

### Available Element Modifiers

| Modifier | Targets |
|----------|---------|
| `prose-headings:` | h1, h2, h3, h4, th |
| `prose-h1:` | h1 |
| `prose-h2:` | h2 |
| `prose-h3:` | h3 |
| `prose-h4:` | h4 |
| `prose-p:` | p |
| `prose-a:` | a |
| `prose-blockquote:` | blockquote |
| `prose-figure:` | figure |
| `prose-figcaption:` | figcaption |
| `prose-strong:` | strong |
| `prose-em:` | em |
| `prose-code:` | code |
| `prose-pre:` | pre |
| `prose-ol:` | ol |
| `prose-ul:` | ul |
| `prose-li:` | li |
| `prose-table:` | table |
| `prose-thead:` | thead |
| `prose-tr:` | tr |
| `prose-th:` | th |
| `prose-td:` | td |
| `prose-img:` | img |
| `prose-video:` | video |
| `prose-hr:` | hr |
| `prose-lead:` | [class~="lead"] |

### Removing Max Width

Prose includes `max-width: 65ch` by default. Remove it:

```html
<article class="prose max-w-none">
  Full-width prose content
</article>
```

### Excluding Elements (not-prose)

Exclude sections from prose styling:

```html
<article class="prose">
  <h1>Article Title</h1>
  <p>Styled paragraph.</p>

  <div class="not-prose">
    <!-- This section won't have prose styles -->
    <div class="my-custom-widget">...</div>
  </div>

  <p>Back to prose styles.</p>
</article>
```

### Custom Configuration (v3)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#333',
            a: {
              color: '#3182ce',
              '&:hover': {
                color: '#2c5282',
              },
            },
            h1: {
              fontWeight: '800',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
}
```

---

## Building Type Systems

### Custom Font Family

```html
<!-- Using Tailwind's font utilities -->
<p class="font-sans">System sans-serif</p>
<p class="font-serif">System serif</p>
<p class="font-mono">System monospace</p>
```

**Extend in config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif Pro', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Fraunces', 'serif'],
      },
    },
  },
}
```

```html
<h1 class="font-display">Display heading</h1>
<p class="font-sans">Body text</p>
<code class="font-mono">Code</code>
```

### Type Scale Component

```html
<!-- Heading hierarchy -->
<h1 class="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
  Page Title
</h1>

<h2 class="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
  Section Title
</h2>

<h3 class="text-xl font-semibold leading-snug md:text-2xl">
  Subsection
</h3>

<p class="text-base leading-relaxed text-gray-700">
  Body paragraph with comfortable reading line height.
</p>

<p class="text-sm leading-normal text-gray-500">
  Caption or secondary text.
</p>
```

### Responsive Type Scale

```html
<h1 class="
  text-2xl leading-tight
  sm:text-3xl
  md:text-4xl
  lg:text-5xl lg:leading-none
  xl:text-6xl
">
  Responsive Heading
</h1>
```

---

## Common Patterns

### All-Caps Labels

```html
<span class="text-xs font-semibold uppercase tracking-widest text-gray-500">
  Category
</span>
```

### Article Header

```html
<header class="mb-8">
  <span class="text-sm font-medium uppercase tracking-wider text-blue-600">
    Technology
  </span>
  <h1 class="mt-2 text-3xl font-bold leading-tight text-gray-900 text-balance md:text-4xl">
    The Future of Web Typography
  </h1>
  <p class="mt-4 text-lg text-gray-600">
    Exploring modern CSS features for better reading experiences.
  </p>
</header>
```

### Card Title

```html
<h3 class="text-lg font-semibold leading-snug text-gray-900 line-clamp-2">
  Long card title that might need to be truncated after two lines
</h3>
```

### Price Display

```html
<span class="text-3xl font-bold tabular-nums">
  $1,234<span class="text-lg font-normal text-gray-500">.99</span>
</span>
```

### Data Table

```html
<td class="text-sm tabular-nums text-right">
  1,234,567
</td>
```

### Dark Mode Typography

```html
<article class="
  prose prose-gray
  dark:prose-invert
  dark:prose-p:text-gray-300
  dark:prose-headings:text-white
  dark:prose-a:text-blue-400
">
  <!-- Content -->
</article>
```

### Blog Post Layout

```html
<article class="
  prose prose-lg
  prose-headings:font-display
  prose-headings:text-gray-900
  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700
  prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5
  prose-pre:bg-gray-900
  prose-img:rounded-lg prose-img:shadow-md
  max-w-prose mx-auto
  dark:prose-invert
">
  <!-- Markdown rendered content -->
</article>
```

---

## Quick Reference

### Essential Prose Setup

```html
<!-- Minimal -->
<article class="prose">...</article>

<!-- Recommended -->
<article class="prose prose-gray lg:prose-lg dark:prose-invert max-w-prose mx-auto">
  ...
</article>

<!-- Full-featured -->
<article class="
  prose prose-gray
  prose-sm md:prose-base lg:prose-lg
  dark:prose-invert
  prose-headings:text-balance
  prose-p:text-pretty
  prose-a:text-blue-600
  max-w-prose mx-auto px-4
">
  ...
</article>
```

### Typography Checklist

- [ ] `prose` class on article content
- [ ] Size modifier for responsive (`prose-sm md:prose-base lg:prose-lg`)
- [ ] Color theme matching site (`prose-slate`, `prose-gray`, etc.)
- [ ] Dark mode support (`dark:prose-invert`)
- [ ] `text-balance` on headings
- [ ] `text-pretty` on paragraphs
- [ ] `tabular-nums` on data/prices
- [ ] `max-w-prose` or `max-w-none` as needed
