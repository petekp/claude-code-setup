# Aesthetic Catalog

> Last updated: 2026-02-07

Pre-researched implementation data for common UI aesthetics. Use as a starting point when generating a full design system guide per the output schema. Cross-reference with web research for the latest trends and variations.

## Table of Contents

1. [Brutalist / Neo-Brutalist](#brutalist)
2. [Swiss / International Typographic Style](#swiss)
3. [Glassmorphism](#glassmorphism)
4. [Retro-Futuristic / Cyberpunk](#cyberpunk)
5. [Apple Human Interface](#apple-hig)
6. [Neumorphism / Soft UI](#neumorphism)
7. [Material Design 3](#material-design-3)

---

<a id="brutalist"></a>
## 1. Brutalist / Neo-Brutalist

**Essence:** Raw, unpolished, anti-design. The absence of decoration IS the aesthetic.

### Essential Properties
- `border-radius: 0` on everything
- `box-shadow` with zero blur (hard offset): `4px 4px 0 #000`
- High-contrast monochrome base with 0-2 saturated accent colors
- Monospace or raw sans-serif typography

### Anti-Patterns
- Gradients, rounded corners, soft shadows, blur effects, subtle color palettes

### Colors
- Backgrounds: `#FFFFFF` or `#000000`
- Text: opposite of background
- Neo-brutalist accents: `#FF5733`, `#FFCC00`, `#4B69FE`, `#00FF9F`, `#9C7BFF`
- Pattern: monochrome base + 0-2 saturated accents. No gradients. No tints.

### Typography
- Fonts: `'IBM Plex Mono', 'Source Code Pro', 'Courier New', monospace` or `Arial, Helvetica, sans-serif`
- Weights: 400 and 700 only
- Scale: large jumps — body 16-18px, headings 32-72px, no intermediates
- Line-height: 1.2-1.4
- Letter-spacing: 0 or slightly negative for headings
- Frequent `text-transform: uppercase`

### Borders & Shapes
- `border: 2px solid #000` or `3px solid #000`
- `border-radius: 0` — always
- Occasional thick borders (4-6px) for emphasis

### Shadows
- Hard offset only: `box-shadow: 4px 4px 0 #000`
- Larger elements: `box-shadow: 8px 8px 0 #000`
- Blur is always 0
- No text-shadow

### Spacing
- Deliberately unrefined: either very tight or very generous
- Large container padding (24-48px), minimal inline padding
- No standardized scale

### Animation
- Minimal to none. Instant state changes.
- Hover: `transform: translate(-2px, -2px)` with shadow growing to `6px 6px 0 #000`
- Active: shadow collapses to `0 0 0 #000`, element translates by shadow offset `transform: translate(4px, 4px)`

### Interactive States
- Hover: shadow grows, background inverts
- Active: shadow collapses, translate matches former shadow offset
- Focus: raw `outline: 3px solid #000`
- Disabled: `opacity: 0.4; cursor: not-allowed`

### Form Elements
- Inputs: `border: 2px solid #000; background: #fff; padding: 8px 12px; font-family: monospace; border-radius: 0`
- Buttons: `background: #000; color: #fff; border: 2px solid #000; padding: 12px 24px; font-family: monospace; text-transform: uppercase`

---

<a id="swiss"></a>
## 2. Swiss / International Typographic Style

**Essence:** Mathematical precision, typographic hierarchy, asymmetric grid. White space is the primary design element.

### Essential Properties
- Strict multi-column grid (12-column standard)
- Generous white space between sections (64-128px)
- Strong typographic hierarchy via size and weight alone
- Left-aligned, flush-left ragged-right text

### Anti-Patterns
- Decorative elements, textures, gradients, rounded corners, centered body text, justified text

### Colors
- Backgrounds: `#FFFFFF` or `#F5F5F5`
- Text: `#000000` or `#1A1A1A`
- 1-2 bold accent colors: `#FF0000`, `#0057B8`, `#FFD600`
- Color is informational, not decorative

### Typography
- Fonts: `'Helvetica Neue', Helvetica, Arial, Inter, sans-serif`
- Weights: 400, 500, 700 with strong contrast between levels
- Scale ratio: ~1.25 (Major Third) or ~1.333 (Perfect Fourth)
- Body: 16px / H3: 20px / H2: 25px / H1: 32-40px / Display: 48-72px
- Line-height: 1.5 body, 1.1-1.2 headings
- Letter-spacing: `-0.02em` to `-0.04em` on large headings
- `text-align: left` always

### Borders & Shapes
- Borders rare: `border: 1px solid #000` or `1px solid #E0E0E0` for dividers only
- `border-radius: 0` or `2-4px` maximum

### Shadows
- None to minimal: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` at most

### Spacing
- 8px baseline grid: 8, 16, 24, 32, 48, 64, 96
- `display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px`
- Generous section spacing: 64-128px vertical margins
- Consistent padding: `24px 32px`

### Animation
- Restrained: `transition: opacity 200ms ease, transform 200ms ease`
- 150-300ms durations, `ease` or `ease-out`
- Opacity and subtle position shifts only

### Interactive States
- Hover: subtle color shift or underline appearance
- Active: `opacity: 0.8`
- Focus: `outline: 2px solid #0057B8; outline-offset: 2px`
- Disabled: `opacity: 0.4`

### Form Elements
- Inputs: `border: none; border-bottom: 1px solid #000; padding: 8px 0; font-family: 'Helvetica Neue', sans-serif; font-size: 16px`
- Buttons: `background: transparent; border: 1px solid #000; padding: 12px 24px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase`

---

<a id="glassmorphism"></a>
## 3. Glassmorphism

**Essence:** Frosted glass panels floating over vibrant color. Depth through translucency and blur.

### Essential Properties
- `backdrop-filter: blur(10px)` — the defining property
- Semi-transparent backgrounds: `rgba(255, 255, 255, 0.15)`
- Thin semi-transparent border: `border: 1px solid rgba(255, 255, 255, 0.2)`
- Vibrant background behind the glass (gradient, image, or colored shapes)

### Anti-Patterns
- Opaque backgrounds, hard shadows, sharp corners, flat backgrounds behind glass elements

### Colors
- Background (behind glass): vibrant gradients — `#667EEA → #764BA2`, `#00B4DB → #0083B0`, `#E100FF → #7F00FF`
- Glass surface: `rgba(255, 255, 255, 0.15)` (light) or `rgba(255, 255, 255, 0.05-0.10)` (dark)
- Dark variant glass: `rgba(0, 0, 0, 0.2)` to `rgba(17, 25, 40, 0.75)`
- Text: `#FFFFFF` or `rgba(255, 255, 255, 0.8-0.9)`

### Typography
- Fonts: `Inter, 'SF Pro Display', Poppins, 'Segoe UI', sans-serif`
- Weights: 400 body, 500-600 headings
- Body: 14-16px, line-height 1.5-1.6
- Color: white or near-white with high opacity

### Borders & Shapes
- `border: 1px solid rgba(255, 255, 255, 0.2)` (light) or `rgba(255, 255, 255, 0.08)` (dark)
- `border-radius: 12px` to `20px`

### Shadows
- Outer: `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2)`
- Inner highlight: `box-shadow: inset 0 4px 20px rgba(255, 255, 255, 0.3)`
- Combined: both outer and inset

### Backgrounds
- Glass: `backdrop-filter: blur(10px) saturate(180%); background: rgba(255, 255, 255, 0.15)`
- Blur range: 6-8px (subtle) to 15-20px (heavy frost)
- Background must be colorful for effect to read

### Spacing
- Generous and airy
- Card padding: `24px 32px` to `32px 40px`
- Element spacing: 16-24px

### Animation
- `transition: all 0.3s ease` or `transition: background 0.3s ease, box-shadow 0.3s ease`
- 200-400ms, `ease` or `ease-in-out`

### Interactive States
- Hover: `background: rgba(255, 255, 255, 0.25)`, deeper shadow
- Active: `transform: scale(0.98)`, shadow reduces
- Focus: `outline: 2px solid rgba(255, 255, 255, 0.5); outline-offset: 2px`
- Disabled: `opacity: 0.5`, reduced blur

### Special Effects
- Gradient orbs behind glass: `border-radius: 50%; filter: blur(60px)` colored blobs
- Light reflection: `::after` pseudo-element with subtle white gradient at top
- Shine: `background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`

---

<a id="cyberpunk"></a>
## 4. Retro-Futuristic / Cyberpunk

**Essence:** Neon on dark. HUD interfaces, glitch effects, terminal aesthetics.

### Essential Properties
- Near-black backgrounds: `#0A0A0F`
- Neon accent colors at full saturation: `#00F0FF` (cyan), `#FF2A6D` (magenta)
- Multi-layer glow shadows: `box-shadow: 0 0 10px, 0 0 30px, 0 0 60px` in neon colors
- Monospace or tech-style fonts
- `text-transform: uppercase` with wide `letter-spacing: 0.1em-0.3em`

### Anti-Patterns
- Pastel colors, rounded corners, soft shadows, light backgrounds, serif fonts, organic shapes

### Colors
- Background: `#0A0A0F`, `#0D0D0D`, `#1A1A2E`
- Primary: `#00F0FF` (cyan)
- Secondary: `#FF2A6D` (magenta/pink)
- Warning: `#FCEE0A` (yellow)
- Success: `#05FFA1` (green)
- Danger: `#FF0040` (red)
- HSL pattern: saturation 80-100%, lightness 50-60% on backgrounds at lightness 3-8%

### Typography
- Primary: `Rajdhani, sans-serif` or `Orbitron, sans-serif`
- Mono: `'Share Tech Mono', 'Source Code Pro', monospace`
- Weights: 500-700
- Body: 14-16px, headings: 24-48px, display: 60-120px
- `text-transform: uppercase` dominant
- `letter-spacing: 0.1em` to `0.3em` on uppercase

### Borders & Shapes
- Neon borders: `border: 1px solid #00F0FF` or `rgba(0, 240, 255, 0.3)`
- `border-radius: 0` (sharp/angular)
- Clipped corners: `clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))`

### Shadows (Neon Glow)
- Box: `box-shadow: 0 0 10px #00F0FF, 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)`
- Text: `text-shadow: 0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 40px #00F0FF, 0 0 80px #00F0FF`
- Inner: `box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.1)`

### Backgrounds
- Base: `background: #0A0A0F` or `linear-gradient(135deg, #0A0A0F, #1A1A2E)`
- Grid pattern: `background-image: linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px); background-size: 50px 50px`
- Scanlines: `background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px); background-size: 100% 2px; pointer-events: none`

### Spacing
- Dense, HUD-like: padding 8-16px, gaps 4-8px

### Animation
- Fast: `transition: all 0.15s ease-out`
- Glitch: rapidly changing `clip-path` and slight translates over 2-5s
- Flicker: `animation: flicker 0.15s infinite` — small opacity variations
- Chromatic aberration: pseudo-elements offset by 1-2px in different neon colors with `mix-blend-mode: screen`

### Interactive States
- Hover: glow intensifies, `background: rgba(0, 240, 255, 0.1)`, border brightens
- Active: glitch animation triggers, flash of inverted colors
- Focus: `outline: 1px solid #00F0FF; outline-offset: 2px`
- Disabled: `filter: grayscale(80%); opacity: 0.3`

### Special Effects
- Scanlines overlay (as above, with `pointer-events: none`)
- CRT flicker: `@keyframes flicker { 0% { opacity: 0.97 } 50% { opacity: 1 } 100% { opacity: 0.98 } }`
- Noise: SVG `<feTurbulence>` filter at opacity 0.03-0.05
- Chromatic aberration on text: `::before` in cyan offset -2px, `::after` in magenta offset +2px, `mix-blend-mode: screen`

---

<a id="apple-hig"></a>
## 5. Apple Human Interface

**Essence:** Clarity, deference, depth. System-level polish with continuous corners, vibrancy, and spring physics.

### Essential Properties
- SF Pro font system (SF Pro Display ≥20pt, SF Pro Text <20pt) via `-apple-system`
- Continuous corners (squircle): `border-radius: 12-20px`
- Vibrancy: `backdrop-filter: blur(20px) saturate(180%)`
- Spring-based animation curves
- Semantic system colors that adapt to light/dark mode

### Anti-Patterns
- Hard corners, heavy borders, neon colors, monospace for UI text, flat design without depth

### Colors (Light / Dark)
- systemBlue: `#007AFF` / `#0A84FF`
- systemGreen: `#34C759` / `#30D158`
- systemRed: `#FF3B30` / `#FF453A`
- systemOrange: `#FF9500` / `#FF9F0A`
- systemYellow: `#FFCC00` / `#FFD60A`
- systemPurple: `#AF52DE` / `#BF5AF2`
- systemPink: `#FF2D55` / `#FF375F`
- Background primary: `#FFFFFF` / `#000000`
- Background secondary: `#F2F2F7` / `#1C1C1E`
- Gray scale (light): `#8E8E93`, `#AEAEB2`, `#C7C7CC`, `#D1D1D6`, `#E5E5EA`, `#F2F2F7`
- Gray scale (dark): `#8E8E93`, `#636366`, `#48484A`, `#3A3A3C`, `#2C2C2E`, `#1C1C1E`

### Typography
- Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif`
- Large Title: 34pt/400/41pt leading/0.37 tracking
- Title 1: 28pt/400/34pt/0.36
- Body: 17pt/400/22pt/-0.41
- Footnote: 13pt/400/18pt/-0.08
- Caption 1: 12pt/400/16pt/0

### Borders & Shapes
- Continuous corners: `border-radius: 12px` (buttons), `20px` (cards)
- Hairline separators: `border: 0.5px solid rgba(0,0,0,0.1)`

### Shadows
- Subtle: `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- Medium: `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`
- High (modals): `box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.08)`
- Always soft: large blur, low opacity

### Backgrounds
- Vibrancy: `backdrop-filter: blur(20px) saturate(180%); background: rgba(255,255,255,0.7)` (light) or `rgba(28,28,30,0.7)` (dark)
- Grouped: layered grays `#F2F2F7` → `#FFFFFF` → `#F2F2F7`

### Spacing
- 4pt base unit: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Touch targets: minimum 44×44pt
- Content margin: 16-20px from screen edge

### Animation
- Spring-based: `transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0)`
- Bouncy spring: `transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- Range: 250-500ms
- Transform and opacity only

### Interactive States
- Hover (macOS): `background: rgba(0, 0, 0, 0.04)`
- Active: `opacity: 0.7` or `transform: scale(0.97)` with spring-back
- Focus: `outline: 4px solid rgba(0, 122, 255, 0.6); outline-offset: 1px`
- Disabled: `opacity: 0.3`

### Form Elements
- Inputs: `background: #F2F2F7; border: none; border-radius: 10px; padding: 12px 16px; font-size: 17px`
- Buttons (filled): `background: #007AFF; color: #fff; border: none; border-radius: 12px; padding: 14px 20px; font-size: 17px; font-weight: 600`
- Toggle: 51×31pt, rounded-pill, green active (`#34C759`)

---

<a id="neumorphism"></a>
## 6. Neumorphism / Soft UI

**Essence:** Extruded from the background. Depth through dual-direction shadows on a uniform surface.

### Essential Properties
- Element background MUST match container background
- Dual box-shadow (dark bottom-right + light top-left): `box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)`
- Low-saturation, high-lightness base colors
- Generous border-radius: 12-20px

### Anti-Patterns
- High-contrast colors, hard borders, flat shadows, gradients on elements (breaks shadow illusion), tight spacing (shadows need room)

### Colors
- Light base: `#E0E5EC` (canonical), `#ECF0F3`, `#E4EBF5`
- Dark base: `#2D2D3A`, `#33333D`
- Accent: single muted color — `#6D5DFC` (soft purple) or `#4ECDC4` (soft teal)
- Text: `#5A5A6E` or `#44476A` (softer than black)
- HSL pattern: saturation 5-15%, lightness 85-92% (light) or 18-25% (dark)

### Typography
- Fonts: `Inter, Poppins, Nunito, Rubik, sans-serif` — soft, rounded
- Weights: 400 body, 500-600 headings (avoid heavy bold)
- Body: 14-16px, line-height 1.5-1.6

### Borders & Shapes
- Generally no borders — depth from shadows only
- `border-radius: 12px` to `20px`, `50px` for pills
- Occasional: `border: 1px solid rgba(255,255,255,0.1)`

### Shadows (THE DEFINING PROPERTY)
- **Raised:** `box-shadow: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)`
- **Pressed/inset:** `box-shadow: inset 9px 9px 16px rgba(163,177,198,0.6), inset -9px -9px 16px rgba(255,255,255,0.5)`
- **Formula:** dark shadow = base lightness -10-15%; light shadow = base lightness +10-15%; offset 5-15px; blur 1.5-2× offset
- **Dark mode:** `box-shadow: 5px 5px 10px rgba(0,0,0,0.5), -5px -5px 10px rgba(255,255,255,0.05)`

### Backgrounds
- Flat solid matching container: `background: #E0E5EC`
- No gradients on elements
- Subtle page gradient acceptable: `linear-gradient(145deg, #E0E5EC, #D1D9E6)`

### Spacing
- Generous: padding 20-32px, margins 24-40px between elements (shadows need room)

### Animation
- `transition: box-shadow 0.25s ease, transform 0.25s ease`
- 200-350ms, `ease` or `ease-in-out`
- Shadow transitions between raised and pressed

### Interactive States
- Hover: shadow grows (offset +2-3px, blur proportional), element "lifts"
- Active: outer shadows → inset shadows, `transform: scale(0.98)` optional
- Focus: `box-shadow: 0 0 0 3px rgba(109,93,252,0.3), ...existing shadows`
- Disabled: shadows flatten to near-zero, `opacity: 0.5`

### Form Elements
- Inputs (inset): `background: #E0E5EC; border: none; border-radius: 12px; padding: 12px 20px; box-shadow: inset 6px 6px 10px rgba(163,177,198,0.5), inset -6px -6px 10px rgba(255,255,255,0.5)`
- Buttons (raised): `background: #E0E5EC; border: none; border-radius: 16px; padding: 14px 28px; box-shadow: 8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)`

---

<a id="material-design-3"></a>
## 7. Material Design 3

**Essence:** Systematic, token-based, color-role-driven. Dynamic color from seed hues, state layers, and structured elevation.

### Essential Properties
- 29 color roles (primary, secondary, tertiary, error, surface + containers + on-colors)
- Tonal elevation: surface tint overlay (primary at low opacity) replaces pure shadow for depth
- State layers: semi-transparent overlays for hover (8%), focus (10%), pressed (10%), dragged (16%)
- Token-based spacing, shape, motion

### Anti-Patterns
- Arbitrary colors outside the tonal system, hard shadows without surface tint, decorative animations, inconsistent corner radius

### Colors (Baseline)
- Primary: `#6750A4` / On Primary: `#FFFFFF` / Primary Container: `#EADDFF`
- Secondary: `#625B71` / Tertiary: `#7D5260`
- Error: `#B3261E`
- Surface: `#FFFBFE` / On Surface: `#1C1B1F`
- Outline: `#79747E` / Surface Variant: `#E7E0EC`
- Dynamic color: HCT color space generates 13 tones per hue (0-100)

### Typography (Roboto)
- Display Large: 57px/400/64px/-0.25px
- Headline Large: 32px/400/40px/0
- Title Medium: 16px/500/24px/0.15px
- Body Large: 16px/400/24px/0.5px
- Label Large: 14px/500/20px/0.1px
- Body Small: 12px/400/16px/0.4px

### Shape Scale
- Extra Small: 4dp — chips
- Small: 8dp
- Medium: 12dp — cards
- Large: 16dp — FABs
- Extra Large: 28dp — dialogs
- Full: 9999dp — pills

### Shadows (Elevation)
- Level 1: `0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)`
- Level 2: `0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)`
- Level 3: `0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)`
- Level 4: `0 2px 3px 0 rgba(0,0,0,0.3), 0 6px 10px 4px rgba(0,0,0,0.15)`
- Level 5: `0 4px 4px 0 rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15)`
- Surface tint: primary color at 5% (L1), 8% (L2), 11% (L3), 12% (L4), 14% (L5)

### Spacing
- 4dp base, 8dp increment for layout
- Touch targets: 48×48dp minimum
- Horizontal padding: 16dp (mobile), 24dp (desktop)

### Animation
- Standard: `cubic-bezier(0.2, 0, 0, 1)`
- Emphasized Decelerate: `cubic-bezier(0.05, 0.7, 0.1, 1)`
- Emphasized Accelerate: `cubic-bezier(0.3, 0, 0.8, 0.15)`
- Short: 50-200ms (micro-interactions)
- Medium: 250-400ms (standard transitions)
- Long: 450-600ms (page transitions)

### State Layers
- Hover: 8% opacity of on-surface color — `rgba(28, 27, 31, 0.08)`
- Focus: 10% — `rgba(28, 27, 31, 0.10)`
- Pressed: 10% — `rgba(28, 27, 31, 0.10)`
- Dragged: 16% — `rgba(28, 27, 31, 0.16)`
- Disabled content: `opacity: 0.38`
- Disabled container: `opacity: 0.12`
- Ripple: circular expansion from touch point, 300ms

### Form Elements
- Outlined text field: `border: 1px solid #79747E; border-radius: 4px; padding: 16px; font-size: 16px` — focus: 2px primary border
- Filled text field: `background: #E7E0EC; border: none; border-bottom: 1px solid #79747E; border-radius: 4px 4px 0 0; padding: 16px` — focus: 2px primary bottom border
- Filled button: `background: #6750A4; color: #FFFFFF; border: none; border-radius: 20px; padding: 10px 24px; height: 40px; font-size: 14px; font-weight: 500`
- Outlined button: `background: transparent; border: 1px solid #79747E; border-radius: 20px; color: #6750A4; padding: 10px 24px; height: 40px`
