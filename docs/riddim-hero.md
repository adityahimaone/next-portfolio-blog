# RIDDIM hero — zoom out, swap, zoom in

The landing hero is a clone of the RIDDIM reference machine, and the scroll is a
camera move around it. You arrive inside the machine's screen, pull back to see
the whole machine, watch it press its own key and change screen, then fall back
into the new screen, which is the About section.

The machine is flat vector art (an SVG panel plus HTML type), so the camera is a
translate and a scale on it. No WebGL, no 3D.

## The story

The hero is a pinned stage: a section `RIDDIM_SCROLL_SVH` (480) tall holding a
sticky, viewport-sized `.stage`.

| Progress  | What happens                                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| 0.00–0.08 | Fullscreen title card, ADITYA HIMAWAN, glyph field booting                                                        |
| 0.08–0.20 | The letterbox closes onto the LCD band; fascia above and console below appear                                     |
| 0.20–0.42 | The camera pulls back to the whole machine                                                                        |
| 0.34–0.44 | Side panels come in: pitch and actions on the left, track list and signal chain on the right                      |
| 0.42–0.58 | Overview: pads ripple, the camera drifts in 6%                                                                    |
| 0.47–0.53 | PLAY goes down and comes back up                                                                                  |
| 0.50–0.56 | The LCD wipes from the title card to the profile card; the side panels follow (now playing, track marker 01 → 02) |
| 0.60–0.70 | Side panels leave                                                                                                 |
| 0.58–0.80 | The camera falls back into the screen                                                                             |
| 0.80–0.92 | The letterbox opens: the profile screen is the viewport                                                           |
| 0.90–0.98 | The backlight gives way to the page surface (`--chassis-hi` and the About grid)                                   |

## Files (`features/landing-page/components/riddim-hero/`)

| File                                                                                | What it is                                                                                                                                         |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `riddim-choreography.ts`                                                            | `riddimFrame(progress)`: every number the scene needs, as one pure function. Retime here (`RIDDIM_PHASES`, `RIDDIM_SCROLL_SVH`).                   |
| `riddim-camera.ts`                                                                  | `cameraAt`, `fillScale`, `bandInset`: the camera poses and the letterbox. Pure.                                                                    |
| `use-riddim-hero.ts`                                                                | One ScrollTrigger → CSS custom properties on `.hero`. Measures one number (the fill scale), writes the counter digits and three flags.             |
| `riddim-hero.tsx`                                                                   | Stage, rig, side panels, plane, and the phone stack.                                                                                               |
| `riddim-screen.tsx`                                                                 | The LCD as one component used twice: on the machine (`LcdFace`) and across the viewport (`PlaneScreen`). Two screens stacked, wiped by `--r-swap`. |
| `riddim-side.tsx`                                                                   | The side panels.                                                                                                                                   |
| `riddim-device.tsx`, `riddim-glyphs.tsx`, `riddim-geometry.ts`, `riddim-content.ts` | The clone, its glyph library, its measured coordinates, and its copy.                                                                              |
| `riddim-hero.module.css`                                                            | All visual maths.                                                                                                                                  |

## Contracts worth knowing

- **Two surfaces, one picture.** The plane lays the LCD, at its own 922:268
  proportions, across the full stage width. At `lens = 1` the camera has made the
  machine's LCD exactly that wide, so the plane's middle band and the LCD are the
  same picture and the hand-over cannot be seen. That is why `plane` is on
  exactly when `lens` is 1, and why the letterbox (`open`) is always closed when
  the camera is away. Both are pinned by tests.
- **`--u` must not be built from `cqw` in the pinned layout.** The machine is
  itself a query container, so the same token would mean something else inside it.
  `--mw` (machine width) is `vw`/`svh` based.
- **Camera in clone units.** `--cam-dx/dy` are in native units; the stylesheet
  multiplies by `--u`. Scale is interpolated in log space.
- **Seam into About.** After the flip the plane is `--chassis-hi` with the same
  28px grid as `.about`. If About's background changes, change `.plane` too.
- **Layout by media query alone.** LIVE is `min-width: 769px` with motion allowed;
  everything else (phones, reduced motion, a failed GSAP import) gets the finished
  machine in the flow of the page, with the copy and, on phones, the index in
  `.stack`. The side panels are hidden below 1181px.
- **Keyboard.** A control or side link that takes focus while the camera is on the
  screen sends the scroll to the middle of the overview. Off-screen side panels
  are `visibility: hidden`, so they are out of the tab order.
- **One `h1`.** The machine's own LCD carries it; the plane is `aria-hidden`.
- **No top bar.** The machine is the navigation (`MACHINE_NAV`); the site's dock
  stays.

## Tuning

- Timing: `RIDDIM_PHASES`. Length: `RIDDIM_SCROLL_SVH`.
- Overview size: `--mw` on `.stage` (0.88 of the viewport height).
- Dolly: `DRIFT` in `riddim-camera.ts`.
- Screen 2 copy: `SCREEN_COPY.second`. Side copy: `SIDE_COPY`.

## QA checklist (not run in CI)

- [ ] 1440×900: title card, letterbox, pull back, overview, press/swap, push in, open, flip, About. Smooth both ways.
- [ ] The hand-over at 0.20 and 0.80 shows no pop in the LCD.
- [ ] Resize mid-scroll: the fill scale re-measures.
- [ ] 1181–1280 wide: side panels fit; 769–1180: panels hidden, story still reads.
- [ ] Phone and reduced motion: static machine, stack, working links.
- [ ] Tab through the page: no focus lands on something off screen without the scroll following.
- [ ] Safari and Firefox: `color-mix`, `clip-path: inset()`, `cqw`.
- [ ] Zoom sharpness at 2.6× on a mid-range phone-class GPU; if soft, cross-dissolve to the plane earlier.

## Not done

- `three` and `@react-three/fiber` are still in `package.json`; nothing here imports them. Remove with the lockfiles in a separate commit.
- The reference's top-strip tabs are flat; the clone's are still outlined pills.
- Keycaps are close but not 1:1 (the reference's are flatter, with chunkier numerals).
