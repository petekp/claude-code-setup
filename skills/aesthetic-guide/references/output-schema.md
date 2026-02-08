# Output Schema

Fill every section below with concrete, implementation-ready values for the target aesthetic. Replace all `[bracketed placeholders]` with exact CSS. Omit nothing — a coding agent will use this as its sole reference.

---

## Template

```markdown
# [Aesthetic Name] Design System

> [One-sentence essence of the aesthetic — what makes it instantly recognizable]

## Identity

### Essential Properties
[List 3-5 CSS properties that are non-negotiable. Without these, the aesthetic fails.]

### Characteristic Properties
[List properties that are common but optional — they reinforce the aesthetic but aren't required.]

### Anti-Patterns
[List properties that actively violate the aesthetic. A coding agent must never use these.]

---

## Color Palette

### Core Colors

| Role | Light Mode | Dark Mode | CSS Variable |
|------|-----------|-----------|--------------|
| Background (primary) | [hex] | [hex] | `--color-bg` |
| Background (secondary) | [hex] | [hex] | `--color-bg-secondary` |
| Background (tertiary) | [hex] | [hex] | `--color-bg-tertiary` |
| Surface | [hex] | [hex] | `--color-surface` |
| Surface (elevated) | [hex] | [hex] | `--color-surface-elevated` |
| Text (primary) | [hex] | [hex] | `--color-text` |
| Text (secondary) | [hex] | [hex] | `--color-text-secondary` |
| Text (disabled) | [hex] | [hex] | `--color-text-disabled` |
| Border | [hex] | [hex] | `--color-border` |
| Border (subtle) | [hex] | [hex] | `--color-border-subtle` |
| Accent (primary) | [hex] | [hex] | `--color-accent` |
| Accent (secondary) | [hex] | [hex] | `--color-accent-secondary` |
| Success | [hex] | [hex] | `--color-success` |
| Warning | [hex] | [hex] | `--color-warning` |
| Error | [hex] | [hex] | `--color-error` |
| Info | [hex] | [hex] | `--color-info` |

### Color Generation Rules
[How to derive new colors that feel native to this aesthetic. HSL patterns, saturation constraints, lightness ranges.]

### Gradient Patterns (if applicable)
[Exact gradient syntax: direction, stops, use cases.]

### Color Do's and Don'ts
- DO: [specific guidance]
- DON'T: [specific anti-pattern]

---

## Typography

### Font Stack

```css
--font-primary: [font-family with full fallback chain];
--font-secondary: [font-family with full fallback chain]; /* if applicable */
--font-mono: [font-family with full fallback chain]; /* if applicable */
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| display | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| h1 | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| h2 | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| h3 | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| h4 | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| body-lg | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| body | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| body-sm | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| caption | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| label | [px/rem] | [number] | [ratio] | [em] | [when to use] |
| overline | [px/rem] | [number] | [ratio] | [em] | [when to use] |

### Scale Ratio
[Mathematical ratio and rationale, e.g., Minor Third 1.2]

### Typography Rules
- text-transform: [when uppercase, when normal]
- text-decoration: [link treatment, emphasis treatment]
- text-align: [default alignment, exceptions]
- text-wrap: [balance/pretty usage]
- font-feature-settings: [any OpenType features this aesthetic uses]
- Dark mode adjustments: [weight reduction, color shifts]

---

## Spacing

### Base Unit
[The foundational spacing unit, e.g., 4px or 8px]

### Scale

| Token | Value | Use |
|-------|-------|-----|
| space-xs | [px/rem] | [when to use] |
| space-sm | [px/rem] | [when to use] |
| space-md | [px/rem] | [when to use] |
| space-lg | [px/rem] | [when to use] |
| space-xl | [px/rem] | [when to use] |
| space-2xl | [px/rem] | [when to use] |
| space-3xl | [px/rem] | [when to use] |

### Spacing Philosophy
[Tight vs generous, mathematical vs organic, grid-based vs freeform]

### Content Width
- max-width for text: [value]
- max-width for containers: [value]
- horizontal padding (mobile): [value]
- horizontal padding (desktop): [value]

---

## Borders & Shapes

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| radius-none | [px] | [when to use] |
| radius-sm | [px] | [when to use] |
| radius-md | [px] | [when to use] |
| radius-lg | [px] | [when to use] |
| radius-xl | [px] | [when to use] |
| radius-full | [px] | [when to use — pills, circles] |

### Border Style
- Default border: [CSS shorthand, e.g., `1px solid var(--color-border)`]
- Emphasis border: [CSS shorthand]
- Divider: [CSS shorthand]
- Border philosophy: [when to use borders, when to avoid]

### Shape Treatments
[Any non-standard shapes: clip-path, corner cuts, skewed containers, squircles]

---

## Shadows & Depth

### Elevation Scale

| Level | CSS box-shadow | Use |
|-------|---------------|-----|
| 0 (flat) | [value] | [when to use] |
| 1 (raised) | [value] | [when to use] |
| 2 (floating) | [value] | [when to use] |
| 3 (overlay) | [value] | [when to use] |
| 4 (modal) | [value] | [when to use] |

### Shadow Rules
- Blur ratio to offset: [relationship]
- Shadow color: [how derived from background]
- Dark mode adjustments: [changes to shadow values]
- Aesthetic-specific shadow patterns: [hard offset, glow, dual-direction, inset, etc.]

### Text Shadow
[If applicable — exact values per use case]

---

## Backgrounds & Surfaces

### Background Treatments
[Flat color, gradient, blur, texture, pattern, noise — with exact CSS for each]

### backdrop-filter (if applicable)
```css
[exact filter chain, e.g., blur(10px) saturate(180%)]
```

### Texture/Pattern Overlays (if applicable)
[CSS for scanlines, noise, grain, grid patterns — with pointer-events: none]

### Surface Hierarchy
[How to layer backgrounds to create depth without shadow — grouped backgrounds, tints, overlays]

---

## Animation & Motion

### Easing Functions

| Token | Value | Use |
|-------|-------|-----|
| ease-default | [cubic-bezier] | [standard transitions] |
| ease-in | [cubic-bezier] | [elements entering] |
| ease-out | [cubic-bezier] | [elements exiting] |
| ease-bounce | [cubic-bezier] | [playful/spring effects, if applicable] |

### Duration Scale

| Token | Value | Use |
|-------|-------|-----|
| duration-instant | [ms] | [micro-interactions] |
| duration-fast | [ms] | [hover, focus changes] |
| duration-normal | [ms] | [standard transitions] |
| duration-slow | [ms] | [complex animations] |
| duration-entrance | [ms] | [elements appearing] |
| duration-exit | [ms] | [elements disappearing] |

### What Animates
[Exhaustive list of which properties should animate in this aesthetic and which should NOT]

### Signature Animations (if applicable)
[Keyframe definitions for any aesthetic-specific effects: glitch, flicker, pulse, float, etc.]

```css
@keyframes [name] {
  [exact keyframes]
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  [what changes — which animations stop, which transitions shorten]
}
```

---

## Interactive States

### Buttons

| State | Background | Text Color | Border | Shadow | Transform | Other |
|-------|-----------|------------|--------|--------|-----------|-------|
| Default | [value] | [value] | [value] | [value] | none | |
| Hover | [value] | [value] | [value] | [value] | [value] | [cursor, etc.] |
| Active/Pressed | [value] | [value] | [value] | [value] | [value] | |
| Focus | [value] | [value] | [value] | [value] | [value] | [outline/ring] |
| Disabled | [value] | [value] | [value] | [value] | none | [opacity, cursor] |
| Loading | [value] | [value] | [value] | [value] | [value] | [spinner style] |

Button variants (if the aesthetic supports multiple):
- Primary: [CSS block]
- Secondary: [CSS block]
- Ghost/Text: [CSS block]
- Destructive: [CSS block]

### Links

| State | Color | Text Decoration | Other |
|-------|-------|-----------------|-------|
| Default | [value] | [value] | |
| Hover | [value] | [value] | |
| Active | [value] | [value] | |
| Visited | [value] | [value] | |
| Focus | [value] | [value] | [outline] |

### Text Inputs

| State | Background | Border | Shadow | Text Color | Placeholder Color |
|-------|-----------|--------|--------|------------|-------------------|
| Default | [value] | [value] | [value] | [value] | [value] |
| Hover | [value] | [value] | [value] | [value] | |
| Focus | [value] | [value] | [value] | [value] | |
| Filled | [value] | [value] | [value] | [value] | |
| Error | [value] | [value] | [value] | [value] | |
| Disabled | [value] | [value] | [value] | [value] | [value] |

### Checkboxes & Radios

| State | Border | Background | Check Color | Shadow |
|-------|--------|-----------|-------------|--------|
| Unchecked | [value] | [value] | — | [value] |
| Checked | [value] | [value] | [value] | [value] |
| Hover | [value] | [value] | | [value] |
| Focus | [value] | [value] | | [value] |
| Disabled | [value] | [value] | [value] | [value] |

### Toggle/Switch
[Dimensions, track colors per state, thumb colors per state, animation on toggle]

### Select/Dropdown
[Trigger styling per state, dropdown panel styling, option hover/selected/disabled states]

### Cards

| State | Background | Border | Shadow | Transform |
|-------|-----------|--------|--------|-----------|
| Default | [value] | [value] | [value] | none |
| Hover | [value] | [value] | [value] | [value] |
| Active | [value] | [value] | [value] | [value] |
| Selected | [value] | [value] | [value] | [value] |

---

## Component Recipes

### Navigation Bar
```css
[Complete CSS block — background, height, shadow, border, blur, padding, sticky behavior]
```

### Sidebar
```css
[Complete CSS block — width, background, border, item padding, active item style]
```

### Modal/Dialog
```css
[Complete CSS block — backdrop, container, border-radius, shadow, padding, entrance animation]
```

### Toast/Notification
```css
[Complete CSS block — position, background, shadow, border, entrance/exit animation]
```

### Tooltip
```css
[Complete CSS block — background, text color, padding, border-radius, shadow, arrow, delay, animation]
```

### Badge/Tag
```css
[Complete CSS block — padding, border-radius, font-size, background, text color per variant]
```

### Avatar
```css
[Complete CSS block — size scale, border-radius, border, fallback background, text style]
```

### Divider
```css
[Complete CSS block — color, height, margin, any decorative treatment]
```

### Progress Bar
```css
[Complete CSS block — track style, fill style, animation, border-radius]
```

### Skeleton Loading
```css
[Complete CSS block — background, animation, border-radius, shimmer gradient]
```

### Table
```css
[Complete CSS block — header style, row style, hover, striping, borders, padding]
```

---

## Layout Patterns

### Grid System
- Columns: [number per breakpoint]
- Gutter: [value per breakpoint]
- Margins: [value per breakpoint]
- Max container width: [value]

### Responsive Breakpoints

| Name | Value | Columns | Margins |
|------|-------|---------|---------|
| mobile | [px] | [n] | [px] |
| tablet | [px] | [n] | [px] |
| desktop | [px] | [n] | [px] |
| wide | [px] | [n] | [px] |

### Density
[How tight or generous the layout should be, and how density changes at breakpoints]

### Alignment Principles
[Left-aligned vs centered, symmetry vs asymmetry, grid adherence]

---

## Iconography

### Style
[Line weight, corner radius, fill vs outline, size scale]

### Recommended Icon Sets
[Specific icon libraries that match this aesthetic, with rationale]

### Icon Sizing

| Context | Size |
|---------|------|
| Inline with text | [px] |
| Button icon | [px] |
| Navigation icon | [px] |
| Feature/hero icon | [px] |

---

## Focus & Accessibility

### Focus Ring
```css
[Exact focus-visible styling — outline width, color, offset, border-radius]
```

### Contrast Requirements
- Text on background: [minimum ratio]
- Interactive elements: [minimum ratio]
- Decorative elements meeting contrast: [guidance]

### Reduced Motion Behavior
[Which animations are removed/shortened, what replaces them]

### Dark Mode Transition
[How color roles shift, weight adjustments, shadow changes, contrast preservation]

---

## CSS Custom Properties Block

Complete set of variables to copy into a project:

```css
:root {
  /* Colors */
  [all color variables]

  /* Typography */
  [all font variables]

  /* Spacing */
  [all spacing variables]

  /* Borders */
  [all border/radius variables]

  /* Shadows */
  [all shadow variables]

  /* Animation */
  [all easing/duration variables]
}

@media (prefers-color-scheme: dark) {
  :root {
    [all dark mode overrides]
  }
}
```

---

## Tailwind Config (if applicable)

```js
// tailwind.config.js extend block
{
  [complete theme extension mapping all tokens above to Tailwind utilities]
}
```
```

---

## Usage Notes

- **Every `[bracketed]` placeholder must be replaced** with an exact value. If a property is not applicable to the aesthetic, explicitly state "Not used in this aesthetic" rather than omitting it.
- **Every CSS block must be complete and copy-pasteable.** No partial snippets or pseudocode.
- **Maintain the heading structure exactly.** Coding agents will search by heading name.
- **Dark mode is not optional.** Every color role needs both light and dark values, even if the aesthetic is primarily dark (provide the dark variant as "default" and a light adaptation).
