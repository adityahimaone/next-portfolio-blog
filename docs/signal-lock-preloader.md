# Signal Lock preloader

A 1.4s studio-playhead preloader that replaces the slat-count boot in
`LandingGate`. It plays once per session, over a page that is already rendered.

| Stage | When | What |
| --- | --- | --- |
| 1 Playhead sweep | 0–600ms | A playhead crosses three track lanes (`01 // SCOPE` green, `02 // PROCESS` blue, `03 // PRACTICAL` amber) on `#EAE6DF` paper with `#141414` ink; each lane lights behind it |
| 2 Glyph decode | 150–950ms | `ADITYA / HIMAONE` rolls into place out of vertical reels of monoline glyphs, each letter starting as the playhead passes it; two rulers draw in; the timecode decodes to `00:00:00 -> 00:01:20 // LOCKED`; three lamps lock |
| 3 Track collapse | 1000–1400ms | The poster thumps (`scale(1.01)`), the name and rulers leave, and the lanes shutter open (`scaleY(0)`, 50ms apart, outer lanes folding away from the middle one) onto the live page |

## Guardrails, and how each is met

- **CLS 0.** Fixed `inset-0`, `contain: strict`; everything inside moves by
  transform, opacity, clip or dash offset. Nothing animates layout.
- **No assets.** The name is path data in the component (ten-letter monoline
  alphabet). Lanes and clips are boxes, rulers are paths. The only text is the
  timecode and three lane labels, in the platform monospace, so there is no font
  to wait for.
- **Does not block hydration.** It is an overlay, `pointer-events: none`,
  mounted by `LandingGate` a frame after the page, and it unmounts itself at
  1400ms. The page underneath is never waiting on it.
- **One schedule.** Every duration and delay is in `TIMELINE`, is handed to the
  stylesheet as a custom property, and is asserted by a test to end inside 1400ms
  (and to match the stage windows above). The CSS carries no timing of its own.
- **Reduced motion** is its own composition, not a faster one: the resolved
  poster, held, then faded (650ms).

## Pieces

- `layoutName()` places the letters and gives each its start, from its
  horizontal position, so the reels fire left to right at the playhead's pace.
- `reelStrip()` chooses each reel's decoys: stable, never repeating back to back.
- `<Rule />`: a baseline with `pathLength={1}` drawn by dash offset, and ticks
  revealed through a mask drawn the same way, so they cannot drift apart.
- `scrambleAt()` / `useScramble()`: the decode. Digits stay digits, letters stay
  letters, punctuation never changes, so the line keeps its width. Written to the
  node, not to state: no renders.

## Integration

```tsx
// features/landing-page/components/landing-gate.tsx
import SignalLockPreloader from '@/components/ui/signal-lock-preloader'

{showGate ? (
  <SignalLockPreloader className="z-[100]" onComplete={complete} />
) : null}
```

`z-[100]` is the one deliberate departure from the default `z-50`: the dock and
the music player sit at or above 50 and would otherwise draw over the poster.

`components/ui/slat-count-preloader.tsx` is no longer used by the gate; it and
its tests are left in place.
