# Design Tokens — RETRO CONSOLE 2026

> Copy-paste ready CSS variables, Tailwind config, and TS constants.
> Companion: `design.md` (rationale), `3d-and-animation.md` (motion).

---

## 1. CSS Variables (globals.css)

Drop ke `src/app/globals.css` di `:root`:

```css
:root {
  /* ─── PALETTE (4 chrome + 4 derivatives) ─── */
  --red:        #E10600;
  --red-dim:    #8A0400;
  --white:      #F5F5F2;
  --white-dim:  #C8C8C4;
  --gray:       #2A2A2D;
  --gray-light: #4A4A4D;
  --gray-deep:  #1A1A1C;
  --black:      #0A0A0A;

  /* ─── SEMANTIC ─── */
  --bg:           var(--black);
  --bg-elevated:  var(--gray-deep);
  --bg-overlay:   var(--gray);
  --fg:           var(--white);
  --fg-dim:       var(--white-dim);
  --fg-muted:     var(--gray-light);
  --accent:       var(--red);
  --accent-dim:   var(--red-dim);
  --border:       var(--gray-light);
  --border-strong: var(--white);

  /* ─── GLOWS ─── */
  --glow-red:        0 0 6px var(--red), 0 0 12px var(--red-dim);
  --glow-red-strong: 0 0 8px var(--red), 0 0 16px var(--red), 0 0 32px var(--red-dim);
  --glow-white:      0 0 4px rgba(245, 245, 242, 0.6);

  /* ─── SHADOWS (chunky NES style) ─── */
  --shadow-1: 2px 2px 0 0 var(--black);
  --shadow-2: 4px 4px 0 0 var(--black);
  --shadow-3: 6px 6px 0 0 var(--black);
  --shadow-red: 4px 4px 0 0 var(--red);

  /* ─── TYPOGRAPHY ─── */
  --font-display: 'VT323', 'Press Start 2P', 'Pixelify Sans', monospace;
  --font-heading: 'Space Grotesk', 'Archivo', system-ui, sans-serif;
  --font-body:    'Inter', -apple-system, system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'IBM Plex Mono', monospace;

  /* ─── SPACING (4px base) ─── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-48: 192px;

  /* ─── EASING / DURATION ─── */
  --ease-linear:    linear;
  --ease-step:      steps(8, end);            /* sprite-like stepped motion */
  --ease-step-fast: steps(4, end);
  --ease-pixel:     cubic-bezier(0.36, 0, 0.66, -0.56);  /* snappy, slightly anticipatory */
  --ease-decel:     cubic-bezier(0, 0, 0.2, 1);
  --ease-accel:     cubic-bezier(0.4, 0, 1, 1);

  --duration-instant: 60ms;
  --duration-fast:    120ms;
  --duration-base:    200ms;
  --duration-slow:    400ms;
  --duration-stage:   800ms;     /* stage transition */

  /* ─── Z-INDEX ─── */
  --z-canvas-bg: 0;
  --z-content:   10;
  --z-hud:       50;
  --z-modal:     100;
  --z-crt:       9999;
}

/* ─── Light mode (opsional, MVP-later) ─── */
[data-theme='light'] {
  --bg:           #F5F5F2;
  --bg-elevated:  #E0E0DC;
  --bg-overlay:   #C8C8C4;
  --fg:           #0A0A0A;
  --fg-dim:       #2A2A2D;
  --fg-muted:     #4A4A4D;
  --border:       #2A2A2D;
  --border-strong: #0A0A0A;
}

/* ─── REDUCED MOTION GLOBAL OVERRIDE ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ─── BASE RESET ADDITIONS ─── */
html {
  background: var(--bg);
  color: var(--fg);
}

body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: var(--font-display);
  -webkit-font-smoothing: subpixel-antialiased;  /* keep pixel crispness */
  font-smooth: never;
}

::selection {
  background: var(--red);
  color: var(--white);
}
```

---

## 2. Tailwind Config (tailwind.config.ts)

Adit pakai **Tailwind v4** (config via CSS `@theme` directive). Tambah ke `globals.css`:

```css
@theme {
  /* ─── Colors ─── */
  --color-red:        #E10600;
  --color-red-dim:    #8A0400;
  --color-white-bone: #F5F5F2;
  --color-white-dim:  #C8C8C4;
  --color-gray-1:     #2A2A2D;
  --color-gray-2:     #4A4A4D;
  --color-gray-deep:  #1A1A1C;
  --color-black-true: #0A0A0A;

  /* ─── Fonts ─── */
  --font-display: 'VT323', monospace;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* ─── Spacing (extend defaults, 4px base preserved) ─── */
  /* tailwind v4 already uses 4px base — no override needed */

  /* ─── Custom radii (mostly 0) ─── */
  --radius-none: 0;
  --radius-pixel: 2px;          /* tiny step radius if needed */
  --radius-led: 9999px;          /* only for LED dots */

  /* ─── Animation timings ─── */
  --animate-duration-instant: 60ms;
  --animate-duration-fast:    120ms;
  --animate-duration-base:    200ms;

  /* ─── Custom shadows ─── */
  --shadow-chunky-1: 2px 2px 0 0 #0A0A0A;
  --shadow-chunky-2: 4px 4px 0 0 #0A0A0A;
  --shadow-chunky-3: 6px 6px 0 0 #0A0A0A;
  --shadow-chunky-red: 4px 4px 0 0 #E10600;
}
```

Usage di JSX:

```jsx
<button className="bg-gray-deep border-2 border-white-bone text-white-bone shadow-chunky-red">
  PRESS START
</button>
```

---

## 3. TypeScript Constants

`src/lib/design-tokens.ts`:

```ts
export const COLORS = {
  red:       '#E10600',
  redDim:    '#8A0400',
  white:     '#F5F5F2',
  whiteDim:  '#C8C8C4',
  gray:      '#2A2A2D',
  grayLight: '#4A4A4D',
  grayDeep:  '#1A1A1C',
  black:     '#0A0A0A',
} as const;

export const TYPE = {
  display: 'var(--font-display)',
  heading: 'var(--font-heading)',
  body:    'var(--font-body)',
  mono:    'var(--font-mono)',
} as const;

export const SPACE = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24,
  8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
  32: 128, 48: 192,
} as const;

export const DURATION = {
  instant: 60,
  fast:    120,
  base:    200,
  slow:    400,
  stage:   800,
} as const;

export const EASE = {
  step:     'steps(8, end)',
  stepFast: 'steps(4, end)',
  pixel:    [0.36, 0, 0.66, -0.56] as const,
  decel:    [0, 0, 0.2, 1] as const,
  accel:    [0.4, 0, 1, 1] as const,
} as const;

export const Z = {
  canvasBg: 0,
  content:  10,
  hud:      50,
  modal:    100,
  crt:      9999,
} as const;

/** Pre-baked common style props for use with motion / inline */
export const STYLE_TOKENS = {
  ledPulse: {
    boxShadow: `0 0 6px ${COLORS.red}, 0 0 12px ${COLORS.redDim}`,
  },
  bracketBorder: {
    border: `2px solid ${COLORS.white}`,
  },
  chunkyButtonShadow: `4px 4px 0 0 ${COLORS.red}`,
} as const;
```

---

## 4. Type Scale Reference Table

| Class name (proposed) | font-size | line-height | font-family | weight | tracking | uppercase |
|----------------------|-----------|-------------|-------------|--------|----------|-----------|
| `.t-title-xl` | clamp(72px, 14vw, 192px) | 1.0 | display | 400 | 0 | yes |
| `.t-title-l`  | clamp(48px, 9vw, 96px) | 1.0 | display | 400 | 0 | yes |
| `.t-heading-l` | clamp(28px, 4vw, 40px) | 1.1 | heading | 700 | 0.02em | yes |
| `.t-heading-m` | 18-20px | 1.2 | heading | 700 | 0.04em | yes |
| `.t-heading-s` | 14px | 1.2 | heading | 700 | 0.08em | yes |
| `.t-body-l` | 16-18px | 1.5 | body | 400 | 0 | no |
| `.t-body-m` | 14px | 1.5 | body | 400 | 0 | no |
| `.t-body-s` | 13px | 1.45 | body | 400 | 0 | no |
| `.t-hud` | 12px | 1.3 | mono | 600 | 0.1em | yes |
| `.t-hud-xs` | 10px | 1.2 | mono | 700 | 0.16em | yes |

CSS implementation di `globals.css`:

```css
.t-title-xl  { font: 400 clamp(72px,14vw,192px)/1.0 var(--font-display); text-transform: uppercase; }
.t-title-l   { font: 400 clamp(48px, 9vw, 96px)/1.0 var(--font-display); text-transform: uppercase; }
.t-heading-l { font: 700 clamp(28px, 4vw, 40px)/1.1 var(--font-heading); letter-spacing: 0.02em; text-transform: uppercase; }
.t-heading-m { font: 700 20px/1.2 var(--font-heading); letter-spacing: 0.04em; text-transform: uppercase; }
.t-heading-s { font: 700 14px/1.2 var(--font-heading); letter-spacing: 0.08em; text-transform: uppercase; }
.t-body-l    { font: 400 17px/1.5 var(--font-body); }
.t-body-m    { font: 400 14px/1.5 var(--font-body); }
.t-body-s    { font: 400 13px/1.45 var(--font-body); }
.t-hud       { font: 600 12px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; }
.t-hud-xs    { font: 700 10px/1.2 var(--font-mono); letter-spacing: 0.16em; text-transform: uppercase; }
```

---

## 5. Migration Map (lama → baru)

Untuk find-replace systematic:

| Old token / class | New token / class |
|-------------------|-------------------|
| `bg-zinc-950` (page bg) | `bg-black-true` |
| `bg-zinc-900` (card bg) | `bg-gray-deep` |
| `bg-zinc-800` (nested) | `bg-gray-1` |
| `bg-purple-500` | DELETE — not allowed |
| `bg-blue-500` | DELETE — not allowed |
| `bg-pink-500` | DELETE — not allowed |
| `bg-orange-500` | DELETE — not allowed |
| `bg-amber-500` (old accent) | `bg-red` |
| `text-zinc-100` | `text-white-bone` |
| `text-zinc-400` | `text-white-dim` |
| `text-zinc-500` | `text-gray-2` |
| `text-amber-*` | `text-red` |
| `border-zinc-800` | `border-gray-2` |
| `border-amber-*` | `border-red` |
| `font-syne` (custom) | `font-display` (VT323) |
| `font-mono` (existing) | keep |
| `rounded-xl` / `rounded-2xl` | `rounded-none` (default) |
| `rounded-full` (LED only) | keep on LED dots |
| Vinyl gradient `from-blue-600 to-cyan-500` | DELETE — vinyl removed |
| Section divider `<SectionDivider />` | replace with `<LoadingBar />` |

**Bulk find-replace candidates** (run setelah tokens terinstall):

```bash
# In project root
rg -l 'amber-500' src/ | xargs sed -i '' 's/amber-500/red/g'
rg -l 'purple-500' src/ | xargs sed -i '' 's/bg-purple-500/bg-red/g'
# (manual review per file untuk sure intent)
```

---

## 6. Asset Inventory

| Asset path | Type | Purpose | Status |
|------------|------|---------|--------|
| `public/fonts/vt323.woff2` | font | Display pixel | Use Google Fonts via `next/font` instead |
| `public/cursor-arrow.svg` | svg | Custom cursor (optional) | TBD pending Adit choice |
| `public/cursor-pointer.svg` | svg | Custom cursor pointer | TBD |
| `public/icons/cartridge.svg` | svg | Custom icon | NEW |
| `public/icons/dpad.svg` | svg | Custom icon | NEW |
| `public/icons/buttons-abxy.svg` | svg | Controller buttons | NEW |
| `public/icons/coin.svg` | svg | Insert coin | NEW |
| `public/icons/save-crystal.svg` | svg | Save point silhouette | NEW |
| `public/sfx/blip.wav` | audio | Hover sound (≤ 200ms) | OPTIONAL |
| `public/sfx/confirm.wav` | audio | Click sound | OPTIONAL |
| `public/3d/mascot.glb` | 3d | Hero character | TBD pending Adit choice |
| `public/3d/cartridge.glb` | 3d | Project cartridge | NEW |
| `public/3d/save-crystal.glb` | 3d | Save crystal octahedron | inline geometry |

3D model details: `3d-and-animation.md` §6.

---

## 7. Font Loading (next/font)

`src/app/layout.tsx`:

```ts
import { VT323, Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

const display = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const heading = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

// In return:
<html lang="en" className={`${display.variable} ${heading.variable} ${body.variable} ${mono.variable}`}>
```

VT323 is ~30 KB woff2 — affordable. Inter sudah ada; Space Grotesk ~20 KB; JetBrains Mono ~25 KB. Total ~75 KB fonts (gzipped, all subsets latin only).

---

## 8. Quick-Reference Cheatsheet

```
COLORS (4 chrome):
  RED   #E10600   active, hover, brand, danger
  WHITE #F5F5F2   primary text
  GRAY  #2A2A2D   surface, plastic
  BLACK #0A0A0A   page bg

CONSTRAINTS:
  ❌ NO blue / green / purple / amber / cyan
  ❌ NO border-radius (except LED dots)
  ❌ NO box-shadow with blur (use offset only)
  ❌ NO smooth easing (use steps() or pixel cubic)

SPACING base 4px. snap.

TYPE:
  display = VT323 (≥ 32px only)
  heading = Space Grotesk uppercase
  body    = Inter
  mono    = JetBrains Mono (HUD)

ANIMATION:
  prefer steps() easing
  prefer transform / opacity (no width/height/top)
  vertex jitter on 3D (PS1-style)
  CRT scanlines fixed overlay
```

---

> Tokens ready. Implementation order: drop CSS vars first, swap fonts, then refactor section by section.
