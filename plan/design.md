# Implementation Plan: Parallax Scroll Effects & Section Connectors

> **Branch:** `feature/parallax-section-connectors`
> **Base:** `feature/daw-controller-redesign`
> **Scope:** Landing page only — all files under `features/landing-page/` and `components/`

---

## Architecture Overview

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `ParallaxSection` | `components/parallax-section.tsx` | Reusable scroll-driven parallax wrapper — 3-layer depth |
| `CableConnector` | `components/cable-connector.tsx` | SVG audio cable with catenary drape + jack sockets between sections |

### Modified Files

| File | Change |
|------|--------|
| `features/landing-page/views/landing-page.tsx` | Wrap sections in `ParallaxSection`, replace `SectionDivider` with `CableConnector` |
| `components/section-divider.tsx` | Keep file but stop using it in landing page (still used by other pages) |

### Technology

- `motion/react` v12.38 — `useScroll`, `useTransform`, `m as motion`, `useMotionTemplate`
- All components already import from `motion/react` so no new dependencies needed
- SVG for cable rendering (no canvas)

### Current Page Section Flow

```
Hero (h-screen, already has own useScroll parallax in daw-hero.tsx)
  ↓
MusicMarquee (thin horizontal ticker strip)
  ↓
SectionDivider ← REPLACE with CableConnector (red #C84B4B)
About Section (py-24, DAW arrangement view, uses useInView)
  ↓
SectionDivider ← REPLACE with CableConnector (gold #C9A447)
Skills Section (py-24, MIDI controller, uses useInView)
  ↓
SectionDivider ← REPLACE with CableConnector (green #7ABB5E)
Experience Section (py-24, music player/album, uses whileInView)
  ↓
SectionDivider ← REPLACE with CableConnector (blue #4A9EC9)
Projects Section (py-24, vinyl record store, full-bleed dark bg, has canvas bg)
  ↓
SectionDivider ← REPLACE with CableConnector (purple #8A5FC9)
Contact Section (py-24, Launchpad controller, uses useInView)
  ↓
Footer (DAW chassis style)
```

---

## Task 1: Create `ParallaxSection` Component

> **File to create:** `components/parallax-section.tsx`
> **Dependencies:** None
> **Can run in parallel with:** Task 2

### Specification

A reusable wrapper component that adds scroll-driven parallax to any section. It creates 3 depth layers that move at different speeds relative to scroll progress.

### Props Interface

```tsx
interface ParallaxSectionProps {
  children: React.ReactNode
  /** Unique section ID for accessibility and scroll targeting */
  id?: string
  /** Additional className for the outer section element */
  className?: string
  /** Speed multiplier for the background layer parallax (default: 0.15).
   *  Higher = more movement = appears deeper */
  bgSpeed?: number
  /** Speed multiplier for the mid layer parallax (default: 0.08) */
  midSpeed?: number
  /** Whether to fade in/out at section edges (default: true) */
  edgeFade?: boolean
  /** Background layer content — decorative elements like grids, glows */
  backgroundLayer?: React.ReactNode
  /** Mid layer content — headings, labels, decorative screws */
  midLayer?: React.ReactNode
  /** Whether to disable parallax entirely (for mobile). Default: false.
   *  When true, all layers render but transforms are zeroed out. */
  disabled?: boolean
}
```

### Implementation Requirements

1. Use `'use client'` directive
2. Import `useRef` from React, `m as motion`, `useScroll`, `useTransform` from `motion/react`, `cn` from `@/lib/utils`
3. Create a `ref` on the outer `<section>` element
4. Set up `useScroll` with:
   - `target: ref`
   - `offset: ['start end', 'end start']` — this tracks from when the section enters the bottom of the viewport to when it exits the top
5. Create three `useTransform` values:
   - `bgY`: maps `scrollYProgress [0, 1]` to `[0, -(bgSpeed * 200)]` pixels. When `disabled`, map to `[0, 0]`
   - `midY`: maps `scrollYProgress [0, 1]` to `[0, -(midSpeed * 200)]` pixels. When `disabled`, map to `[0, 0]`
   - `opacity`: maps `scrollYProgress [0, 0.15, 0.85, 1]` to `[0.4, 1, 1, 0.4]` when `edgeFade` is true, else `[1, 1, 1, 1]`
6. Render three layers in order:
   - **Background layer** (z-0): `pointer-events-none absolute inset-0 overflow-hidden`, `style={{ y: bgY, opacity, willChange: 'transform' }}`. Only renders if `backgroundLayer` prop is provided.
   - **Mid layer** (z-1): `pointer-events-none absolute inset-0 overflow-hidden`, `style={{ y: midY, willChange: 'transform' }}`. Only renders if `midLayer` prop is provided.
   - **Foreground layer** (z-2): `relative`, `style={{ opacity }}`. Renders `{children}`.
7. The outer `<section>` should accept `id` and `className` props and pass them through

### Acceptance Criteria

- [ ] Component renders children normally when `disabled={true}`
- [ ] `backgroundLayer` and `midLayer` are optional — component works with just `children`
- [ ] Parallax effect is visible: background moves slower than foreground on scroll
- [ ] Edge fade dims the section at viewport boundaries
- [ ] No layout shift or jank — all transforms use GPU-composited `translateY`
- [ ] TypeScript compiles with `npx tsc --noEmit`

---

## Task 2: Create `CableConnector` Component

> **File to create:** `components/cable-connector.tsx`
> **Dependencies:** None
> **Can run in parallel with:** Task 1

### Specification

An SVG-based audio patch cable that visually connects two sections. It renders:
1. An **OUTPUT jack socket** at the top
2. A **catenary-curved SVG cable** in the middle
3. An **INPUT jack socket** at the bottom

The cable droop and opacity respond to scroll position using `useScroll` + `useTransform`.

### Props Interface

```tsx
interface CableConnectorProps {
  /** Color of the cable body and LED indicators (hex). Default: '#1a1a1a' */
  color?: string
  /** Label for the output jack. Example: 'ABOUT' */
  fromLabel?: string
  /** Label for the input jack. Example: 'SKILLS' */
  toLabel?: string
  /** Disable scroll animation (for mobile). Renders a static cable. Default: false */
  disabled?: boolean
}
```

### Implementation Requirements

1. Use `'use client'` directive
2. Import `useRef` from React, `m as motion`, `useScroll`, `useTransform` from `motion/react`, `cn` from `@/lib/utils`
3. Create a `ref` on the outer `<div>` wrapper
4. Set up `useScroll` with `target: ref` and `offset: ['start end', 'end start']`
5. Create scroll-driven values:
   - `droop`: maps `scrollYProgress [0, 0.5, 1]` to `[35, 8, 35]` — cable is relaxed at edges, taut when centered
   - `cableOpacity`: maps `scrollYProgress [0, 0.3, 0.7, 1]` to `[0.3, 1, 1, 0.3]`
   - `ledOpacity`: maps `scrollYProgress [0, 0.3, 0.7, 1]` to `[0.2, 1, 1, 0.2]`
   - When `disabled` is true, use static values: `droop=25`, `cableOpacity=0.6`, `ledOpacity=0.5`

6. **SVG Cable Rendering:**
   - SVG dimensions: `width={200}` `height={120}` with `viewBox="0 0 200 120"` and `overflow-visible`
   - The cable path is a cubic bezier: `M 100 0 C 70 {droop}, 130 {120-droop}, 100 120`
   - Render 3 paths for the cable (bottom to top):
     - **Shadow**: `stroke="rgba(0,0,0,0.15)"` `strokeWidth={7}` `strokeLinecap="round"`
     - **Body**: `stroke={color}` `strokeWidth={5}` `strokeLinecap="round"`
     - **Highlight**: `stroke="rgba(255,255,255,0.08)"` `strokeWidth={2}` `strokeLinecap="round"`
   - All paths use `fill="none"`
   - To reactively compute the `d` attribute from the `droop` MotionValue, use `useMotionTemplate`:
     ```tsx
     const pathD = useMotionTemplate`M 100 0 C 70 ${droop}, 130 ${subtracted}, 100 120`
     ```
     Where `subtracted` = `useTransform(droop, v => 120 - v)`
   - If `useMotionTemplate` doesn't work for path `d`, fallback: use a state variable updated via `droop.on('change', callback)` in a `useEffect`

7. **JackSocket Sub-Component** (defined in same file, not exported):
   ```tsx
   interface JackSocketProps {
     ledColor: string
     ledOpacity: MotionValue<number> | number
   }
   ```
   - Renders a `h-6 w-6` circular recessed jack socket matching the header-daw INPUT jack style:
     - Outer ring: `rounded-full border-2 border-black/25 dark:border-white/10 bg-[var(--daw-chassis-deep)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]`
     - Inner contact: `h-2.5 w-2.5 rounded-full bg-black/80 shadow-inner`
     - LED dot inside: `h-1 w-1 rounded-full` with `backgroundColor: ledColor`, `opacity: ledOpacity`, `boxShadow: 0 0 4px {ledColor}`

8. **Overall Layout:**
   - Outer div: `flex flex-col items-center py-2 select-none`
   - Top: fromLabel text + JackSocket
   - Middle: SVG cable
   - Bottom: JackSocket + toLabel text
   - Labels: `font-mono text-[7px] font-bold tracking-widest text-black/30 dark:text-white/20 uppercase`
   - fromLabel shows `{fromLabel} · OUT`, toLabel shows `{toLabel} · IN`

### Cable Color Assignments (for reference by integrator)

| Position | From → To | Cable Color | Hex |
|----------|-----------|-------------|-----|
| 1 | Hero → About | Red | `#C84B4B` |
| 2 | About → Skills | Gold | `#C9A447` |
| 3 | Skills → Experience | Green | `#7ABB5E` |
| 4 | Experience → Projects | Blue | `#4A9EC9` |
| 5 | Projects → Contact | Purple | `#8A5FC9` |

### Acceptance Criteria

- [ ] Cable renders as a smooth curved SVG path between two jack sockets
- [ ] Cable droop responds to scroll — taut when centered, relaxed at edges
- [ ] Jack sockets render at both endpoints with colored LED indicators
- [ ] LED brightness responds to scroll proximity
- [ ] Labels display correctly (FROM · OUT / TO · IN)
- [ ] Works in both light and dark modes
- [ ] When `disabled={true}`, renders a static cable with no scroll animation
- [ ] TypeScript compiles with `npx tsc --noEmit`

---

## Task 3: Integrate into `landing-page.tsx`

> **File to modify:** `features/landing-page/views/landing-page.tsx`
> **Dependencies:** Task 1 and Task 2 must be completed first

### Current File Reference

- **Total lines:** 158
- **Key imports (line 37):** `import { SectionDivider } from '@/components/section-divider'`
- **Sections wrapper (line 98):** `<div className="mx-auto w-full max-w-7xl space-y-2 py-20">`
- **SectionDivider usage:** Lines 99, 104, 109, 114, 125

### Changes Required

#### 1. Update imports

**Remove:**
```tsx
import { SectionDivider } from '@/components/section-divider'
```

**Add:**
```tsx
import { ParallaxSection } from '@/components/parallax-section'
import { CableConnector } from '@/components/cable-connector'
```

#### 2. Add mobile detection state

Inside the `LandingPage` component, after the existing state declarations (around line 43-44), add:

```tsx
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const mql = window.matchMedia('(max-width: 768px)')
  setIsMobile(mql.matches)
  const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}, [])
```

#### 3. Replace section structure

**Remove `space-y-2` from the wrapper div** (line 98). The `CableConnector` components handle spacing now.

**Replace each `<SectionDivider />` + `<section>` pair** with `<CableConnector>` + `<ParallaxSection>`:

Target structure for the inner content div (replaces lines 98-115):

```tsx
<div className="mx-auto w-full max-w-7xl py-20">
  <CableConnector color="#C84B4B" fromLabel="HERO" toLabel="ABOUT" disabled={isMobile} />

  <ParallaxSection id="about" className="snap-start scroll-mt-0" disabled={isMobile}>
    <AboutSection />
  </ParallaxSection>

  <CableConnector color="#C9A447" fromLabel="ABOUT" toLabel="SKILLS" disabled={isMobile} />

  <ParallaxSection id="skills" className="snap-start scroll-mt-0" disabled={isMobile}>
    <SkillsSection />
  </ParallaxSection>

  <CableConnector color="#7ABB5E" fromLabel="SKILLS" toLabel="EXP" disabled={isMobile} />

  <ParallaxSection id="experience" className="snap-start scroll-mt-0" disabled={isMobile}>
    <ExperienceSection />
  </ParallaxSection>

  <CableConnector color="#4A9EC9" fromLabel="EXP" toLabel="WORK" disabled={isMobile} />
</div>
```

**Replace the Projects section** (lines 117-122):

```tsx
<ParallaxSection
  id="projects"
  className="dark:bg-void border-graphite/10 dark:border-graphite/35 snap-start scroll-mt-0 border-y"
  disabled={isMobile}
>
  <ProjectsSection />
</ParallaxSection>
```

**Replace the last SectionDivider + Contact** (lines 124-130):

```tsx
<CableConnector color="#8A5FC9" fromLabel="WORK" toLabel="CONTACT" disabled={isMobile} />

<ParallaxSection id="contact" className="snap-start" disabled={isMobile}>
  <ContactSection />
</ParallaxSection>
```

#### 4. What NOT to change

- **DO NOT** wrap the Hero section — it already has its own `useScroll` parallax in `daw-hero.tsx`
- **DO NOT** wrap or replace the `MusicMarquee` — it's a thin decorative strip
- **DO NOT** delete `components/section-divider.tsx` — it may be used by other pages

### Acceptance Criteria

- [ ] All `SectionDivider` references removed from this file
- [ ] All content sections (About, Skills, Experience, Projects, Contact) wrapped in `ParallaxSection`
- [ ] Five `CableConnector` instances placed between sections with correct colors:
  - `#C84B4B` (Hero→About), `#C9A447` (About→Skills), `#7ABB5E` (Skills→Exp), `#4A9EC9` (Exp→Work), `#8A5FC9` (Work→Contact)
- [ ] Hero section NOT wrapped (already has own parallax)
- [ ] Mobile detection disables parallax and cable animation on screens ≤ 768px
- [ ] All section `id` attributes preserved for anchor navigation from header
- [ ] `space-y-2` removed from wrapper div
- [ ] TypeScript compiles with `npx tsc --noEmit`
- [ ] Page renders without errors in browser

---

## Task 4: Per-Section Parallax Background Layers (Optional Enhancement)

> **File to modify:** `features/landing-page/views/landing-page.tsx`
> **Dependencies:** Task 3 must be completed first

### Specification

Add custom `backgroundLayer` props to each `ParallaxSection` in `landing-page.tsx` to create unique per-section depth effects. These are purely decorative elements that drift at a slower rate than the content.

### Changes

Update each `<ParallaxSection>` call to include a `backgroundLayer` and optionally a custom `bgSpeed`:

**About Section** — subtle dot grid:
```tsx
<ParallaxSection
  id="about"
  className="snap-start scroll-mt-0"
  disabled={isMobile}
  bgSpeed={0.12}
  backgroundLayer={
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
      <div className="h-full w-full bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  }
>
```

**Skills Section** — warm amber glow from below (spectrum analyzer warmth):
```tsx
<ParallaxSection
  id="skills"
  className="snap-start scroll-mt-0"
  disabled={isMobile}
  bgSpeed={0.18}
  backgroundLayer={
    <div className="absolute inset-0">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-[500px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl" />
    </div>
  }
>
```

**Experience Section** — faint vinyl groove circles:
```tsx
<ParallaxSection
  id="experience"
  className="snap-start scroll-mt-0"
  disabled={isMobile}
  bgSpeed={0.1}
  backgroundLayer={
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full border border-black/[0.03] dark:border-white/[0.04]" />
    </div>
  }
>
```

**Projects Section** — cool blue/purple ambient glow:
```tsx
<ParallaxSection
  id="projects"
  className="dark:bg-void border-graphite/10 dark:border-graphite/35 snap-start scroll-mt-0 border-y"
  disabled={isMobile}
  bgSpeed={0.2}
  backgroundLayer={
    <div className="absolute inset-0">
      <div className="absolute top-20 right-20 h-60 w-60 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-40 w-40 rounded-full bg-purple-500/8 dark:bg-purple-500/12 blur-3xl" />
    </div>
  }
>
```

**Contact Section** — warm purple glow (final output):
```tsx
<ParallaxSection
  id="contact"
  className="snap-start"
  disabled={isMobile}
  bgSpeed={0.1}
  edgeFade={false}
  backgroundLayer={
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-500/8 dark:bg-purple-500/15 blur-3xl" />
    </div>
  }
>
```

### Acceptance Criteria

- [ ] Each section has a visually distinct, subtle background layer
- [ ] Background layers move at a different speed than content (parallax visible)
- [ ] Layers are very subtle — they enhance depth, not distract
- [ ] No background layers on mobile (ParallaxSection handles this via disabled prop)
- [ ] TypeScript compiles

---

## Task 5: Performance & Mobile Optimization Pass

> **Dependencies:** Task 3 must be completed first

### Checklist

- [ ] All parallax `motion.div` elements use `style={{ willChange: 'transform' }}`
- [ ] All transforms are `translateY` via motion/react (GPU-composited automatically)
- [ ] `ParallaxSection` receives `disabled={isMobile}` on screens ≤ 768px
- [ ] `CableConnector` receives `disabled={isMobile}` — renders static cable without scroll listener
- [ ] When `disabled=true`, `useScroll` still creates the hook but `useTransform` maps to static `[0,0]` — no work done on scroll
- [ ] Cable SVG uses `overflow-visible` to prevent clipping at edges
- [ ] No new `IntersectionObserver` or `requestAnimationFrame` loops introduced
- [ ] Test: Chrome DevTools → Performance tab → record scroll → no frames > 16ms
- [ ] Test: Chrome DevTools → Layers panel → verify parallax layers are composited

---

## Task 6: Final Integration Test

> **Dependencies:** All previous tasks

### Manual Test Checklist

1. **Desktop Chrome (dark mode):**
   - [ ] Scroll slowly Hero → Contact — parallax depth visible on each section
   - [ ] Cable droop responds to scroll position (taut when centered, relaxed at edges)
   - [ ] Cable LED indicators glow when the connector is in viewport center
   - [ ] Cable colors: red → gold → green → blue → purple (top to bottom)
   - [ ] Edge fade: sections dim slightly at viewport entry/exit

2. **Desktop Chrome (light mode):**
   - [ ] Same as above — cables and jack sockets visible against light background
   - [ ] Background layers still subtle and not washed out

3. **Mobile (< 768px):**
   - [ ] Parallax disabled — content scrolls normally, no depth layers
   - [ ] Cables render as static curved lines (no scroll animation, no LED pulsing)
   - [ ] No horizontal overflow or layout shift

4. **Header Navigation:**
   - [ ] Click nav links (ABOUT, SKILLS, EXP, WORK, CONTACT) — smooth scroll works
   - [ ] Section `id` attributes preserved and matched correctly

5. **TypeScript:**
   - [ ] `npx tsc --noEmit` passes with no errors

---

## Execution Order & Parallelism

```
Task 1 (ParallaxSection) ──┐
                           ├──→ Task 3 (Integration) ──→ Task 4 (BG Layers) ──→ Task 6 (Final Test)
Task 2 (CableConnector) ───┘                        └──→ Task 5 (Perf QA) ─────┘
```

- **Task 1 and Task 2** can be executed in parallel by two agents
- **Task 3** depends on both Task 1 and Task 2
- **Task 4** depends on Task 3
- **Task 5** depends on Task 3
- **Task 6** depends on Task 4 and Task 5
