# Studio 01 / Listening Room

The landing page's design system. This is the source of truth for the 2026
portfolio redesign. It covers the page at `/`, not the booth routes.

## 1. Premise

The previous landing page was a room full of studio hardware. This one is a
single listening room. A chrome ring and its waveform orbit in the hero are the
only object; a hairline signal rail drops out of that object and runs through
every section, so the page reads as one connected instrument instead of a stack
of unrelated sections.

Three rules make the concept honest:

1. Every music motif carries data. The waveform bars are a written array, the
   practice channels are the real skill levels, the project rows are the real
   releases, and the tempo readout is a fixed value for the site's own mix.
2. One accent, one material, one radius. Nothing on the page introduces a second
   accent colour or a second card shape.
3. The divider is signal, not decoration. It is the same line at the same x as
   the section entries, and its node is the join between the section before it
   and the section after it.

## 2. Palette

| Token          | Light                  | Dark                     | Role                     |
| -------------- | ---------------------- | ------------------------ | ------------------------ |
| `--paper`      | `#ece8de`              | `#111210`                | page ground              |
| `--paper-hi`   | `#f5f1e7`              | `#181916`                | raised plate, preview    |
| `--paper-lo`   | `#e3ded1`              | `#1d1e1a`                | recessed sleeve ground   |
| `--ink`        | `#121310`              | `#f0ece1`                | primary type             |
| `--muted`      | `#66655b`              | `#9e9b90`                | secondary type           |
| `--hair`       | `rgb(18 19 16 / .18)`  | `rgb(240 236 225 / .2)`  | structural rule          |
| `--hair-soft`  | `rgb(18 19 16 / .085)` | `rgb(240 236 225 / .09)` | row rule                 |
| `--signal`     | `#cf4f1b`              | `#ff6a2b`                | object, node, meter fill |
| `--signal-ink` | `#b44416`              | `#ff8a54`                | accent text on paper     |
| `--chrome`     | `#d9d2c3`              | `#8e877a`                | 3D fallback material     |

There is no second accent. Status is expressed with the same signal orange and
with weight, never with a new hue.

## 3. Type

| Role          | Family     | Specification                                                         |
| ------------- | ---------- | --------------------------------------------------------------------- |
| Display       | Syne       | `clamp(3.15rem, 7.05vw, 6.6rem) / .87`, weight 650, tracking -.058em  |
| Section title | Syne       | `clamp(2.05rem, 4.25vw, 4.15rem) / .98`, weight 650, tracking -.045em |
| Body          | Geist      | `15-17px / 1.6-1.7`, max 55ch                                         |
| Silkscreen    | Geist Mono | `8-10px`, uppercase, tracking .1-.17em                                |

Silkscreen is reserved for machine data and labels: nav, section numbers,
periods, levels, years, readouts. It is not used as a decorative eyebrow over
every heading. The hero has one eyebrow, and the section heads carry exactly one
label each.

## 4. Space and shape

- Shell: `1440px`.
- Page padding: `clamp(18px, 4vw, 56px)`.
- Vertical section rhythm: `clamp(76px, 10vw, 148px)`.
- The rail x is the page padding, so the line aligns with the hero copy.
- Section content is inset `clamp(32px, 4vw, 68px)` from the rail, giving the
  connected spine its own lane without a card or a sidebar.
- Radius: `3px` for plates and controls, `2px` for chips and stack tags. There
  are no pill buttons and no soft 16px cards.

## 5. Components

| Component     | Rule                                                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SignalHero`  | Asymmetric 7/5 grid. Two-line display, one eyebrow, subtext, two actions, one readout strip. The 3D canvas is the right column on desktop and a low-opacity object behind the copy on mobile.                          |
| `SignalScene` | Procedural Three.js: chrome torus, orange run-out ring, 56 instanced waveform bars, 150 dust points. Rotates continuously, reacts to pointer and scroll, gains energy when the site mix is playing. No model download. |
| `SignalRail`  | The only divider. A 1px line at `--rail-x`, a 13px node, a real anchor to the next section, and a small instrument meta tag. It is drawn in with scroll and connects the hero patch to the contact end.                |
| `SectionHead` | Label, sentence-case title, optional lede. Vertical stack, never a split header.                                                                                                                                       |
| `Practice`    | Three channel strips. Each channel has a 16-tick meter and a printed value from `MIXER_DATA`.                                                                                                                          |
| `Record`      | Accordion rows. One open at a time, native `aria-expanded` state, notes in two columns on desktop.                                                                                                                     |
| `Work`        | Six release rows and a sticky sleeve preview. The row is the link; the preview is not a second one.                                                                                                                    |
| `Contact`     | Oversized mailto, four real links, footer with the build note.                                                                                                                                                         |

## 6. Motion

| Token          | Value                          | Use                                |
| -------------- | ------------------------------ | ---------------------------------- |
| `--ease`       | `cubic-bezier(.22, 1, .36, 1)` | every interface transition         |
| Hero entrance  | 0.85-1.4s                      | one timeline, no repeat            |
| Section reveal | 0.9s, 26px rise                | once per block                     |
| Rail line      | scroll-scrubbed                | the only scroll-linked draw        |
| Node pulse     | 3.2s loop                      | shows the signal is live           |
| Waveform bars  | 0.9-2.4s                       | energy rises when audio is playing |

There is no pinned scroll and no scroll hijack. GSAP is loaded after paint and
skips entirely under `prefers-reduced-motion`. Reduced motion leaves the page
static, not broken: all transforms and opacity reveals are reset.

## 7. The connection rule

The hero's SVG patch ends at `x = --rail-x` on the hero's bottom edge. The first
`SignalRail` begins at the same x. Every section is padded from that same x, and
every subsequent rail repeats it. The line is never restarted at a different
offset, and no divider exists as an isolated ornament.

```
hero ring
   │  patch curve
   ▼
rail 01 ── About
   │
rail 02 ── Practice
   │
rail 03 ── Record
   │
rail 04 ── Work
   │
rail 05 ── Contact
```

## 8. Accessibility

- Nav collapses to a full-screen menu below 900px; desktop nav stays on one line.
- All interactive elements are buttons or links with real labels.
- The 3D canvas is `aria-hidden`; the hero carries the text alternative.
- Meters expose an `aria-label` with the channel and its level.
- Focus is a 2px signal outline with a 4px offset.
- Body text and accent text pass AA on both grounds. The accent is not used for
  small body copy on the paper ground; `--signal-ink` is the darker text token.
