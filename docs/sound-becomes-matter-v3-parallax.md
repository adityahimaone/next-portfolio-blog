# Sound Becomes Matter v4: Real Device Parallax

**Status:** implementation design for review. This document replaces the earlier v3 snapshot. It describes the current baseline, the visual diagnosis, the proposed device treatment, major source changes, and the tests that must pass. It does not reproduce every existing file.

## Design read

Reading this as: an art-directed portfolio transition for a designer and frontend engineer, in a tactile studio-hardware language, dial ENERGY 3 / RHYTHM 3 / MOTION 3.

## Goal

Make the About handoff feel like one believable music device breaking apart. The visitor should first recognize a compact sampler and turntable hybrid, then watch its controls, platter, signal path, and patch cable separate into the kinetic type scene.

The first practice line, `Start with the user.`, must land beside a quiet piece of that device. It must not arrive over an empty stage.

## Current baseline

The shipped v3 layer already provides:

- one Matter `ScrollTrigger`, owned by `useMatterMotion()`
- measured PROFILE, fader, and playhead origins
- pure flight math in `matter-flight.ts`
- per-letter SIGNAL and HUMAN animation
- inline SVG fragments
- progressive enhancement and reduced-motion fallback
- an opaque About panel with a measured runway
- exact style restoration during teardown

Preserve these contracts. The v4 work adds a cohesive device layer and grouped motion. It does not add a second scroll system, Web Audio, canvas rendering, or new content copy.

## Why the current scene feels empty

- The current parts appear as isolated square icons, not parts of one machine.
- `vinyl` is only a disc. It lacks a platter, spindle, tonearm, stylus, and label.
- `knob-a`, `pad-a`, and `fader` have no shared panel geometry.
- Narrow opacity windows remove too much visual mass before the first practice line.
- Contours create atmosphere but do not show a signal route.
- `Start with the user.` has no remaining hardware detail to give it context.

## Scene concept

### Device shell

Add one decorative `deviceShell` behind the flying parts. It stays inside the existing `aria-hidden="true"` Matter stage.

The shell is a compact sampler and turntable hybrid viewed slightly from above:

- warm dark chassis with a thin outer edge
- inset faceplate
- left mixer zone with channel strips, knobs, meters, and faders
- right platter zone with record, spindle, tonearm, and cue light
- lower patch zone with sockets and a loose cable
- one primary-color signal path from platter to mixer to playhead

Use solid colors, thin edges, and restrained opacity. Do not add a global glow, glass treatment, or blue-purple gradient. The device should feel printed and anodized, not like a generic sci-fi dashboard.

### Material hierarchy

| Layer        | Treatment                               | Purpose                          |
| ------------ | --------------------------------------- | -------------------------------- |
| chassis      | `var(--matter-ground)` with a thin edge | establishes one physical body    |
| faceplate    | darker solid inset                      | mounts the controls visually     |
| signal       | `var(--primary)` stroke and cue light   | keeps the existing signal accent |
| marks        | foreground at low opacity               | supplies scale without noise     |
| record       | dark disc, groove rings, label          | makes vinyl mechanically legible |
| moving parts | inner edge and restrained shadow        | separates parts from the stage   |

## Music object construction

Replace the current symbolic drawings with compact multi-part SVGs. Keep one SVG per cast member, so the existing part cap does not grow.

| Part                      | Major visual cues                                                    |
| ------------------------- | -------------------------------------------------------------------- |
| `knob-a`                  | mounting plate, outer ring, tick marks, cap, indicator line          |
| `pad-a`                   | rubber pad grid, active inset, panel screws                          |
| `fader`                   | slot, fader cap, grip lines, scale ticks, adjacent meter             |
| `clip-a`, `clip-b`        | timeline lane, clip body, waveform, start marker                     |
| `cassette`                | shell, window, two reels, tape path, label strip                     |
| `cable`                   | curved cable, jack body, strain relief, destination direction        |
| `phones`                  | headband, ear cups, folded resting angle, cable exit                 |
| `vinyl`                   | platter, record, spindle, label, grooves, tonearm, stylus, cue light |
| `key-a`, `key-b`, `key-c` | adjacent keys, gaps, bevel, one accent key                           |
| `jack`                    | socket plate, ring, plug, cable continuation                         |
| `playhead`                | track lane, ruler ticks, triangular head, signal pulse               |

No invented product name, specification, price, statistic, or hardware brand.

## Timing contract

| Progress | Required state                                                       |
| -------: | -------------------------------------------------------------------- |
|   `0.00` | full shell and controls visible; About copy not yet revealed         |
|   `0.10` | shell established; proxy aligned with PROFILE signal                 |
|   `0.22` | clip and playhead begin signal transfer; shell remains readable      |
|   `0.35` | SIGNAL fully legible; device silhouette still present as residue     |
|   `0.40` | platter, mixer, and patch groups begin separating                    |
|   `0.48` | SIGNAL to HUMAN swap; signal path aims toward the type field         |
|   `0.58` | large parts cross the word field; shell remains at quiet low opacity |
|   `0.65` | first practice line begins; platter edge or meter remains behind it  |
|   `0.70` | HUMAN exits; About panel remains below the type band                 |
|   `0.80` | only resident playhead or signal trace remains; body copy dominates  |
|   `1.00` | all large device residue cleared                                     |

The visual floor belongs between `p=.35` and `p=.70`. Empty space becomes intentional only after attention has transferred to readable content.

## Proposed frame contracts

### Device frame

Create `matter-device.ts` as a pure module.

```ts
import { MATTER_PHASES } from './matter-frame'

export type DeviceFrame = {
  shellOpacity: number
  faceplateOpacity: number
  signalOpacity: number
  residueOpacity: number
  platterRotation: number
  meterLevel: number
  tonearm: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
const smooth = (value: number) => value * value * (3 - 2 * value)
const phase = (p: number, from: number, to: number) =>
  smooth(clamp((p - from) / Math.max(0.0001, to - from), 0, 1))

export function matterDeviceFrame(progress: number): DeviceFrame {
  const p = clamp(Number.isFinite(progress) ? progress : 0, 0, 1)
  const establish = phase(p, 0, 0.1)
  const release = phase(p, 0.4, 0.7)
  const clear = phase(p, 0.7, 0.8)
  const signal = phase(p, 0.18, MATTER_PHASES.swap[1])

  return {
    shellOpacity: establish * (1 - clear),
    faceplateOpacity: establish * (1 - phase(p, 0.58, 0.78)),
    signalOpacity: signal * (1 - clear),
    residueOpacity: release * (1 - clear) * 0.22,
    platterRotation: 3 + 42 * release,
    meterLevel: 0.24 + 0.7 * signal,
    tonearm: phase(p, 0.38, 0.62),
  }
}
```

Required properties:

- deterministic under forward and reverse scrubbing
- finite for `NaN`, infinite, zero, and missing geometry inputs
- shell established before major flight exits
- exact zero for shell, faceplate, and residue after the clear boundary
- no DOM reads or writes inside the pure module

### Grouped flight metadata

Extend `FlightPart` with group metadata. Grouping is math metadata, not an extra DOM wrapper.

```ts
export type FlightGroup =
  | 'platter'
  | 'mixer'
  | 'timeline'
  | 'patch'
  | 'keys'
  | 'resident'

export type FlightPart = {
  id: string
  group: FlightGroup
  depth: number
  size: number
  home: { x: number; y: number }
  local: { x: number; y: number }
  source?: string
  exit: { x: number; y: number }
  rot: [number, number]
  window: [number, number]
  delay?: number
  resident?: boolean
}
```

Group intent:

- `platter`: vinyl, tonearm, cue light rotate together, then separate slightly.
- `mixer`: knob, pad, fader, and meter leave as one panel cluster.
- `timeline`: clips maintain a lane before the playhead becomes resident.
- `patch`: plug exits first, cable follows with a delayed bend.
- `keys`: keys leave as one short cascade.
- `resident`: playhead and final signal trace remain longest.

Major `flightFrame()` shape:

```ts
export function flightFrame(
  progress: number,
  part: FlightPart,
  geometry: FlightGeometry,
  home = part.home,
  groupAnchor = { x: 0, y: 0 },
): FlightFrame {
  const p = clamp(finite(progress, 0), 0, 1)
  const d = clamp(finite(part.depth, 0), 0, 1)
  const [from, to] = part.window
  const span = Math.max(0.0001, to - from)
  const localProgress = clamp((p - from) / span, 0, 1)
  const delayed = clamp(
    (localProgress - finite(part.delay, 0)) /
      Math.max(0.0001, 1 - finite(part.delay, 0)),
    0,
    1,
  )
  const t = d > 0.7 ? delayed * delayed : smooth(delayed)
  const x = finite(home.x, 0) + finite(part.local.x, 0) + groupAnchor.x
  const y = finite(home.y, 0) + finite(part.local.y, 0) + groupAnchor.y
  const clearance = Math.hypot(geometry.viewportWidth, geometry.viewportHeight)

  if (part.resident) {
    return {
      x: mix(x, geometry.viewportWidth * 0.38, t),
      y: mix(y, -geometry.viewportHeight * 0.4, t),
      scale: mix(1, 1.12, t),
      rotation: mix(part.rot[0], part.rot[1], t),
      opacity: p < from ? 0 : 1,
    }
  }

  return {
    x: mix(x, normalize(part.exit).x * clearance, t),
    y: mix(y, normalize(part.exit).y * clearance, t),
    scale: mix(1, mix(0.9, 2.6, d), t),
    rotation: mix(part.rot[0], part.rot[1], t),
    opacity: wakeAndTail(p, from, to, d),
  }
}
```

`normalize`, `finite`, `mix`, and `wakeAndTail` remain small private helpers. Keep the existing one-transform-per-element write rule.


## Fixing the empty practice-line moment

Add a decorative `practiceResidue` node inside the stage. It is not semantic copy.

```tsx
<div className={styles.practiceResidue} data-practice-residue>
  ![svg](data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQwIDEyMCIgYXJpYS1oaWRkZW49InRydWUiIHdpZHRoPSIyNDAiIGhlaWdodD0iMTIwIj4KICAgIDxwYXRoIGRhdGEtcmVzaWR1ZS1wbGF0dGVyIGQ9Ik0yOCA4MmE0MiA0MiAwIDEgMCA4NCAwIiAvPgogICAgPHBhdGggZGF0YS1yZXNpZHVlLW1ldGVyIGQ9Ik0xNDggOTRWMjZtMTYgNjhWNDJtMTYgNTJWMzQiIC8+CiAgPC9zdmc+)
</div>
```

The residue contract:

- opacity `0.22` at `p=.58`
- opacity `0.10` at `p=.70`
- exact zero by `p=.78`
- positioned from measured practice heading geometry
- never behind readable story text
- cleared before body copy becomes the focal point

Reveal order:

1. residue appears first
2. practice words rise using the existing mask transition
3. residue dims as the final word settles
4. story copy uses the existing observer reveal

Do not add a second generic fade-up to the story.

## Major bridge markup

The current bridge keeps semantic About content in normal DOM flow. Add only decorative nodes to the existing stage.

```tsx
<div className={styles.stage} data-matter-stage aria-hidden="true">
  <div className={styles.ground} data-matter-ground />

  ![svg](data:image/svg+xml;base64,PHN2ZyBjbGFzc05hbWU9e3N0eWxlcy5kZXZpY2VTaGVsbH0gZGF0YS1kZXZpY2Utc2hlbGwgdmlld0JveD0iMCAwIDEyMDAgNjIwIiB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MjAiPgogICAgPHJlY3QgY2xhc3NOYW1lPXtzdHlsZXMuY2hhc3Npc30geD0iODAiIHk9IjcyIiB3aWR0aD0iMTA0MCIgaGVpZ2h0PSI0NzYiIHJ4PSIxOCIgLz4KICAgIDxyZWN0IGNsYXNzTmFtZT17c3R5bGVzLmZhY2VwbGF0ZX0geD0iMTA4IiB5PSIxMDAiIHdpZHRoPSI5ODQiIGhlaWdodD0iNDIwIiByeD0iMTAiIC8+CiAgICA8cGF0aCBjbGFzc05hbWU9e3N0eWxlcy5zaWduYWxQYXRofSBkYXRhLWRldmljZS1zaWduYWwgZD0iTTc5MCAyODAgQzY1MCAyNTAgNTQwIDI4NiAzNTAgMzMwIiAvPgogICAgPGcgZGF0YS1kZXZpY2UtcGxhdHRlcj57LyogcGxhdHRlciwgcmVjb3JkLCB0b25lYXJtICovfTwvZz4KICAgIDxnIGRhdGEtZGV2aWNlLW1peGVyPnsvKiBrbm9icywgcGFkcywgZmFkZXJzLCBtZXRlcnMgKi99PC9nPgogICAgPGcgZGF0YS1kZXZpY2UtcGF0Y2g+ey8qIHNvY2tldHMgYW5kIGNhYmxlIG9yaWdpbiAqL308L2c+CiAgPC9zdmc+)

  <div className={styles.flightStage}>
    {FLIGHT_PARTS.filter((part) => MATTER_PARTS[part.id]).map((part) => (
      <span
        key={part.id}
        className={styles.part}
        data-flight={part.id}
        data-group={part.group}
        data-band={flightBand(part.depth)}
        style={{ '--size': `${part.size}px` } as React.CSSProperties}
      >
        {MATTER_PARTS[part.id]}
      </span>
    ))}
  </div>

  <div className={styles.practiceResidue} data-practice-residue />
  <div className={styles.typeStage}>
    <span data-matter-word="signal">{letters('SIGNAL')}</span>
    <span data-matter-word="human">{letters('HUMAN')}</span>
  </div>
</div>
```

Keep the existing `KineticLine` calls and existing `ABOUT_TRACKS` strings unchanged.

## Major DOM binder changes

`matter-extras.ts` remains the single binder for flight parts, kinetic letters, shell, and residue.

```ts
import { matterDeviceFrame } from './matter-device'
import { FLIGHT_PARTS, flightFrame } from './matter-flight'
import { letterFrame } from './matter-type'

export function createMatterExtras(stage: HTMLElement, gsap: Gsap) {
  const shell = stage.querySelector<HTMLElement>('[data-device-shell]')
  const residue = stage.querySelector<HTMLElement>('[data-practice-residue]')
  const parts = bindParts(stage)
  const words = bindLetters(stage)
  const snapshots = snapshotOwned([shell, residue, ...parts, ...words])
  let width = 1
  let height = 1

  return {
    reset() {
      gsap.set([...parts, ...words, shell, residue].filter(Boolean), {
        clearProps: 'transform,opacity,--device-shell-opacity,--device-residue-opacity',
      })
    },

    measure() {
      gsap.set([...parts, ...words].filter(Boolean), {
        clearProps: 'transform,opacity',
      })
      width = Math.max(1, stage.clientWidth)
      height = Math.max(1, stage.clientHeight)
      measureSourceHomes(parts, stage)
      measurePracticeResidue(residue, stage)
    },

    render(progress: number) {
      const device = matterDeviceFrame(progress)
      if (shell) shell.style.opacity = String(device.shellOpacity)
      if (residue) residue.style.opacity = String(device.residueOpacity)

      renderGroupedParts(parts, progress, { viewportWidth: width, viewportHeight: height })
      renderLetters(words, progress)
    },

    restore() {
      clearOwnedStyles(gsap, [shell, residue, ...parts, ...words])
      restoreSnapshots(snapshots)
    },
  }
}
```

Implementation rules:

- `measure()` is called only during setup and refresh.
- `render()` performs no layout reads, selector queries, or React updates.
- Every part transform is one composed `translate3d(...) rotate(...) scale(...)` string.
- Never use `gsap.quickSetter(element, 'scale')`. GSAP 3.15 rejects that shorthand in this environment.
- Restore the exact original inline `style` attribute on teardown.

## Motion owner integration

Keep the existing callback ownership:

```ts
onRefreshInit: () => {
  extras.reset()
  measure()
},
onRefresh: (self) => {
  extras.measure()
  renderFrame(matterFrame(self.progress, geometry))
  extras.render(self.progress)
},
onUpdate: (self) => {
  renderFrame(matterFrame(self.progress, geometry))
  extras.render(self.progress)
},
```

No additional trigger, ticker, smoother, or RAF loop.

## CSS integration

Major CSS only. Existing responsive and fallback rules remain authoritative.

```css
.deviceShell {
  position: absolute;
  inset: 12% 8% 18%;
  width: 84%;
  height: 70%;
  overflow: visible;
  pointer-events: none;
  color: var(--foreground);
}

.chassis {
  fill: var(--matter-ground);
  stroke: color-mix(in srgb, var(--foreground) 42%, transparent);
  stroke-width: 2;
}

.faceplate {
  fill: color-mix(in srgb, var(--matter-ground) 72%, black);
  stroke: color-mix(in srgb, var(--foreground) 18%, transparent);
}

.signalPath {
  fill: none;
  stroke: var(--primary);
  stroke-width: 3;
  opacity: 0.72;
}

.practiceResidue {
  position: absolute;
  right: 8%;
  top: 18%;
  width: min(18rem, 28vw);
  aspect-ratio: 2 / 1;
  color: var(--primary);
  opacity: 0;
  pointer-events: none;
}

.practiceResidue svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.practiceResidue path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
```

The stage remains hidden unless `data-motion="ready"`. Mobile, reduced motion, no JavaScript, failed GSAP setup, and missing required markers retain ordinary readable About content.

## Tests

Add `tests/matter-device.test.ts`.

```ts
import { matterDeviceFrame } from '@/features/landing-page/components/matter/matter-device'

it('establishes the device before release', () => {
  expect(matterDeviceFrame(0.1).shellOpacity).toBe(1)
  expect(matterDeviceFrame(0.35).residueOpacity).toBe(0)
})

it('keeps a quiet residue through the practice landing', () => {
  expect(matterDeviceFrame(0.65).residueOpacity).toBeGreaterThan(0)
  expect(matterDeviceFrame(0.7).residueOpacity).toBeGreaterThan(0)
  expect(matterDeviceFrame(0.8).residueOpacity).toBe(0)
})

it('is deterministic and finite', () => {
  expect(matterDeviceFrame(0.53)).toEqual(matterDeviceFrame(0.53))
  for (const value of Object.values(matterDeviceFrame(NaN))) {
    expect(Number.isFinite(value)).toBe(true)
  }
})
```

Extend `matter-flight.test.ts` with:

- each part has a valid group
- grouped members share the first movement direction
- delayed patch cable movement is monotonic
- resident playhead persists after `.80`
- all frames remain finite
- forward and reverse sampling produce identical values

Acceptance sample at 1440 by 900:

- `.35`: shell or residue occupies at least 28% of visible stage area; SIGNAL remains legible.
- `.48`: at least one grouped hardware cluster remains readable.
- `.58`: the device silhouette remains recognizable at low contrast.
- `.65`: the first practice heading has residue opacity between `.08` and `.22`.
- `.70`: the About panel remains below the type band.
- `.80`: only the resident playhead or signal trace remains.

## Accessibility and fallback

- All device art remains in the existing `aria-hidden="true"` stage.
- Semantic About copy remains real text in DOM order.
- No new interaction is introduced.
- No SVG claims to be measured audio data.
- Narrow screens and reduced-motion users receive no decorative stage or hidden copy.
- A failed import or setup leaves the native reading flow intact.

## Performance rules

- Scroll updates write transforms, opacity, and preallocated CSS custom properties only.
- No `getBoundingClientRect`, `offsetHeight`, selector lookup, React state update, or SVG path mutation inside `onUpdate`.
- Use one shell SVG plus the existing fragment nodes, not a new DOM tree per mechanical detail.
- Run the production build and browser checks at 1440 by 900, 1280 by 720, 390 by 844, and 200% zoom.

## Delivery slices

### Slice A: device artwork

Files:

- `features/landing-page/components/matter/matter-bridge.tsx`
- `features/landing-page/components/matter/matter-parts.tsx`
- `features/landing-page/components/matter/matter.module.css`

Build the shell, materials, mechanically legible SVGs, and practice residue.

### Slice B: pure device and grouped math

Files:

- `features/landing-page/components/matter/matter-device.ts`
- `features/landing-page/components/matter/matter-flight.ts`
- `tests/matter-device.test.ts`
- `tests/matter-flight.test.ts`

Build deterministic device frames, group metadata, delayed local offsets, and boundary tests.

### Slice C: binder and verification

Files:

- `features/landing-page/components/matter/matter-extras.ts`
- `features/landing-page/components/matter/use-matter-motion.ts`
- `features/landing-page/components/matter/matter-frame.ts`
- `tests/matter-frame.test.ts`

Integrate the same clock, preserve restoration, verify runway clearance, run tests, build, and browser checks.

## Deliberate simplifications

- No Web Audio API. Scroll remains the source of truth.
- No canvas or WebGL. Inline SVG stays sharp and easy to disable.
- No fake hardware brand, product name, specification, or measurement.
- No new semantic copy behind the practice headings.
- No second animation system.


## Immersive concept exploration

The strongest direction is not a generic music-device illustration. The app already has a real visual language: ArrangementHero, mixer strips, clips, playhead, PROFILE signal, and About tracks. The transition should expose the hidden relationship between those elements.

### Direction A: the arrangement becomes a living circuit

**Core idea:** the ArrangementHero is a working timeline. During the handoff, its clips detach from the timeline and become the About scene's visual grammar.

```text
ARRANGEMENT HERO
  [PROFILE clip] [REACT fader] [playhead]
          │              │          │
          └──── signal route ──────┘
                         ↓
              SIGNAL  →  HUMAN
                         ↓
                 Start with the user.
```

Visual sequence:

1. The real playhead leaves a thin illuminated trail across the Matter stage.
2. The PROFILE clip stretches into a wide waveform ribbon, not a card.
3. The mixer fader becomes a vertical architectural line beside the first practice heading.
4. Clip blocks separate into editorial rules, brackets, and underlines.
5. The line `Start with the user.` appears where the signal route ends.
6. The hardware disappears. The signal route remains as one thin accent rule, then clears.

Why it fits this app: it uses real existing source markers and turns portfolio structure into motion. It avoids inventing a new music product.

### Direction B: the device is a desk viewed from above

**Core idea:** the visitor looks down at a studio desk. The About section is not underneath the device. It is the paper, notes, and decisions revealed on the desk after the machine moves away.

```text
┌──────────────────────────────────────────────┐
│ record       mixer channels        patch bay  │
│     ◉       ▥ ▥ ▥ ▥ ▥             o─── cable │
│      ╲                 playhead               │
│       ╲________________│________________      │
│                          Start with the user. │
└──────────────────────────────────────────────┘
```

Visual sequence:

1. Chassis enters as one wide slab, with believable mounting relationships.
2. The record turns slowly while the playhead advances across a track lane.
3. The left mixer bank lifts as one cluster. Knob, pad, meter, and fader keep their spacing.
4. The tonearm points toward the first practice line, acting as a visual pointer.
5. The record and mixer slide outward, exposing the About panel as the desk surface.
6. A small meter and the tonearm remain during `Start with the user.`. They fade before body copy.

Why it fits this app: it makes the existing DAW metaphor physically readable. It gives the section enough mass to feel immersive without adding semantic UI.

### Direction C: the page is a signal observatory

**Core idea:** the visitor moves through a field of signal traces. The music objects are not scattered icons. They are stations connected by one continuous route.

```text
[PROFILE] ───╮
             ├── waveform tunnel ─── [MIX]
[PLAYHEAD] ──╯                         │
                                      HUMAN
                                        │
                              Start with the user.
```

Visual sequence:

1. Three traces enter from the actual source locations: PROFILE, fader, and playhead.
2. The traces converge at the center, creating one temporary signal junction.
3. The junction unfolds into a record, channel strip, cable socket, and clip lane.
4. SIGNAL and HUMAN appear inside the trace field, not above unrelated objects.
5. The traces straighten into editorial rules pointing toward the About tracks.
6. The final trace becomes a small resident playhead and then clears.

Why it fits this app: it makes the handoff about connection and practice, not literal hardware. It is the lightest implementation, but also the least tactile.

## Recommended direction: A plus B

Use **Direction A** as the narrative spine and **Direction B** as the physical staging.

The result should read as:

```text
real arrangement
      ↓
working device
      ↓
connected signal route
      ↓
editorial practice line
      ↓
quiet reading surface
```

Do not combine all three directions. Direction C can supply the signal-path treatment, but its observatory framing should not become a separate visual world.

## Screen-by-screen visual storyboard

### Frame 01: machine still running, `p=.00`

```text
┌──────────────────────────────────────────────┐
│                                              │
│       ┌──────────── DEVICE ────────────┐     │
│       │  mixer      waveform    record  │     │
│       │  ▥ ▥ ▥       ~~~~~       ◎      │     │
│       │          ────│────              │     │
│       └─────────────────────────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
```

The shell is the focal point. No isolated fragment should compete with it.

### Frame 02: signal leaves the machine, `p=.22`

```text
┌──────────────────────────────────────────────┐
│       ┌──────── DEVICE ────────┐             │
│       │ mixer       record     │             │
│       │ ▥ ▥ ▥        ◎╲        │             │
│       └───────────────╲────────┘             │
│                       ╲  ~~~~~ signal       │
│                    ────╲──────              │
└──────────────────────────────────────────────┘
```

The PROFILE waveform becomes the bridge. The first flight is directional, not random.

### Frame 03: word field, `p=.35`

```text
┌──────────────────────────────────────────────┐
│       faint chassis / record residue         │
│                                              │
│                 S I G N A L                  │
│       ───────────────╱────────────           │
│             mixer fragments near edge        │
└──────────────────────────────────────────────┘
```

At least one coherent device silhouette remains. SIGNAL owns the center.

### Frame 04: break-apart, `p=.58`

```text
┌──────────────────────────────────────────────┐
│      ○ platter       ▥ mixer                 │
│                  H U M A N         ──╮      │
│       cable ────────────────╱─────────┘      │
│                         playhead             │
└──────────────────────────────────────────────┘
```

Large parts travel along group paths. HUMAN remains readable because the route bends around it.

### Frame 05: practice landing, `p=.65`

```text
┌──────────────────────────────────────────────┐
│                                ○             │
│                         meter  │             │
│              Start with the user.            │
│                                              │
│        body copy begins below                │
└──────────────────────────────────────────────┘
```

The residual platter edge or meter gives the heading a visual anchor. It clears before story text becomes dominant.

### Frame 06: reading plateau, `p=.80`

```text
┌──────────────────────────────────────────────┐
│                         │ playhead           │
│                                              │
│  Behind the interface.                       │
│                                              │
│  readable About content                      │
└──────────────────────────────────────────────┘
```

Only one resident signal remains. No large decorative object competes with reading.

## Visual rules that make it feel like a real device

1. **Shared mounting geometry:** knobs, faders, pads, and meters must align to one faceplate grid.
2. **Shared light direction:** every moving object gets the same restrained inner edge, never independent shadows.
3. **Mechanical cause:** a cable follows a socket, a tonearm follows a record, and a playhead follows a lane.
4. **Mass before detail:** establish chassis and panel silhouette before showing small SVG details.
5. **Signal continuity:** one primary-color route connects the real source markers to the practice line.
6. **Editorial handoff:** the device points toward the sentence, then yields to the sentence.
7. **No particle scatter:** every object belongs to a group, a source, or the resident trace.
8. **No fake product UI:** decorative marks remain abstract. Existing app labels remain the only real labels.

## Recommended implementation order

1. Build the single shell and test its silhouette at 1440 by 900 and 1280 by 720.
2. Connect the real PROFILE, fader, and playhead markers with one signal route.
3. Replace the vinyl SVG with platter, record, tonearm, stylus, and cue light.
4. Group mixer, platter, patch, timeline, and key motion.
5. Add practice residue measured against the first practice heading.
6. Tune opacity and clearance at `.35`, `.48`, `.58`, `.65`, `.70`, and `.80`.
7. Only then add secondary cassette and headphone details if the silhouette still needs them.

## Concrete visual blueprint

### Stage composition at 1440 by 900

Use the stage as a three-depth composition. Do not center every object on the same point.

```text
x: 0%                 22%          50%             78%                100%
   far contour  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        timeline clips                    record / platter
              [====]                         (  ◎  )
                   ───────── signal path ─────╲
        mixer bank       [ knob ][ fader ]      ╲ tonearm
        [ pad ][ pad ]                         [ socket ]── cable

                         SIGNAL / HUMAN

        About body zone                      practice heading zone
        x=14%..45%                            x=60%..91%
```

Coordinate rules:

- Shell: `left: 10%`, `top: 18%`, `width: 80%`, `height: 54%`.
- Mixer cluster: left half of shell, approximately `x=20%..48%`.
- Platter cluster: right half, approximately `x=58%..82%`.
- Practice residue: right of the reading column, never inside the body column.
- Signal path: one continuous route from measured PROFILE origin to the playhead lane.
- Human-sized copy remains the focal point after `p=.58`; hardware becomes secondary through opacity, not blur.

These are stage-relative starting values. Measure the final type band and practice heading before fixing the residue position.

### Source-to-visual mapping


| Existing app element   | Visual transformation                             | Why it belongs                                 |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------- |
| PROFILE clip           | waveform ribbon and source of signal path         | it is the existing signal source               |
| React fader            | vertical mixer channel and first detached control | it is a real measured mixer origin             |
| arrangement playhead   | track lane, resident line, final trace            | it already marks time in the hero              |
| arrangement clips      | timeline blocks and editorial rules               | they become structure, not random rectangles   |
| About practice heading | destination of the signal route                   | it turns the portfolio claim into the endpoint |
| About body copy        | exposed reading surface                           | it replaces the device as the main content     |

Do not create a fictitious data relationship. The route is an art-directed transition between real existing visual elements, not an analytics visualization.

## Concrete state machine

The device has five visual states. State names describe composition, not React state.

```text
SOURCE_HOLD
   │ p=.00.. .10
   ▼
DEVICE_ESTABLISHED
   │ p=.10.. .40
   ▼
SIGNAL_TRANSFER
   │ p=.40.. .58
   ▼
DEVICE_RELEASE
   │ p=.58.. .70
   ▼
READING_RESIDUE
   │ p=.70.. .80
   ▼
READING_PLATEAU
```

State responsibilities:

- `SOURCE_HOLD`: show the shell and source proxy. No large object travels.
- `DEVICE_ESTABLISHED`: establish chassis, faceplate, platter, and mixer relationships.
- `SIGNAL_TRANSFER`: animate the route, playhead, and SIGNAL to HUMAN swap.
- `DEVICE_RELEASE`: detach grouped hardware. Keep the silhouette visible.
- `READING_RESIDUE`: support `Start with the user.` with one quiet detail.
- `READING_PLATEAU`: clear all large hardware. Leave only the resident trace, then clear it.

The pure frame functions should derive these states from progress. Do not store mutable state between scroll frames.

## More concrete code shape

### Device DOM contract

Use dedicated data markers so the binder owns only the new decorative nodes.

```tsx
![svg](data:image/svg+xml;base64,PHN2ZwogIGNsYXNzTmFtZT17c3R5bGVzLmRldmljZVNoZWxsfQogIGRhdGEtZGV2aWNlLXNoZWxsCiAgdmlld0JveD0iMCAwIDEyMDAgNjIwIgogIGFyaWEtaGlkZGVuPSJ0cnVlIgogd2lkdGg9IjEyMDAiIGhlaWdodD0iNjIwIj4KICA8ZyBkYXRhLWRldmljZS1jaGFzc2lzPnsvKiBvdXRlciBib2R5IGFuZCBmYWNlcGxhdGUgKi99PC9nPgogIDxnIGRhdGEtZGV2aWNlLW1peGVyPnsvKiBrbm9icywgcGFkcywgZmFkZXJzLCBtZXRlcnMgKi99PC9nPgogIDxnIGRhdGEtZGV2aWNlLXBsYXR0ZXI+ey8qIHBsYXR0ZXIsIHJlY29yZCwgdG9uZWFybSwgc3R5bHVzICovfTwvZz4KICA8cGF0aCBkYXRhLWRldmljZS1zaWduYWwgZD0iTTc5MCAyODAgQzY1MCAyNTAgNTQwIDI4NiAzNTAgMzMwIiAvPgogIDxnIGRhdGEtZGV2aWNlLXBhdGNoPnsvKiBzb2NrZXRzIGFuZCBjYWJsZSBvcmlnaW4gKi99PC9nPgo8L3N2Zz4=)
<div className={styles.practiceResidue} data-practice-residue aria-hidden="true">
  ![svg](data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQwIDEyMCIgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxMjAiPgogICAgPHBhdGggZGF0YS1yZXNpZHVlLXBsYXR0ZXIgZD0iTTI4IDgyYTQyIDQyIDAgMSAwIDg0IDAiIC8+CiAgICA8cGF0aCBkYXRhLXJlc2lkdWUtbWV0ZXIgZD0iTTE0OCA5NFYyNm0xNiA2OFY0Mm0xNiA1MlYzNCIgLz4KICA8L3N2Zz4=)
</div>
```

### Device writer shape

The binder should write a small set of paint-only properties. Keep shell internals static where possible.

```ts
const writeDevice = (frame: DeviceFrame) => {
  shell?.style.setProperty('--device-opacity', String(frame.shellOpacity))
  shell?.style.setProperty('--faceplate-opacity', String(frame.faceplateOpacity))
  shell?.style.setProperty('--signal-opacity', String(frame.signalOpacity))
  shell?.style.setProperty('--platter-rotation', `${frame.platterRotation}deg`)
  shell?.style.setProperty('--tonearm-progress', String(frame.tonearm))
  shell?.style.setProperty('--meter-level', String(frame.meterLevel))
  residue?.style.setProperty('--residue-opacity', String(frame.residueOpacity))
}
```

```css
.deviceShell {
  opacity: var(--device-opacity, 0);
  transform: translate3d(0, 0, 0);
  will-change: opacity;
}
[data-device-chassis] {
  opacity: var(--faceplate-opacity, 0);
}
[data-device-signal] {
  opacity: var(--signal-opacity, 0);
}
[data-device-platter] {
  transform-origin: 78% 44%;
  transform: rotate(var(--platter-rotation, 0deg));
}
[data-device-patch] {
  opacity: var(--faceplate-opacity, 0);
}
.practiceResidue {
  opacity: var(--residue-opacity, 0);
  will-change: opacity, transform;
}
```

The CSS custom properties are written by the motion owner only. No CSS animation should fight the ScrollTrigger clock.

## Immersion checklist before implementation is accepted

- At `p=.00`, the visitor can describe one machine, not fourteen icons.
- At `p=.35`, SIGNAL has a visible source, route, and destination.
- At `p=.48`, HUMAN appears because the route changes target, not because two words randomly crossfade.
- At `p=.65`, `Start with the user.` has a visible residual hardware anchor.
- At `p=.80`, the reading surface wins and the device has a clear exit.
- Scrubbing backward reconstructs the same machine states.
- Removing JavaScript never removes About content.
- Reduced motion never leaves the user with an empty section.

## Owner decisions

1. Should the device lean sampler, turntable, or compact mixing desk?
2. Should cassette and headphones remain, or should the cast stay closer to the visible ArrangementHero?
3. Should the resident playhead persist through the entire About plateau?
4. Should the faceplate stay dark like the hero, or lift slightly against the page background?
