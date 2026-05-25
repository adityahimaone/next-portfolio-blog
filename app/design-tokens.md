# Studio Tape Design System

## Overview

Studio Tape is a warm, analog-inspired design system designed for Option 1 Studio. It draws from vintage tape recording equipment, earthy textures, and studio aesthetics while maintaining modern accessibility standards.

The palette centers on a deep warm charcoal (`#1A1614`) foundation with ochre accents, mossy greens, and terracotta warmth — evoking the feeling of an old recording studio bathed in amber monitoring lights.

---

## 1. Color System

All colors are defined using **OKLCH** format, which provides:
- Perceptually uniform lightness
- Better interpolation for gradients and transitions
- Consistent saturation across hues

### Raw Palette

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| `--color-charcoal` | `#1A1614` | `oklch(0.12 0.015 35)` | Primary background |
| `--color-surface` | `#2B2520` | `oklch(0.17 0.02 30)` | Elevated surfaces, cards |
| `--color-ochre` | `#D4A84B` | `oklch(0.72 0.12 75)` | Primary accent, interactive |
| `--color-slate` | `#6B6B6B` | `oklch(0.48 0 0)` | Secondary text, muted elements |
| `--color-moss` | `#5E6D4B` | `oklch(0.47 0.06 125)` | Secondary accent, nature tones |
| `--color-highlight` | `#F5E6CC` | `oklch(0.92 0.05 80)` | Primary text, highlights |
| `--color-terracotta` | `#B84A39` | `oklch(0.52 0.12 35)` | Error states, warm accent |

### Semantic Mapping

```css
--color-bg-primary:           var(--color-charcoal);
--color-bg-secondary:         var(--color-surface);
--color-text-primary:         var(--color-highlight);
--color-text-secondary:       var(--color-slate);
--color-accent-primary:       var(--color-ochre);
--color-accent-secondary:     var(--color-moss);
--color-accent-tertiary:      var(--color-terracotta);
--color-interactive-default:  var(--color-ochre);
--color-interactive-hover:    oklch(0.78 0.13 75);
--color-interactive-active:   oklch(0.65 0.11 75);
--color-border-subtle:        oklch(0.25 0.02 30);
--color-border-default:       oklch(0.30 0.03 30);
--color-border-strong:        oklch(0.40 0.04 30);
```

- **Surfaces** step up from charcoal through surface in 0.03-0.05 lightness increments.
- **Text** uses highlight for primary and progressively darker slates for lower hierarchy.
- **Borders** scale with surface lightness to maintain contrast.
- **Interactives** brighten on hover, darken on active, gutter to disabled.

### Accessibility Notes

All text/background pairs exceed WCAG 2.1 AA contrast ratios:
- `charcoal` bg + `highlight` text: ~16:1
- `surface` bg + `highlight` text: ~13:1
- `charcoal` bg + `slate` text: ~7:1 (OK for body text at 18px+)

---

## 2. Font Definitions

### Space Grotesk (Display & Body)

- **CSS family**: `--font-display`, `--font-body`
- **Usage**: Headings, body text, navigation, UI elements
- **Weights available**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Character**: Modern geometric sans-serif with warm, approachable curves
- **Fallback chain**: `system-ui, -apple-system, sans-serif`

### JetBrains Mono (Monospace)

- **CSS family**: `--font-mono`
- **Usage**: Code blocks, technical content, data, timestamps
- **Weights available**: 400 (Regular), 700 (Bold)
- **Character**: Developer-friendly monospace with ligatures and clear glyph differentiation
- **Fallback chain**: `'Fira Code', 'Courier New', monospace`

### EB Garamond (Serif)

- **CSS family**: `--font-serif`
- **Usage**: Long-form articles, quotations, elegant headers, pull quotes
- **Weights available**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Character**: Classic old-style serif with high readability and timeless elegance
- **Fallback chain**: `Georgia, 'Times New Roman', serif`

---

## 3. Typography Scale

Mobile-first scale using a 1.25 ratio (major third). Text sizes are fluid: they grow at `md` and `lg` breakpoints for readability on larger screens.

### Heading Scale

| Level | Mobile | Tablet (768px+) | Desktop (1024px+) | Weight | Family |
|-------|--------|----------------|-------------------|--------|--------|
| **h1** | 2.25rem / 36px | 3.75rem / 60px | 4.5rem / 72px | 700 | Space Grotesk |
| **h2** | 1.875rem / 30px | 3rem / 48px | 3.75rem / 60px | 700 | Space Grotesk |
| **h3** | 1.5rem / 24px | 1.875rem / 30px | 1.875rem / 30px | 600 | Space Grotesk |
| **h4** | 1.25rem / 20px | 1.5rem / 24px | 1.5rem / 24px | 600 | Space Grotesk |
| **h5** | 1.125rem / 18px | 1.125rem / 18px | 1.125rem / 18px | 500 | Space Grotesk |
| **h6** | 1rem / 16px | 1rem / 16px | 1rem / 16px | 500 | Space Grotesk |

### Body Scale

| Type | Size | Line Height | Weight | Family |
|------|------|------------|--------|--------|
| Body | 1rem / 16px | 1.625 | 400 | Space Grotesk |
| Body Large | 1.125rem / 18px → 1.25rem | 1.625 | 400 | Space Grotesk |
| Body Small | 0.875rem / 14px | 1.5 | 400 | Space Grotesk |
| Mono | 0.875rem / 14px | 1.5 | 400 | JetBrains Mono |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--letter-spacing-tighter` | `-0.05em` | Large display headlines |
| `--letter-spacing-tight` | `-0.025em` | Headings h1-h3 |
| `--letter-spacing-normal` | `0` | Body, most text |
| `--letter-spacing-wide` | `0.025em` | Small caps, labels |
| `--letter-spacing-wider` | `0.05em` | Uppercase headers |
| `--letter-spacing-widest` | `0.1em` | Mono data, all-caps badges |

---

## 4. Spacing System

Based on an **8px base grid** with half-step granularity for fine-tuning.

### Space Tokens

| Token | Rem | PX | Context |
|-------|-----|-----|---------|
| `--space-0` | 0 | 0 | None |
| `--space-0-5` | 0.125rem | 2px | Inner padding, borders |
| `--space-1` | 0.25rem | 4px | Tight spacing, icon gaps |
| `--space-2` | 0.5rem | 8px | Component padding (sm) |
| `--space-3` | 0.75rem | 12px | Button padding, chip spacing |
| `--space-4` | 1rem | 16px | Card padding, section gap |
| `--space-6` | 1.5rem | 24px | Section margin, form groups |
| `--space-8` | 2rem | 32px | Section padding (mobile) |
| `--space-12` | 3rem | 48px | Section padding (desktop) |
| `--space-16` | 4rem | 64px | Large section separators |
| `--space-24` | 6rem | 96px | Page section gaps |
| `--space-32` | 8rem | 128px | Hero section padding |
| `--space-40` | 10rem | 160px | Page gutter (desktop) |
| `--space-64` | 16rem | 256px | Max content width offset |

### Spacing Patterns

```css
/* Card */
.card {
  padding: var(--space-4);
  gap: var(--space-3);
}

/* Section */
.section {
  padding-block: var(--space-12);
}

/* Stack (vertical rhythm) */
.stack > * + * {
  margin-block-start: var(--space-4);
}

/* Inline cluster */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```

---

## 5. Motion System

Inspired by analog tape mechanics — smooth acceleration/deceleration, tape reel tension, and subtle vinyl wobble.

### Easing Curves

| Token | Cubic Bezier | Character |
|-------|-------------|-----------|
| `--ease-linear` | `linear` | Mechanical, constant |
| `--ease-in` | `(0.4, 0, 1, 1)` | Slow start, fast end |
| `--ease-out` | `(0, 0, 0.2, 1)` | Fast start, graceful stop |
| `--ease-in-out` | `(0.4, 0, 0.2, 1)` | Standard UI motion |
| `--ease-tape` | `(0.34, 1.56, 0.64, 1)` | Tape reel start — slight overshoot |
| `--ease-vinyl` | `(0.68, -0.55, 0.265, 1.55)` | Vinyl wobble — springy, playful |
| `--ease-smooth` | `(0.25, 0.46, 0.45, 0.94)` | Softer deceleration for reveals |
| `--ease-bounce` | `(0.68, -0.6, 0.32, 1.6)` | Playful bounce for micro-interactions |

### Duration Tokens

| Token | Time | Usage |
|-------|------|-------|
| `--duration-instant` | 0ms | State changes without animation |
| `--duration-fast` | 150ms | Hover states, micro-interactions |
| `--duration-normal` | 250ms | Standard transitions, toggles |
| `--duration-slow` | 350ms | Panel slides, modal entrances |
| `--duration-slower` | 500ms | Page transitions, route changes |
| `--duration-slowest` | 750ms | Hero animations, loading reveals |

### Combined Transition Shorthands

```css
--transition-fast:   150ms ease-out;
--transition-normal: 250ms ease-in-out;
--transition-slow:   350ms ease-smooth;
--transition-tape:   250ms ease-tape;
--transition-vinyl:  350ms ease-vinyl;
```

### Recommended Motion Usage

| Interaction | Transition | Rationale |
|-------------|-----------|-----------|
| Button hover | `fast` `ease-out` | Instant feedback, graceful exit |
| Card hover | `normal` `ease-out` | Noticeable but not distracting |
| Modal open | `slow` `ease-tape` | Tape-reel entrance feel |
| Page transition | `slower` `ease-smooth` | Calm, deliberate pacing |
| Micro-interaction | `fast` `ease-bounce` | Playful accent on icons |
| Toggle switch | `normal` `ease-vinyl` | Analog switch feel |
| Loading state | `slowest` `ease-smooth` | Patient, relaxed waiting |

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp edges, vintage UI |
| `--radius-sm` | 2px | Input fields, small elements |
| `--radius-base` | 4px | Buttons, cards (default) |
| `--radius-md` | 6px | Modals, dropdowns |
| `--radius-lg` | 8px | Larger cards, panels |
| `--radius-xl` | 12px | Feature cards |
| `--radius-2xl` | 16px | Floating action buttons |
| `--radius-3xl` | 24px | Large banners |
| `--radius-full` | 9999px | Pills, avatars, badges |

---

## 7. Shadows

All shadows use the charcoal color (`oklch(0.12 0.015 35)`) with varying alpha for consistent ambient occlusion across the dark theme.

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Subtle element separation |
| `--shadow-sm` | Cards, small panels |
| `--shadow-base` | Elevated cards, dropdowns |
| `--shadow-md` | Modals, dialogs |
| `--shadow-lg` | Navigation, sidebar |
| `--shadow-xl` | Hero sections, overlays |
| `--shadow-glow-ochre` | Interactive buttons (hover) |
| `--shadow-glow-moss` | Success feedback |
| `--shadow-glow-terracotta` | Error/warning emphasis |

---

## 8. Z-Index Scale

```css
--z-base:           0      /* Content */
--z-dropdown:       1000   /* Dropdown menus */
--z-sticky:         1100   /* Sticky headers */
--z-fixed:          1200   /* Fixed navbar */
--z-modal-backdrop: 1300   /* Modal backdrop */
--z-modal:          1400   /* Modal dialogs */
--z-popover:        1500   /* Popovers, tooltips */
--z-tooltip:        1600   /* Tooltips (highest normal) */
--z-toast:          1700   /* Toast notifications */
--z-max:            9999   /* Emergency overlays */
```

---

## 9. Usage Guide

### CSS Import

```css
/* In globals.css */
@import './design-tokens.css' layer(base);
```

### Using in Components

```css
.my-card {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  padding: var(--space-4);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  transition: transform var(--transition-fast),
              box-shadow var(--transition-normal);
}

.my-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.my-heading {
  font-family: var(--h1-font-family);
  font-size: var(--h1-font-size);
  font-weight: var(--h1-font-weight);
  line-height: var(--h1-line-height);
  letter-spacing: var(--h1-letter-spacing);
}
```

### Tailwind v4 Integration (Future)

For Tailwind v4, these tokens can be registered via the `@theme` directive:

```css
@theme {
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-serif: 'EB Garamond', Georgia, serif;
  
  --color-charcoal: oklch(0.12 0.015 35);
  --color-surface: oklch(0.17 0.02 30);
  --color-ochre: oklch(0.72 0.12 75);
  --color-slate: oklch(0.48 0 0);
  --color-moss: oklch(0.47 0.06 125);
  --color-highlight: oklch(0.92 0.05 80);
  --color-terracotta: oklch(0.52 0.12 35);
  
  --ease-tape: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-vinyl: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 10. Dark Mode / Single Theme

Studio Tape is designed as a **single dark theme** — the charcoal base with ochre highlights creates a moody, warm atmosphere reminiscent of a recording studio at night. No light mode is provided by default, as the palette is intentionally dark and ambient.

If a light mode is needed in the future, invert using:
- Background: `oklch(0.92 0.05 80)` (highlight → warm cream)
- Surface: `oklch(0.85 0.03 70)` (lighter cream)
- Text: `oklch(0.12 0.015 35)` (charcoal)
- Accents: same ochre/moss/terracotta

---

## File Structure

```
app/
├── globals.css           # Main CSS file (imports design tokens)
├── design-tokens.css     # ← This file: all design tokens
└── design-tokens.md      # ← This file: documentation
```
