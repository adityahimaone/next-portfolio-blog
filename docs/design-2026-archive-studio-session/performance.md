# Performance Plan 2026

> Specific performance budget, baseline, and fix list.
> Extends `../perf-fix-plan.md` (April 2026 audit).

---

## 1. Performance Budget

### 1.1 Hard Limits (NFR contract)

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Lighthouse Performance | ≥ 85 | ≥ 95 |
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 1.5s |
| FCP (First Contentful Paint) | ≤ 1.8s | ≤ 1.0s |
| TBT (Total Blocking Time) | ≤ 200ms | ≤ 150ms |
| CLS (Cumulative Layout Shift) | ≤ 0.05 | ≤ 0.05 |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 200ms |
| TTI (Time to Interactive) | ≤ 3.8s | ≤ 2.5s |

### 1.2 Bundle Budget

| Asset | Budget (gzipped) |
|-------|------------------|
| First-load JS | ≤ 180 KiB |
| First-load CSS | ≤ 25 KiB |
| Per-route JS chunk | ≤ 80 KiB |
| Total page weight (HTML+CSS+JS+image) | ≤ 1.2 MiB |

### 1.3 Asset Budget

| Asset Type | Max Size |
|------------|----------|
| Hero image | ≤ 80 KiB (AVIF) |
| Project thumbnail | ≤ 60 KiB (AVIF) |
| Audio file (Tone.js samples) | ≤ 200 KiB total |
| Font files (woff2) | ≤ 100 KiB total |
| SVG icons | ≤ 5 KiB each |

---

## 2. Baseline (Pre-Redesign)

> To be captured during T-001. Placeholder values from existing `perf-fix-plan.md`:

| Metric | Mobile (current) | Mobile (target) | Delta |
|--------|------------------|-----------------|-------|
| Performance Score | ~60 | ≥ 85 | +25 |
| LCP | ~5.5s | ≤ 2.5s | -3.0s |
| Legacy JS waste | 11.1 KiB | 0 KiB | -11.1 KiB |
| Render-blocking CSS | 110ms | < 50ms | -60ms |
| Unused JS | ~70 KiB | < 20 KiB | -50 KiB |

After T-001, replace placeholder with actual.

---

## 3. Issues & Fix Plan

### 3.1 P1 — LCP Render Delay (CRITICAL)

**Symptom**: LCP element (`<h1>` ADITYA in hero) takes 4220ms to render.

**Root cause**:
1. Element wrapped in `motion.h1` with `initial={{ opacity: 0, scale: 0.9 }}` and explicit `transition={{ delay: baseDelay + 0.1 }}` where `baseDelay = 1`. So minimum 1.1s before paint.
2. Preloader covers screen for first ~1200ms, blocking visibility.
3. Subtitle `<p>` similarly delayed.

**Fix**:
1. **Hero h1 + subtitle**: Replace motion wrapper with plain HTML + CSS animation. Element is in DOM immediately for LCP measurement; CSS animation handles visual fade-in.
2. **Preloader**: Verify `sessionStorage.getItem('preloaderShown')` skip path runs in <100ms (already implemented per `preloader.tsx`).

**Code** (after T-100):

```tsx
// hero-section.tsx — BEFORE
<motion.h1
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: baseDelay + 0.1 }}
  className="..."
>
  ADITYA
</motion.h1>

// hero-section.tsx — AFTER
<h1 className="animate-hero-name ...">
  ADITYA
</h1>
```

```css
/* globals.css */
@keyframes hero-name-in {
  0%   { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.animate-hero-name {
  animation: hero-name-in 0.6s cubic-bezier(0, 0, 0.2, 1) 0.1s both;
}
```

**Expected gain**: LCP from 5.5s → ~2.0s mobile.

---

### 3.2 P2 — Legacy JS Polyfills (-11.1 KiB)

**Symptom**: 11.1 KiB of legacy polyfill code shipped to all browsers.

**Root cause**: `tsconfig.json` target is `ES2017` while `package.json` browserslist already targets modern browsers (Chrome 109+, etc).

**Fix**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",  // was: ES2017
    ...
  }
}
```

**Expected gain**: -11.1 KiB JS payload, ~10ms parse time.

---

### 3.3 P3 — Render-Blocking CSS (-110ms)

**Symptom**: 3 CSS chunks block rendering for 110ms.

**Root cause**: Critical CSS not inlined, multiple CSS chunks loaded synchronously.

**Fix**:
1. Verify Next.js automatically inlines critical CSS (default in Next 15).
2. Check `next.config.ts` for `experimental.optimizeCss` or similar.
3. Use `critters` (already in devDependencies) for additional inline.
4. Reduce globals.css from 632 LOC → < 400 LOC (T-112) — saves CSS chunk size.

**Expected gain**: -60ms TBT, -110ms render-blocking time.

---

### 3.4 P4 — Unused JS (~50-70 KiB)

**Symptom**: `react-syntax-highlighter` and `tone.js` in main bundle when not needed there.

**Root cause**:
- `tone.js` is loaded eagerly in `use-audio-engine.tsx` even though only Contact section uses it
- `react-syntax-highlighter` only needed for blog post pages

**Fix**:
1. **`tone.js`**: Defer load via IntersectionObserver. Don't import until ContactSection enters viewport.
   ```tsx
   // contact-section.tsx
   const [toneReady, setToneReady] = useState(false)
   const sectionRef = useRef<HTMLDivElement>(null)
   
   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting && !toneReady) {
           setToneReady(true)
         }
       },
       { rootMargin: '200px' }  // load when 200px from viewport
     )
     if (sectionRef.current) observer.observe(sectionRef.current)
     return () => observer.disconnect()
   }, [toneReady])
   
   // Only render audio engine when ready
   {toneReady && <AudioEngineProvider>...</AudioEngineProvider>}
   ```

2. **`react-syntax-highlighter`**: Verify already lazy via `dynamic()` for blog post route. Check `app/blog/[slug]/page.tsx` and `features/blog/components/blog-post.tsx`.

**Expected gain**: -50-70 KiB initial bundle.

---

### 3.5 P5 — Non-Composited Animations

**Symptom**: Some Motion animations animate non-GPU properties (width, height, top, left, box-shadow).

**Audit needed**: Run grep:
```bash
grep -rn "motion\." features/ | grep -E "width|height|top|left|boxShadow"
```

Replace with `transform` (translateX/Y/scale) and `opacity`.

**Examples**:
- `features/landing-page/components/about-section.tsx` — playhead `style.left = '...%'` → use `transform: translateX(...)`
- Various `whileHover={{ scale: 1.02 }}` — already GPU-friendly, keep

---

### 3.6 P6 — @next/mdx Version Mismatch

**Symptom**: Pinned to `@next/mdx@14.2.13` while Next.js is `15.1.11`.

**Fix**:
```json
// package.json
"@next/mdx": "^15.1.11"
```

Verify build still succeeds, no breaking changes.

---

### 3.7 P7 — About Section Bundle Bloat (NEW, gw add)

**Symptom**: `about-section.tsx` is 957 LOC (~25 KiB minified). All clip content imported eagerly.

**Fix**: Refactor (T-120):
1. Split into per-clip files
2. Lazy load clip content when clip clicked (not on initial render)

**Expected gain**: -20-25 KiB initial bundle.

---

### 3.8 P8 — Decorative Animations Cost (NEW)

**Symptom**: 3 floating notes (♫ ♩ ♬) running infinite Motion animations on every render.

**Fix**: Remove entirely (T-131). Already proposed in `redesign-2026.md`.

**Expected gain**: -3 KiB JS, ~5% CPU during scroll.

---

### 3.9 P9 — CLS from Dynamic Imports (NEW)

**Symptom**: All sections `dynamic()` import without skeleton → height collapses then expands when section loads → CLS spike.

**Fix** (T-105): Add `loading: () => <SectionSkeleton />` with appropriate min-height.

**Expected gain**: CLS 0.10+ → < 0.05.

---

### 3.10 P10 — Image Optimization Audit (NEW)

**Symptom**: PNG/JPG images in `public/` not optimized.

**Inventory**:
| File | Current | Format | Action |
|------|---------|--------|--------|
| `public/cover.jpg` | unknown | JPG | Convert AVIF/WebP, resize ≤600px |
| `public/nwjns.jpeg` | unknown | JPEG | Convert AVIF/WebP |
| `public/Edge of Desire (Sunrise Mix).jpg` | unknown | JPG | Convert AVIF/WebP |
| `public/memoji-1.png` | unknown | PNG | Keep PNG (transparency), reduce size |
| `public/grid.svg` | small | SVG | Optimize via `svgo` |
| `public/noise.png` | unknown | PNG | Keep, but verify <20 KiB |
| `public/assets/primarindo.png` | unknown | PNG | Convert to AVIF |
| `public/assets/quick-chat-wa.png` | unknown | PNG | Convert to AVIF |
| `public/assets/thumbnail-fe-resources.png` | unknown | PNG | Convert to AVIF |
| `public/assets/thumbnail-habit-tracker.png` | unknown | PNG | Convert to AVIF |
| `public/assets/frontend-resources.png` | unknown | PNG | Convert to AVIF |
| `public/assets/Edge of Desire.jpg` | unknown | JPG | Convert AVIF |

**Fix** (T-400): Use `cwebp -q 80` or Squoosh CLI; verify Next.js `next/image` AVIF/WebP serves automatically.

**Expected gain**: 30-50% size reduction per image, faster Project section load.

---

## 4. Optimization Techniques

### 4.1 Code Splitting Strategy

```
First load (initial page):
  - layout.tsx + globals.css
  - Hero section (eager)
  - Header / Footer
  - First-paint critical CSS

Lazy loaded (post-paint):
  - About section
  - Skills section
  - Experience section
  - Projects section
  - Contact section (PLUS Tone.js when in viewport)
  - MusicMarquee
  
Route-specific:
  - Blog list (/blog)
  - Blog post (/blog/[slug]) — react-syntax-highlighter here
  - Music page (/music) — heavy components
  - Contact subpage (/contact) — full Contact section
```

### 4.2 Font Loading Strategy

```ts
// app/layout.tsx — using next/font/google
import { Inter, Crimson_Pro, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // critical: avoid blocking
  variable: '--font-body',
})

const display = Crimson_Pro({
  weight: ['400', '500'],
  style: ['italic', 'normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
```

### 4.3 Image Loading Strategy

```tsx
// Hero image (above fold)
<Image src="/hero.avif" priority alt="..." />

// Project thumbnails (below fold, lazy)
<Image src={project.image} loading="lazy" alt="..." />
```

### 4.4 Animation Performance Rules

1. **Animate transform/opacity only** — composited on GPU
2. **Use `will-change` sparingly** — only on actively animating elements
3. **Stop animations off-screen** — use `useInView` to pause Motion components
4. **Prefer CSS keyframes for infinite animations** — Motion infinite is JS overhead
5. **Use `requestAnimationFrame` for scroll-linked** — already doing this in playhead

---

## 5. Monitoring Plan

### 5.1 Pre-deploy
- Lighthouse CI (manual or via GitHub Action)
- Bundle analyzer reports
- Manual cross-device test

### 5.2 Post-deploy (RUM)
- Vercel Analytics (already in `package.json`)
- Track: LCP, FID, CLS, INP per route
- Alert if any metric regress > 20% from baseline

### 5.3 Weekly Review
- Check Vercel Analytics dashboard
- Compare to budget
- File regression issues if budget violated

---

## 6. Cheat Sheet (Common Wins)

```bash
# Bundle analysis
ANALYZE=true pnpm build

# Lighthouse local
npx lighthouse http://localhost:3000 \
  --view \
  --preset=desktop \
  --output=json \
  --output-path=./lighthouse-report.json

# Image optimization (one-off)
cwebp -q 80 input.jpg -o output.webp

# Find non-GPU animations
grep -rn "motion\." features/ | grep -E "(width:|height:|left:|top:|boxShadow)"

# Check first-load JS
pnpm build 2>&1 | grep "First Load JS"
```

---

## 7. Targets Summary (Visual)

```
Current → Target:

Performance Score    [████░░░░░░] 60   →   [████████░░] 85   ⬆ +25
LCP (mobile)         [██████████]      →   [██░░░░░░░░]      ⬇ -3.0s
First-load JS        [████████░░]      →   [████░░░░░░]      ⬇ -50KB
TBT                  [████░░░░░░]      →   [██░░░░░░░░]      ⬇ -200ms
CLS                  [██░░░░░░░░]      →   [▌░░░░░░░░░]      ⬇ -0.05+
```
