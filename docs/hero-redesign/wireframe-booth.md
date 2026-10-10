# Wireframe Booth - Hero Concept 6

> A 3D wireframe of a single listening room, drawn in one line weight and one accent colour. The camera pushes in toward the chair; the speaker pulses with the page's track; the headline types itself on the back wall.

This is one of four candidate redesigns for `features/landing-page/rack-01/section-hero.tsx`. It deliberately drops the device wall, the pad sea, the broken-light name, the rack-collapse chapter and the LCD readouts. The bottom rail and the About handoff survive (Section 9). Everything else is replaced by a single line drawing in motion.

## 0.0 Design Read

> Reading this as: a premium-consumer audio-product hero (DAP / music language) for a technical hiring audience, with the `Signal` warm-aluminium + signal-orange + LCD-green brand, leaning on a single drawn-line aesthetic and a slow camera dolly, dials `VARIANCE 8 / MOTION 8 / DENSITY 2`.

- VARIANCE 8: one asymmetric composition, drawn not rendered. The room occupies the right 60%, the headline occupies the left 40%, and the rail anchors the bottom.
- MOTION 8: scroll = one continuous push-in. The room rotates slowly on idle (0.05 rad/s). The speaker cone pulses with the page's track. The headline types itself on the back wall.
- DENSITY 2: the room has seven objects (four walls, floor, ceiling, chair, speaker). Nothing else. The page trusts the line.

## 0.1 Premise

The product invites you into a room. The room is a single chair, a single speaker, four walls, a floor, a ceiling. The whole thing is drawn, not rendered: a thin signal-orange line on charcoal, with the soft shadow of a real environment arriving only as the camera gets close. The page is a hi-fi brand's product photograph translated into a wireframe, the way KEF and Devialet and Sonos have all shipped hero shots at some point: a single object in a single space, with the brand's accent colour as the only light source.

The headline is not floating above the scene. It is typeset on the back wall. The user reads it because the camera pushes toward it. The speaker cone pulses with the track currently playing on the page's `MusicPlayer`, so when audio is on the room is alive, when audio is off the room is still.

The wireframe is the brand statement: "we are a developer who builds with care, the same care a speaker designer builds a listening room." The page does not need to explain it. The drawing explains it.

## 0.2 Concept

```
viewport edge
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Built for the            ╭─────────────────────────╮       │
│   moment after             │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ back  │
│   launch.                  │ ▒                     ▒ │ wall  │
│   Frontend systems         │ ▒                     ▒ │       │
│   for products that        │ ▒                     ▒ │       │
│   have to work at          │ ▒                     ▒ │       │
│   scale.                   │ ▒                     ▒ │       │
│                            │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │       │
│                            ╰─────────────────────────╯       │
│                            │    │              │    │        │
│                            │    │    chair     │    │        │
│  ┌─────┐  ┌─────┐          │    │              │    │        │
│  │ 4+  │  │  3  │          │    │              │    │ speaker│
│  │ yrs │  │teams│          │  ╔════════════════════╗  │  on   │
│  └─────┘  └─────┘          │  ║   HEADLINE TYPES   ║  │  right│
│  ┌─────┐                   │  ║   ONTO THE BACK    ║  │  wall │
│  │15K+ │                   │  ║   WALL AS THE      ║  │       │
│  │ usr │                   │  ║   CAMERA ARRIVES   ║  │       │
│  └─────┘                   │  ╚════════════════════╝  │       │
│                            │       ← pulse ←          │       │
│  [ See the works ↓ ]       │                          │       │
│  [ Read the notes ↗ ]      ╰──────────────────────────╯       │
│  [ Resume ↗ ]                                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   rail: 1 room / 7 objects / 1 line  About Aditya →
   handoff: Next signal / 02  Profile
```

The room is the only 3D element. The headline, the readouts and the link pads are DOM overlays anchored to the hero's CSS-grid layout. The room's `LineSegments` is at z-index 0; the overlays are at z-index 2. The headline copy is duplicated into a real DOM `<h1>` (visually hidden behind a `clip-path` for screen readers, visually present as a CSS `mask` over the back-wall plane in the 3D scene).

## 0.3 Visual specification

### 0.3.1 Color usage (locked to brand tokens)

| Element | Light | Dark | Token |
| --- | --- | --- | --- |
| Background | `#e7e6dd` | `#0d1110` | `--background` shifted one stop |
| Wireframe line | `#a03d12` | `#ff5a1f` | `--primary` |
| Wireframe line (hover / accent) | `#7a2c0c` | `#ff8a5e` | `--primary-dark` / `--primary-light` |
| Speaker cone fill (when audio on) | n/a | `rgba(122, 187, 94, 0.18)` | `--secondary` with alpha |
| Soft shadow | `rgba(20, 24, 23, 0.12)` | `rgba(0, 0, 0, 0.55)` | new `--wireframe-shadow` |
| Headline ink | n/a | `#f1eee5` | `--card-foreground` |
| LCD readouts | unchanged | unchanged | existing tokens |

The wireframe is the only coloured line in the entire scene. There is no second accent, no third colour, no highlight overlay. The chair, the speaker, the walls, the floor, the ceiling: all the same `LineBasicMaterial` in `--primary`. This is what makes the page read as "drawing", not "rendering".

### 0.3.2 Typography (existing stack, no new fonts)

| Role | Family | Spec | Notes |
| --- | --- | --- | --- |
| Headline (in scene) | Syne | `750 clamp(2.5rem, 5vw, 4.5rem) / 0.96` | tracking `-0.05em`; max `13ch`; types itself onto a `CanvasTexture` on the back wall |
| Subtext | Geist | `400 1.0625rem / 1.6` | max `60ch`; one paragraph |
| LCD readout value | Orbitron | `600 0.875rem` | `font-variant-numeric: tabular-nums` |
| LCD readout label | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Silkscreen rail | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Link pad | Space Grotesk | `650 0.9375rem` | tracking `-0.01em` |
| Headline DOM mirror (a11y) | Syne | same as in-scene, `clip-path: inset(50% 50%)` | visually hidden, screen-reader visible |

The DOM mirror exists for two reasons: screen readers cannot read a `CanvasTexture`, and search engines need the headline in real text. It is `position: absolute; inset: 0; clip-path: inset(50% 50%); pointer-events: none;` so it occupies the hero's grid but is not visible.

### 0.3.3 Materials and lighting

The wireframe is a single material, repeated:

```ts
const wireMaterial = new LineBasicMaterial({
  color: cssColor('--primary'),
  transparent: true,
  opacity: 0.78,
  linewidth: 1, // WebGL ignores > 1 on most platforms; render the chair thicker via TubeGeometry if needed
})
```

The "linewidth: 1" is a known WebGL limitation (most browsers cap line width at 1 device pixel). Two options: accept the thin line as a feature, or build thicker lines via `TubeGeometry` over a curve. The default is the thin line, the alternative is documented in Section 0.11.

Lighting is one `AmbientLight` (intensity 0.6, colour `#222827`) and one `DirectionalLight` from `(2, 4, 3)` (intensity 0.4, colour `#ff5a1f` with intensity 0.2). The directional light is the only source of soft shadow: it casts onto a single `ShadowMaterial` plane (the floor) with `opacity: 0.18`. This is what gives the wireframe its "drawn in a room" feeling without ever rendering the walls solid.

No bloom, no DoF, no tone mapping override. Default ACESFilmic from the renderer is enough.

### 0.3.4 Room geometry

The room is 6m x 4m x 3m (real-world units; the camera FOV is set so 1 unit = 1 metre at the working distance). Built from primitives:

| Object | Geometry | Edges derived |
| --- | --- | --- |
| Floor | `PlaneGeometry(6, 4)` | perimeter only |
| Ceiling | `PlaneGeometry(6, 4)` at y=3 | perimeter only |
| Back wall | `PlaneGeometry(6, 3)` at z=-2 | perimeter only |
| Front wall | none (camera is here, occluded) | n/a |
| Left wall | `PlaneGeometry(4, 3)` rotated 90° at x=-3 | perimeter only |
| Right wall | `PlaneGeometry(4, 3)` rotated 90° at x=3 | perimeter only |
| Chair | `BoxGeometry(0.5, 1, 0.5)` seat + `BoxGeometry(0.5, 0.6, 0.05)` back + 4 cylinder legs | all edges |
| Speaker | `BoxGeometry(0.4, 0.7, 0.3)` cabinet + `CylinderGeometry(0.12, 0.12, 0.04, 32)` cone | cabinet edges, cone ring + centre |

Edges are derived via `EdgesGeometry(geometry, 30)` (30° threshold so only sharp edges render, not subdivided mesh faces). Each `LineSegments` shares the single `wireMaterial`.

The chair sits at `(0, 0, -0.4)`. The speaker sits at `(2.2, 0.5, -1.7)`, slightly behind the chair and to the right, tilted 5° toward the listener. The camera starts at `(3.5, 1.6, 2.5)` looking at the chair.

## 0.4 Layout

### 0.4.1 Hero container

```css
.hero {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--background);
  container-type: inline-size;
}
```

Same `container-type: inline-size` discipline as concept 2. The headline scales with the hero's own width, not the viewport.

### 0.4.2 Z-layers

| z | Element | Pointer |
| --- | --- | --- |
| 0 | R3F `<Canvas>` (room) | n/a |
| 1 | Soft shadow plane | none |
| 2 | Headline (in-scene CanvasTexture on back wall) | n/a |
| 3 | DOM overlays: subtext, readouts, link pads, rail, handoff | auto on pads, none on readouts |
| 4 | Headline DOM mirror (a11y) | none |

### 0.4.3 Responsive collapse

| Breakpoint | Headline scale | Camera FOV | Chair + speaker |
| --- | --- | --- | --- |
| `< 480px` | `clamp(2rem, 8vw, 2.5rem)` | `52°` | scale `0.7`, room scale `0.85` |
| `480 - 768px` | `clamp(2.25rem, 6vw, 3rem)` | `46°` | scale `0.85`, room scale `0.9` |
| `768 - 1280px` | `clamp(2.5rem, 5vw, 4rem)` | `40°` | full size |
| `>= 1280px` | `clamp(3rem, 5vw, 4.5rem)` | `36°` | full size |

Mobile users see the same room, scaled. The headline still types on the back wall, the camera still pushes in, but the push is shorter (200ms instead of 600ms scrub) so it does not feel slow on a small screen.

## 0.5 Motion choreography

### 0.5.1 Idle (no scroll)

- The room rotates `0.05 rad/s` around the world Y axis. Slow enough to feel like a turntable, fast enough to read as "alive".
- The speaker cone pulses at the page's 120 BPM (one full cycle per 500ms) when audio is off. When audio is on, the pulse is driven by the actual track amplitude via the existing `useAudio` hook. The pulse is a scale animation on the cone: `cone.scale.y = 1 + amplitude * 0.18`.
- The headline on the back wall is rendered character by character. At mount, characters 0..N appear with a 35ms stagger, in two passes: the headline (chars 0..9) first, then the subtext (chars 9..N). Each character fades in over 220ms, ease-out, with a 1.5px upward translate.
- The DOM readouts cycle every 4s, same as concept 2.

### 0.5.2 Scroll timeline

| Progress | Camera | Room | Headline | Readouts | Handoff |
| --- | --- | --- | --- | --- | --- |
| `0.00` | `(3.5, 1.6, 2.5)`, FOV `36°` | full room visible, slow rotation | typed in (0..0.05s of mount) | fade in, stagger 80ms | hidden |
| `0.00 - 0.50` | dollies to `(0.5, 1.4, 0.5)`, FOV `34°` | rotation slows to `0.02 rad/s` | holds | holds | hidden |
| `0.50 - 0.85` | continues to `(0, 1.3, -0.3)`, FOV `40°` | rotation stops | holds | holds | hidden |
| `0.85 - 0.95` | pulls back slightly to `(0.4, 1.5, 0.6)`, FOV `40°` | room still | head fades to `0.32` opacity, `filter: blur(0 → 2px)` | fade to `0.4` opacity | slides in from `yPercent: 100` |
| `0.95 - 1.00` | holds, vignette darkens | room still | locked | locked | fully in, `opacity: 1` |

The whole camera path is a `CatmullRomCurve3` through the four keyframes. The curve is sampled at scroll progress, `camera.position.copy(curve.getPointAt(p))`, with `lookAt(0, 0.6, -0.5)`. The FOV is interpolated independently with `power2.inOut`. This produces a real arc, not a straight line: the camera dips slightly as it approaches the chair, which reads as "leaning in" rather than "zooming in".

### 0.5.3 Easing and timing

| Use | Curve | Duration |
| --- | --- | --- |
| Boot reveal (headline type) | per-char `cubic-bezier(0.22, 1, 0.36, 1)` | 220ms per char, 35ms stagger |
| Idle rotation | linear, `0.05 rad/s` | continuous |
| Camera dolly | curve-sampled, FOV `power2.inOut` | scrub, `scrub: 0.5` |
| Headline blur/fade on exit | `cubic-bezier(0.22, 1, 0.36, 1)` | scrub |
| Speaker pulse (audio off) | sine wave, 0.5s period (120 BPM) | continuous |
| Speaker pulse (audio on) | `lerp(currentScale, 1 + amplitude * 0.18, 0.2)` per frame | continuous |
| Handoff slide in | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.32s |
| LCD value crossfade | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.3s in, 0.3s out, 200ms hold |

### 0.5.4 Reduced motion

`prefers-reduced-motion: reduce`:
- No idle rotation. The room is locked at angle 0.
- No speaker pulse. The cone is at scale `1, 1, 1`.
- Headline appears instantly, all characters at once.
- The camera holds at the frame 0 position for the entire scroll. The chair, the speaker, the walls are all visible from the start, and the headline is already on the back wall.
- The boot sequence is instant.

## 0.6 Stack and architecture

### 0.6.1 Files

```
features/landing-page/components/wireframe-booth/
├── booth-stage.tsx               # top-level hero section (DOM overlay)
├── booth-stage.module.css        # hero layout + grid for overlays
├── booth-r3f.tsx                 # R3F <Canvas> wrapper
├── booth-room.tsx                # floor, ceiling, four walls (LineSegments)
├── booth-chair.tsx               # chair geometry
├── booth-speaker.tsx             # speaker geometry + cone pulse
├── booth-headline-texture.tsx    # CanvasTexture painter for the back wall
├── booth-camera.ts               # <PerspectiveCamera> + ScrollTrigger wiring
├── booth-readouts.tsx            # three LCD readout cards (DOM)
├── booth-readouts.module.css     # readout card styles
├── use-booth-motion.ts           # writes progress + velocity, exposes to R3F
└── index.ts                      # barrel: <WireframeBooth />
```

Plus one edit to `features/landing-page/rack-01/section-hero.tsx` to replace the `<PadSea />` mount with `<WireframeBooth />`. The `data-anim` attributes the rack hook queries for the rail and the handoff are preserved on the new component.

### 0.6.2 Hook contract

```ts
// use-booth-motion.ts
export type BoothMotion = {
  progress: { current: number }
  velocity: { current: number }
  reduced: boolean
  audio: { amplitude: number; playing: boolean }
}

export function useBoothMotion(
  ref: RefObject<HTMLElement>,
  audioSource: { amplitude: number; playing: boolean },
): BoothMotion
```

The audio source is the existing `useAudio` hook. The booth subscribes to amplitude and playing state. When the user clicks play elsewhere on the page, the speaker cone in the booth starts pulsing with the actual track. When audio is off, the cone pulses at the page's 120 BPM idle (the page's own heartbeat).

### 0.6.3 Capability probe

Same `decideRuntime()` function as concept 2. The fallback is a static SVG that draws the room as 12 lines (4 walls + 4 floor edges + 4 ceiling edges) plus the chair silhouette and the speaker outline, in `--primary` on `--background`. The headline is real text on top. The fallback is real, not an apology.

## 0.7 Code suggestion

### 0.7.1 Room mesh (`booth-room.tsx`)

```tsx
'use client'

import { useMemo } from 'react'
import {
  EdgesGeometry,
  LineSegments,
  type Color,
} from 'three'

import { useBoothMotion } from './use-booth-motion'
import { Chair } from './booth-chair'
import { Speaker } from './booth-speaker'

const ROOM = { w: 6, d: 4, h: 3 }

function wall(
  width: number,
  height: number,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
) {
  // EdgesGeometry on a PlaneGeometry returns only the perimeter. We
  // intentionally do not render the plane itself, only the lines.
  return { width, height, position, rotation }
}

type Props = { motion: ReturnType<typeof useBoothMotion> }

export function BoothRoom({ motion }: Props) {
  const lineRef = useMemo(() => ({ current: null as LineSegments | null }), [])

  const walls = useMemo(
    () => [
      // Floor
      wall(ROOM.w, ROOM.d, [0, 0, 0], [-Math.PI / 2, 0, 0]),
      // Ceiling
      wall(ROOM.w, ROOM.d, [0, ROOM.h, 0], [Math.PI / 2, 0, 0]),
      // Back
      wall(ROOM.w, ROOM.h, [0, ROOM.h / 2, -ROOM.d / 2], [0, 0, 0]),
      // Left
      wall(ROOM.d, ROOM.h, [-ROOM.w / 2, ROOM.h / 2, 0], [0, Math.PI / 2, 0]),
      // Right
      wall(ROOM.d, ROOM.h, [ROOM.w / 2, ROOM.h / 2, 0], [0, -Math.PI / 2, 0]),
    ],
    [],
  )

  return (
    <group rotation={[0, 0, 0]}>
      {walls.map((w, i) => (
        <Wall key={i} {...w} />
      ))}
      <Chair position={[0, 0, -0.4]} />
      <Speaker
        position={[2.2, 0.5, -1.7]}
        rotation={[0, -0.4, 0.05]}
        amplitudeRef={motion.audio}
      />
    </group>
  )
}

function Wall({
  width,
  height,
  position,
  rotation,
}: {
  width: number
  height: number
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const edges = useMemo(() => {
    const plane = new (require('three').PlaneGeometry)(width, height)
    const e = new EdgesGeometry(plane, 1)
    plane.dispose()
    return e
  }, [width, height])

  return (
    <lineSegments
      position={position}
      rotation={rotation}
      geometry={edges}
    >
      <lineBasicMaterial
        color={'var(--primary)'}
        transparent
        opacity={0.78}
      />
    </lineSegments>
  )
}
```

### 0.7.2 Chair (`booth-chair.tsx`)

```tsx
'use client'

import { useMemo } from 'react'
import { BoxGeometry, CylinderGeometry, EdgesGeometry } from 'three'

export function Chair({
  position,
}: {
  position: [number, number, number]
}) {
  const seat = useMemo(() => new EdgesGeometry(new BoxGeometry(0.5, 0.05, 0.5), 30), [])
  const back = useMemo(
    () => new EdgesGeometry(new BoxGeometry(0.5, 0.6, 0.05), 30),
    [],
  )
  const legGeo = useMemo(() => new CylinderGeometry(0.015, 0.015, 0.45, 8), [])
  const legEdges = useMemo(() => new EdgesGeometry(legGeo, 30), [legGeo])

  const legPositions: [number, number, number][] = [
    [-0.22, 0.225, -0.22],
    [0.22, 0.225, -0.22],
    [-0.22, 0.225, 0.22],
    [0.22, 0.225, 0.22],
  ]

  return (
    <group position={position}>
      <lineSegments position={[0, 0.45, 0]} geometry={seat}>
        <lineBasicMaterial color={'var(--primary)'} transparent opacity={0.78} />
      </lineSegments>
      <lineSegments position={[0, 0.75, -0.225]} geometry={back}>
        <lineBasicMaterial color={'var(--primary)'} transparent opacity={0.78} />
      </lineSegments>
      {legPositions.map((p, i) => (
        <lineSegments key={i} position={p} geometry={legEdges}>
          <lineBasicMaterial color={'var(--primary)'} transparent opacity={0.78} />
        </lineSegments>
      ))}
    </group>
  )
}
```

### 0.7.3 Speaker with pulse (`booth-speaker.tsx`)

```tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  CylinderGeometry,
  EdgesGeometry,
  type Mesh,
} from 'three'

type Props = {
  position: [number, number, number]
  rotation: [number, number, number]
  amplitudeRef: { amplitude: number; playing: boolean }
}

const IDLE_AMP = 0.18
const IDLE_PERIOD = 0.5 // 120 BPM

export function Speaker({ position, rotation, amplitudeRef }: Props) {
  const coneRef = useRef<Mesh>(null)

  const cabinet = useMemo(
    () => new EdgesGeometry(new BoxGeometry(0.4, 0.7, 0.3), 30),
    [],
  )
  const coneRing = useMemo(
    () => new EdgesGeometry(new CylinderGeometry(0.12, 0.12, 0.04, 32), 30),
    [],
  )

  useFrame((state) => {
    if (!coneRef.current) return
    const t = state.clock.elapsedTime
    let amp: number
    if (amplitudeRef.playing) {
      // Audio is on: drive from the live amplitude
      amp = amplitudeRef.amplitude
    } else {
      // Audio is off: idle pulse at 120 BPM
      amp = IDLE_AMP * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / IDLE_PERIOD))
    }
    // Lerp toward the target so the cone never snaps
    const target = 1 + amp * 0.18
    const current = coneRef.current.scale.y
    coneRef.current.scale.y = current + (target - current) * 0.2
  })

  return (
    <group position={position} rotation={rotation}>
      <lineSegments geometry={cabinet}>
        <lineBasicMaterial color={'var(--primary)'} transparent opacity={0.78} />
      </lineSegments>
      <mesh ref={coneRef} position={[0, 0, 0.151]}>
        {/* A flat disc so the speaker reads as solid where it pulses */}
        <cylinderGeometry args={[0.12, 0.12, 0.04, 32]} />
        <meshStandardMaterial
          color={'var(--secondary)'}
          emissive={'var(--secondary)'}
          emissiveIntensity={0.4}
          transparent
          opacity={0.18}
        />
      </mesh>
      <lineSegments position={[0, 0, 0.151]} geometry={coneRing}>
        <lineBasicMaterial color={'var(--primary)'} transparent opacity={0.78} />
      </lineSegments>
    </group>
  )
}
```

The cone is the only solid mesh in the entire scene. It is a `MeshStandardMaterial` with `--secondary` colour and emissive, alpha `0.18`. When the cone pulses, the soft circle reads as the speaker "breathing". The wireframe ring around it stays sharp, which is the contrast: a real soft object inside a drawn room.

### 0.7.4 Camera on a curve (`booth-camera.ts`)

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera as DreiPerspectiveCamera } from '@react-three/drei'
import { CatmullRomCurve3, Vector3 } from 'three'
import gsap from 'gsap'

const KEYFRAMES = [
  { p: 0.0, pos: [3.5, 1.6, 2.5] as const, fov: 36 },
  { p: 0.5, pos: [0.5, 1.4, 0.5] as const, fov: 34 },
  { p: 0.85, pos: [0.0, 1.3, -0.3] as const, fov: 40 },
  { p: 1.0, pos: [0.4, 1.5, 0.6] as const, fov: 40 },
]

const LOOK_TARGET = new Vector3(0, 0.6, -0.5)

type Props = { motion: ReturnType<typeof useBoothMotion> }

export function BoothCamera({ motion }: Props) {
  const camRef = useRef<any>(null)
  const { camera } = useThree()

  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        KEYFRAMES.map((k) => new Vector3(...k.pos)),
        false,
        'catmullrom',
        0.5,
      ),
    [],
  )

  useFrame(() => {
    if (!camRef.current) return
    const p = motion.progress.current
    const eased = gsap.parseEase('power2.inOut')(p)
    const point = curve.getPointAt(eased)
    camRef.current.position.copy(point)
    camRef.current.lookAt(LOOK_TARGET)
    const fovA = nearestFrame(p).fov
    const fovB = nextFrame(p).fov
    const fovT = frameT(p)
    const target = fovA + (fovB - fovA) * gsap.parseEase('power2.inOut')(fovT)
    if (Math.abs(camRef.current.fov - target) > 0.01) {
      camRef.current.fov = target
      camRef.current.updateProjectionMatrix()
    }
  })

  return (
    <DreiPerspectiveCamera
      ref={camRef}
      makeDefault
      fov={36}
      near={0.1}
      far={50}
      position={[3.5, 1.6, 2.5]}
    />
  )
}

function nearestFrame(p: number) {
  return [...KEYFRAMES].reverse().find((k) => k.p <= p) ?? KEYFRAMES[0]
}
function nextFrame(p: number) {
  return KEYFRAMES.find((k) => k.p > p) ?? KEYFRAMES[KEYFRAMES.length - 1]
}
function frameT(p: number) {
  const a = nearestFrame(p)
  const b = nextFrame(p)
  return (p - a.p) / Math.max(0.0001, b.p - a.p)
}
```

### 0.7.5 Headline on the back wall (`booth-headline-texture.tsx`)

The back wall carries the headline as a `CanvasTexture`. The texture is repainted whenever the headline copy changes, which only happens at mount. A `CanvasTexture` is enough; no need for a full text-renderer.

```tsx
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

type Props = {
  text: string
  font: string // e.g. "'Syne', system-ui, sans-serif"
  color: string // CSS colour, e.g. "var(--card-foreground)"
  width?: number
  height?: number
}

export function useBackWallText({
  text,
  font,
  color,
  width = 1024,
  height = 256,
}: Props) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [width, height])

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.font = `750 96px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    texture.needsUpdate = true
  }, [text, font, color, texture])

  return texture
}
```

The back wall mesh is a `PlaneGeometry(ROOM.w, ROOM.h * 0.6)` placed at z = `-ROOM.d / 2 + 0.001` (just in front of the wireframe back wall so the texture is not z-fighting with the line). The material is `MeshBasicMaterial` with the texture, `transparent: true`, no lighting. The wireframe back wall still draws its perimeter behind the text.

## 0.8 Performance budget

| Metric | Budget | Notes |
| --- | --- | --- |
| First frame | < 1.0s after navigation | R3F dynamic-imported, scene is mostly edges (cheap) |
| Steady-state frame time | < 6ms (120Hz) / < 12ms (60Hz) | 12 `LineSegments` + 1 solid cone + 1 shadow plane |
| Draw calls | < 8 | floor + ceiling + 3 walls + chair parts (3) + speaker parts (3) + shadow |
| `frameloop` | `'always'` while in view, `'never'` when scrolled past | IntersectionObserver swap |
| DPR clamp | `[1, 2]` | wireframe looks the same at any DPR |
| Shadow map size | none | shadow is a `ShadowMaterial` plane, no shadow map |
| Bundle cost | reuses existing three + r3f | No new dependencies |
| Reduced motion | Static room, no per-frame work | R3F `frameloop` switches to `'demand'` |
| Mobile < 480px | Same scene, scaled `0.85` | 12 lines is nothing for a phone GPU |

The scene is genuinely cheap. A wireframe is the lightest 3D rendering there is, and there are only 12 line objects. The headline `CanvasTexture` is repainted exactly once.

## 0.9 Accessibility

| Concern | Treatment |
| --- | --- |
| `prefers-reduced-motion: reduce` | No idle rotation, no scroll-driven camera, no speaker pulse, no headline typing. Camera holds at frame 0, headline is fully on the back wall, readouts and handoff are in their final state. |
| `prefers-reduced-transparency: reduce` | Wireframe `LineBasicMaterial.opacity` rises to 1.0. The cone mesh switches to a solid material. |
| Keyboard | All three link pads, the resume link and the About handoff are reachable with Tab. The canvas is `tabindex="-1"`, `aria-hidden="true"`. |
| Screen reader | A visually hidden `<h1>` carries the headline copy (`Aditya Himawan, Frontend Engineer`). The DOM mirror and the in-scene `CanvasTexture` carry the same text. Readouts expose values through `aria-live="polite"` on cycle, suppressed under reduced motion. |
| Contrast | Headline `#f1eee5` on `--background` `#0d1110` = 14.8:1 in dark mode. Wireframe `--primary` `#ff5a1f` on `--background` `#0d1110` = 5.4:1, above AA for graphics. Readouts inherit existing LCD token set, already AA. |
| Audio | The speaker cone pulse is a visual response to audio. If the user has not yet interacted with the page, audio is off, the pulse is the page's 120 BPM idle. No autoplay. |
| Pointer cancel | Touch users do not get any pointer-driven camera nudge (the camera is scroll-driven only). The speaker pulse is the only motion that could be considered "ambient" and it is suppressed under reduced motion. |
| No nausea | The camera push is slow (`scrub: 0.5`), the FOV change is small (4°), and the rotation stops at `progress = 0.85`. The reduced-motion opt-out is mandatory. |

## 0.10 Acceptance criteria

1. The first paint shows the room at frame 0 within 1.0s of navigation. Chair and speaker are visible, the wireframe is drawn, the headline is typing onto the back wall.
2. The headline, three LCD readouts, three link pads and the bottom rail are visible above the fold on a 1280x720 viewport without scroll.
3. The headline does not exceed two lines at any supported viewport (max 13ch).
4. The room rotates `0.05 rad/s` around Y when idle, no scroll. The speaker cone pulses at 120 BPM (one cycle per 500ms) when audio is off.
5. As scroll progress moves 0 → 1, the camera follows the `CatmullRomCurve3` through the four keyframes, with FOV interpolated via `power2.inOut`. The curve produces a real arc, not a straight line.
6. The headline on the back wall is fully typed by `progress = 0.05` (during the boot reveal). It holds at `opacity: 1` until `progress = 0.85`, then fades to `opacity: 0.32` with `filter: blur(2px)`.
7. The About handoff slides in from `yPercent: 100` to `yPercent: 0` between `progress = 0.85` and `progress = 0.95`.
8. When the page's `MusicPlayer` is playing, the speaker cone pulses with the live track amplitude. When the user pauses, the cone returns to the 120 BPM idle within 500ms.
9. `prefers-reduced-motion: reduce` returns the room to frame 0 with no rotation, no speaker pulse, no headline typing, no scroll-driven camera. The headline is fully on the back wall from the first paint.
10. The WebGL probe falls back to the static SVG line drawing. The headline is real text on top, the readouts stay in place.
11. Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms. R3F bundle is dynamic-imported.
12. The rack-hook's `useRackAnimations` does not throw on the new component: every `data-anim` attribute it queries for the rail and the handoff is present.

## 0.11 Risks and what to add when

| Risk | When to add the fix |
| --- | --- |
| WebGL `linewidth: 1` is too thin on retina displays. Lines look like single pixels. | Replace each `LineSegments` with a `TubeGeometry` over the same edge curve, radius `0.005` units. ~3x the GPU cost but reads on 4K monitors. |
| The chair is a box. It is not iconic. | When the brand ships a real chair (or a single signature object), swap the geometry. The wireframe abstraction is the point; the chair itself is a placeholder. |
| The speaker pulse is hard to read on mobile. | Add a faint `--secondary` glow around the cone via a `Sprite` with a radial-gradient texture, scaled with the cone. |
| The headline types slowly on first load. The user may scroll before it finishes. | The first paint is the headline already typed (synchronous, no animation on first frame). The typing animation only plays on subsequent remounts, e.g. if the user navigates back. |
| The 12-line scene feels too sparse on a 4K monitor. | Add a turntable under the chair and a small record on it. Same line material, same opacity. The room reads as "someone is about to listen", not "empty room". |
| The `useAudio` hook is the existing implementation. The amplitude it returns may be too low to drive a visible pulse. | Multiply the amplitude by 4 inside `booth-speaker.tsx` (`amp * 4`) before mapping to scale. The pulse becomes visible at normal listening volume. |

ponytail: skipped: real shadow casting from the chair and the speaker (ray-marched soft shadows). The current `ShadowMaterial` plane is a deliberate flat shadow, drawn not rendered. Add ray-marched shadows when the design read leans product-photography; current read leans editorial.
