# Animation Plans

Audit: 3D Pad Sea scroll animation, branch `feat/pad-sea-immersive-title-sync`.

## Plans

| # | Title | Severity | Status | Files |
|---|---|---|---|---|
| [001](001-pad-sea-immersive-scroll-title-sync.md) | Immersive scroll + title sync | HIGH | DONE | 3 |
| [002](002-colorful-boot-finale-wave.md) | Colorful boot + visible finale | HIGH | DONE | 2 |

## Execution order

1. **001** — immersive scroll smoothing + gaze lerp + title 3D + dive extension + banking roll.
2. **002** — `paletteReveal` starts from mount + per-pad colour from first lit frame + finale swell.

## Dependencies

- 002 builds on 001's keyframe layout; keyframe changes from 001 must land first.
- Both plans share `pad-field-math.ts` and `pad-field.tsx`.

## Status legend

- TODO — not started
- IN PROGRESS — work underway
- DONE — implemented and verified