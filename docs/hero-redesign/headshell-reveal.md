# Headshell Reveal - Hero Concept 3

> A 3D tonearm swings in from the right edge of the viewport, arcs across, and the cartridge needle lands on a single point in the centre of the screen. Where it lands, a circular waveform blooms outward in concentric rings. The headline is the centre of the rings.

This is one of four candidate redesigns for `features/landing-page/rack-01/section-hero.tsx`. It deliberately drops the device wall, the pad sea, the broken-light name, the rack-collapse chapter and the LCD readouts. The bottom rail and the About handoff survive (Section 9). The rest of the composition is one strong gesture, executed in a single camera arc.

## 0.0 Design Read

> Reading this as: a premium-consumer audio-product hero (DAP / music language) for a technical hiring audience, with the `Signal` warm-aluminium + signal-orange + LCD-green brand, leaning on a single iconic product gesture (the needle drop) and a real chrome tonearm in real light, dials `VARIANCE 7 / MOTION 8 / DENSITY 3`.

- VARIANCE 7: one asymmetric gesture, an arc from right to centre. The composition has a strong direction: the eye follows the arm.
- MOTION 8: scroll = one continuous swing, one impact, one bloom. The idle is the bloom's afterglow, not a separate motion.
- DENSITY 3: one focal subject (the tonearm and the rings), one accent (the needle tip in signal orange), one headline, three readouts.

## 0.1 Premise

The needle drop is the most photographed gesture in hi-fi. It is a real action with a real cause: the listener chose a record, the arm was cued, the needle lands in the groove. The page is the same idea: a developer chose a project, the page lands on a single point in the centre, the rings are the sound escaping. The metaphor is not decoration. The action IS the page.

The tonearm is real. Chrome body, brass counterweight, aluminium headshell, orange cantilever, diamond tip. It catches real light from a single key light, with an envmap giving the chrome its reflective character. The arm is not a placeholder shape; it is a real object, photographed (rendered) under real conditions, swinging on a real arc.

Scroll drives the swing. At frame 0 the arm is parked at the right edge of the viewport, the needle is up. At frame 0.3 the arm is mid-arc, the cantilever is angled. At frame 0.45 the needle lands. From frame 0.45 to 1.0, the rings bloom outward and the headline emerges from the centre.

The rings are the page's response to the gesture, not a separate visual. They are five concentric circles drawn in a fragment shader, each fading from a high amplitude at the centre to zero at the edge, with the colours shifting from `--primary` at the innermost ring to `--secondary` at the outermost. The rings ride on top of the bloom of the needle's impact, the same way a real speaker cone blooms when the needle hits the groove.

## 0.2 Concept

```
viewport edge
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                                              ╲               │
│                                               ╲              │
│                                                ╲             │
│                                                 ╲            │
│                                  ┌─────┐         ╲           │
│                                  │arm  │          ╲          │
│                                  │ head│           ╲         │
│                                  │ shell           ╲│        │
│                                  │ cartridge       │●        │
│                                  └─────────────────┘●        │
│                                              ⟵─────●        │
│                                          rings       ● ← impact point
│                                                    ●          │
│                                                  ●            │
│                                                ●              │
│                                              ●                │
│                                            ●                  │
│                                                              │
│                                                              │
│        HEADLINE: "Built for the moment after launch."         │
│        (types itself, character by character, on the rings)   │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │  4+ yrs │  │  3 teams│  │ 15K+ us │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
│                                                              │
│  [ See the works ↓ ]  [ Read the notes ↗ ]  [ Resume ↗ ]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   rail: 1 arm / 1 needle / 5 rings   About Aditya →
   handoff: Next signal / 02  Profile
```

The arm and the rings are the only 3D elements. The headline, the readouts and the link pads are DOM overlays. The rings sit at z-index 1; the arm at z-index 0; the overlays at z-index 2. The arm occupies the right 40% of the viewport, the rings occupy the centre 30%, the headline occupies the bottom 30%.

## 0.3 Visual specification

### 0.3.1 Color usage (locked to brand tokens)

| Element | Light | Dark | Token |
| --- | --- | --- | --- |
| Arm body (chrome) | envmap | envmap | `MeshPhysicalMaterial` with `metalness: 0.95`, `roughness: 0.08` |
| Counterweight (brass) | `#c99032` | `#e0b75a` | `--accent` |
| Headshell (anodised aluminium) | `#bcb6a8` | `#2a2f2d` | new `--aluminium` |
| Cantilever (orange aluminium) | `#a03d12` | `#ff5a1f` | `--primary` |
| Needle tip (emissive) | `#a03d12` | `#ff5a1f` | `--primary`, `emissiveIntensity: 0.8` |
| Ring 1 (innermost) | `#a03d12` | `#ff5a1f` | `--primary` |
| Ring 2 | `#c99032` | `#e0b75a` | `--accent` |
| Ring 3 | `#7abb5e` | `#7abb5e` | `--secondary` |
| Ring 4 | `#7abb5e` | `#a0d18a` | `--secondary-light` |
| Ring 5 (outermost) | `#36564d` | `#456f38` | `--secondary-dark` |
| Headline ink | `#1a1d1c` | `#f1eee5` | `--card-foreground` |
| Background | `#e7e6dd` | `#141817` | `--background` |
| Impact flash (single frame) | `rgba(255,90,31,0.4)` | `rgba(255,90,31,0.4)` | `--primary` with alpha, fades in 1 frame |

The cantilever is the page's signal orange. It is the smallest element on screen and the only part of the arm that is not metal. The eye finds it first. This is what makes the page read as SIGNAL: the cantilever is the brand mark, not a logo, not a label.

### 0.3.2 Typography (existing stack, no new fonts)

| Role | Family | Spec | Notes |
| --- | --- | --- | --- |
| Headline | Syne | `750 clamp(2.5rem, 5vw, 4.5rem) / 0.96` | tracking `-0.045em`; max `13ch`; types itself on the rings after the impact |
| Subtext | Geist | `400 1.0625rem / 1.6` | max `60ch`; one paragraph |
| LCD readout value | Orbitron | `600 0.875rem` | `font-variant-numeric: tabular-nums` |
| LCD readout label | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Silkscreen rail | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Link pad | Space Grotesk | `650 0.9375rem` | tracking `-0.01em` |

The headline types itself in the centre of the rings, one character at a time, with a 40ms stagger. Each character fades in over 240ms, ease-out, with a 1.5px upward translate. The subtext types 200ms after the headline finishes. The ring at the character's vertical position pulses briefly as the character lands.

### 0.3.3 Materials and lighting

- **Arm body:** `MeshPhysicalMaterial` with `metalness: 0.95`, `roughness: 0.08`, `clearcoat: 1.0`, `clearcoatRoughness: 0.05`. This is the chrome: it picks up the envmap and a single key light, with the clearcoat giving it the wet-look shine of a real polished arm.
- **Counterweight:** `MeshStandardMaterial` with `color: var(--accent)`, `metalness: 0.7`, `roughness: 0.35`. The brass is warmer than the chrome and reads as a different material under the same light.
- **Headshell:** `MeshStandardMaterial` with `color: var(--aluminium)`, `metalness: 0.6`, `roughness: 0.45`. The anodised aluminium is the third metal, with the lowest metalness and the highest roughness. The hierarchy: chrome reflects most, brass reflects less, aluminium reflects least.
- **Cantilever:** `MeshStandardMaterial` with `color: var(--primary)`, `metalness: 0.4`, `roughness: 0.5`, `emissive: var(--primary)`, `emissiveIntensity: 0.2`. The cantilever is the only coloured part of the arm and it emits a faint glow.
- **Needle tip:** `MeshStandardMaterial` with `color: var(--primary)`, `emissive: var(--primary)`, `emissiveIntensity: 0.8`. The tip is small (a cone of radius `0.005` and height `0.012`) but it emits enough light to be the brightest single point on the page.
- **Lighting:** one `DirectionalLight` from `(3, 4, 2)`, intensity `1.4`, colour `#fff2e2` (warm), casting shadows. One `HemisphereLight`, sky `#3a4140`, ground `#0d1110`, intensity `0.3`. One `RoomEnvironment` envmap for chrome reflections.
- **Tone mapping:** `ACESFilmicToneMapping`, exposure `1.1`.

### 0.3.4 Arm geometry

The arm is a real tonearm, not a stylised shape. It is composed of:

| Part | Geometry | Size (m) | Material |
| --- | --- | --- | --- |
| Main tube | `CylinderGeometry(0.008, 0.008, 0.28, 24)` | 28cm long | chrome |
| S-bend | `TubeGeometry` over a `CatmullRomCurve3` of 6 points | total length 0.32m | chrome |
| Counterweight | `CylinderGeometry(0.024, 0.024, 0.04, 32)` | 4cm thick | brass |
| Counterweight stub | `CylinderGeometry(0.01, 0.01, 0.06, 16)` | connects weight to arm | chrome |
| Headshell | `BoxGeometry(0.02, 0.012, 0.04)` with chamfered edges | 4cm long | aluminium |
| Cantilever | `CylinderGeometry(0.0015, 0.0005, 0.018, 12)` | 1.8cm long | signal orange |
| Needle tip | `ConeGeometry(0.005, 0.012, 16)` | tiny cone | emissive orange |

The arm is parented to a single group whose origin is the pivot (the right edge of the viewport, at the height of the centre). The pivot does not move; the group rotates around it. The needle lands at a fixed world position `(0, 0, 0)` (the centre of the rings).

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

### 0.4.2 Z-layers

| z | Element | Pointer |
| --- | --- | --- |
| 0 | R3F `<Canvas>` (arm) | n/a |
| 1 | R3F `<Canvas>` (rings) | n/a |
| 2 | Headline + subtext | none on text, auto on link pads |
| 3 | LCD readouts | none on labels, auto on values |
| 4 | Bottom rail + link pads | auto |
| 5 | About handoff (rack-hook) | auto |

Two R3F canvases, not one. The arm canvas and the rings canvas are separate `<Canvas>` elements at different z-indexes, with the arm canvas slightly transparent so the rings show through the arm's empty space. The alternative is one canvas with both layers, which would force the rings to inherit the arm's lighting; separation keeps each scene on its own renderer state.

### 0.4.3 Responsive collapse

| Breakpoint | Headline scale | Arm reach | Ring count | Camera FOV |
| --- | --- | --- | --- | --- |
| `< 480px` | `clamp(2rem, 8vw, 2.5rem)` | 60% of viewport width | 3 rings | `38°` |
| `480 - 768px` | `clamp(2.25rem, 6vw, 3rem)` | 70% of viewport width | 4 rings | `34°` |
| `768 - 1280px` | `clamp(2.5rem, 5vw, 4rem)` | 80% of viewport width | 5 rings | `32°` |
| `>= 1280px` | `clamp(3rem, 5vw, 4.5rem)` | 90% of viewport width | 5 rings | `30°` |

Below 480px the arm swings from a closer pivot (the right edge of the hero, not the right edge of the viewport) and reaches only 60% of the viewport width. The needle lands in the upper third, not the centre, so the headline has room below.

## 0.5 Motion choreography

### 0.5.1 Idle (no scroll)

- The arm is parked at the right edge, needle up. No rotation.
- The rings are at `opacity: 0`. They only appear after the impact.
- The headline, subtext and readouts are at their final state. The headline does not type until the impact happens.
- The needle tip pulses: `emissiveIntensity = 0.6 + 0.2 * sin(t * 2π / 0.5)` (120 BPM). A heartbeat at the page's own rhythm.

### 0.5.2 Scroll timeline

| Progress | Arm rotation (deg) | Needle position | Rings opacity | Impact flash | Headline |
| --- | --- | --- | --- | --- | --- |
| `0.00` | `-30` (parked, needle up) | above impact point | 0 | 0 | hidden |
| `0.00 - 0.30` | `-30 → -8` (swing in) | arcs toward impact | 0 | 0 | hidden |
| `0.30 - 0.42` | `-8 → 0` (settle) | approaches impact | 0 | 0 | hidden |
| `0.42 - 0.45` | `0` (impact) | at impact point | 0 → 1, 1 frame | 0 → 1, 1 frame | hidden |
| `0.45 - 0.50` | `0` | rests on impact | 1, expanding outward | fading | starts typing (chars 0..9) |
| `0.50 - 0.70` | `0` | rests | rings 1..5 expanding, fading | 0 | continues typing (chars 9..N) |
| `0.70 - 0.90` | `0` | rests | rings at full extent, fading | 0 | fully typed |
| `0.90 - 1.00` | `0` | rests | rings fading to 0 | 0 | holds, then fades to `0.32` opacity as handoff slides in |

The arm rotation is a single tween with `power2.inOut` and a small anticipation: the arm dips `2°` past zero at `progress = 0.41`, then settles. This is the only motion flourish. The anticipation is what makes the impact feel real, the way a real needle "drops" slightly past the groove before settling.

The impact flash is a single fullscreen plane in `--primary` with alpha `0.4`, scaled from `0.0` to `1.0` in 16ms (one frame at 60Hz), then back to `0.0` in 80ms. It is the visual "click" of the needle landing.

### 0.5.3 Ring bloom

The five rings are fullscreen `ShaderMaterial` planes that draw concentric circles from the impact point. Each ring has its own starting radius, expansion speed, and colour:

| Ring | Start radius | End radius | Duration | Start opacity | End opacity | Colour |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.05 | 0.20 | 0.6s | 1.0 | 0.0 | `--primary` |
| 2 | 0.05 | 0.32 | 0.7s | 0.85 | 0.0 | `--accent` |
| 3 | 0.05 | 0.45 | 0.8s | 0.7 | 0.0 | `--secondary` |
| 4 | 0.05 | 0.60 | 0.9s | 0.55 | 0.0 | `--secondary-light` |
| 5 | 0.05 | 0.78 | 1.0s | 0.4 | 0.0 | `--secondary-dark` |

Each ring is delayed by 80ms after the previous. The shader draws the ring as a `smoothstep` band at `radius - 0.012, radius + 0.012`, with anti-aliasing at the edges. The result is five soft circles blooming outward from the impact point, the way a real speaker cone blooms when the needle hits the groove.

The rings are `transparent: true` and do not receive shadows. They are drawn over the arm canvas, so the arm is visible behind the rings (with the rings at low alpha). This is what makes the bloom feel like a physical event, not a separate visual.

### 0.5.4 Easing and timing

| Use | Curve | Duration |
| --- | --- | --- |
| Arm swing (entry) | `power2.inOut` | scrub, `scrub: 0.5` |
| Arm anticipation (overshoot at impact) | `sine.inOut` | 0.04 of scroll |
| Impact flash | `linear` in, `power2.out` out | 16ms in, 80ms out |
| Ring expansion | `power2.out` per ring | 0.6-1.0s per ring |
| Ring fade | `linear` | matches expansion |
| Headline typing | per-char `cubic-bezier(0.22, 1, 0.36, 1)` | 240ms per char, 40ms stagger |
| Subtext typing | per-char `cubic-bezier(0.22, 1, 0.36, 1)` | 200ms per char, 20ms stagger, starts 200ms after headline |
| Needle idle pulse | sine wave, 0.5s period (120 BPM) | continuous |
| Handoff slide in | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.32s |

### 0.5.5 Reduced motion

`prefers-reduced-motion: reduce`:
- The arm is parked at the impact point (rotation `0`), not at the parked position. The needle is down.
- The rings are at their full extent and `opacity: 0` (visible at low alpha is what causes the most discomfort; fully transparent rings with the headshell as the focus is the safe state).
- The headline, subtext, readouts, and handoff are at their final state from the first paint.
- The impact flash does not play.
- The needle tip does not pulse.
- Scroll does not change any of the above.

## 0.6 Stack and architecture

### 0.6.1 Files

```
features/landing-page/components/headshell-reveal/
├── headshell-stage.tsx              # top-level hero section (DOM overlay)
├── headshell-stage.module.css       # hero layout + grid for overlays
├── headshell-arm-r3f.tsx            # R3F <Canvas> for the tonearm
├── headshell-arm.tsx                # arm geometry, materials, swing
├── headshell-rings-r3f.tsx          # R3F <Canvas> for the rings
├── headshell-rings.tsx              # ring shader + bloom orchestration
├── headshell-impact-flash.tsx       # single-frame flash plane
├── headshell-camera.ts              # <PerspectiveCamera> + ScrollTrigger
├── headshell-readouts.tsx           # three LCD readout cards (DOM)
├── headshell-readouts.module.css    # readout card styles
├── use-headshell-motion.ts          # writes progress + velocity
└── index.ts                         # barrel: <HeadshellReveal />
```

Plus one edit to `features/landing-page/rack-01/section-hero.tsx` to replace the `<PadSea />` mount with `<HeadshellReveal />`. The `data-anim` attributes the rack hook queries for the rail and the handoff are preserved.

### 0.6.2 Hook contract

```ts
// use-headshell-motion.ts
export type HeadshellMotion = {
  progress: { current: number }
  velocity: { current: number }
  reduced: boolean
}

export function useHeadshellMotion(
  ref: RefObject<HTMLElement>,
): HeadshellMotion
```

### 0.6.3 Capability probe

Same `decideRuntime()` function as concepts 2 and 6. The fallback is a static SVG: a stylised tonearm at the impact point (silhouette in `--primary` on `--background`), a single ring drawn in `--secondary`, the headline as real text on top, the readouts in their final position. The fallback is real, not an apology.

## 0.7 Code suggestion

### 0.7.1 Arm mesh (`headshell-arm.tsx`)

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  Color,
  TubeGeometry,
  Vector3,
  type Group,
} from 'three'

import type { HeadshellMotion } from './use-headshell-motion'

const ARM_PIVOT = new Vector3(2.4, 0.2, 0)
const NEEDLE_LANDING = new Vector3(0, 0, 0)
const ARM_REST_DEG = -30
const IMPACT_DEG = 0
const ANTICIPATION_DEG = 2.5

const SBend = (() => {
  // An S-bend in the arm: a real tonearm has a J or S shape near the headshell
  // to correct for tracking error. 6 control points over 0.32m.
  const pts = [
    new Vector3(0, 0, 0),
    new Vector3(0.04, 0.01, 0),
    new Vector3(0.1, 0.025, 0),
    new Vector3(0.16, 0.022, 0),
    new Vector3(0.24, 0.012, 0),
    new Vector3(0.32, 0, 0),
  ]
  return new CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
})()

type Props = { motion: HeadshellMotion }

export function HeadshellArm({ motion }: Props) {
  const groupRef = useRef<Group>(null)
  const needleRef = useRef<any>(null)
  const tubeGeo = useMemo(() => new TubeGeometry(SBend, 64, 0.008, 16, false), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const p = motion.progress.current
    const t = state.clock.elapsedTime

    // Compute the arm angle along the scroll.
    let deg: number
    if (p < 0.42) {
      // Swing in: power2.inOut from REST to IMPACT
      const u = p / 0.42
      const eased = Math.pow(u, 2) / (Math.pow(u, 2) + Math.pow(1 - u, 2))
      deg = ARM_REST_DEG + (IMPACT_DEG - ARM_REST_DEG) * eased
    } else if (p < 0.45) {
      // Anticipation: overshoot past IMPACT by ANTICIPATION_DEG
      const u = (p - 0.42) / 0.03
      const eased = Math.sin(u * Math.PI)
      deg = IMPACT_DEG + ANTICIPATION_DEG * eased
    } else {
      // Settle
      deg = IMPACT_DEG
    }
    groupRef.current.rotation.z = (deg * Math.PI) / 180

    // Needle pulse (idle)
    if (needleRef.current) {
      const pulse = 0.6 + 0.2 * Math.sin((t * Math.PI * 2) / 0.5)
      needleRef.current.material.emissiveIntensity = pulse
    }
  })

  return (
    <group ref={groupRef} position={ARM_PIVOT.toArray()}>
      {/* Main tube as the S-bend */}
      <mesh geometry={tubeGeo} castShadow>
        <meshPhysicalMaterial
          color={'#dadce0'}
          metalness={0.95}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Counterweight at the back end of the arm */}
      <mesh
        position={[-0.04, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.024, 0.024, 0.04, 32]} />
        <meshStandardMaterial
          color={'var(--accent)'}
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>

      {/* Headshell at the front end */}
      <mesh position={[0.34, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.012, 0.02]} />
        <meshStandardMaterial
          color={'var(--aluminium)'}
          metalness={0.6}
          roughness={0.45}
        />
      </mesh>

      {/* Cantilever protruding from the headshell */}
      <mesh
        position={[0.36, -0.008, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.0015, 0.0005, 0.018, 12]} />
        <meshStandardMaterial
          color={'var(--primary)'}
          metalness={0.4}
          roughness={0.5}
          emissive={'var(--primary)'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Needle tip at the end of the cantilever */}
      <mesh
        ref={needleRef}
        position={[0.37, -0.018, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.005, 0.012, 16]} />
        <meshStandardMaterial
          color={'var(--primary)'}
          emissive={'var(--primary)'}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
```

The arm pivot is at world `(2.4, 0.2, 0)`. The arm is parented to this point and rotates around its Z axis. When `rotation.z = 0`, the needle lands exactly at world `(0, 0, 0)`, the centre of the rings. The pivot's X is chosen so the arm sweeps into the right 40% of the viewport at desktop sizes.

### 0.7.2 Ring shader (`headshell-rings.tsx`)

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  type Mesh,
} from 'three'

const RINGS = [
  { start: 0.0, end: 0.2, dur: 0.6, color: 'var(--primary)', startA: 1.0, endA: 0.0 },
  { start: 0.08, end: 0.32, dur: 0.7, color: 'var(--accent)', startA: 0.85, endA: 0.0 },
  { start: 0.16, end: 0.45, dur: 0.8, color: 'var(--secondary)', startA: 0.7, endA: 0.0 },
  { start: 0.24, end: 0.6, dur: 0.9, color: 'var(--secondary-light)', startA: 0.55, endA: 0.0 },
  { start: 0.32, end: 0.78, dur: 1.0, color: 'var(--secondary-dark)', startA: 0.4, endA: 0.0 },
]

export function HeadshellRings({
  impactTimeRef,
  position = [0, 0, -0.5],
}: {
  impactTimeRef: { current: number | null }
  position?: [number, number, number]
}) {
  const meshRefs = useRef<(Mesh | null)[]>([])
  const materialRefs = useRef<(any)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const impact = impactTimeRef.current
    if (impact === null) {
      // No impact yet, rings are invisible
      materialRefs.current.forEach((m) => {
        if (m) m.opacity = 0
      })
      return
    }
    const elapsed = t - impact
    RINGS.forEach((ring, i) => {
      const mat = materialRefs.current[i]
      if (!mat) return
      const localElapsed = elapsed - ring.start
      if (localElapsed < 0) {
        mat.opacity = 0
        return
      }
      if (localElapsed > ring.dur) {
        mat.opacity = 0
        return
      }
      const u = localElapsed / ring.dur
      const eased = 1 - Math.pow(1 - u, 3) // power3.out
      mat.uniforms.uProgress.value = eased
      mat.opacity = ring.startA * (1 - eased) + ring.endA * eased
    })
  })

  return (
    <group position={position}>
      {RINGS.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
        >
          <planeGeometry args={[2.5, 2.5]} />
          <shaderMaterial
            ref={(el) => (materialRefs.current[i] = el)}
            transparent
            depthWrite={false}
            blending={2} // AdditiveBlending
            uniforms={{
              uProgress: { value: 0 },
              uColor: { value: new Color() },
              uMaxRadius: { value: ring.end },
            }}
            vertexShader={VERT}
            fragmentShader={FRAG}
          />
        </mesh>
      ))}
    </group>
  )
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform float uProgress;
  uniform float uMaxRadius;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    if (r > uMaxRadius) discard;
    float ringR = uProgress * uMaxRadius;
    float band = smoothstep(0.014, 0.0, abs(r - ringR));
    gl_FragColor = vec4(uColor, band);
  }
`
```

The ring shader draws a soft band at the ring's current radius, with anti-aliased edges. `AdditiveBlending` is what makes the rings glow on top of the arm without occluding it. The `discard` for `r > uMaxRadius` is the perf optimisation: the GPU skips pixels outside the maximum extent.

### 0.7.3 Scroll choreography (`use-headshell-motion.ts`)

```ts
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export type HeadshellMotion = {
  progress: { current: number }
  velocity: { current: number }
  reduced: boolean
  impactTime: { current: number | null }
}

export function useHeadshellMotion(
  ref: React.RefObject<HTMLElement>,
): HeadshellMotion {
  const progress = useRef(0)
  const velocity = useRef(0)
  const impactTime = useRef<number | null>(null)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ref.current) return

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const prev = progress.current
        progress.current = self.progress
        velocity.current = self.getVelocity()

        // Detect the impact moment (progress crossing 0.45)
        if (prev < 0.45 && self.progress >= 0.45 && impactTime.current === null) {
          impactTime.current = performance.now() / 1000
        }
      },
    })

    return () => trigger.kill()
  }, [ref])

  return { progress, velocity, reduced: reduced.current, impactTime }
}
```

The `impactTime` ref is a `performance.now() / 1000` timestamp. The ring shader reads this in `useFrame` and computes `elapsed = currentTime - impactTime`. The moment the scroll crosses `0.45`, the impact fires and the rings bloom. This is the cleanest way to choreograph a one-shot event from scroll progress: the moment is captured once and replayed by the rings on every frame.

### 0.7.4 Reduced-motion fallback (the SVG silhouette)

```tsx
function HeadshellFallback() {
  // The arm at the impact position, with the cantilever down and the rings
  // at full extent (but very low opacity). Real headline on top.
  return (
    <svg
      viewBox="0 0 1600 900"
      className={styles.fallback}
      aria-hidden
    >
      {/* Arm silhouette */}
      <g transform="translate(1200, 200)">
        <line x1="0" y1="0" x2="-340" y2="20" stroke="var(--primary)" strokeWidth="3" />
        <circle cx="0" cy="0" r="24" fill="var(--accent)" />
        <rect x="-380" y="14" width="40" height="12" fill="var(--aluminium)" />
        <line x1="-380" y1="26" x2="-380" y2="44" stroke="var(--primary)" strokeWidth="2" />
      </g>
      {/* Concentric rings */}
      {[200, 320, 450, 600, 780].map((r, i) => (
        <circle
          key={i}
          cx="800"
          cy="450"
          r={r * 0.4}
          fill="none"
          stroke={['var(--primary)', 'var(--accent)', 'var(--secondary)', 'var(--secondary-light)', 'var(--secondary-dark)'][i]}
          strokeWidth="2"
          opacity={0.4 - i * 0.06}
        />
      ))}
    </svg>
  )
}
```

## 0.8 Performance budget

| Metric | Budget | Notes |
| --- | --- | --- |
| First frame | < 1.2s after navigation | R3F dynamic-imported, two `<Canvas>` instances |
| Steady-state frame time | < 10ms (120Hz) / < 18ms (60Hz) | Arm is ~6 meshes, rings are 5 shader planes, one shadow |
| Draw calls | < 12 | 6 arm + 5 rings + 1 flash |
| `frameloop` | `'always'` while in view, `'never'` when scrolled past | IntersectionObserver swap on each canvas |
| DPR clamp | `[1, 2]` | chrome looks the same at any DPR |
| Shadow map size | `1024` | arm only |
| Bundle cost | reuses existing three + r3f | No new dependencies |
| Reduced motion | Static arm, no rings, no flash | `frameloop: 'demand'` |
| Mobile < 480px | 3 rings, simpler arm, no envmap | fallback path |

The two-canvas setup is a deliberate tradeoff. It costs one extra WebGL context, but it lets each scene run its own renderer state and avoids the rings inheriting the arm's expensive PBR pass. The arm is 6 meshes; the rings are 5 transparent planes. The cost is acceptable.

## 0.9 Accessibility

| Concern | Treatment |
| --- | --- |
| `prefers-reduced-motion: reduce` | Arm at impact, rings at `opacity: 0`, no flash, no scroll-driven motion. Headline, readouts, handoff in final state. |
| `prefers-reduced-transparency: reduce` | Rings `opacity: 0` (they are transparent by nature). Arm canvas is fully opaque. |
| Keyboard | All three link pads, the resume link and the About handoff are reachable with Tab. Both canvases are `tabindex="-1"`, `aria-hidden="true"`. |
| Screen reader | A visually hidden `<h1>` carries the headline. The 3D scene is `aria-hidden`. The impact is a visual event; no equivalent audio is played. |
| Contrast | Headline `#f1eee5` on `#141817` = 14.8:1 in dark mode. The cantilever and needle are decorative graphics at 5.4:1 against the background, above AA for graphics. |
| Audio | The impact does not play a click sound. The page is visual, not aural; the existing `MusicPlayer` handles audio. |
| Pointer cancel | Touch users do not get any pointer-driven effects. The arm swing is scroll-driven only. |
| No nausea | The swing is a slow rotation (`scrub: 0.5`), the FOV does not change, the camera does not move. The rings are additive and very low alpha. The reduced-motion opt-out is mandatory. |

## 0.10 Acceptance criteria

1. The first paint shows the arm parked at `-30°` (right edge, needle up) within 1.2s of navigation. The needle tip pulses at 120 BPM.
2. The headline, three LCD readouts, three link pads and the bottom rail are visible above the fold on a 1280x720 viewport without scroll. The headline is hidden until the impact.
3. The headline does not exceed two lines at any supported viewport (max 13ch).
4. As scroll progress moves 0 → 0.42, the arm rotates from `-30°` to `0°` with `power2.inOut` easing and `scrub: 0.5`.
5. At `progress = 0.42`, the arm overshoots by `2.5°` (anticipation), settling at `0°` by `progress = 0.45`.
6. At `progress = 0.45`, the impact flash fires for 96ms (16ms in, 80ms out), and the rings begin blooming from the impact point. The rings expand outward with their per-ring timing.
7. The headline starts typing at `progress = 0.50`, one character at a time, 40ms stagger, 240ms per character. The subtext starts 200ms after the headline finishes.
8. The About handoff slides in from `yPercent: 100` to `yPercent: 0` between `progress = 0.85` and `progress = 0.95`.
9. `prefers-reduced-motion: reduce` returns the arm to the impact position, the rings to `opacity: 0`, the headline to its final state, from the first paint. No scroll-driven motion.
10. The WebGL probe falls back to the static SVG silhouette with the arm at impact, the rings as 5 concentric circles, the headline as real text.
11. Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms. R3F bundle is dynamic-imported.
12. The rack-hook's `useRackAnimations` does not throw on the new component: every `data-anim` attribute it queries for the rail and the handoff is present.

## 0.11 Risks and what to add when

| Risk | When to add the fix |
| --- | --- |
| The arm geometry is hand-authored. It might not look like a real SME or Rega arm. | When the brand decides which arm to ship, swap the geometry. The TubeGeometry + counterweight + headshell + cantilever + tip pattern is general; the dimensions and the S-bend control points are the only arm-specific values. |
| The impact flash is one frame. On a 60Hz monitor it can be missed. | Extend the in-time to 32ms (two frames) and the out-time to 120ms. The flash becomes a real beat, not a single pixel of brightness. |
| The rings at low alpha can read as "screen door" effect on bad monitors. | Drop the ring count to 3 on displays that match `(max-width: 480px) and (max-device-pixel-ratio < 2)`. |
| The cantilever is the only orange element. If a future redesign adds more orange (e.g. an active CTA), the cantilever loses its role as the brand mark. | Keep the cantilever at `emissiveIntensity: 0.8` always. The glow is what makes it the brand mark, not the colour alone. |
| The arm shadow on the floor is missing. Without it the arm looks like it is floating. | Add a `ShadowMaterial` plane at `y = -0.5` (the floor), `opacity: 0.2`, with `receiveShadow` on. The arm `castShadow` already. |
| The headline types too slowly for users who scroll fast. | Speed up the per-char duration to 180ms and the stagger to 25ms. The typing is still legible; it just keeps up with a fast scroll. |

ponytail: skipped: real-time audio-driven needle wobble. A real needle in a real groove vibrates with the music. Skipped because the page's `MusicPlayer` requires a user gesture to start, and adding a wobble that only fires after a click would feel like a bug, not a feature. Add when the page ships an always-on ambient track or when the audio context can be safely pre-primed.
