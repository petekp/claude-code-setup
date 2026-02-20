# Editorial Design System

All visual decisions for the interactive study guide should reference these tokens. The system is inspired by long-form editorial design (NYT Interactives, Pudding.cool, The Markup) — generous whitespace, confident typography, and color used sparingly for meaning.

---

## CSS Custom Properties

Paste this entire block into the project's main CSS file as the design foundation:

```css
:root {
  /* Typography */
  --font-serif: 'Newsreader', 'Georgia', 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;

  --text-hero: clamp(2.5rem, 5vw, 4rem);
  --text-h1: clamp(2rem, 4vw, 3rem);
  --text-h2: clamp(1.5rem, 3vw, 2rem);
  --text-h3: 1.25rem;
  --text-body: 1.0625rem;
  --text-small: 0.875rem;
  --text-caption: 0.8125rem;
  --text-mono: 0.875rem;

  --leading-tight: 1.2;
  --leading-body: 1.65;
  --leading-relaxed: 1.8;

  --measure: 38rem; /* ~65 characters per line */

  /* Color — Light */
  --ink: #1a1a2e;
  --ink-secondary: #4a4a68;
  --ink-muted: #8888a0;
  --surface: #ffffff;
  --surface-raised: #fafafa;
  --surface-sunken: #f3f3f8;
  --border: #e2e2ea;
  --border-light: #f0f0f5;
  --accent: #2563eb;
  --accent-light: #dbeafe;
  --accent-dark: #1d4ed8;

  /* Semantic colors */
  --think: #f59e0b;
  --think-bg: #fffbeb;
  --explore: #10b981;
  --explore-bg: #ecfdf5;
  --code-bg: #1e1e2e;
  --code-text: #cdd6f4;

  /* Spacing scale (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* Motion */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-medium: 350ms;
  --duration-slow: 500ms;
  --duration-dramatic: 800ms;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(26, 26, 46, 0.05);
  --shadow-md: 0 4px 12px rgba(26, 26, 46, 0.08);
  --shadow-lg: 0 8px 24px rgba(26, 26, 46, 0.12);

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Layout */
  --sidebar-width: 240px;
  --content-max: 64rem;
  --gutter: var(--space-6);
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #e4e4ef;
    --ink-secondary: #a0a0b8;
    --ink-muted: #6b6b82;
    --surface: #121220;
    --surface-raised: #1a1a2e;
    --surface-sunken: #0e0e1a;
    --border: #2a2a3e;
    --border-light: #1e1e30;
    --accent: #60a5fa;
    --accent-light: #1e3a5f;
    --accent-dark: #93bbfd;
    --think-bg: #2a2010;
    --explore-bg: #0a2a1a;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}
```

---

## Base Styles

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  color: var(--ink);
  background: var(--surface);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Typography

```css
h1, h2, h3 {
  font-family: var(--font-serif);
  line-height: var(--leading-tight);
  color: var(--ink);
  letter-spacing: -0.02em;
}

h1 { font-size: var(--text-h1); }
h2 { font-size: var(--text-h2); margin-bottom: var(--space-4); }
h3 { font-size: var(--text-h3); margin-bottom: var(--space-3); }

p {
  max-width: var(--measure);
  margin-bottom: var(--space-4);
}

.hero__title {
  font-size: var(--text-hero);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.hero__label {
  font-family: var(--font-sans);
  font-size: var(--text-small);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-muted);
  margin-bottom: var(--space-2);
}

.section__title {
  font-size: var(--text-h2);
  margin-bottom: var(--space-2);
}

.section__subtitle {
  font-size: var(--text-body);
  color: var(--ink-secondary);
  max-width: var(--measure);
}

code, pre {
  font-family: var(--font-mono);
  font-size: var(--text-mono);
}

code:not(pre code) {
  background: var(--surface-sunken);
  padding: 0.15em 0.4em;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}
```

---

## Layout Components

### Page Shell

```css
.page {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .page { grid-template-columns: 1fr; }
}

.page__content {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-8) var(--gutter);
}
```

### Navigation Sidebar

```css
.nav {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: var(--space-8) var(--space-6);
  border-right: 1px solid var(--border-light);
  overflow-y: auto;
}

.nav__link {
  display: block;
  padding: var(--space-2) var(--space-3);
  color: var(--ink-muted);
  text-decoration: none;
  font-size: var(--text-small);
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard);
}

.nav__link:hover {
  color: var(--ink);
  background: var(--surface-sunken);
}

.nav__link.active {
  color: var(--accent);
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    height: auto;
    display: flex;
    overflow-x: auto;
    padding: var(--space-3) var(--space-4);
    background: var(--surface);
    border-right: none;
    border-top: 1px solid var(--border-light);
    z-index: 100;
  }

  .nav__link { white-space: nowrap; }
}
```

### Reading Progress Bar

```css
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
  z-index: 1000;
  transition: width 100ms linear;
}
```

### Sections

```css
.section {
  padding: var(--space-24) 0;
  border-bottom: 1px solid var(--border-light);
}

.section:last-child { border-bottom: none; }

.section__header { margin-bottom: var(--space-12); }

.section--hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-16) var(--gutter);
  border-bottom: none;
}
```

---

## Interactive Components

### Concept Cards

```css
.concept-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  overflow: hidden;
  transition: box-shadow var(--duration-fast) var(--ease-standard);
}

.concept-card:hover { box-shadow: var(--shadow-sm); }

.concept-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-6);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.concept-card__name {
  font-family: var(--font-serif);
  font-size: var(--text-h3);
}

.concept-card__toggle {
  font-size: 1.5rem;
  color: var(--ink-muted);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.concept-card__body {
  padding: 0 var(--space-6) var(--space-6);
}
```

### Pill (Code Location Tag)

```css
.pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  padding: var(--space-1) var(--space-3);
  background: var(--surface-sunken);
  border-radius: 100px;
  color: var(--ink-secondary);
  margin: var(--space-1);
}
```

### Tabs

```css
.tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-8);
  overflow-x: auto;
}

.tab {
  padding: var(--space-3) var(--space-6);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font: inherit;
  font-size: var(--text-small);
  color: var(--ink-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}

.tab:hover { color: var(--ink); }

.tab.active {
  color: var(--ink);
  border-bottom-color: var(--accent);
  font-weight: 500;
}

.tab-panel { display: none; }
.tab-panel.active { display: block; }
```

### Callouts

```css
.callout {
  padding: var(--space-6);
  border-radius: var(--radius-md);
  margin: var(--space-8) 0;
}

.callout h4 {
  font-family: var(--font-sans);
  font-size: var(--text-small);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.callout--think {
  background: var(--think-bg);
  border-left: 3px solid var(--think);
}

.callout--think h4 { color: var(--think); }

.callout--explore {
  background: var(--explore-bg);
  border-left: 3px solid var(--explore);
}

.callout--explore h4 { color: var(--explore); }

.self-test {
  background: var(--surface-sunken);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  margin-top: var(--space-8);
  font-style: italic;
  color: var(--ink-secondary);
}
```

### Pattern Cards

```css
.patterns__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  margin: var(--space-8) 0;
}

.pattern-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: box-shadow var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}

.pattern-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.pattern-card__name {
  font-family: var(--font-serif);
  font-size: var(--text-h3);
  margin-bottom: var(--space-2);
}

.pattern-card__description {
  color: var(--ink-secondary);
  font-size: var(--text-small);
  margin-bottom: var(--space-3);
}

.pattern-card__link {
  font-size: var(--text-caption);
  color: var(--accent);
  text-decoration: none;
}

.pattern-card__link:hover { text-decoration: underline; }
```

### Code Blocks

```css
pre {
  background: var(--code-bg);
  color: var(--code-text);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  overflow-x: auto;
  line-height: 1.6;
  margin: var(--space-4) 0;
}

pre code {
  background: none;
  padding: 0;
  font-size: var(--text-mono);
}
```

### Badge

```css
.badge {
  display: inline-block;
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  font-weight: 500;
  padding: var(--space-1) var(--space-3);
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge--pattern {
  background: var(--accent-light);
  color: var(--accent-dark);
}
```

### Search Input

```css
.search-input {
  width: 100%;
  max-width: 400px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: var(--text-small);
  background: var(--surface);
  color: var(--ink);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
```

### Walkthrough Split Layout

```css
.walkthrough__split {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: var(--space-8);
}

.walkthrough__diagram {
  position: sticky;
  top: var(--space-8);
  align-self: start;
  height: 50vh;
}

.walkthrough__step {
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--border-light);
  opacity: 0.4;
  transition: opacity var(--duration-medium) var(--ease-standard);
}

.walkthrough__step.active { opacity: 1; }

.walkthrough__step-number {
  font-family: var(--font-serif);
  font-size: var(--text-h2);
  color: var(--accent);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.walkthrough__annotation {
  margin-top: var(--space-4);
  padding-left: var(--space-4);
  border-left: 2px solid var(--border);
  color: var(--ink-secondary);
  font-size: var(--text-small);
}

@media (max-width: 768px) {
  .walkthrough__split { grid-template-columns: 1fr; }

  .walkthrough__diagram {
    position: relative;
    height: 40vh;
    margin-bottom: var(--space-8);
  }
}
```

### System Map (D3)

```css
.system-map__svg {
  width: 100%;
  height: 100%;
}

.system-map__node { cursor: grab; }
.system-map__node:active { cursor: grabbing; }

.system-map__node circle {
  transition: stroke var(--duration-fast) var(--ease-standard),
              fill var(--duration-fast) var(--ease-standard);
}

.system-map__node.highlighted circle {
  stroke: var(--accent);
  stroke-width: 3;
  fill: var(--accent-light);
}

.system-map__node-label {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--ink);
  pointer-events: none;
}

.system-map__edge-label {
  font-family: var(--font-mono);
  font-size: 10px;
  fill: var(--ink-muted);
}

.system-map__tooltip {
  position: absolute;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-caption);
  box-shadow: var(--shadow-md);
  pointer-events: none;
  z-index: 10;
  max-width: 280px;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
```

### Checklist / Progress

```css
.progress {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.progress__track {
  flex: 1;
  height: 6px;
  background: var(--surface-sunken);
  border-radius: 3px;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width var(--duration-medium) var(--ease-standard);
}

.progress__label {
  font-size: var(--text-small);
  color: var(--ink-muted);
  white-space: nowrap;
}

.checklist__day { margin-bottom: var(--space-8); }

.checklist__day-label {
  font-family: var(--font-sans);
  font-size: var(--text-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted);
  margin-bottom: var(--space-4);
}

.checklist__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.checklist__item label {
  cursor: pointer;
  color: var(--ink-secondary);
  transition: color var(--duration-fast) var(--ease-standard);
}

.checklist__item input:checked + label {
  text-decoration: line-through;
  color: var(--ink-muted);
}

.checklist__item input[type="checkbox"]:checked + label::before {
  animation: check-pop 0.3s var(--ease-bounce);
}

@keyframes check-pop {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

## Font Loading

Include in the HTML head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&display=swap" rel="stylesheet">
```

---

## External Dependencies

| Library | Purpose | npm package |
|---------|---------|-------------|
| D3.js v7 | System map, force layout | `d3` |
| Prism.js | Syntax highlighting | `prismjs` |
