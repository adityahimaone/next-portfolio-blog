# RIDDIM hero — "The machine is the page"

The landing hero is the RIDDIM SUPERTONE from the two reference photographs,
cloned at the coordinates measured off the front view, upright and full bleed.

On a wide desktop it is also a scroll story that opens on **the top half of the
instrument** — the port strip, the RIDDIM header, the speaker, the lit screen
and the console's own row of knobs, down through `VOLUME … METRONOME` — so the
first thing the page shows is a real object rather than a rectangle of glass.
The screen's icon field boots **dark at 0%** and lights in sequence as the
machine comes up. Scrolling pulls a camera back until the whole instrument is
in frame, with printed columns either side annotating it while the pads play,
the PLAY key presses itself and the screen swaps; then the camera pushes back
into the LCD — now on the next chapter's plane — and the backlight flips from
green to the About band's cream, so the band begins exactly where the machine
ends. Below that width the story stands down and the machine is simply the
poster it has always been: scrolling walks down its face, from the port strip
and the wordmark, past the screen, and down the console — where the nine
numbered pads and the right-hand caps **are** the site's navigation.

No canvas, no WebGL, no 3D. The story adds one `position: sticky` viewport and
one `translateY(...) scale(...)` on a single element; everything else is one SVG
for the panel, one HTML block for the screen's type, and a scroll bridge that
writes numbers.

## Files

All the hero's code is in `features/landing-page/components/riddim-hero/`.

| File                     | What it is                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `riddim-geometry.ts`     | The clone, transcribed: every cap, pad, knob, label and colour in reference pixels, plus the control-id helpers.   |
| `riddim-content.ts`      | The software: `COPY`, `SCREEN_COPY`, `MACHINE_NAV` (control → destination) and `STORY` (the story's copy).          |
| `riddim-choreography.ts` | The whole scroll story as two pure functions: `riddimFrame` (the power-up) and `riddimStory` (the camera).         |
| `riddim-device.tsx`      | The machine: the panel SVG, the screen (and its swap plane), the glyph library, the controls as links and buttons.  |
| `riddim-story.tsx`       | Everything the story says that is not the machine: the next chapter's plane and the flanking columns.               |
| `riddim-hero.tsx`        | The section: the stage, the camera, the letterbox, and the two viewport facts that decide who owns copy and links.  |
| `use-riddim-hero.ts`     | Scroll bridge: one ScrollTrigger → CSS custom properties on the hero. Pointer parallax for the sheen.              |
| `riddim-hero.module.css` | All visual maths (`rotate(calc(var(--r-controls) * var(--sweep) * 1deg))`, the camera, the letterbox, the planes).  |
| `*.test.ts(x)`           | Choreography invariants (both functions), the nav/geometry join, counter digits, server render.                    |

The About band keeps its opening frame tight via `--about-pad-top` and friends on
`.root` in `rack-01/rack-01.module.css`; the hero no longer reads those tokens,
but it does end exactly where they begin, so they stay tuned together.

## How the clone is built

- **One coordinate space.** Everything on the panel is drawn in
  `viewBox="0 0 952 1317"` — the device's bounding box in the reference front
  view — so a number in `riddim-geometry.ts` is a number on the photograph.
  The LCD's rect in that space is `x 15–937, y 324–592`, and `BOOT_WINDOW`
  (`0 0 952 730`) is the top of the machine down past the console's own knob
  row. The story's letterbox and camera are both derived from those numbers.
- **The screen's interior is measured too.** `SCREEN_UI` is not a design: it is
  the photograph's own 922 × 268 window read off the crop, down to the lattice
  the pictograms sit on. Four bands of eighteen glyphs on a 50 × 42 pitch, the
  seven-segment counter on the panel the photograph backs it with at ~42%
  across, and the six layer words (`SOUND … SWING`) at the per-word `x` starts
  the photograph gives them. The only thing the screen adds is the live
  readout, and it prints in the one band the photograph leaves blank. See
  *The screen interior* below.
- **One scale.** `--u` is one clone unit, and everything printed on the machine,
  including the HTML type on the fascia and the screen, is
  `calc(<native units> * var(--u))`, so the whole object scales as one thing.
  In the poster path `.machine` is an inline-size container with `aspect-ratio:
  952 / 1317` and `--u: calc(100cqw / 952)`, its width `min(100%, 2.6 screens of
  height)`. In the story path the height is pinned instead
  (`--machine-h`, then `--u: calc(var(--machine-h) / 1317)`), so the camera has a
  fixed object to move over.
- **Colours are sampled, not mixed.** `PALETTE` holds the values pulled out of
  the reference crops: cream that is never white, green that is nearly black,
  and one orange used only on the controls that do something. The one place the
  stylesheet mixes is the handoff, where the LCD's backlight runs
  `color-mix(in oklab, green, cream)` on `--r-flip`.
- **No rotation.** The clone is upright, which is what keeps every measured
  coordinate a coordinate. The composition problem a portrait machine poses in
  a landscape viewport is solved by scale, camera and scroll, not by turning the
  object.

## The screen interior

`SCREEN_UI` in `riddim-geometry.ts` is the reference's own 922 × 268 window,
transcribed. Everything in it is a measurement rather than a layout choice:

| Field      | What the photograph gives                                                       |
| ---------- | ------------------------------------------------------------------------------- |
| `field`    | Four bands of eighteen pictograms on a 50 × 42 lattice, `cell 36`, running the full width |
| `counter`  | Four digits and the dot at ~42% across, `digit 50` (seven-segment height), on its own lighter panel |
| `words`    | The six layer words on the fourth band's baseline, `y 202`, one measured `x` per word |
| `readout`  | The band under the words, which the photograph leaves blank — the only live type |
| `pad`      | The gutter the readout hangs off                                            |

Three details are load-bearing:

- **The counter is backed.** `ScreenArt` draws a `.readoutWell` rect — the
  lighter green the photograph backs its display with, plus a 12-unit rim —
  behind the digits, so the counter reads as a module rather than as type
  floating on the glass. The bar geometry is proportional
  (`SEG_W = 0.54` of the digit height wide, `SEG_T = 0.12` thick), so the
  display keeps its shape when the camera pushes in.
- **The last band is short.** The photograph stops its texture where `SOUND`
  begins, so `ScreenArt` prints only the glyphs that run up to the first word
  (`colIndex > leadCols` → `null`) and leaves the rest of the band to the type.
- **The words are placed, not stepped.** `MAIN` and `SYSTEM` differ in width by
  half again, so `words.x` is one measured start per word rather than a uniform
  step — an even step either crowds the longest or runs the last one off the
  glass.

The page's own name is **not** on the glass. It is the document's `h1`
(`.srOnly` in `riddim-hero.tsx`), so a screen reader gets it once and the
machine prints only what the hardware prints. The screen's only interaction is
the readout: hovering or focusing a control prints its name and note in the
blank band, and prints `READY` when nothing is armed.

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

In the story the machine is only a navigation during the **overview** beat, when
the whole of it is in frame; the camera takes its `pointer-events` away in every
other beat.

## The desktop story

At `min-width: 1181px` with `prefers-reduced-motion: no-preference` the hero
becomes a pinned stage, and one camera walks it. Three ideas do all the work.

### The stage

`.stage` is `460svh` tall (once `data-live="true"` lands) and holds one
`.sticky` child that is `position: sticky; top: 0; height: 100svh; overflow:
clip` — the pinned viewport. The ScrollTrigger is over the stage, so progress 0
is the top of the stage and progress 1 is the frame the About band arrives in.
`overflow: clip` is what keeps the pulled-back machine from painting over the
page above and below it.

### The camera

`.camera` is `position: absolute; inset: 0`, a grid that centres the machine,
and its whole transform is one line:

```css
transform: translateY(var(--cam-ty)) scale(var(--cam-s));
```

`riddimStory(progress)` yields two numbers, `pull` (0 = the boot window, 1 = the
whole machine at fit height) and `push` (0 = the whole machine, 1 = the LCD
filling the viewport). The bridge turns the pair into the camera's two values
from one measurement of the machine's height — three framings and a lerp
between them:

```ts
const head = Math.max(0, inset - window.scrollY)      // the top bar still holding the frame down
const bootScale  = Math.min(vw / (BOOT_W * unit),     // the top half, contained in the room the bar leaves
                            (vh - head) / (BOOT_H * unit))
const aboutScale = vh / (LCD_H * unit)                // the LCD filling the viewport
const scale  = lerp(lerp(bootScale, 1, s.pull), aboutScale, s.push)   // --cam-s
const centre = lerp(lerp(BOOT_H / 2, CANVAS_H / 2, s.pull), LCD_CENTRE, s.push)
set('--cam-ty', `${(CANVAS_H / 2 - centre) * unit * scale - head / 2}px`)
```

At fit height (`pull = 1`, `push = 0`) the scale is exactly 1 and the offset is
0, so the poster is simply centred; at the boot (`pull = 0`, `push = 0`) the
scale is the contained top-half framing and the offset walks the boot window's
centre to the viewport's. The `* scale` matters: the translate is applied in the
parent's space, after the scale, so it must be measured in the scaled frame.

**The top-bar correction.** The top bar is a normal-flow first child of the hero,
so at rest it holds the sticky viewport — and the boot window with it — down by
its own height (`inset = stage.top − hero.top`). `head` is that inset minus the
scroll, and it does two jobs: it shrinks the boot window's available height, and
it shifts the camera up by half of itself so the frame is centred in the room the
bar leaves rather than in the whole viewport. It is spent within the first pixels
of the story, long before the pull is under way.

### The letterbox and the planes

A box can't be laid over the LCD and clipped to it unless it knows where the LCD
is *at every zoom*. So the letterbox is not a screen-space overlay — it is a
`.letterbox` element placed in the **LCD's own rect, inside the camera**:

```css
left:   calc(50% - 461 * var(--u));   /* canvas x 15  */
top:    calc(50% - 334.5 * var(--u)); /* canvas y 324 (658.5 - 334.5) */
width:  calc(922 * var(--u));         /* canvas x 15–937 */
height: calc(268 * var(--u));         /* canvas y 324–592 */
overflow: clip;
```

Because it lives inside the camera it moves and scales with the machine, so it is
clipped to exactly the screen at every zoom — no per-frame maths. Inside it sits
the **plane**, a viewport laid down and counter-scaled by the camera:

```css
.plane {
  width:  calc(100vw / var(--cam-s));
  height: calc(100svh / var(--cam-s));
  container-type: size;
}
```

So a plane is always viewport-sized *on screen* however far in the camera is,
and `container-type: size` lets everything inside it be written in `cqw`/`cqh`
and still land at viewport size.

There is **one** plane, `.aboutPlane` — the next chapter's surface, opacity
`--r-about`, its background and ink both `color-mix`ed green→cream by `--r-flip`
so the backlight flip and the About band's own cream are the same colour at the
handoff. The boot is not a plane: the frame the page opens on is the machine
itself, so there is nothing to fade over the screen but the machine's own lit
field. (The old `.bootPlane` title card is gone.)

### The screen swap

The machine's screen never unmounts. `.screenUi` fades out on
`opacity: calc(1 - var(--r-swap))` while a second plane, `.screenSwap`, fades in
on `var(--r-swap)`, printing the next chapter's kicker and title. The swap is a
scrubbable cross-fade in both directions, and the `h1` is never off the page.

### The flanking columns

`StorySides` is the content the story adds on both sides of the machine. It is a
flex row over the pinned viewport, `justify-content: space-between`, so its two
`<aside>` columns sit in the space the camera leaves free at fit height:

- **left — "Machine notes":** `01 DISPLAY`, `02 CONSOLE`, `03 LAMPS`
- **right — "Session notes":** `04 CURRENT`, `05 HANDOFF`, `06 SESSION`

They fade with `--r-sides`, so they are on screen only across the pull-back and
press-swap beats (roughly `0.34 → 0.68`), and they are `pointer-events: none` —
they are annotations, not a second navigation. Below `4 / 3` aspect ratio the
machine at fit height is too wide to leave a column either side, so they stand
down rather than sit on top of it.

## Choreography

Everything is a pure function of progress: scrolling back renders the identical
frame at the identical position. There are two functions, both in
`riddim-choreography.ts`.

### `riddimFrame` — the machine powering up

| Progress   | Phase                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- |
| 0.00–0.16  | Power: the power LED and the panel come up to full                                         |
| 0.05–0.80  | Controls: both knobs turn and the fader slides with the scroll                             |
| 0.12–0.58  | Meter: the parameter LEDs step on, one after another, down the pad field                   |
| 0.05–0.45  | Ink: the screen's icon field and its six words light, in sequence, out of the dark panel the boot frame opens on |
| 0.20–0.66  | Readout: the seven-segment counter runs 01.12 → 04.16                                      |
| 0.34–0.90  | Play: the pads ripple, each on its own beat                                                |
| 0.84–1.00  | Handoff: the console's bottom label row turns into `NEXT / 02 / PROFILE`                    |

### `riddimStory` — the camera

| Progress   | Beat       | What happens                                                                        |
| ---------- | ---------- | ----------------------------------------------------------------------------------- |
| 0.00–0.12  | `boot`     | The top half of the machine fills the frame — header, speaker, lit screen, knobs; the icon field is dark and lighting |
| 0.12–0.40  | `pull`     | The camera pulls back until the whole instrument is in frame                         |
| 0.40–0.64  | `overview` | Machine at fit height: the pads play, the columns annotate it, PLAY presses itself, the screen swaps |
| 0.64–0.86  | `push`     | The camera pushes back into the LCD, now on the next chapter's screen                 |
| 0.86–1.00  | `about`    | The LCD is the first fold of the About band; the backlight flips green → cream        |

`riddimStory` returns the six numbers the stylesheet needs (`pull`, `push`,
`sides`, `swap`, `about`, `flip`) plus `beat`, the name of the window the
progress is in — written to `data-beat` on the hero, which gates the machine's
pointer events and the PLAY key's pulse. `pull` and `push` are the two the
camera interpolates on; the sides and the swap are windows *inside* the beats:
sides open at `0.34` and close at `0.68`, the swap runs `0.54 → 0.62` so it
finishes before the camera starts back in at `0.64`.

## Contracts worth knowing

- **The hero's height is the stage's, not the machine's.** At the story width the
  stage is `460svh` and the machine is pinned inside it; below that width
  `--stage-h` is `auto` and the hero is once again exactly as tall as the
  machine, so progress 0 is its top edge and progress 1 its bottom. The top bar
  sits in flow above the stage, which is the only thing between the page's top
  and the clone's top edge.
- **The letterbox is geometry, not an overlay.** It is placed in the LCD's own
  rect *inside* the camera, so it is clipped to the screen at every zoom without
  a single per-frame calculation. If you move the LCD in `riddim-geometry.ts`,
  move the letterbox with it — the three constants that must agree are the
  canvas (`1317`), the LCD height (`268`) and the LCD centre (`458`) in
  `use-riddim-hero.ts`, and `461` / `334.5` / `922` / `268` in the stylesheet.
- **The boot frame is a window on the machine, not a plane.** `BOOT_WINDOW`
  (`0 0 952 730`) is the top of the instrument down past the console's knob row,
  and the camera's first framing is that window *contained* in the viewport. The
  constants that must agree are `BOOT_W` (`952`) and `BOOT_H` (`730`) in
  `use-riddim-hero.ts` and the `--cam-s` / `--cam-ty` fallbacks in the
  stylesheet, which are the same frame written by hand so the first paint and the
  no-JS paint match what the live story starts from.
- **The top bar's height is spent, not assumed.** `inset = stage.top −
  hero.top` measures how far the in-flow top bar holds the sticky viewport down;
  `head = max(0, inset − scrollY)` is that inset minus the scroll. `head` both
  shrinks the boot window's available height and shifts the camera up by half of
  itself. Because the bar scrolls away while the trigger's progress is still
  exactly `0` — a tick `onUpdate` never fires on — a passive `scroll` listener
  re-applies the frame until the bar is gone. Without it the opening frame is
  clipped at the top and only corrects itself once the pull begins.
- **`apply(0)` before `data-live`, then the trigger.** The stage grows from one
  viewport to `460svh` the instant `data-live="true"` lands. The bridge therefore
  writes the frame at progress 0 *first*, then sets `data-live`, then creates the
  trigger and refreshes — a trigger created before the growth sees `start === end`
  and pins progress at 1 for the rest of the page's life.
- **The clone table owns the HTML's numbers.** The screen's readout is
  positioned from `SCREEN_UI`, passed into CSS as `--scr-*`. The geometry's `y`
  values are SVG baselines; the component converts them to line-box tops once.
  (`COPY_BLOCK` — the fascia copy block from an earlier design — is still in
  `riddim-geometry.ts` but no longer read by the hero.)
- **Controls are SVG.** Links are `<a>` (via `next/link` for routes, which does
  work inside SVG and keeps navigation client-side); the four actions are
  `<g role="button" tabindex="0">` with Enter/Space handlers, because a
  `<button>` cannot live in the SVG namespace. Focus is drawn by a `.ring` in
  each control's own shape, and every control carries an `aria-label` of
  `"<destination> — <note>"`.
- **One navigation, one `h1`, ever.** The machine's controls are the nav from
  769px up; below that a 84-unit pad is 34px, so the links move to `.stack`
  under the poster and the machine goes back to being a drawing. Below 1181px
  the story stands down for the static poster and the stack carries the copy and
  the index. The page's only `h1` is the hero's `.srOnly` heading, and the screen
  swap is `aria-hidden` — the machine prints the photograph's words rather than
  the site's — so there is never a duplicate navigation or heading in the
  accessibility tree.
- **Keyboard reaches the machine from anywhere.** Tab can land on a control the
  camera has pushed off screen, so a `focusin` handler scrolls the stage to the
  overview midpoint first, and the machine's controls are only clickable in that
  beat anyway.
- **Live vs static.** The motion runs only at `min-width: 769px` with
  `prefers-reduced-motion: no-preference`, and the story only at 1181px up;
  otherwise `.hero` takes the finished values (powered, lamps up, screen lit,
  counter run to the end) and the hook downloads nothing. If the GSAP import
  fails the hook sets `data-live="failed"`, which does the same.

## Tuning

- Power-up timing: `RIDDIM_PHASES` in `riddim-choreography.ts`.
- Story beats and the derived windows: `RIDDIM_STORY` and the `phase(...)` calls
  in `riddimStory`, same file.
- Counter range: `RIDDIM_COUNTER`. Readout format: `counterDigits`.
- Stage length: `--stage-h` (`460svh`). Machine height in the story:
  `--machine-h`. Camera scale/offset: `--cam-s` / `--cam-ty` (written by the
  bridge, defaulted in the stylesheet for the first paint).
- The boot framing: `BOOT_WINDOW` in `riddim-geometry.ts` and its `BOOT_W` /
  `BOOT_H` copies plus the `head` term in `use-riddim-hero.ts`. The LCD's
  framing: `LCD_H` / `LCD_CENTRE`, same file.
- The screen's interior — lattice, counter, words, readout band: `SCREEN_UI` in
  `riddim-geometry.ts`.
- Poster scale: `--max-screens` on `.hero` (`2.6` = the tallest the machine may
  stand in viewport heights).
- A destination: one entry in `MACHINE_NAV`. Its printed word changes with it,
  and if the id is wrong the nav test fails.
- Story copy, the columns, the screen-swap words: `STORY` in `riddim-content.ts`.
- Machine geometry or colour: `riddim-geometry.ts` only.

## QA checklist (not run in CI)

- [ ] Desktop 1440×900: boot → pull → overview → push → about, smooth both directions.
- [ ] At the top the top half of the machine fills the viewport — port strip, RIDDIM header, speaker, dark screen and the knobs through `METRONOME` — with no clipping under the top bar and the screen's icon field at 0%; at fit height the machine is centred with a column either side; at the foot the LCD reads the next chapter on cream.
- [ ] The screen's icon field and its six words light from 0% as the machine boots, and scrolling back un-lights them.
- [ ] The two columns fade in across the pull-back and out before the push, and never sit on the machine.
- [ ] The screen swaps before the camera starts back in, and scrubbing backwards un-swaps it.
- [ ] Scroll to the bottom: the machine's label row reads `NEXT 02 PROFILE` and About arrives in the next frame, with no gap and no colour seam at the handoff.
- [ ] Tab from the top bar into a pad from outside the overview beat: the page brings the overview into view before the control takes focus.
- [ ] Hover and tab through every armed control: the screen prints its name, its lamp goes to full, the focus ring is visible on the control's own shape.
- [ ] A route pad (`/projects`, `/blog`, `/music`, `/bookmarks`) navigates without a full page load.
- [ ] LIGHT / DARK caps switch the theme; SHARE copies the URL; TOP returns to the top.
- [ ] 769–1180px: the copy moves to the stack, the machine keeps its links, the story does not run, nothing collides.
- [ ] ≤768px and `prefers-reduced-motion`: the whole machine fits one screen, the stack carries the copy and the index, no duplicate nav.
- [ ] Safari and Firefox: `cqw` sizing, `aspect-ratio`, `container-type: size`, SVG `<a>` focus rings, `color-mix`.
- [ ] Lighthouse: LCP is the server-rendered machine; no layout shift when the layout flags settle.

## Not done / optional follow-ups

- The clone is a clone of a *design*, not a photograph: the wordmark and the pad
  numerals are the site's display face with a stroke for weight, not traced.
- The screen's icon *shapes* are a redrawn library (`FIELD_ROWS` over the
  `Glyph` set), not traced pictograms; the *lattice* they sit on, the counter's
  backed panel and the six words' per-word starts are measured off the
  photograph. So the screen reads at 1:1 in layout, while each individual
  pictogram is a redraw of the reference's shape and palette.
- The story's side columns are annotations, not navigation, on purpose — the
  machine's controls are the sitemap. If the primary three ever want a written
  home during the overview, they belong in the left column rather than a second
  list of links.
- The primary three repeat inside the index on purpose (quick caps plus the
  numbered map). If the tab order ever feels long, drop the duplicates from the
  index rather than from the caps.
- No sound. A tick per pad hit would suit the machine.
- The old Pad Sea hero (`components/hero/pad-sea`, `use-hero-motion.ts`, the
  `hero*` classes in `rack-01.module.css`, `chapters/hero`, `lib/hero-sweep-order.ts`)
  remains unused; delete in a separate commit.
