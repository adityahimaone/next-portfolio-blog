# Hero redesign - four concepts

Four independent design specs for replacing `features/landing-page/rack-01/section-hero.tsx`. Each is a complete, self-contained brief: design read, dials, palette mapping, typography, layout, scroll choreography, code, performance budget, accessibility, acceptance criteria.

None of them reuse the existing hero's concept: no device wall, no pad sea, no broken-light tubes, no rack-collapse chapter. All four keep the SIGNAL palette from `app/globals.css` unchanged, reuse the existing stack (`three`, `@react-three/fiber`, `gsap`, `motion`, `lenis`), add no dependencies, and preserve the `data-anim` hooks that `use-rack-animations.ts` queries for the bottom rail and the About handoff.

| # | Concept | One-line | Dials (V/M/D) | Camera move | Idle motion |
| --- | --- | --- | --- | --- | --- |
| 2 | [Frequency Landscape](frequency-landscape.md) | A 3D terrain whose elevation is the audio spectrum; the camera flies the surface | 7 / 9 / 3 | Dolly forward through the ridge | Ridge pulse at 120 BPM |
| 6 | [Wireframe Booth](wireframe-booth.md) | A single listening room drawn in one line; the camera pushes in toward the chair | 8 / 8 / 2 | Push in on a CatmullRom curve | Room rotation, speaker pulse |
| 3 | [Headshell Reveal](headshell-reveal.md) | A chrome tonearm swings in, the needle lands, rings bloom, the headline types | 7 / 8 / 3 | None; the arm moves | Needle tip pulse at 120 BPM |
| 5 | [Mastering Console](mastering-console.md) | A channel strip photographed from a low angle; scroll dollies right along it | 8 / 7 / 4 | Lateral dolly along the strip | VU needle breath, fader pulse |

## Shared decisions

- **Palette.** `--primary` signal orange, `--secondary` LCD green, `--accent` warm gold, `--lcd-bg` / `--lcd-text`, all read from the existing tokens. No new colour is introduced except per-concept surface values (`--terrain-*`, `--aluminium`, `--desk*`, `--rail`), each defined as one stop off an existing token.
- **Type.** Syne display, Space Grotesk heads, Geist body, Geist Mono silkscreen, Orbitron meters. Every family is already loaded in `app/layout.tsx`. No new font.
- **Motion.** `transform` and `opacity` only on DOM overlays. Scroll drives one continuous camera move per concept via a single `ScrollTrigger` writing into refs, read in `useFrame`. No `window.addEventListener('scroll')`. No re-renders on scroll.
- **Capability gate.** One `decideRuntime()` per concept, same inputs as `pad-sea.tsx`: `prefers-reduced-motion`, `saveData`, a WebGL probe. Failing any of them renders a real static SVG composition, not an apology.
- **Reduced motion.** Every concept has a named reduced-motion composition that is still art-directed (concept 5's is the full desk at rest; concept 3's is the arm at the impact point). Fewer and gentler, never zero.
- **Performance.** R3F trees are `next/dynamic` imported, `frameloop` swaps to `never` when the hero is off-screen, DPR clamped to `[1, 2]`, and every concept states a draw-call and frame-time budget.
- **Existing hooks.** `useRackAnimations` keeps working: `data-anim="hero-section"`, `hero-panel`, `hero-rail`, `hero-atmosphere`, `hero-boot`, `hero-handoff` are all preserved on the new components.

## Pick order

If only one ships, the order of confidence is: 5 (Console), 3 (Headshell), 2 (Landscape), 6 (Booth).

- **5** has the strongest tie to the existing brand system (silkscreen type is already the page's voice) and the safest performance profile.
- **3** has the strongest single gesture and the clearest brand mark (the orange cantilever).
- **2** is the most cinematic but leans on synthetic data that the page does not yet own.
- **6** is the most distinctive and the cheapest to render, but a wireframe room is the furthest from the brand's warm-aluminium material language.
