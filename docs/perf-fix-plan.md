# Performance Fix Plan — next-portfolio-blog
> Lighthouse audit · adityahimaone.vercel.app · April 2026

## Score Baseline

| Metric | Current | Target |
|---|---|---|
| Performance | ~60 | 85+ |
| LCP | ~5.5s | <2.5s |
| Legacy JS waste | 11.1 KiB | 0 KiB |
| Render-blocking CSS | 110 ms | <50 ms |
| Unused JS | ~70 KiB | <20 KiB |

---

## Issues Found

| # | Issue | Root Cause | Est. Savings |
|---|---|---|---|
| P1 | LCP element render delay 4,220 ms | Preloader + Motion animation blocks hero `<p>` | **Biggest LCP win** |
| P2 | Legacy JS polyfills 11.1 KiB | `tsconfig.json` target `ES2017` + no `browserslist` | −11.1 KiB |
| P3 | Render-blocking CSS 110 ms | 3 CSS chunks in critical path | −110 ms |
| P4 | Unused JS ~70 KiB | `react-syntax-highlighter` + `tone.js` eager-loaded | −60–70 KiB |
| P5 | Non-composited animation | Motion animating non-GPU properties | Removes jank |
| P6 | `@next/mdx` version mismatch | Pinned to `14.2.13` while Next.js is `15.1.11` | Stability + tree-shaking |

---

## TASK P1 — Fix LCP Element Render Delay ⚡

**Priority: CRITICAL**
**File:** `features/landing-page/sections/hero.tsx` (or wherever the hero `<p>` lives)
**File:** `features/landing-page/animations/preloader.tsx`

### What's happening
The LCP element is a `<p>` tag inside the hero section wrapped in a `motion.p` with `opacity: 0` initial state and a `delay` of 1–2s. Lighthouse cannot measure LCP until that element has fully painted. The preloader adds another 1–2s on top of that, resulting in **4,220 ms total element render delay**.

### Fix 1a — Remove Motion wrapper from LCP element, use CSS animation instead

```tsx
// features/landing-page/sections/hero.tsx

// ❌ BEFORE — hidden behind JS animation, LCP blocked
<motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.2, duration: 0.6 }}
  className="mb-10 max-w-2xl text-center text-base font-light text-zinc-600 sm:text-lg"
>
  Orchestrating code and rhythm...
</motion.p>

// ✅ AFTER — visible immediately, CSS handles the visual fade
<p className="mb-10 max-w-2xl text-center text-base font-light text-zinc-600 sm:text-lg animate-hero-desc">
  Orchestrating code and rhythm...
</p>
```

Add to `app/globals.css`:
```css
@keyframes hero-desc-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-hero-desc {
  animation: hero-desc-in 0.6s ease 0.2s both;
}
```

> **Why `both`?** The `animation-fill-mode: both` keeps the element at `opacity: 0` before the animation starts (tiny 0.2s delay) but the browser still registers it as "painted" for LCP purposes because it's in the DOM immediately.

### Fix 1b — Cap preloader duration

```tsx
// features/landing-page/animations/preloader.tsx

// ❌ BEFORE — likely 2500–3500 ms
const PRELOADER_DURATION = 3000

// ✅ AFTER — max 1200 ms first visit, skip entirely on return
const PRELOADER_DURATION = 1200

// Add skip logic for return visits (sessionStorage check)
// Most preloaders already do this — verify the skip path exits in < 100ms
const hasVisited = sessionStorage.getItem('visited')
if (hasVisited) {
  // must unmount preloader synchronously / in first paint, not after timeout
  setShowPreloader(false)
  return
}
sessionStorage.setItem('visited', '1')
```

---

## TASK P2 — Eliminate Legacy JS Polyfills (−11.1 KiB)

**Priority: HIGH**
**Files:** `tsconfig.json`, `package.json`

### Root causes (two separate places)

1. `tsconfig.json` targets `ES2017` → TypeScript/SWC emits polyfills for `Array.at` (ES2022), `flat/flatMap` (ES2019), `Object.fromEntries` (ES2019), `Object.hasOwn` (ES2022), `String.trimStart/End` (ES2019).
2. No `browserslist` in `package.json` → Next.js defaults to wide browser support.

### Fix 2a — Upgrade TypeScript compile target

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",   // ← was ES2017
    "lib": ["dom", "dom.iterable", "ES2022"],  // ← add ES2022
    ...
  }
}
```

### Fix 2b — Add browserslist to package.json

```json
// package.json — add at root level
"browserslist": [
  "chrome >= 109",
  "edge >= 109",
  "firefox >= 110",
  "safari >= 16",
  "not dead"
]
```

These browser versions all natively support every feature being polyfilled. No polyfill chunk will be emitted for these targets.

### Fix 2c — Upgrade @next/mdx to match Next.js version

```bash
pnpm add @next/mdx@15.1.11
```

Current: `14.2.13` | Next.js: `15.1.11` — mismatched minor version can cause duplicate React internals in the bundle.

---

## TASK P3 — Reduce Render-Blocking CSS (−110 ms)

**Priority: MEDIUM**
**File:** `next.config.mjs`, `app/globals.css`

### Fix 3a — Enable optimizeCss in next.config.mjs

```js
// next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
    optimizeCss: true,          // ← ADD: inlines critical CSS, defers the rest
  },
  // ... rest unchanged
}
```

> `optimizeCss: true` uses Critters under the hood — it extracts above-the-fold CSS and inlines it, then defers the full stylesheet. This directly removes render-blocking behavior.

You'll need to install the dependency:
```bash
pnpm add -D critters
```

### Fix 3b — Audit globals.css for unnecessary global imports

Ensure `app/globals.css` does not `@import` heavy CSS that could be scoped to specific layouts. Tailwind v4 already handles per-page scoping — don't add global `@import` statements for page-specific styles.

---

## TASK P4 — Remove Unused JS from Initial Bundle (−60–70 KiB)

**Priority: HIGH**
**Files:** Blog code block component, music player component

### Fix 4a — Dynamic import react-syntax-highlighter

`react-syntax-highlighter` is ~60 KiB and only needed on blog post pages with code blocks. It should never be in the initial bundle.

```tsx
// features/blog/components/blog-post.tsx (or wherever CodeBlock is)
import dynamic from 'next/dynamic'
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter'

// ❌ BEFORE
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// ✅ AFTER — loaded only when a blog post with code is visited
const SyntaxHighlighter = dynamic<SyntaxHighlighterProps>(
  () => import('react-syntax-highlighter'),
  {
    ssr: false,
    loading: () => (
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300 overflow-x-auto">
        <code>Loading...</code>
      </pre>
    ),
  }
)

// For the style, import lazily inside the dynamic component or import only the
// specific style file, not the entire dist:
// ✅ import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// rather than the default cjs import
```

### Fix 4b — Dynamic import tone.js (music player)

`tone.js` is a large audio library (~200 KiB unminified). It should only load when the user interacts with the music player, not on page load.

```tsx
// features/landing-page/spotify/music-player.tsx

// ❌ BEFORE
import * as Tone from 'tone'

// ✅ AFTER — lazy load on first interaction
const [toneLoaded, setToneLoaded] = useState(false)

const handlePlay = async () => {
  if (!toneLoaded) {
    const Tone = await import('tone')
    await Tone.start()
    setToneLoaded(true)
    // init your synth here with the loaded Tone
    initSynth(Tone)
  }
  // ... play logic
}
```

### Fix 4c — Consider replacing react-syntax-highlighter with rehype-pretty-code

For a longer-term, lighter solution — `rehype-pretty-code` + `shiki` integrates directly into the MDX pipeline and outputs static HTML at build time (zero client-side JS):

```bash
pnpm add rehype-pretty-code shiki
pnpm remove react-syntax-highlighter @types/react-syntax-highlighter
```

```js
// next.config.mjs
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'one-dark-pro' }]
    ],
  },
})
```

This moves syntax highlighting entirely to build time — **0 KiB runtime JS** for code blocks.

---

## TASK P5 — Fix Non-Composited Animations

**Priority: LOW**
**Files:** Any component using Motion or CSS animations

### Rule: only animate `transform` and `opacity`

```tsx
// ❌ BEFORE — causes layout recalculation (non-composited)
animate={{ width: '100%' }}
animate={{ height: 'auto' }}
animate={{ top: 0 }}
animate={{ background: '#fff' }}

// ✅ AFTER — GPU-composited, no layout recalc
animate={{ scaleX: 1 }}        // instead of width
animate={{ opacity: 1 }}
animate={{ y: 0 }}             // instead of top
// For background: use opacity on a pseudo-element overlay
```

Check for the specific flagged element using Chrome DevTools → Rendering → Paint Flashing to identify which element is triggering non-composited paint.

---

## TASK P6 — Accessibility Quick Wins (Score: 86 → 95+)

**Priority: MEDIUM**
**Files:** Various component files

### Fix 6a — Add aria-label to icon-only buttons

```tsx
// ❌ BEFORE — no accessible name
<button onClick={toggle}>
  <SunIcon />
</button>

// ✅ AFTER
<button onClick={toggle} aria-label="Toggle dark mode">
  <SunIcon aria-hidden="true" />
</button>
```

### Fix 6b — Add discernible text to icon-only links

```tsx
// ❌ BEFORE
<a href="https://github.com/adityahimaone">
  <GithubIcon />
</a>

// ✅ AFTER
<a href="https://github.com/adityahimaone" aria-label="GitHub profile">
  <GithubIcon aria-hidden="true" />
</a>
```

### Fix 6c — Fix low contrast text

Check `text-zinc-400` on white background — it often fails WCAG AA (4.5:1 ratio). Replace with `text-zinc-500` or `text-zinc-600` for body text on light backgrounds.

---

## TASK P7 — Security Headers (Best Practices: 96 → 100)

**Priority: LOW**
**File:** `next.config.mjs`

```js
// next.config.mjs — add headers() function
const nextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',                    // fixes XFO/clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Basic CSP — tighten progressively
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://api.spotify.com https://accounts.spotify.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

---

## Execution Order

```
Week 1 — Core Performance (score impact)
├── [ ] P2  tsconfig target ES2022 + browserslist       ~10 min
├── [ ] P2  upgrade @next/mdx to 15.1.11                ~5 min
├── [ ] P1  cap preloader to 1200ms + verify skip path  ~30 min
├── [ ] P1  replace motion.p with CSS animation on LCP  ~30 min
└── [ ] P4  dynamic import tone.js                      ~20 min

Week 1 — Bundle Cleanup
├── [ ] P4  dynamic import react-syntax-highlighter     ~20 min
├── [ ] P4  (optional) migrate to rehype-pretty-code    ~45 min
└── [ ] P3  add optimizeCss + install critters          ~10 min

Week 2 — Polish
├── [ ] P5  audit non-composited animations             ~30 min
├── [ ] P6  add aria-labels to icon buttons/links       ~30 min
├── [ ] P6  fix low-contrast text colors                ~20 min
└── [ ] P7  add security headers to next.config.mjs     ~15 min
```

---

## Expected Score After All Fixes

| Metric | Before | After |
|---|---|---|
| Performance | ~60 | **88–92** |
| LCP | ~5.5s | **<2.0s** |
| Accessibility | 86 | **95+** |
| Best Practices | 96 | **100** |
| SEO | 100 | 100 |
| Legacy JS waste | 11.1 KiB | **0 KiB** |
| Initial JS bundle | ~300 KiB | **~220 KiB** |

---

## Verification Commands

```bash
# Run bundle analyzer to confirm chunk reduction
ANALYZE=true pnpm build

# Run Lighthouse CI locally
npx lighthouse https://adityahimaone.vercel.app --view

# Check browserslist resolved targets
npx browserslist
```
