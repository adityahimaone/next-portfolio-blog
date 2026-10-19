# Signal Storm preloader

A 2.8s studio-poster preloader, adapted from the Waving Portfolio Landing
reference and now the one `LandingGate` plays. It runs once per session, over a
page that is already rendered. `SignalLockPreloader` (the 1.4s playhead version,
`signal-lock-preloader.md`) is a drop-in alternative: swap the import and the
element in `landing-gate.tsx`.

## What was changed from the reference

| Reference | Here |
| --- | --- |
| `P [O] RT / F [O] LIO`, one giant shared letter | **`AD [I] TYA / H [I] MAONE`**. Both names contain an I, so the giant letter is a tall bar, which is also a playhead |
| Storm of random capitals | **Studio words** (PLAY, REC, LOOP, MIX, GAIN, SYNC...) in the three lane colours, solid and outlined |
| Hand-inked waving character | **A metronome** that rises from the baseline and ticks at 120 BPM (one beat at each extreme of the swing) |
| Dice corners | **Two pads**: a play pad and a record pad with a pulsing dot |
| 7s intro, the poster is the page | **2.8s**, and an exit: the poster leaves and three track lanes shutter open onto the page |
| Interactive (hover re-rolls, click throws letters) | **None.** It is an overlay with `pointer-events: none`; the page under it is usable immediately |

## The sequence

| When | What |
| --- | --- |
| 0–360ms | The storm slides in, seven rows alternating direction, and runs |
| 380–1340ms | Letters roll into place beneath it, left to right, row by row; the giant I starts at 800ms |
| 600–1210ms | The storm shutters away, row by row (`scaleY(0)`, 45ms apart) |
| 1360ms | The giant letter has landed: the poster thumps |
| 1360–2080ms | Rules draw in (`pathLength` 1); labels decode (1250–1950ms) |
| 1400–1930ms | The pads slide in from the corners |
| 1400–1850ms | The metronome rises; from 1850ms its pendulum ticks |
| 2350ms | The poster leaves; 2400–2800ms three lanes shutter open |

## Guardrails

- **CLS 0.** `fixed inset-0`, `contain: strict`; everything moves by transform,
  opacity, clip or dash offset.
- **No assets.** Every letter is a path in `poster-glyphs.ts`; the metronome,
  rules and pads are paths and boxes. Only the labels are text, in the
  platform's own monospace.
- **Does not block hydration.** An overlay mounted by `LandingGate` a frame
  after the page; it removes itself at the end.
- **One schedule.** `STORM_TIMELINE` feeds the stylesheet as custom properties
  and a test asserts it ends exactly at the total and that the beats are in the
  right order (storm gone before the giant letter lands, nothing leaves before it
  has finished, a full beat of ticking before the exit).
- **The storm is unmounted** once its last row has shuttered away: a hidden
  strip is still a running marquee.
- **Reduced motion** is its own composition: no storm, the resolved poster,
  held, then faded (900ms).

## Files

`poster-glyphs.ts` (the capital alphabet and layout, pure),
`preloader-kit.ts` (the hash and the timecode decode, shared with Signal Lock),
`signal-storm-preloader.tsx`, `signal-storm-preloader.module.css`.
