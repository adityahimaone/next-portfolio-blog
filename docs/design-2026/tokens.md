# Design Tokens 2026

> Single source of truth for design values. Copy-paste ready.
> Used by: `globals.css`, Tailwind config, component implementations.

---

## 1. Naming Convention

```
--<category>-<scale|variant>-[modifier]

Examples:
--surface-0           (page bg)
--surface-1           (card bg)
--surface-2-light     (light mode variant)
--text-primary
--accent
--accent-glow
--led-rec
--space-4
--font-display
--ease-default
--duration-base
```

## 2. Color Tokens

### 2.1 Surfaces (dark mode primary)

```css
:root {
  --surface-0: #0A0A0B;        /* page bg, near-black warm */
  --surface-1: #131316;        /* card bg */
  --surface-2: #1C1C20;        /* nested card / modal */
  --surface-3: #26262C;        /* hover state */
}

[data-theme='light'] {
  --surface-0: #FAFAF8;        /* paper white, warm tint */
  --surface-1: #F2F2F0;
  --surface-2: #E8E8E5;
  --surface-3: #DEDEDB;
}
```

### 2.2 Borders

```css
:root {
  --border: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-emphasis: rgba(255, 255, 255, 0.20);
}

[data-theme='light'] {
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.16);
  --border-emphasis: rgba(0, 0, 0, 0.24);
}
```

### 2.3 Text

```css
:root {
  --text-primary: #EDEDED;
  --text-secondary: #A8A8AC;
  --text-muted: #6E6E73;
  --text-disabled: #4A4A4F;
}

[data-theme='light'] {
  --text-primary: #18181B;
  --text-secondary: #52525B;
  --text-muted: #A1A1AA;
  --text-disabled: #D4D4D8;
}
```

### 2.4 Accent (Single)

```css
:root {
  --accent: #FF6B35;                                     /* amber */
  --accent-strong: #FF8F5C;                              /* hover */
  --accent-bg-soft: rgba(255, 107, 53, 0.08);            /* tinted bg */
  --accent-bg-mid: rgba(255, 107, 53, 0.16);             /* active bg */
  --accent-glow: 0 0 12px rgba(255, 107, 53, 0.4);       /* default glow */
  --accent-glow-strong: 0 0 24px rgba(255, 107, 53, 0.6); /* emphasis glow */
}
```

> Note: amber works equally well in light and dark mode. No light-mode override needed.

### 2.5 Signal Lights (Sparingly)

```css
:root {
  --led-rec: #FF3B30;        /* red — recording, error */
  --led-play: #34C759;       /* green — playing, ok */
  --led-mute: #007AFF;       /* blue — mute, info */
  --led-solo: #FFCC00;       /* yellow — solo, warning */
}
```

> Light mode same — these are signal indicators, contrast already strong.

---

## 3. Typography Tokens

### 3.1 Font Families

```css
:root {
  --font-display: 'Crimson Pro Variable', 'Crimson Pro', 'PP Editorial New', 'Migra', Georgia, serif;
  --font-body: 'Inter Variable', 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
}
```

### 3.2 Font Sizes (fluid)

```css
:root {
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-md: 16px;
  --text-lg: clamp(18px, 1.5vw, 22px);
  --text-xl: clamp(20px, 2vw, 28px);
  --text-2xl: clamp(24px, 3vw, 36px);
  --text-3xl: clamp(28px, 5vw, 48px);
  --display-md: clamp(36px, 8vw, 84px);
  --display-lg: clamp(56px, 12vw, 144px);
}
```

### 3.3 Line Heights

```css
:root {
  --leading-tight: 1.05;
  --leading-snug: 1.2;
  --leading-base: 1.5;
  --leading-relaxed: 1.7;
}
```

### 3.4 Tracking

```css
:root {
  --tracking-tight: -0.04em;     /* display */
  --tracking-snug: -0.02em;      /* card title */
  --tracking-normal: 0;
  --tracking-wide: 0.04em;
  --tracking-mono: 0.16em;       /* uppercase mono labels */
  --tracking-mono-wide: 0.24em;  /* tiny status */
}
```

### 3.5 Font Weights

```css
:root {
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 900;
}
```

---

## 4. Spacing Tokens

8pt baseline:

```css
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-2-5: 10px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;
}
```

### 4.1 Section Rhythm

```css
:root {
  --section-py-mobile: var(--space-16);     /* 64px */
  --section-py-tablet: var(--space-24);     /* 96px */
  --section-py-desktop: var(--space-32);    /* 128px */
  
  --container-max: 1280px;
  --container-px-mobile: var(--space-4);    /* 16px */
  --container-px-tablet: var(--space-6);    /* 24px */
  --container-px-desktop: var(--space-8);   /* 32px */
}
```

---

## 5. Radii

```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-base: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-full: 9999px;
}
```

---

## 6. Shadows

```css
:root {
  /* Standard elevation */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.10), 0 8px 10px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  /* Inner shadows (rack/console depth) */
  --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-inset-strong: inset 0 2px 6px rgba(0, 0, 0, 0.20);
  
  /* Hardware glow (LED-style) */
  --glow-rec: 0 0 8px rgba(255, 59, 48, 0.6);
  --glow-play: 0 0 8px rgba(52, 199, 89, 0.6);
  --glow-amber: 0 0 8px rgba(255, 107, 53, 0.6);
}
```

---

## 7. Motion

### 7.1 Easing

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-decel: cubic-bezier(0, 0, 0.2, 1);
  --ease-accel: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 7.2 Duration

```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --duration-storytelling: 800ms;
  --duration-cinematic: 1200ms;
}
```

---

## 8. Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-elevated: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 50;
  --z-modal-backdrop: 49;
  --z-toast: 60;
  --z-tooltip: 70;
  --z-popover: 80;
  --z-cursor: 9999;
}
```

---

## 9. Breakpoints (reference, Tailwind defaults)

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 10. Tailwind v4 Theme Integration

Tailwind v4 (which this project uses) supports inline theme via `@theme`. Add to `globals.css`:

```css
@import 'tailwindcss';

@theme {
  /* Colors */
  --color-surface-0: var(--surface-0);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  
  --color-accent: var(--accent);
  --color-accent-strong: var(--accent-strong);
  
  --color-led-rec: var(--led-rec);
  --color-led-play: var(--led-play);
  --color-led-mute: var(--led-mute);
  --color-led-solo: var(--led-solo);
  
  /* Fonts */
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
  
  /* Custom radii */
  --radius-rack: 12px;
  --radius-pad: 8px;
  
  /* Custom shadows for hardware aesthetic */
  --shadow-rack: 0 4px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  --shadow-pad-pressed: inset 0 4px 8px rgba(0, 0, 0, 0.4);
}
```

This gives you Tailwind utilities like:
- `bg-surface-1`
- `text-accent`
- `font-display`
- `shadow-rack`

---

## 11. Component Token Mapping

### 11.1 Button

```css
.btn-primary {
  background: var(--accent);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font: var(--weight-semibold) var(--text-base) / var(--leading-snug) var(--font-body);
  transition: all var(--duration-fast) var(--ease-default);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--accent-strong);
  box-shadow: var(--shadow-lg), var(--accent-glow);
}
```

### 11.2 Card

```css
.card-rack {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-rack);
  padding: var(--space-5);
  box-shadow: var(--shadow-rack);
}
```

### 11.3 Eyebrow Label

```css
.eyebrow {
  font: var(--weight-semibold) var(--text-xs) / var(--leading-snug) var(--font-mono);
  letter-spacing: var(--tracking-mono);
  text-transform: uppercase;
  color: var(--text-secondary);
}
```

### 11.4 Status Indicator

```css
.indicator-led {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.indicator-led--rec {
  background: var(--led-rec);
  box-shadow: var(--glow-rec);
  animation: pulse-rec 1s ease-in-out infinite;
}

.indicator-led--play {
  background: var(--led-play);
  box-shadow: var(--glow-play);
}

@keyframes pulse-rec {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

---

## 12. Migration Reference (current → token)

Saat refactor, mapping ini:

### Color migration

```diff
- bg-zinc-50         →  bg-surface-1 (light) / bg-surface-1 (dark via variable)
- bg-zinc-100        →  bg-surface-2 (light)
- bg-zinc-200        →  bg-surface-3 (light)
- bg-white           →  bg-surface-0 (light) — page bg
- bg-zinc-800        →  bg-surface-2 (dark)
- bg-zinc-900        →  bg-surface-1 (dark)
- bg-zinc-950        →  bg-surface-0 (dark)

- text-zinc-100      →  text-primary (dark)
- text-zinc-300/400  →  text-secondary
- text-zinc-500      →  text-muted

- bg-purple-500/blue-500/pink-500/orange-500 (chrome)  →  bg-accent OR neutral
- bg-amber-500       →  bg-accent
- text-blue-500/green-500/purple-500 (chrome)          →  text-accent OR text-primary

- border-zinc-200    →  border (light) via CSS var
- border-zinc-700/800 →  border (dark)
```

### Font migration

```diff
- (default sans)            →  font-body
- Syne (display)            →  font-display
- font-mono (default)       →  font-mono
```

### Radius migration

```diff
- rounded-sm (2px)    →  rounded-sm (var(--radius-sm) = 4px)  ⚠ verify
- rounded (4px)       →  rounded-base (6px)
- rounded-md (6px)    →  rounded-md (8px)
- rounded-lg (8px)    →  rounded-lg (12px)
- rounded-xl (12px)   →  rounded-xl (16px)
- rounded-2xl (16px)  →  rounded-2xl (20px)
- rounded-3xl (24px)  →  rounded-3xl (24px) — same
- rounded-full        →  rounded-full
```

> ⚠ **Tailwind defaults differ from token values** — be careful, audit case-by-case.

---

## 13. Usage Cheat Sheet

### When to use what

| Need | Use |
|------|-----|
| Page background | `bg-surface-0` |
| Card background | `bg-surface-1` |
| Modal background | `bg-surface-2` |
| Body text | `text-primary` |
| Helper text | `text-secondary` |
| Disabled / placeholder | `text-muted` |
| Heading | `font-display` |
| Body / paragraph | `font-body` |
| Label / metadata | `font-mono` |
| Active state, focus | `bg-accent` or `text-accent` |
| Recording / error | `bg-led-rec` |
| Success / playing | `bg-led-play` |
| Mute / info | `bg-led-mute` |
| Solo / warning | `bg-led-solo` |
| Standard transition | `transition-all duration-base ease-default` |
| Hover scale | `hover:scale-[1.02]` |

---

## 14. Validation Rules

When reviewing a PR or component, ensure:

- [ ] No raw hex colors (use tokens)
- [ ] No raw rgba except for tokens defined here
- [ ] No `bg-purple-X / bg-pink-X / bg-blue-X` etc as decorative chrome (use accent)
- [ ] No raw font-family (use `font-display | font-body | font-mono`)
- [ ] No magic numbers for spacing (use space tokens)
- [ ] No magic numbers for animation duration (use duration tokens)
- [ ] All animations use easing tokens

---

## 15. Token Update Process

When adding new token:

1. Discuss in PR description (or update this doc directly + open PR)
2. Add to relevant section above
3. Update Tailwind theme integration if user-facing
4. Document migration path if replacing existing
5. Search codebase for usage that should adopt new token
