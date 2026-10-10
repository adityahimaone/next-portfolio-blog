# DAP hero — "The DAP, Disassembled"

The landing hero is a digital audio player floating in a dark studio. Scrolling
takes it apart layer by layer, labels what each layer is, puts it back together,
then falls into its own OLED — which opens onto the About section.

Built from DOM planes in CSS 3D (no three.js / WebGL), so the first paint is the
assembled player, server-rendered, and nothing heavy ships.

## Files

All new code is in `features/landing-page/components/dap-hero/`.

| File                  | What it is                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `dap-choreography.ts` | The whole scroll story as one pure function, `dapFrame(progress)`, plus the portal geometry. Tune timing here. |
| `dap-content.ts`      | Copy (cover text, track, layer tags, keys) and the OLED's geometry (`SCREEN`). Edit copy here.                 |
| `use-dap-hero.ts`     | Scroll bridge: one ScrollTrigger → CSS custom properties on the stage. Pointer parallax. Measures the portal.  |
| `dap-hero.tsx`        | Markup: six layers, tags, side keys, rail, portal.                                                             |
| `dap-hero.module.css` | All visual maths (`translateZ(var(--z) * var(--dap-explode))` etc.).                                           |
| `*.test.ts(x)`        | Choreography invariants + server-render smoke test.                                                            |

Touched elsewhere:

- `rack-01/section-hero.tsx` — now just `<DapHero />`. It carries none of the old
  `data-anim` hooks, so `chapters/hero/hero-chapter.ts` stands down on its own
  (it bails on a missing `[data-anim="hero-section"]`).
- `rack-01/use-rack-animations.ts` — the legacy engine does `if (!hero) return`
  inside its desktop block, which would have skipped the about / skills / seam
  timelines. The hero part is now `if (hero) { … }`. The diff is large only
  because of re-indentation: review it with `git diff -w`.

## Choreography

Hero section is `DAP_SCROLL_SVH = 340` tall; the stage pins for the 240svh of
scroll beyond its first screen.

| Progress   | Phase                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 0.00–0.10  | Idle: player floats, LCD playing, pointer parallax                                             |
| 0.10–0.46  | Explode: six layers separate along Z, body tilts, cover copy and keys step aside               |
| 0.30–0.46  | Tags fade in, one per layer (Interaction / Interface / Systems / Range / Origin)               |
| 0.44–0.66  | A pulse runs the PCB trace (input → DAC → amp)                                                 |
| 0.66–0.80  | Reassemble: layers return, tilt and bob settle                                                 |
| 0.74–0.82  | OLED flips from black to the About surface                                                     |
| 0.82–0.985 | Portal: a clip window opens from the OLED's rect to the full stage while its contents zoom 1:1 |

Everything is a pure function of progress: scrolling back renders the identical
frame at the identical position. The OLED playhead is the scroll — the track
"ends" as the portal opens.

## Contracts worth knowing

- **3D flattening.** `preserve-3d` is silently dropped by `opacity`, `filter`,
  `overflow`, `mask`, `clip-path` on an ancestor. Never put those on `.layer`,
  `.device` or `.float`; they live on `.face` and on leaf `.tag`s.
- **The measured box.** `.slot` has no transform on it or above it, so its rect
  is the device's rest position at any scroll. `SCREEN` fractions are applied to
  that rect to place the portal's start window — the same constants the CSS uses.
- **Seam.** `.portalInner` uses the same background recipe as `.about`
  (28px grid on `--chassis-hi`). If About's background changes, change both.
- **Live vs static.** The motion runs only at `min-width: 769px` with
  `prefers-reduced-motion: no-preference`. Otherwise the stylesheet makes a
  normal one-screen hero (stacked on phones) and the hook downloads nothing.
  If the GSAP import fails, the hook sets `data-live="failed"` and the section
  collapses to one screen.
- **Keys** are the hero's real links (Work, Notes, Résumé). They are hidden —
  visibility, so also out of the tab order — while the player is taken apart.
  The "About Aditya" rail link and the page skip link still work.

## Tuning

- Timing: `DAP_PHASES` in `dap-choreography.ts`.
- Explode depth / spread: each layer's `--z` / `--dy` in the stylesheet; tilt in `DAP_TILT`.
- Scroll length: `DAP_SCROLL_SVH`.
- Player size: `--dh` on `.stage`. Perspective: `--persp`.

## QA checklist (not run in CI)

- [ ] Desktop 1440×900: idle → explode → tags → reassemble → portal → About, smooth both directions.
- [ ] Scroll back up from inside About: the portal closes onto the OLED exactly (no jump).
- [ ] Resize mid-scroll and after load: portal still starts exactly on the OLED.
- [ ] 769–1120px: tags drop their notes and stay on screen.
- [ ] ≤768px and `prefers-reduced-motion`: static hero, links work, no console errors.
- [ ] Safari and Firefox: `preserve-3d` ordering of the six layers, `color-mix`, `cqw`.
- [ ] Light and dark theme: portal surface equals About surface at the seam.
- [ ] Lighthouse: LCP is the server-rendered player; no new layout shift.

## Not done / optional follow-ups

- The old Pad Sea hero (`components/hero/pad-sea`, `use-hero-motion.ts`, the
  `hero*` classes in `rack-01.module.css`, `chapters/hero`, `lib/hero-sweep-order.ts`)
  is now unused. Delete in a separate commit once the new hero is signed off.
- No sound. A toggle that plays a tick per layer on explode would fit.
- Mobile gets the static player; a tap-to-explode variant is possible.
