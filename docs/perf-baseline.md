# Performance baseline — landing page

Measured before the 3D motion redesign begins, so every
phase has something to be compared against. Re-measure
after each phase with the same recipe.

## Recipe

- **Lighthouse:** `pnpm build && npx next start -p 3000`,
  then Lighthouse (Chrome 129, macOS, throttled) on `/`:
  mobile (4x CPU slowdown, Slow 4G) and desktop profiles,
  3 runs each, median recorded.
- **Trace:** Chrome Performance panel, one full scroll
  Hero → Contact at 60px/frame; record long tasks and
  Layout Shifts.
- **Bundle:** `npx next build` output (per-route JS) and
  `@next/bundle-analyzer` for the landing page chunks.
- **INP:** the trace's Interaction to Next Paint for the
  scroll gesture; pointer parallax is rAF-throttled and
  writes CSS variables only, so it should not register.

## What is measured

| Metric | Mobile | Desktop | Notes |
|---|---|---|---|
| LCP | _to fill_ | _to fill_ | Must stay a text element (the hero panel's h1/tagline). WebGL, if added in Phase 2, mounts after LCP via `requestIdleCallback` and only when in view. |
| CLS | _to fill_ | _to fill_ | Target 0. The work section's height is applied post-mount (existing behaviour); the radio flip reuses that pattern and reserves its canvas size in CSS. |
| INP | _to fill_ | _to fill_ | Pointer parallax writes CSS variables only; scroll timelines are GSAP-scrubbed transforms. |
| JS transferred | _to fill_ | _to fill_ | GSAP + Lenis are dynamic imports inside `use-rack-animations.ts`; nothing new lands on the critical path. |
| Long tasks (>50ms) during full scroll | _to fill_ | _to fill_ | The flip window (260vh) is the hot path: transforms and opacity only, no filter/blur in the scrub. |

## Guardrails the redesign must hold

1. **LCP stays text.** The hero editorial panel is the LCP
   element before and after every phase.
2. **No new JS on the critical path.** Tier 2 WebGL (Phase 2)
   is a lazy `dynamic(..., { ssr: false })` chunk with a
   static poster behind it.
3. **Reduced motion is free.** `prefers-reduced-motion` skips
   the engine entirely — no Lenis, no GSAP, no timelines —
   which the baseline should confirm as the cheapest path.
4. **The flip is transform-only.** Rotation, z, scale, y,
   width on the cassette (matching the legacy seam's cost
   profile), and two style writes per frame (`--angle`,
   face `inert` toggles at 90° crossings only).

## Known pre-existing items (not caused by the redesign)

- `tests/use-list-keys.test.tsx` fails in this environment:
  React 19.3 / `@testing-library/react` 16.3 `React.act`
  incompatibility — pre-existing on `main`, unrelated to the
  landing page.
- ESLint carries pre-existing debt in files outside the
  landing page (`top-bar`, `work-archive`, and the legacy
  `set-state-in-effect` / `refs` patterns in
  `work.tsx` that predate this work). The chapter files and
  the radio flip files lint clean.

## Phase checkpoints

- **Phase 0 (foundations):** same visuals, new structure —
  Lighthouse within noise of the numbers above; e2e green.
- **Phase 1 (radio flip):** no long task >50ms inside the
  260vh flip window; LCP unchanged; CLS unchanged.
- **Phase 2 (hero):** LCP not worse; WebGL chunk loaded
  after LCP and only when the hero is on screen.
- **Phase 3 (transitions):** each chapter's timeline adds
  no layout passes (transform/opacity only).
- **Phase 4 (polish):** final Lighthouse + trace report
  recorded here, or the gap documented.
