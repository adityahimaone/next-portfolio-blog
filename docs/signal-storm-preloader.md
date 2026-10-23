# Signal Storm preloader

A 1.74s boot that **ends in the hero**: studio words run edge to edge, are pulled
into the hero's name clip, and the hero's own letters rise onto it. It is what
`LandingGate` plays once per session. `SignalLockPreloader` (the 1.4s playhead
version, `signal-lock-preloader.md`) is a drop-in alternative: swap the import
and the element in `landing-gate.tsx`.

There is no poster and no scene in the middle (the metronome, the corner pads,
the labels and the paper are gone): the last thing on screen is the first thing
in the hero.

## It is made of the hero's materials

| | Hero | Preloader |
| --- | --- | --- |
| Ground | `--deck-ground` `#14171a` and its 30px graph grid | the same tokens |
| Name clip | signal orange `#ff5a1f` | the same orange |
| Ink | cream `#eee9df` | the same cream, for the outlined rows |
| Accents | the three lane colours | green, blue and amber rows |

A test reads `app/deck-theme.css` and fails if these ever drift apart.

## The sequence

| When | What |
| --- | --- |
| 0–600ms | Seven rows of studio words (PLAY, REC, LOOP, MIX, GAIN, SYNC...) slide in and run, alternating direction, on the hero's ground |
| 900ms | The merge starts. The column straightens from its tilt and every row is pulled onto the **name clip's centre line**, squashing to a thread, outer rows first |
| 1000–1400ms | An orange band grows out of that line, to the clip's **measured** rectangle and corner radius |
| 1300ms | The hero's letters are released and start to rise |
| 1400–1620ms | The dark ground fades; the hero is under it |
| 1580–1740ms | The band fades; the real clip is under it, unchanged |

## How it lands on the title

- **The target is measured, not drawn.** The hero marks its name clip with
  `data-hero-name-clip`; at the start of the merge the preloader reads that
  element's rectangle and corner radius. If the clip is missing, or the page was
  restored scrolled past the hero, it lands on a centred band instead.
- **The letters are the hero's own.** While the preloader plays it sets
  `--boot-play: paused` on the document, which the hero's letter animation
  (`.nameChar` in `arrangement.module.css`) reads. At the release beat it sets
  `running` with a shorter delay (`--boot-delay: 0ms`) and stagger
  (`--boot-stagger: 28ms`). So the title is set in the real face, at the real
  size, by the real CSS, and nothing is cross-faded because nothing is
  duplicated. With no preloader (a repeat visit) none of the three is set and the
  hero's timing is exactly what it was: 450ms, 45ms, running.
- **The variables outlive the overlay.** Changing a running animation's delay
  moves it, so the preloader leaves them in place for 2.2s after it finishes
  (the letters are mid-rise) and then removes them. If it is unmounted before the
  release, the hero gets its own timing back at once.

## Guardrails

- **CLS 0.** `fixed inset-0`, `contain: strict`; everything moves by transform,
  opacity or clip.
- **No assets.** Every letter is a path in `poster-glyphs.ts`; the ground is two
  gradients.
- **Does not block hydration.** An overlay (`pointer-events: none`) mounted by
  `LandingGate` a frame after the page; it removes itself at the end.
- **One schedule.** `STORM_TIMELINE`, checked by tests for order (merge before
  band, band before ground, ground before band fade) and total.
- **Reduced motion** is its own composition: the hero's ground, held 600ms, then
  faded. The hero's letters do not animate under reduced motion, so nothing is
  held or released.
- **No Web Animations?** The merge is skipped, the boot still ends on time.

## Files

`signal-storm-preloader.tsx` (the component, the timeline and the merge
geometry), `signal-storm-preloader.module.css` (ground, running words, band),
`poster-glyphs.ts` (the condensed capital alphabet), `preloader-kit.ts` (the hash,
shared with Signal Lock). In the hero: `data-hero-name-clip` on the name clip in
`arrangement-clip.tsx`, and the three `--boot-*` variables in `.nameChar`.
