# Footer: the halftone wordmark

The page closes on its own name, printed in halftone dots and cropped by the
bottom edge of the document. It replaces the tangle band, and the deck panel
that used to sit above it (brand, motto, back to top) has since been removed —
the band is now the whole footer.

## The idea

A footer is the last thing a visitor sees, so it should be the thing they
remember: the name. `HIMAWAN` is set as wide as the screen allows, stretched
taller, and cut off at the bottom edge so only the top ~60% shows. A small
`ADITYA` sits above it with a hairline running the width of the word.

It belongs to the page's music-hardware theme, not to a generic footer:

- **Playhead.** A DAW-style playhead sweeps the word, looping every four bars
  (8s at 120 BPM). Dots under it swell and warm to the signal orange, then cool
  as it passes. The top-right readout (`BAR 02 · BEAT 3 · 120 BPM`) is driven by
  the same clock, next to a live Jakarta clock.
- **Pointer.** Dots part around the cursor on springs and warm as they are
  pushed off their place.
- **Click.** A shock ring runs through the word.

## Decisions

- Title is `HIMAWAN` only. `ADITYA` is the kicker, small and tracked, so the
  surname is the brand and the first name is the signature.
- Face is Syne ExtraBold, the hero's display face, resolved from
  `--font-syne` at runtime (canvas cannot read a CSS variable).
- Colours are the footer's own: `#0b0d0c` ground (no seam with `.footer`),
  `#e7e2d8` ink, `#ff5a1f` warm.
- Height is derived from the word (`width` → font size → cap height × stretch ×
  (1 − crop)), and the kicker is placed from the same measurement, so they
  cannot collide. On screens under 560px the word is stretched 1.5× further.
- Performance: the resting field is painted once into an offscreen layer; a
  frame is one `drawImage` plus only the displaced or lit dots.
- Reduced motion paints one still frame. The name is also in the DOM as
  visually hidden text; the canvas is `aria-hidden`.

## Tuning

`<HalftoneWordmarkFooter />` props: `crop` (0.4), `stretch` (2.5, raised from the
component's 1.5 default now that the band is the whole footer), `dotGap` (6),
`radius` (90), `grain` (0.5), `tempo` (120), `playhead`, `interactive`.
