# Performance — RETRO CONSOLE 2026

> Performance budget, monitoring, and optimization checklist.
> Companion: `requirements.md` (NFR-1 to NFR-9), `3d-and-animation.md` §7 (3D budget).

---

## 1. Performance Budget

### 1.1 Lighthouse Targets

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | ≥ 85 | ≥ 95 |
| LCP | ≤ 2.5s | ≤ 1.5s |
| CLS | ≤ 0.05 | ≤ 0.05 |
| TBT | ≤ 200ms | ≤ 150ms |
| INP | ≤ 200ms (RUM) | ≤ 200ms |
| FCP | ≤ 1.8s | ≤ 1.0s |

### 1.2 Bundle Budget (gzipped)

| Asset | Budget | Note |
|-------|--------|------|
| First-load JS | ≤ 200 KiB | Raised from 180KB to fit R3F core (~50KB) |
| First-load CSS | ≤ 30 KiB | Tailwind purge effective, custom CSS minimal |
| Per-chunk max | ≤ 80 KiB | Code-split aggressive |
| Total page weight (mobile, 3G slow) | ≤ 600 KiB | Includes 1 hero 3D model |

### 1.3 3D / WebGL Budget

| Item | Budget | Mitigation |
|------|--------|-----------|
| Mascot 3D first-paint | ≤ 250ms after hydrate | Poster fallback during load |
| Cartridge canvas (per card) | ≤ 8ms / frame mobile | DPR 1-1.5, antialias off |
| Total 3D bundle gzipped | ≤ 200 KiB | three core ~50KB, drei ~25KB, models ~70KB |
| Per-model size | ≤ 50 KiB | gltfpack -cc -tc compression |
| Shader code | ≤ 5 KiB inline per shader | Custom GLSL, no over-engineering |
| EffectComposer overhead | ≤ 4ms / frame desktop | Default OFF mobile |

### 1.4 Asset Budget

| Asset type | Budget | Format |
|------------|--------|--------|
| Hero poster fallback | ≤ 80 KiB | WebP 800×800 |
| Project thumbnail | ≤ 40 KiB | WebP 800×800 |
| 3D model (.glb) | ≤ 50 KiB | gltfpack |
| SFX file | ≤ 12 KiB | WAV mono 16-bit, ≤ 200ms |
| Total SFX library | ≤ 60 KiB | 6 files |
| Font (woff2 per face) | ≤ 35 KiB | latin subset |
| Icon SVG | ≤ 1 KiB each | SVGO optimized |

---

## 2. Critical Path

```
0ms      ─ HTML download starts (server response)
50ms     ─ HTML received, parsing begins
80ms     ─ <link rel="preload"> fires for fonts + critical CSS
200ms    ─ FCP — title screen text visible (no 3D yet)
600ms    ─ Hydration begins
800ms    ─ Hydration complete, R3F mount triggered (lazy)
1.0s     ─ 3D Canvas first frame painted
1.5s     ─ LCP candidate stabilized
2.0s     ─ Time to interactive
```

LCP target candidate: `<h1>ADIT HIMAONE</h1>` (text node, paints with first font batch).

---

## 3. Optimization Tactics

### 3.1 Code Splitting

```tsx
// Sections — top-level dynamic imports
const HeroSection      = dynamic(() => import('@/features/landing-page/components/hero/hero-section'));
const AboutSection     = dynamic(() => import('@/features/landing-page/components/about/about-section'),     { loading: () => <SectionSkeleton /> });
const SkillsSection    = dynamic(() => import('@/features/landing-page/components/skills/skills-section'),   { loading: () => <SectionSkeleton /> });
const ExperienceSection = dynamic(() => import('@/features/landing-page/components/experience/experience-section'), { loading: () => <SectionSkeleton /> });
const ProjectsSection  = dynamic(() => import('@/features/landing-page/components/projects/projects-section'), { loading: () => <SectionSkeleton /> });
const ContactSection   = dynamic(() => import('@/features/landing-page/components/contact/contact-section'),  { loading: () => <SectionSkeleton /> });

// 3D — never SSR
const Mascot3D       = dynamic(() => import('@/components/3d/mascot-3d'),       { ssr: false, loading: () => <MascotPoster /> });
const CartridgeCanvas = dynamic(() => import('@/components/3d/cartridge-canvas'), { ssr: false });
const SaveCrystal    = dynamic(() => import('@/components/3d/save-crystal'),    { ssr: false });
const CRTEffect      = dynamic(() => import('@/components/3d/effects/crt-effect'), { ssr: false });

// Boot screen — only loaded on first visit
const BootScreen = dynamic(() => import('@/components/layout/boot-screen'), { ssr: false });
```

### 3.2 Tree Shaking Three.js

Three.js bisa fat kalau unused modules ke-bundle. Best practice:

```ts
// ❌ Don't do this
import * as THREE from 'three';

// ✅ Do this
import { Mesh, IcosahedronGeometry, MeshStandardMaterial } from 'three';
```

Use `next.config.js` transpile rules:

```js
const nextConfig = {
  experimental: { optimizePackageImports: ['three', '@react-three/drei', 'lucide-react'] },
};
```

### 3.3 Font Subsetting

Default `next/font/google` already subset to latin only. Avoid loading multiple weights when not needed:

```ts
// ❌
const space = Space_Grotesk({ weight: ['300', '400', '500', '600', '700'] });

// ✅ — only used weights
const space = Space_Grotesk({ weight: ['400', '700'] });
```

Verify with `pnpm next build` and check `.next/static/chunks/_app-*.css` size.

### 3.4 Image Optimization

Use Next.js `<Image>` component everywhere:

```tsx
import Image from 'next/image';

<Image
  src="/3d/mascot-poster.webp"
  alt="Adit's mascot cartridge"
  width={400}
  height={400}
  priority           // hero image
  placeholder="blur"
  blurDataURL="data:image/webp;base64,..."
/>
```

Pre-generate poster from R3F:

```bash
# After mascot-3d component working
node scripts/render-mascot-poster.mjs > public/3d/mascot-poster.webp
```

### 3.5 GLB Compression

```bash
npx gltfpack -i public/3d/cartridge.glb -o public/3d/cartridge.opt.glb -cc -tc
mv public/3d/cartridge.opt.glb public/3d/cartridge.glb
```

Flags:
- `-cc`: meshopt compression
- `-tc`: texture compression
- Result: typically 4-6x smaller

### 3.6 Static Asset Caching

```js
// next.config.js
async headers() {
  return [
    { source: '/3d/:path*',   headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/sfx/:path*',  headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ];
}
```

### 3.7 Preconnect / DNS-prefetch

```tsx
// src/app/layout.tsx
<head>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://api.spotify.com" />
  <link rel="dns-prefetch" href="https://api.github.com" />
</head>
```

### 3.8 Reduce Render-Blocking

- Inline critical CSS (Next.js does automatically for above-fold)
- Defer non-critical JS via `<Script strategy="lazyOnload">`
- No third-party analytics in critical path (load post-hydration)

---

## 4. Specific Optimizations per Section

### 4.1 Hero

- LCP element: text `<h1>` (no image swap)
- 3D mascot: lazy + poster fallback
- Background pixel grid: pure CSS gradient, no image
- Vignette: pure CSS radial-gradient
- Boot sequence: skipped on subsequent visits (localStorage)

### 4.2 About

- 3D portrait: same shared mascot model (no second download)
- Stats panel: pure CSS, no 3D needed
- NES textbox: pure CSS

### 4.3 Skills

- No 3D needed
- Icon SVGs: lucide-react tree-shaken, only used icons in bundle
- 24 cells × ~0.5KB icon = ~12KB total

### 4.4 Experience

- No 3D needed
- 4 stage tiles: thumbnail images optional, can be CSS-only solid color blocks

### 4.5 Projects

- Top 3 cards: 3D cartridge canvas (single shared model)
- Bottom 3 cards: 2D SVG silhouette
- Modal: lazy-loaded, only mounts on click
- Filter: client-side, no API call

### 4.6 Contact

- 3D save crystal: tiny octahedron geometry, inline (no .glb)
- 4 buttons: pure CSS, no 3D

### 4.7 Footer

- Last commit fetch: ISR cache 1h via Next.js Route Handler
- Live timer: simple `setInterval`, no expensive re-render (use `useRef`)

---

## 5. Monitoring Plan

### 5.1 Pre-Launch

- Run Lighthouse on localhost (`pnpm next build && pnpm next start`)
- Target metrics passed before merge

### 5.2 Launch Day

- Run Lighthouse on production URL immediately after deploy
- Compare against budget
- Document in PR

### 5.3 Post-Launch (Day 1-7)

Real User Monitoring (RUM) via Vercel Analytics atau alternative:
- Track LCP, CLS, INP per percentile
- Alert if p75 LCP > 3s
- Alert if error rate > 1%

### 5.4 Weekly Check (Post-Launch)

- Lighthouse run weekly
- Bundle analyzer monthly
- Check for dependency bloat

---

## 6. Performance Anti-Patterns to Avoid

### 6.1 In Sections

- ❌ Animating `width`, `height`, `padding`, `margin`, `top`, `left`
- ❌ Infinite-loop `motion.div` for backgrounds
- ❌ Re-rendering 3D on every scroll
- ❌ Multiple `<Canvas>` instances when 1 shared works
- ❌ `box-shadow` with non-zero blur in scroll-tied animations

### 6.2 In 3D Code

- ❌ `useFrame` doing expensive work (DOM access, state updates)
- ❌ Creating new geometry / materials inside render loop
- ❌ `console.log` in `useFrame`
- ❌ Loading large textures (> 1MB) without compression
- ❌ Using `MeshPhysicalMaterial` when `MeshStandardMaterial` suffices

### 6.3 In React

- ❌ Inline object/array props (causes child re-render)
- ❌ Anonymous function props without `useCallback`
- ❌ Large `useEffect` dependency arrays
- ❌ Reading scroll position in component body (use IntersectionObserver instead)

---

## 7. Performance Test Checklist

Pre-launch:

- [ ] `pnpm next build` succeeds
- [ ] Bundle analyzer no chunk > 80KB
- [ ] First-load JS ≤ 200KB
- [ ] First-load CSS ≤ 30KB
- [ ] Lighthouse mobile (lab, simulated 4G) ≥ 85
- [ ] Lighthouse desktop ≥ 95
- [ ] LCP mobile ≤ 2.5s, desktop ≤ 1.5s
- [ ] CLS ≤ 0.05 across all sections (test with Layout Shift highlighter)
- [ ] No console errors
- [ ] 60fps scroll desktop
- [ ] 30fps scroll mobile (acceptable)
- [ ] 3D scene mounts < 300ms after hydrate
- [ ] Hover/click interactions < 100ms response

Post-launch:

- [ ] RUM data shows p75 LCP within budget
- [ ] No regression vs pre-launch baseline
- [ ] CDN/edge cache hit rate > 90%

---

## 8. Performance Debt / Known Trade-offs

- **CRT post-FX** adds ~4ms/frame on desktop. Mitigation: default OFF mobile, toggle.
- **Vertex jitter shader** adds tiny GPU work, but visible on 3 scenes simultaneously could compound. Mitigation: only mascot has jitter at all times; cartridges + crystal have it conditionally on hover.
- **Boot sequence** delays first interaction by 1.6s on first visit. Mitigation: localStorage skip + `?nb=1` URL param.
- **6 cartridge cards** with 3D would cost ~24ms/frame on mobile (6 canvases). Mitigation: top 3 = 3D, bottom = SVG.

---

## 9. Bundle Analysis Workflow

```bash
# Install
pnpm add -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
module.exports = withBundleAnalyzer(nextConfig);

# Run
ANALYZE=true pnpm next build

# Open the visualizer
open .next/analyze/nodejs.html
```

Identify:
- What's in first-load chunk?
- Any duplicate React versions?
- Anything > 80KB that should be code-split?

---

## 10. Lighthouse CI (Optional)

```yaml
# .github/workflows/lighthouse.yml (optional, for PRs)
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @lhci/cli
      - run: lhci autorun --config=.lighthouserc.json
```

`.lighthouserc.json`:
```json
{
  "ci": {
    "collect": { "url": ["http://localhost:3000"], "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }]
      }
    }
  }
}
```

---

## 11. Mobile-Specific Tactics

- 3D Canvas DPR clamped to `[1, 1.5]` (vs desktop `[1, 2]`)
- CRT post-FX OFF default
- Cartridge SVG-only on mobile (override `use3D: true` to false on small viewport)
- Pause Menu lazy-loaded on hamburger click
- Scroll listener throttled (or use IntersectionObserver instead)
- No infinite-loop animations in viewport
- Reduce font weights loaded on mobile (skip 700 if not used in mobile layout)

---

## 12. Performance Backlog

Items deferred to v2 polish (post-launch):

- ☐ Service Worker for offline-first
- ☐ Web Workers for color audit / heavy processing
- ☐ Image LQIP placeholder generation
- ☐ Critical CSS extraction (above-fold only)
- ☐ Preact compat swap (untested risk, save for later)
- ☐ Edge function for last-commit (instead of ISR)

---

> Performance is a feature. Run Lighthouse before merge, every time.
