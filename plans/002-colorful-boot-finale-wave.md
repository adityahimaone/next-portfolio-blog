# 002 — Colorful boot + visible finale

- **Status**: DONE
- **Commit**: 9e73463
- **Branch**: feat/pad-sea-immersive-title-sync
- **Severity**: HIGH
- **Category**: Purpose & frequency, Cohesion
- **Estimated scope**: 2 files, ~60 LOC

## Problem

Two issues remained after plan 001:

1. **Pads booted monochrome.** `paletteReveal` waited for the full row sweep
   (`bootDone` ≈ 1.91s on desktop) plus a `hold` before the Contact bank
   arrived. Even worse, the body tint multiplied its own bank colour by `0.3`,
   which is a dimming toward black, not a transition to another hue — so before
   `reveal` hit 1 the field read as near-black, not orange.

2. **Finale lacked presence.** The lock-in (76–98% scroll) left a static grid
   over dead water — the most expensive third of the hero was the least alive.

## Target

- Every pad carries its own bank colour from the moment its row lights up in the
  boot sweep. No monochrome hold, no dim multiplier.
- The last stretch of the hero carries a visible breathing swell whose peak is
  large enough to read on a 27" monitor but settles before the step grid settles.

## Repo conventions to follow

- `paletteReveal(rows, elapsed)` returns 0..1; the body and lip both key off
  `reveal` for the transition.
- `bootGlow(row, time)` keys off real elapsed time, not scroll.
- `finaleWave(p)` is a pure function of scroll progress.

## Steps

### Step 1 — paletteReveal starts from mount, not after sweep
File: `features/landing-page/components/hero/pad-sea/pad-field-math.ts`

Removed `bootDone + PALETTE_REVEAL.hold` start; now `start: PALETTE_REVEAL.hold`
(0.1s), `PALETTE_REVEAL = { hold: 0.1, duration: 0.8 }`. Reveal ramps as the
sweep runs, not after it.

### Step 2 — per-pad colour from first lit frame
File: `features/landing-page/components/hero/pad-sea/pad-field.tsx`

Body:
```ts
scratch.tint.copy(tint)
```
Lip:
```ts
scratch.tint.copy(full)
scratch.color.copy(LED_DARK).lerp(scratch.tint, led)
```

Removed the `0.3` multiplyScalar and the `.lerp(tint, reveal)` that held the
field dim. Added a `finale` swell in the surface pass, amplitude 0.55, scaled by
`(1 - lock)` so survivors flatten as they snap.

## Boundaries

- Did NOT touch the fallback SVG (`pad-sea.tsx`) — it still boots mono-orange in
  reduced-motion / no-JS clients. Out of scope.
- Did NOT change keyframe spacing (already done in plan 001).
- Did NOT change `BOOT` row timing — the row sweep stays as-is; only colour
  availability changes.

## Verification

- `npx tsc --noEmit` — passes.
- `npx eslint features/landing-page/components/hero/pad-sea/` — passes.
- `npx jest tests/pad-field-math.test.ts` — 33/33.
- Removed the stale `paletteReveal(rows, bootDone) === 0` assertion (the monochrome
  hold was the bug being fixed); kept monotonicity + endpoint checks.
- Done when: first boot frame shows distinct colours per pad, and the last
  quarter of the scroll shows a visible swell.