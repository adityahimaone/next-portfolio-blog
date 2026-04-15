
# Stack Audit & Upgrade Plan

## Current Versions

| Package | Current | Latest (Apr 2026) | Status |
|---------|---------|-------------------|--------|
| next | 15.1.11 | 15.3.x | ⚠️ Minor behind |
| react | 19.0.0 | 19.x | ✅ Latest |
| tailwindcss | 4.0.0 | 4.1.x | ⚠️ Minor behind |
| @tailwindcss/postcss | 4.0.0 | 4.1.x | ⚠️ Minor behind |
| typescript | 5.x | 5.8.x | ✅ Good |
| motion | 11.15.0 | 12.x | ⚠️ Major behind |
| lucide-react | 0.468.0 | 0.487+ | ⚠️ Minor behind |
| @next/mdx | 14.2.13 | 15.x | ❌ Outdated |
| @mdx-js/loader | 3.0.1 | 3.1+ | ⚠️ Minor behind |
| tone | 15.1.22 | 15.x | ✅ Good |
| next-themes | 0.4.4 | 0.4.6 | ⚠️ Minor |

## Issues Found

### Critical
1. **`@next/mdx` at 14.x** — Should be 15.x to match Next.js 15. This is a version mismatch.
2. **`tailwind.config.js` still exists** — Running Tailwind v4 with v3 config file via `@config` compat shim.
3. **`motion` at 11.x** — Framer Motion renamed to `motion` at v12. v11 is the old framer-motion.

### Moderate
4. **`next.config.mjs` uses `images.domains`** — Deprecated, should use `remotePatterns`.
5. **`tailwindcss-animate`** — This plugin may not be fully compatible with Tailwind v4.
6. **Mixed CSS approach** — globals.css has both `@theme` (v4) and `:root` CSS vars (v3 pattern).

### Minor
7. **`page.tsx` is `'use client'`** — Entire homepage is client-rendered. Could benefit from splitting server/client components.
8. **No TypeScript strictness issues** — tsconfig looks clean.
9. **ESLint config** — Using flat config (good), but verify all plugins are compatible.

## Tailwind v4 Migration — What Needs to Change

### Remove
- `tailwind.config.js` — delete entirely
- `@config "../tailwind.config.js"` — remove from globals.css
- `tailwindcss-animate` — replace with native CSS or v4-compatible approach
- `require('tailwindcss/lib/util/flattenColorPalette')` — no longer needed

### Move to `@theme` in globals.css
All custom config from tailwind.config.js should be expressed in CSS:

```css
@theme {
  /* Colors */
  --color-primary: #273281;
  --color-primary-light: #3a4699;
  --color-primary-dark: #1e2866;
  --color-secondary: #3d468b;
  --color-secondary-light: #505aa3;
  --color-secondary-dark: #333b74;
  --color-accent: #e6a817;
  --color-accent-light: #f2bc36;
  --color-accent-dark: #cc920a;
  --color-vinyl: #191f47;
  --color-vinyl-groove: #2b335e;
  --color-vinyl-label: #fef3c7;

  /* Animations */
  --animate-spin-slow: spin 4s linear infinite;
  --animate-float: float 6s ease-in-out infinite;
  --animate-wave: wave 2.5s ease-in-out infinite;
  --animate-equalizer-1: equalizer 1.5s ease-in-out infinite;
  --animate-equalizer-2: equalizer 1.7s ease-in-out 0.2s infinite;
  --animate-equalizer-3: equalizer 1.9s ease-in-out 0.4s infinite;
  --animate-aurora: aurora 60s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
/* ... etc */
```

### Keep
- `@import 'tailwindcss'` — standard v4 import
- `@plugin '@tailwindcss/typography'` — still valid v4 syntax
- `@custom-variant dark` — v4 custom variant
- `@layer base/components/utilities` — still valid
- CSS custom properties in `:root` / `.dark` — still needed for theme switching

## Upgrade Commands

```bash
# Update core
pnpm up next@latest react@latest react-dom@latest

# Update Tailwind ecosystem
pnpm up tailwindcss@latest @tailwindcss/postcss@latest @tailwindcss/typography@latest

# Update motion (framer-motion → motion)
pnpm up motion@latest

# Update MDX
pnpm add @next/mdx@latest @mdx-js/loader@latest @mdx-js/react@latest

# Update others
pnpm up lucide-react@latest next-themes@latest tone@latest

# Dev deps
pnpm up -D typescript@latest eslint@latest eslint-config-next@latest prettier@latest
```

## After Upgrade — Must Test

- [ ] Build passes (`pnpm build`)
- [ ] Dev server works (`pnpm dev`)
- [ ] Dark/light toggle works
- [ ] Spotify integration still works
- [ ] Animations render correctly
- [ ] No console errors
- [ ] Mobile responsive still works

## Recommended Stack (Post-Refactor)

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Next.js 15.3 | App Router, Server Components |
| Styling | Tailwind CSS 4.1 | Native @theme, no config file |
| UI Library | Radix UI (via shadcn/ui) | Only if needed, otherwise raw |
| Animation | Motion 12 | Framer Motion successor |
| Icons | Lucide React | Tree-shakeable |
| Theme | next-themes | Class-based dark mode |
| Blog | gray-matter + next-mdx-remote | Markdown → MDX rendering |
| Music | Tone.js 15 | Audio synthesis |
| Linting | ESLint 9 + Prettier | Flat config |
| Deploy | Vercel | Optimal for Next.js |
