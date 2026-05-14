# Design — Visual Direction 2026

> Visual language, component patterns, dan rationale buat tiap design decision.
> Companion: `tokens.md` (raw values), `story-map.md` (narrative).

---

## 1. Theme Identity: "Studio Session — Refined"

### 1.1 The Mood

Bayangin lu masuk ke studio recording professional jam 11 malem. Lampu dim. Warna utama: gelap warm (bukan blue-tech-bro-gelap), dengan satu spot light amber dari analog console LED. Surface nya glossy tapi ga kayak plastik — kayak metal brushed atau acrylic premium.

**References (visual):**
- Splice marketing site (hero typography + signal flow)
- Ableton 12 launch microsite (clip color system)
- Native Instruments Komplete (rack chrome detail, signal lights)
- Teenage Engineering OP-1 product page (editorial photography + mono labels)

**Anti-references:**
- ❌ Cyberpunk neon (overdone, dating)
- ❌ Skeumorphic Logic Pro 2008 (current portfolio leans here too much)
- ❌ Glass morphism Apple-style (clash dengan hardware metaphor)

### 1.2 Why Single Accent

Sekarang portfolio pake 5+ accent (purple, pink, blue, amber, green) per section. Itu nyebar visual focus. Real audio gear cuma punya **1 dominant LED color** (amber/warm yellow) dengan rare colored signal indicator (red=record, green=peak warning, blue=phantom power).

Adopting that convention:
- 1 accent: **amber #FF6B35** untuk active state, playhead, current selection
- 4 signal lights (small, sparingly): rec / play / mute / solo
- Rest = grayscale (zinc neutral)

Hasil: **focus jadi clear**. User langsung tau di mana attention point per screen.

---

## 2. Color System

### 2.1 Surface Tokens

```
/* Dark mode (primary) */
--surface-0: #0A0A0B    /* page bg, near-black warm */
--surface-1: #131316    /* card bg */
--surface-2: #1C1C20    /* nested card / modal */
--surface-3: #26262C    /* hover state */

/* Light mode */
--surface-0-light: #FAFAF8    /* paper white, warm tint */
--surface-1-light: #F2F2F0
--surface-2-light: #E8E8E5
--surface-3-light: #DEDEDB

/* Borders */
--border: rgba(255, 255, 255, 0.06)
--border-strong: rgba(255, 255, 255, 0.12)
--border-light: rgba(0, 0, 0, 0.08)
--border-light-strong: rgba(0, 0, 0, 0.16)
```

### 2.2 Text Tokens

```
/* Dark mode */
--text-primary: #EDEDED
--text-secondary: #A8A8AC
--text-muted: #6E6E73

/* Light mode */
--text-primary-light: #18181B
--text-secondary-light: #52525B
--text-muted-light: #A1A1AA
```

### 2.3 Accent (Single)

```
--accent: #FF6B35              /* amber — primary active/playing state */
--accent-glow: 0 0 12px rgba(255, 107, 53, 0.4)
--accent-glow-strong: 0 0 24px rgba(255, 107, 53, 0.6)
--accent-bg-soft: rgba(255, 107, 53, 0.08)
--accent-bg-mid: rgba(255, 107, 53, 0.16)
```

### 2.4 Signal Lights (Sparingly)

Hanya boleh dipake buat indikator hardware (LED, status dot). Tidak buat decorative.

```
--led-rec: #FF3B30          /* red — recording, error */
--led-play: #34C759         /* green — playing, ok */
--led-mute: #007AFF         /* blue — mute, info */
--led-solo: #FFCC00         /* yellow — solo, warning */
```

### 2.5 Migration Map

Color migration dari sekarang → 2026 (buat Find & Replace ke depan):

| Sekarang | Pake-nya buat | Ganti jadi |
|----------|---------------|------------|
| `bg-purple-500` (Fast 8 exp) | section accent random | `bg-accent` (amber) jika "current/active", else neutral |
| `bg-blue-500` (80&Co exp) | section accent random | neutral grayscale, accent saat active |
| `bg-pink-500` (Unzypsoft) | section accent random | neutral grayscale |
| `bg-orange-500` (Vocational) | section accent random | neutral grayscale |
| `text-blue-400` (about clip 1) | clip color | neutral, accent saat active |
| `text-green-400` (stats) | clip color | `--led-play` cuma di status badge "OPERATIONAL" |
| `text-purple-500` (audio clip) | clip color | neutral |
| `from-blue-600 to-cyan-500` (project gradient) | vinyl sleeve color | KEEP — vinyl colors are intentional product art |
| `from-green-500 to-emerald-500` | vinyl sleeve color | KEEP |
| ... | ... | ... |

> **Catatan**: `vinylColor` di `PROJECTS_SHOWCASE` adalah intentional album art per project. Boleh tetap variatif — itu **content**, bukan **chrome**. Tapi UI chrome di sekitarnya harus neutral.

---

## 3. Typography

### 3.1 Font Stack

```
/* Display — headlines, hero */
--font-display: 'PP Editorial New', 'Migra', 'GT Sectra', Georgia, serif;
font-feature: italic light/regular weights, large optical size

/* Body */
--font-body: 'Inter Variable', 'Inter', -apple-system, system-ui, sans-serif;

/* Mono — meta, labels, code */
--font-mono: 'JetBrains Mono', 'IBM Plex Mono', 'Menlo', monospace;
```

**Rationale**:
- Editorial serif = elevation, "this person has taste". Pairs with hardware aesthetic (think Teenage Engineering manual).
- Inter = neutral readable workhorse for body
- JetBrains Mono = "rack label" feel for meta

**Current state**: lu pake `Syne` Google Font. Itu nice display font, bisa di-keep sebagai fallback atau diganti penuh ke Editorial New (paid via PP Type Foundry, atau pake free alternative `Sentient` dari Indian Type Foundry).

**Recommendation**: Mulai dengan free Sentient dari ITF Free, atau combo Crimson Pro + Inter (semua free Google Fonts) untuk safe MVP.

```ts
// Free safe MVP combo (next/font/google):
import { Crimson_Pro, Inter, JetBrains_Mono } from 'next/font/google'

const display = Crimson_Pro({ weight: ['400','500'], style: ['italic','normal'], subsets: ['latin'] })
const body = Inter({ subsets: ['latin'], variable: '--font-body' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

### 3.2 Hierarchy

| Style | Size | Font | Weight | Tracking | Use |
|-------|------|------|--------|----------|-----|
| Display XL | clamp(56px, 12vw, 144px) | display | 400 italic | -0.04em | Hero name |
| Display L | clamp(36px, 8vw, 84px) | display | 400 | -0.03em | Section heading |
| Display M | clamp(28px, 5vw, 48px) | display | 500 | -0.02em | Card title |
| Body L | clamp(16px, 1.4vw, 18px) | body | 400 | -0.01em | Paragraph hero subtitle |
| Body M | 14px | body | 400 | 0 | Paragraph |
| Body S | 12px | body | 400 | 0 | Caption |
| Meta | 11px | mono | 600 | 0.16em uppercase | Section label, rack tag |
| Meta XS | 9px | mono | 700 | 0.2em uppercase | Tiny status indicator |

### 3.3 Examples

```jsx
// Hero name
<h1 className="font-display text-[clamp(56px,12vw,144px)] italic font-normal -tracking-[0.04em]">
  Aditya
</h1>

// Section heading
<h2 className="font-display text-[clamp(36px,8vw,84px)] -tracking-[0.03em]">
  Featured Releases
</h2>

// Section meta label
<span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
  ◉ TRACKS
</span>
```

---

## 4. Spacing System

8pt baseline grid:

```
--space-0: 0
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
--space-40: 160px

/* Section vertical rhythm */
--section-py-mobile: 64px      /* py-16 */
--section-py-desktop: 128px    /* py-32 */
```

### 4.1 Section Spacing Audit

Sekarang section pake `py-24` (96px) konsisten — bagus. Yang harus di-fix:
- Hero `min-h-screen` keep
- Sub-section gap di About (clip detail modal): tighten dari `space-y-8` → `space-y-6` di nested grid

---

## 5. Motion / Animation Language

### 5.1 Easing Tokens

```
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)        /* general */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)        /* dramatic */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)     /* bouncy, sparingly */
--ease-decel: cubic-bezier(0, 0, 0.2, 1)              /* enter */
--ease-accel: cubic-bezier(0.4, 0, 1, 1)              /* exit */
```

### 5.2 Duration Tokens

```
--duration-instant: 100ms       /* hover state, tap feedback */
--duration-fast: 200ms          /* button transition, simple fade */
--duration-base: 300ms          /* most UI transition */
--duration-slow: 500ms          /* section reveal */
--duration-storytelling: 800ms  /* hero entrance */
```

### 5.3 Motion Patterns

#### Pattern A — Section Reveal (on scroll)
```jsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
>
```
Use buat: section heading, card grid item.

#### Pattern B — Tap Feedback
```jsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.1 }}
>
```
Use buat: button, pad, knob.

#### Pattern C — Active State Pulse
```css
@keyframes active-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 107, 53, 0.4); }
  50%      { box-shadow: 0 0 20px rgba(255, 107, 53, 0.6); }
}
.is-active { animation: active-pulse 2s ease-in-out infinite; }
```
Use buat: playing indicator, recording dot. **CSS-only** — jangan pake motion.

#### Pattern D — Marquee
CSS-only `@keyframes scroll`. Jangan pake motion's `animate.x` infinite — bikin GPU work tanpa henti.

### 5.4 Forbidden Animations
- ❌ Animating `width`, `height`, `top`, `left`, `box-shadow` (forces reflow/repaint)
- ❌ Infinite-loop motion components (use CSS keyframes)
- ❌ Animations during scroll yang ngambil > 16ms per frame

### 5.5 prefers-reduced-motion

Wajib global override (sekarang belum ada di `globals.css`):

```css
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

## 6. Component Pattern Library

### 6.1 Section Header

Standard pattern semua section pake ini:

```jsx
<header className="mb-12 md:mb-16 flex flex-col items-center text-center">
  {/* Eyebrow with icon */}
  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-700 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
    <Disc className="h-3.5 w-3.5" />
    TRACKS
  </span>
  
  {/* Display heading */}
  <h2 className="font-display text-[clamp(36px,8vw,84px)] italic font-normal -tracking-[0.03em] text-zinc-900 dark:text-white">
    Featured Releases
  </h2>
  
  {/* Optional subtitle */}
  <p className="mt-4 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
    Six records out. Pick one — I'll tell you what went into the mix.
  </p>
</header>
```

### 6.2 Rack Card (Surface 2)

```jsx
<div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  {/* Rack header (label + status light) */}
  <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
      MODULE.001
    </span>
    <div className="h-1.5 w-1.5 rounded-full bg-[--led-play]" />
  </header>
  
  {/* Body */}
  <div className="p-5">
    {/* content */}
  </div>
</div>
```

### 6.3 Status Pill

```jsx
<span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-green-700 dark:text-green-400">
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
  AVAILABLE
</span>
```

### 6.4 Active Indicator

For "currently selected" / "now playing":

```jsx
<motion.div
  layoutId="active-indicator"
  className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-[--accent]"
/>
```

Use Motion `layoutId` untuk smooth transition between selections (existing pattern lu udah pake di Experience — keep).

---

## 7. Section-Level Visual Direction

### 7.1 Hero — "Album Cover Drop"

**Layout**:
- Center-aligned, viewport height
- Top eyebrow: `LIVE SESSION · v2026.05` (mono, small)
- Center: nama besar (display italic)
- Below: subtitle (1 sentence specific)
- Below: hardware-style transport bar (existing, keep)
- Bottom: secondary CTA "Or jam with me →"
- Removed: "New Release" rotated stamp, floating notes

**Background**:
- Subtle dot pattern (existing) — keep but reduce opacity 50%
- Add: single radial gradient warm amber from bottom (subtle, like stage light)

**Mockup ASCII**:
```
┌──────────────────────────────────────────────┐
│             ◉ LIVE SESSION · v2026.05         │
│                                              │
│            [ Aditya ]                          │
│             himaone                            │
│                                              │
│  Frontend Engineer at Fast 8 — building       │
│  Bisadaya for thousands of jobseekers.        │
│                                              │
│  ┌─[▶]──[ NOW PLAYING: Edge of Desire ]──[⏭]─┐ │
│  └────────────────────────────────────────┘ │
│                                              │
│         scroll ↓        or jam with me →      │
└──────────────────────────────────────────────┘
```

### 7.2 About — "The Workflow" ❗DAW-PRESERVE

**Parent shell preserved**: timeline grid, tracks, clips, playhead, mute/solo, transport.

**Inner refactor**: 4 tracks → 3 tracks
- Track 1 IDENTITY (icon: User, color: neutral) — bio, signal flow timeline
- Track 2 NOW_PLAYING (icon: Activity, color: amber accent) — current company, current learning, Spotify integration
- Track 3 METRICS (icon: BarChart, color: neutral) — output history bars, stats

**Removed**: STACK track (duplicate of Skills section)

**Visual cleanup**:
- Remove fake VST knobs di modal header (keep just close button + LCD title)
- Reduce screw decorations dari 4 → 2 (top corners only)

### 7.3 Skills — "Sonic Arsenal"

**Layout preserved**: mixer console with faders + knobs.

**Additions**:
- Top of mixer: 3 preset chips `[FRONTEND] [BACKEND] [DESIGN]` — clicking animates fader/knob to predefined positions
- Below mixer: caption strip "Each fader = years of practice. Drag to remix the role."
- Mobile: horizontal scrollable mixer panel (overflow-x-auto)

**Visual updates**:
- Label "MIX-MASTER 2025" → "MIX-MASTER 2026"
- Section colors normalized to amber accent (no purple/pink/blue mixer corner lights — use signal LEDs only)

### 7.4 Experience — "Career Discography"

**Layout preserved**: tracklist + player detail.

**Additions per item**:
- `★ CURRENT` badge buat job dengan period "PRESENT"
- Duration in track meta: `Oct 2022 — Present · 3y 7m`
- Click company link icon (external) buka link

**Visual updates**:
- Section colors per track (purple/blue/pink/orange) → all neutral, accent amber when selected
- Spinning vinyl center color → uses accent amber instead of section color

### 7.5 Projects — "Featured Releases"

**Layout preserved**: vinyl sleeves grid.

**Additions**:
- Above grid: filter chips `All · Web3 · Corporate · Productivity · DeFi · Biotech` (derive from `genre` field)
- On each card: small metric badge ("10K visits", "Used by 3 enterprises") — read from new `metric` field
- Modal: dynamic tech stack from new `tech` array per project
- Modal: optional GitHub source link button (when `github` field exists)
- Header counter: "06 RELEASES"

**Visual updates**:
- Vinyl colors per project → KEEP variatif (intentional album art, not chrome)
- Album cover image area: add subtle vignette + grain overlay for "physical print" feel

### 7.6 Contact — "Launch Collaboration"

**Layout preserved**: launchpad + transport + functional pads.

**Additions**:
- Above grid: preset chips `[CHILL] [TRAP] [LOFI]` — surface presets data already in `presets.ts`
- Functional pads: subtle pulse animation default (CSS-only, low opacity)
- Mobile: functional pads span 2 cells (currently all 1×1)

**Visual updates**:
- Pad active glow → amber accent
- LED indicators: rec=red, playing=green, looping=amber

### 7.7 Footer

**Layout preserved**: brand + nav + tech + social.

**Additions**:
- Last commit badge: `Last shipped: 2 days ago · feat: redesign 2026` (from GitHub API)
- Mini Now Playing strip (single line at very bottom): `🎧 Currently spinning: Edge of Desire (Sunrise Mix)`

---

## 8. Section Transitions

Replace `<SectionDivider />` static dengan musical transitions. Keep `SectionDivider` component name, ganti implementation:

### 8.1 Variants

```tsx
type DividerVariant = 'cassette' | 'signal' | 'crossfade' | 'static'

<SectionDivider variant="signal" />     // signal flow line w/ moving dot
<SectionDivider variant="cassette" />    // cassette tape rewinding
<SectionDivider variant="crossfade" />   // crossfader sweep
<SectionDivider variant="static" />      // legacy fallback
```

### 8.2 Mapping

```
Hero      ──[signal]──    About
About     ──[crossfade]── Skills
Skills    ──[signal]──    Experience
Experience ──[cassette]── Projects
Projects  ──[crossfade]── Contact
```

### 8.3 Implementation Note

CSS-only animations dengan `prefers-reduced-motion` fallback ke static line. No motion library dependency for divider.

---

## 9. Iconography

Keep `lucide-react` (already in stack). Standardize sizes:

| Context | Size | Stroke |
|---------|------|--------|
| Inline body | 14px | 1.5 |
| Button | 16px | 1.75 |
| Eyebrow icon | 14px | 1.75 |
| Hero icon | 20-24px | 2 |
| Decorative large | 32-48px | 1.5 |

---

## 10. Imagery & Assets

### 10.1 Project Thumbnails
- Format: WebP/AVIF (convert from PNG)
- Max width: 800px @ 1x, 1600px @ 2x
- Aspect: 4:3 or 16:10 (current mostly square — okay tapi terlalu cropped)

### 10.2 Album Cover (`public/cover.jpg`)
- Used in Spotify integration
- Convert to WebP, max 600×600

### 10.3 Memoji
- `public/memoji-1.png` — keep for now (kalo dipake), tapi pertimbangin handful of expression variants buat hover state

### 10.4 New Asset Needs
- Section divider SVG (cassette icon, signal flow line, crossfader)
- Hero arm cue (vinyl needle "drop the needle" indicator) — animated SVG

---

## 11. Dark / Light Mode

Both supported via `next-themes` (existing).

**Default**: dark mode (matches studio mood). Light mode = "morning practice" alt.

**Test**: every component must look good in both. Audit checklist di `bugfix.md`.

---

## 12. Responsiveness

### 12.1 Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 12.2 Per-Section Responsive Strategy

| Section | Mobile (< 640) | Tablet (640-1024) | Desktop (> 1024) |
|---------|----------------|-------------------|------------------|
| Hero | Single column, smaller name | Same as mobile + larger | Full layout |
| About DAW | Vertical stack, no timeline view | Compact timeline | Full grid |
| Skills | Horizontal scroll mixer | 1-column mixer | 2-column |
| Experience | Single column, modal-style detail | Tracklist top, detail bottom | Side-by-side |
| Projects | 1 column | 2 columns | 3 columns |
| Contact | 4×6 launchpad, 2×1 functional pads | 6×4 grid | 8×4 grid |

---

## 13. Accessibility Layer

### 13.1 Keyboard

All interactive harus bisa di-tab through. Custom inputs (faders, knobs, pads) butuh `role` + `aria-valuenow` + `aria-valuemin/max` + arrow key handlers.

### 13.2 Screen Reader

Audit all `aria-label`. Saat ini sebagian udah ada (`Pad ${label}`, `Close project modal`) — tapi audit lengkap di `tasks.md`.

### 13.3 Focus Visible

Existing `:focus-visible` already in globals.css — keep, tapi update color ke `--accent`.

---

## 14. Brand Voice

Per `story-map.md` (companion doc), tiap section punya tagline yang konsisten metaphor music. Keep voice:
- Confident, not arrogant
- Specific, not generic
- Playful, but professional
- Indonesian English mix kalo perlu (lu personal, lu boleh casual di copy)

---

## 15. Out-of-Box Patterns to Reuse

Boleh copy dari portfolio existing yang udah jadi patokan industri:
- **vercel.com** — minimal type-led layout
- **rauno.me** — interactive component showcase
- **jhey.dev** — playful CSS-led
- **emilkowal.ski** — animated hero pattern

Tapi jangan overstudy — itu inspirasi, bukan template.
