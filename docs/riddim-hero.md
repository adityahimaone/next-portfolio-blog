# RIDDIM hero — "The machine is the page"

The landing hero is the RIDDIM SUPERTONE from the two reference photographs,
cloned at the coordinates measured off the front view, upright and full bleed.
The section's height **is** the clone's height: scrolling is walking down the
machine's face, from the port strip and the wordmark, past the screen that
prints `ADITYA HIMAWAN`, and down the console — where the nine numbered pads
and the right-hand caps **are** the site's navigation. The About band begins at
the machine's bottom edge, so there is no dead scroll between the two.

No canvas, no WebGL, no pinning: one SVG for the panel, one HTML block for the
screen's type, and a scroll bridge that writes numbers.

## Files

All the hero's code is in `features/landing-page/components/riddim-hero/`.

| File                     | What it is                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `riddim-geometry.ts`     | The clone, transcribed: every cap, pad, knob, label and colour in reference pixels, plus the control-id helpers.   |
| `riddim-content.ts`      | The software: the copy, the screen's wording, and `MACHINE_NAV` — the table that joins a control to a destination.  |
| `riddim-choreography.ts` | The whole scroll story as one pure function, `riddimFrame(progress)`, plus the counter.                            |
| `riddim-device.tsx`      | The machine: the panel SVG, the screen, the glyph library, the controls as links and buttons.                      |
| `riddim-hero.tsx`        | The section, and the two viewport facts that decide who owns the copy and the links.                               |
| `use-riddim-hero.ts`     | Scroll bridge: one ScrollTrigger → CSS custom properties on the hero. Pointer parallax for the sheen.              |
| `riddim-hero.module.css` | All visual maths (`rotate(calc(var(--r-controls) * var(--sweep) * 1deg))` etc.).                                   |
| `*.test.ts(x)`           | Choreography invariants, the nav/geometry join, counter digits, server render.                                    |

The About band keeps its opening frame tight via `--about-pad-top` and friends on
`.root` in `rack-01/rack-01.module.css`; the hero no longer reads those tokens,
but it does end exactly where they begin, so they stay tuned together.

## How the clone is built

- **One coordinate space.** Everything on the panel is drawn in
  `viewBox="0 0 952 1317"` — the device's bounding box in the reference front
  view — so a number in `riddim-geometry.ts` is a number on the photograph.
- **One scale.** `.machine` is an inline-size container with `aspect-ratio:
  952 / 1317`, and `--u: calc(100cqw / 952)` is one clone unit. Everything
  printed on the machine, including the HTML type on the fascia and the screen,
  is `calc(<native units> * var(--u))`, so the whole object scales as one thing.
  Its width is `min(100%, 2.6 screens of height)`, so it is full bleed on
  ordinary screens and stops growing on ultrawide ones.
- **Colours are sampled, not mixed.** `PALETTE` holds the values pulled out of
  the reference crops: cream that is never white, green that is nearly black,
  and one orange used only on the controls that do something.
- **No rotation.** The clone is upright, which is what keeps every measured
  coordinate a coordinate. The composition problem a portrait machine poses in
  a landscape viewport is solved by scale and scroll, not by turning the object.

## The machine as navigation

`MACHINE_NAV` is the single place the site and the hardware meet. Each entry
names a control id (`live-sound`, `pad-7`, `right-record`), the word printed on
it, and the line the screen prints while it is armed. The ids are derived from
the clone table (`capId(zone, cap)`, `padId(pad)`), and a test asserts that
every entry resolves to a control the geometry actually draws.

Three tiers, because that is how the hardware is laid out:

| Tier | Controls | Destinations |
| --- | --- | --- |
| Primary | the LIVE row's top line | Work, Profile, Résumé |
| Index | the nine numbered pads, with their names in the reference's own label rows | Work, Projects, Notes, Mixtape, Bookmarks, Profile, Contact, Résumé, Email |
| Utilities | the right-hand cap column | Résumé (RECORD), Email (SAMPLE), copy link (SHOP → SHARE), light/dark (TIMING/CORRECT), RSS (FX), back to top (ERASE) |

Hovering or focusing any of them arms it: its lamp goes to full and the screen
prints its name and note. That is the only React state on the machine, and it is
off the scroll path.

Controls that are not destinations stay drawings — the rest of the panel, the
knobs, the fader, the instrument bank, `EDIT`/`COMMIT`/`LOOP`, `PLAY`, and the
port strip.

## Choreography

The hero is as tall as the machine, so progress 0 is the machine's top edge at
the top of the viewport and progress 1 is its bottom edge at the bottom — the
frame the About band arrives in.

| Progress   | Phase                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- |
| 0.00–0.16  | Power: the power LED and the panel come up to full                                         |
| 0.05–0.80  | Controls: both knobs turn and the fader slides with the scroll                             |
| 0.12–0.58  | Meter: the parameter LEDs step on, one after another, down the pad field                   |
| 0.20–0.68  | Ink: the screen's glyph field lights, in sequence                                          |
| 0.20–0.66  | Readout: the seven-segment counter runs 01.12 → 04.16                                      |
| 0.34–0.90  | Play: the pads ripple, each on its own beat                                                |
| 0.84–1.00  | Handoff: the console's bottom label row turns into `NEXT / 02 / PROFILE`                    |

Everything is a pure function of progress: scrolling back renders the identical
frame at the identical position.

## Contracts worth knowing

- **The hero's height is the machine's height.** There is nothing to pin and
  nothing to measure, `end: 'bottom bottom'` is the whole geometry, and the
  handoff finishes exactly at progress 1 — anything still animating there is a
  frame nobody sees. The top bar sits in flow above the machine, which is the
  only thing between the page's top and the clone's top edge.
- **The clone table owns the HTML's numbers.** The fascia copy and the screen's
  `h1`/role/readout are positioned from `COPY_BLOCK` and `SCREEN_UI`, passed
  into CSS as `--copy-*` and `--scr-*`. The geometry's `y` values are SVG
  baselines; the component converts them to line-box tops once.
- **Controls are SVG.** Links are `<a>` (via `next/link` for routes, which does
  work inside SVG and keeps navigation client-side); the four actions are
  `<g role="button" tabindex="0">` with Enter/Space handlers, because a
  `<button>` cannot live in the SVG namespace. Focus is drawn by a `.ring` in
  each control's own shape, and every control carries an `aria-label` of
  `"<destination> — <note>"`.
- **Only one navigation is ever live.** The machine's controls are the nav from
  769px up; below that a 84-unit pad is 34px, so the links move to `.stack`
  under the poster and the machine goes back to being a drawing. Below 1181px
  the copy moves there too, because the machine's own headline scales under
  ~34px. Both facts are read after mount, so the server output — the stack,
  which works everywhere — is also what a client without JS keeps. `HeroIndex`
  renders the index only when the machine is not interactive, so there is never
  a duplicate navigation in the accessibility tree.
- **Live vs static.** The motion runs only at `min-width: 769px` with
  `prefers-reduced-motion: no-preference`; otherwise `.hero` takes the finished
  values (powered, lamps up, screen lit, counter run to the end) and the hook
  downloads nothing. If the GSAP import fails the hook sets
  `data-live="failed"`, which does the same.

## Tuning

- Timing: `RIDDIM_PHASES` in `riddim-choreography.ts`.
- Counter range: `RIDDIM_COUNTER`. Readout format: `counterDigits`.
- Machine scale: `--max-screens` on `.hero` (`2.6` = the tallest the machine may
  stand in viewport heights).
- A destination: one entry in `MACHINE_NAV`. Its printed word changes with it,
  and if the id is wrong the nav test fails.
- Machine geometry or colour: `riddim-geometry.ts` only.

## QA checklist (not run in CI)

- [ ] Desktop 1440×900: power → controls → meter → ink → readout → handoff, smooth both directions.
- [ ] Scroll to the bottom: the machine's label row reads `NEXT 02 PROFILE` and About arrives in the next frame, with no gap.
- [ ] Hover and tab through every armed control: the screen prints its name, its lamp goes to full, the focus ring is visible on the control's own shape.
- [ ] A route pad (`/projects`, `/blog`, `/music`, `/bookmarks`) navigates without a full page load.
- [ ] LIGHT / DARK caps switch the theme; SHARE copies the URL; TOP returns to the top.
- [ ] 769–1180px: the copy moves to the stack, the machine keeps its links, nothing collides.
- [ ] ≤768px and `prefers-reduced-motion`: the whole machine fits one screen, the stack carries the copy and the index, no duplicate nav.
- [ ] Safari and Firefox: `cqw` sizing, `aspect-ratio`, SVG `<a>` focus rings, `color-mix`.
- [ ] Lighthouse: LCP is the server-rendered machine; no layout shift when the layout flags settle.

## Not done / optional follow-ups

- The clone is a clone of a *design*, not a photograph: the wordmark and the pad
  numerals are the site's display face with a stroke for weight, not traced.
- The screen's glyph field is the reference's shapes and palette, re-laid; it is
  texture, not a one-to-one transcription of the icons.
- The primary three repeat inside the index on purpose (quick caps plus the
  numbered map). If the tab order ever feels long, drop the duplicates from the
  index rather than from the caps.
- No sound. A tick per pad hit would suit the machine.
- The old Pad Sea hero (`components/hero/pad-sea`, `use-hero-motion.ts`, the
  `hero*` classes in `rack-01.module.css`, `chapters/hero`, `lib/hero-sweep-order.ts`)
  remains unused; delete in a separate commit.
