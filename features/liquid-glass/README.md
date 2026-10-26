# Side Two — the Liquid Glass surface

The 2026 portfolio movement. `/` and `/notes` render from this module; every
other route keeps the previous shell (see `components/world-chrome.tsx`).

| Route          | View                    | Notes                                   |
| -------------- | ----------------------- | --------------------------------------- |
| `/`            | `views/home-view.tsx`   | Hero, selected works, liner notes        |
| `/notes`       | `views/notes-index-view.tsx` | Full tracklist                     |
| `/notes/[slug]`| `components/notes/reader.tsx` | Reader, sticky rail, prev/next     |
| `/classic`     | `app/classic/page.tsx`  | The previous landing, preserved          |

## File map

```
features/liquid-glass/
  types.ts                 Content model (Project, Note, Track, PortfolioSource)
  data/                    Mock content — the only place prose and copy live
  lib/cms.ts               Source adapter + fetch helper
  lib/use-content.ts       Client revalidation hooks (no-op without an endpoint)
  lib/format.ts            Dates as catalogue numbers, minutes as runtimes
  audio/engine.tsx         Web Audio graph, transport, signal bus
  scroll/smooth-scroll.tsx Lenis, wired into the GSAP ticker
  interactive/use-pointer.ts  Spotlight, magnetic pull, tilt (CSS variables only)
  components/motion/       Reveal, Stagger, HeroStatement, Parallax
  components/hero/         Turntable + hero
  components/work/         Bento grid, card, dialog
  components/notes/        Tracklist row, section, reader
  components/dock/         Persistent nav + transport pill
  styles/glass.css         Materials, tokens, keyframes
  views/                   Page-level composition
```

## Content

Components never import `data/*`. They receive props from a route, and routes
call `cms` (`lib/cms.ts`). Swapping in Sanity or Contentful means writing one
object that satisfies `PortfolioSource`:

```ts
export const sanitySource: PortfolioSource = {
  async getProjects() {
    return client.fetch(PROJECT_QUERY)
  },
  // getProject, getNotes, getNote, getTracks …
}

export const cms: PortfolioSource = sanitySource
```

Set `NEXT_PUBLIC_CONTENT_ENDPOINT` and the client hooks revalidate against it
after the server-rendered payload. With no endpoint, the server payload stands
and no request is made.

**Adding a release:** append to `data/projects.ts` (or the CMS). `span` chooses
the grid footprint (`feature` 2×2, `wide` 2×1, `standard` 1×1), `cover` is
optional — without it the card renders a generated sleeve keyed to `accent`.

**Adding a note:** append to `data/notes.ts`. `duration` is the reading time
formatted like a track length; `body` is a small portable-text-ish block array,
so a CMS migration maps field-to-field.

## Audio

`AudioEngineProvider` sits in the root layout, above the router, so navigation
never tears the graph down. Nothing is constructed until the first play intent.

```
<audio> ──▶ MediaElementSource ──▶ Analyser ──▶ Gain ──▶ destination
```

- The analyser is **before** the gain, so muting silences the room without
  flattening the visualiser.
- One `requestAnimationFrame` loop computes four values (`level`, `bass`, `mid`,
  `high`), writes them to `:root` as `--lg-level` / `--lg-bass` / `--lg-mid`, and
  notifies subscribers. Nothing in the tree re-renders per frame.
- `useAudioSignal(cb)` is the subscription hook; every consumer writes transforms
  or CSS variables.
- Analyser data is read from `frameRef`, never from React state.

## Motion

- **Lenis** owns inertia scrolling on this surface only; it is ticked by GSAP so
  `ScrollTrigger` and the scroll position share one clock.
- **GSAP** handles mount-time choreography (the hero statement) and scroll-linked
  parallax (`Parallax`).
- **Motion (`motion/react`)** handles in-view reveals, staggered grids and the
  dialog's enter/exit.
- Everything checks `prefers-reduced-motion`; the turntable freezes at a set
  angle, the dock still works, and no content depends on an animation finishing.

## Material

`styles/glass.css` is a self-contained system behind `lg-` prefixed classes:

- `.lg-glass` — body gradient + specular `::before` + chromatic rim `::after`.
- `data-lit="true"` (set by `useSpotlight`) raises the specular and turns the rim
  toward the cursor via `--lg-angle`.
- `.lg-glass--heavy` for the dock and dialog, `--flat` for quiet panels,
  `--lit` for the active audio state.

Three gotchas worth keeping:

1. **Never write `-webkit-backdrop-filter` by hand.** The CSS minifier collapses
   a `backdrop-filter`/`-webkit-backdrop-filter` pair and keeps only the
   prefixed declaration, which current Chrome ignores — every pane goes
   unfrosted. The build adds prefixes itself.
2. **Don't reset children of a glass pane.** A `.lg-glass > *` rule (for stacking
   above the pseudo-elements) overrides utility positioning and stretches every
   absolutely positioned child to full width. The pseudo-elements use
   `z-index: -1` under `isolation: isolate` instead.
3. **A pane has to work without blur.** `@supports not (backdrop-filter: …)`
   makes every pane denser, because legibility must not depend on a compositor
   feature. Related: headless Chrome does not composite backdrop-filter in
   screenshots, so visual checks taken in a headless browser under-report the
   frost. Verify the computed value, not the pixels.

## Accessibility

- The dock is a `<nav>`; the transport buttons carry labels that change with
  state, and mute is an `aria-pressed` toggle.
- The hero clock is `aria-hidden` (it ticks four times a second); the track title
  is not.
- The dialog traps focus on open, closes on `Escape` and on backdrop click, and
  returns focus to the card that opened it.
- Contrast: body copy sits at ~0.68α on `#050506` and small mono labels at 0.48α,
  both above 4.5:1; the amber/cyan accents are used for state, never as the only
  signal.
