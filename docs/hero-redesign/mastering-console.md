# Mastering Console Strip - Hero Concept 5

> A single long channel strip photographed from a low angle, edge to edge. The hero copy is silkscreened onto the desk surface. Scroll dollies the camera right along the strip; one VU needle rises with progress; the fader caps shift as if the desk is being played.

This is one of four candidate redesigns for `features/landing-page/rack-01/section-hero.tsx`. It deliberately drops the device wall, the pad sea, the broken-light name, the rack-collapse chapter and the LCD readouts. The bottom rail and the About handoff survive (Section 9). The rest of the composition is one continuous camera dolly along a real console surface.

## 0.0 Design Read

> Reading this as: a premium-consumer audio-product hero (DAP / music language) for a technical hiring audience, with the `Signal` warm-aluminium + signal-orange + LCD-green brand, leaning on a single tactile surface and a slow lateral camera dolly, dials `VARIANCE 8 / MOTION 7 / DENSITY 4`.

- VARIANCE 8: one asymmetric composition, a low-angle strip. The camera never centres; it travels.
- MOTION 7: scroll = one dolly, one VU needle, five fader caps. The idle is a slow needle breath. No other motion.
- DENSITY 4: the strip carries silkscreen labels, five faders, one VU meter, one headline, three readouts. The page is tactile, not sparse.

## 0.1 Premise

The brand already types in silkscreen (Geist Mono, `0.6875rem`, tracking `0.12em`, uppercase) and already prints its data the way a machine would. The console literalises that: the hero is a real desk surface, photographed from a low angle, and the page's own copy is silkscreened onto it. The nav becomes the track labels above the strip. The page reads as a session, not a landing page.

Every element on the strip carries data. That is the rule inherited from `design.md` §0.0:

| Motif | What it encodes |
| --- | --- |
| Fader position | Scroll progress. Five faders, five sections of the page (About, Skills, Experience, Work, Contact). The fader for the section you are scrolling into is the one that rises. |
| VU needle | The page's live audio amplitude when the `MusicPlayer` is playing; the 120 BPM idle breath when it is not. |
| Track label | The nav. Five labels, five faders, one to one. Clicking a label scrolls to the section and the camera dollies to that fader. |
| Silkscreen serial | `SIGNAL / 01 / HERO`, printed as a machine would print it. |
| Peak LED | Lights red when the VU needle passes 85 percent. Real peak detection, not decoration. |

A knob with no data behind it is decoration and does not ship. The strip has exactly five faders, one VU meter, five track labels, one serial, one peak LED. Nothing else.

## 0.2 Concept

```
viewport edge (low angle, camera at desk height)
┌──────────────────────────────────────────────────────────────┐
│  ABOUT      SKILLS    EXPERIENCE     WORK       CONTACT       │ ← track labels (nav)
│  ─────      ─────     ──────────     ────       ───────       │
│                                                              │
│  ╔══════════════════════════════════════════════════════════╗ │
│  ║  ▮        ▮        ▮        ▮        ▮                    ║ │ ← fader caps
│  ║  │        │        │        │        │                    ║ │
│  ║  ▯        ▯        ▯        ▯        ▯                    ║ │
│  ║                                                          ║ │
│  ║  ┌───────────────────┐                                   ║ │
│  ║  │   VU   ╱╲          │  ◉ PEAK                           ║ │
│  ║  │       ╱  ╲         │                                   ║ │
│  ║  │      ╱    ╲        │                                   ║ │
│  ║  └───────────────────┘                                   ║ │
│  ║                                                          ║ │
│  ║  SIGNAL / 01 / HERO              64 BANDS / 120 BPM      ║ │ ← serial silkscreen
│  ╚══════════════════════════════════════════════════════════╝ │
│                                                              │
│   HEADLINE (silkscreened on the strip, left, 55% width)      │
│   Built for the moment after launch.                         │
│   Frontend systems for products that have to work at scale.  │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │  4+ yrs │  │  3 teams│  │ 15K+ us │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
│                                                              │
│  [ See the works ↓ ]  [ Read the notes ↗ ]  [ Resume ↗ ]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   handoff: Next signal / 02  Profile
```

The strip is a single wide surface, 3D, lit from above and slightly behind. The camera sits at desk height (0.35m above the surface) looking slightly down. Scroll dollies the camera right along the strip, so the five faders pass through frame one at a time.

The headline is not floating above the strip. It is printed on the strip, in the flat area between the fader row and the front edge. As the camera dollies right, the headline slides left through the frame at the same rate as the surface, so it reads as printed, not overlaid. The headline leaves the frame as the camera reaches the VU meter; the readouts and the link pads stay as DOM overlays pinned to the viewport.

## 0.3 Visual specification

### 0.3.1 Color usage (locked to brand tokens)

| Element | Light | Dark | Token |
| --- | --- | --- | --- |
| Desk surface | `#bcb6a8` | `#222827` | `--card` (dark) / new `--desk` (light) |
| Desk edge (front chamfer) | `#9d9a90` | `#1a1d1c` | new `--desk-edge` |
| Silkscreen ink | `#5e625c` | `#8b8f89` | `--muted-foreground` |
| Silkscreen ink (primary labels) | `#1a1d1c` | `#f1eee5` | `--card-foreground` |
| Fader cap (rest) | `#1a1d1c` | `#0d1110` | `--lcd-bg` |
| Fader cap (raised, the active section) | `#a03d12` | `#ff5a1f` | `--primary` |
| Fader rail | `#7a7a72` | `#3a4140` | new `--rail` |
| VU face | `#f4f1e6` | `#17201e` | `--card` (light) / `--lcd-bg` (dark) |
| VU needle | `#1a1d1c` | `#7abb5e` | `--card-foreground` / `--secondary` |
| VU arc (green) | `#36564d` | `#7abb5e` | `--secondary` |
| VU arc (amber) | `#c99032` | `#e0b75a` | `--accent` |
| Peak LED (off) | `#5e625c` | `#456f38` | `--muted-foreground` / `--secondary-dark` |
| Peak LED (on) | `#a03d12` | `#ff5a1f` | `--primary` |
| Headline ink (printed on desk) | `#1a1d1c` | `#f1eee5` | `--card-foreground` |

The signal orange appears in exactly two places: the raised fader cap for the active section, and the peak LED when it fires. Both are state, not decoration. Without them the desk is warm aluminium and silkscreen; with them the page reads as SIGNAL.

### 0.3.2 Typography (existing stack, no new fonts)

| Role | Family | Spec | Notes |
| --- | --- | --- | --- |
| Headline (printed on desk) | Syne | `750 clamp(2.5rem, 4.5vw, 4rem) / 0.96` | tracking `-0.045em`; max `13ch`; two lines |
| Subtext (printed on desk) | Geist | `400 1.0625rem / 1.6` | max `60ch`; one paragraph |
| Track label (nav) | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase; one per fader |
| Silkscreen serial | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| VU scale numerals | Orbitron | `600 0.625rem` | `font-variant-numeric: tabular-nums` |
| LCD readout value | Orbitron | `600 0.875rem` | `font-variant-numeric: tabular-nums` |
| LCD readout label | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Link pad | Space Grotesk | `650 0.9375rem` | tracking `-0.01em` |

The desk-printed type is baked into a `CanvasTexture` painted once on mount. The track labels are real DOM elements pinned above the strip, not painted, because they are interactive and must be keyboard reachable.

### 0.3.3 Materials and lighting

- **Desk surface:** `MeshStandardMaterial` with `color: var(--desk)`, `roughness: 0.55`, `metalness: 0.35`, plus a `roughnessMap` from a procedurally generated 512x512 noise canvas (brushed aluminium has direction, not uniform roughness). The map is generated once on mount, not fetched.
- **Fader caps:** `MeshStandardMaterial`, `roughness: 0.35`, `metalness: 0.5`. The raised cap uses `--primary` with `emissiveIntensity: 0.15`.
- **VU face:** `MeshBasicMaterial` with a `CanvasTexture` painted once (the arc, the numerals, the ticks). No lighting on the face; it is backlit glass, not a lit object.
- **VU needle:** a thin `BoxGeometry(0.002, 0.09, 0.001)` parented to a pivot group at the bottom of the face. Rotation around Z drives the needle.
- **Lighting:** one `DirectionalLight` from `(-2, 5, 3)`, intensity `1.1`, colour `#fff2e2`, casting shadows onto the desk. One `HemisphereLight`, sky `#3a4140`, ground `#0d1110`, intensity `0.4`. One `SpotLight` from above the VU meter, intensity `0.6`, angle `0.4`, penumbra `0.8`, colour `#f4f1e6`, giving the meter its pool of light.
- **Tone mapping:** `ACESFilmicToneMapping`, exposure `1.0`.

### 0.3.4 Strip geometry

The strip is 4.8m wide, 0.6m deep, 0.08m thick, centred at the world origin with its top face at `y = 0`. The camera travels from `x = -1.6` to `x = +1.6` over the scroll.

| Part | Geometry | Position (m) | Notes |
| --- | --- | --- | --- |
| Desk body | `BoxGeometry(4.8, 0.08, 0.6)` | `(0, -0.04, 0)` | top face at `y = 0` |
| Fader rail (x5) | `BoxGeometry(0.012, 0.004, 0.28)` inset | `x = -1.6 + i * 0.8`, `z = -0.1` | one per section |
| Fader cap (x5) | `BoxGeometry(0.05, 0.02, 0.035)` | `x = -1.6 + i * 0.8`, `y = 0.01`, `z = -0.1 + travel` | travel `-0.1 .. +0.1` |
| VU meter body | `BoxGeometry(0.34, 0.02, 0.24)` | `(0, 0.01, 0.16)` | raised housing |
| VU face | `PlaneGeometry(0.3, 0.2)` | `(0, 0.022, 0.16)` rotated `-PI/2` | CanvasTexture |
| VU needle pivot | `Group` at `(0, 0.022, 0.26)` | | needle rotates around Z |
| Peak LED | `CylinderGeometry(0.008, 0.008, 0.004, 16)` | `(0.2, 0.022, 0.16)` | `MeshBasicMaterial`, colour switches |
| Serial plate | `PlaneGeometry(0.5, 0.05)` | `(-0.9, 0.001, 0.2)` rotated `-PI/2` | CanvasTexture |
| Headline plate | `PlaneGeometry(2.0, 0.34)` | `(-1.1, 0.001, 0.2)` rotated `-PI/2` | CanvasTexture, painted once |

The headline plate is 2.0m wide, so at a 1280px viewport showing roughly 2.4m of strip, the headline fills most of the frame at `progress = 0` and slides out by `progress = 0.6`.

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
| 0 | R3F `<Canvas>` (desk) | n/a |
| 1 | Atmosphere gradient (vignette at the edges) | none |
| 2 | Track labels (nav, pinned above the strip) | auto |
| 3 | LCD readouts | none on labels, auto on values |
| 4 | Link pads + About handoff | auto |

The track labels sit above the strip at a fixed viewport position (`top: 12vh`), while the strip dollies underneath. This is the one deliberate spatial inconsistency in the design: the labels are the page's chrome, the strip is the page's content, and they move at different rates. It reads as a real desk with a printed nav strip above it, not as a floating overlay.

### 0.4.3 Responsive collapse

| Breakpoint | Headline scale | Camera FOV | Strip visible | Faders |
| --- | --- | --- | --- | --- |
| `< 480px` | `clamp(1.75rem, 7vw, 2.25rem)` | `48°` | 1.2m | 2 visible, camera snaps between them |
| `480 - 768px` | `clamp(2rem, 6vw, 2.75rem)` | `44°` | 1.8m | 3 visible |
| `768 - 1280px` | `clamp(2.5rem, 5vw, 3.5rem)` | `38°` | 2.4m | 4 visible |
| `>= 1280px` | `clamp(3rem, 4.5vw, 4rem)` | `34°` | 3.2m | 5 visible |

Below 480px the desk is too wide to dolly smoothly, so the camera snaps between fader positions instead of travelling continuously: `Math.round(progress * 4) / 4` instead of `progress`. The snap is a deliberate mobile behaviour, not a degraded one; it reads as a real fader clicking into a detent.

## 0.5 Motion choreography

### 0.5.1 Idle (no scroll)

- The VU needle breathes: `angle = -30° + 12° * (0.5 + 0.5 * sin(t * 2π / 0.5))`. When audio is playing, the needle is driven by the live amplitude instead, mapped from `0..1` to `-30°..+42°`.
- The raised fader cap (the active section) pulses its emissive at `0.15 + 0.05 * sin(t * 2π / 2)`, a two-second breath.
- The peak LED fires when the needle passes 85 percent of its arc. It stays lit for 120ms, then fades over 200ms.
- No camera motion, no desk motion.

### 0.5.2 Scroll timeline

| Progress | Camera X | Active fader | Fader travel | Headline | Readouts | Handoff |
| --- | --- | --- | --- | --- | --- | --- |
| `0.00` | `-1.6` | 0 (About) | `+0.10` | fully in frame | fade in, 80ms stagger | hidden |
| `0.00 - 0.20` | `-1.6 → -0.8` | 0 → 1 | fader 0 falls to `0`, fader 1 rises to `+0.10` | slides left with the surface | holds | hidden |
| `0.20 - 0.40` | `-0.8 → 0` | 1 → 2 | fader 1 falls, fader 2 rises | continues left | holds | hidden |
| `0.40 - 0.60` | `0 → 0.8` | 2 → 3 | fader 2 falls, fader 3 rises | mostly out of frame | holds | hidden |
| `0.60 - 0.80` | `0.8 → 1.6` | 3 → 4 | fader 3 falls, fader 4 rises | out of frame | holds | hidden |
| `0.80 - 0.95` | `1.6` | 4 (Contact) | fader 4 at `+0.10` | out of frame | fades to `0.4` | slides in from `yPercent: 100` |
| `0.95 - 1.00` | `1.6` | 4 | holds | out of frame | locked | fully in, `opacity: 1` |

The fader travel is a `sine.inOut` curve: the cap rises over 0.1 of scroll, holds for 0.05, falls over 0.1. Two adjacent faders are never both raised; the handoff is a crossfade of position, which is what a real desk looks like when a hand moves from one channel to the next.

Clicking a track label sets scroll to that fader's progress and the camera dollies there with `scrub: 0.5`. The click is a real navigation, not a decorative jump: it scrolls the page to the corresponding section, and the camera arrives at the same time because both are driven by the same scroll position.

### 0.5.3 Easing and timing

| Use | Curve | Duration |
| --- | --- | --- |
| Boot reveal (desk + labels) | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.5s, 60ms stagger per fader |
| Camera dolly | `sine.inOut` | scrub, `scrub: 0.5` |
| Fader travel | `sine.inOut` | scrub |
| Track label click | `power2.inOut` | 0.6s scroll, camera follows via scrub |
| VU needle (idle) | sine wave, 0.5s period (120 BPM) | continuous |
| VU needle (audio) | `lerp(current, target, 0.25)` per frame | continuous |
| Peak LED on | `linear` | 120ms on, 200ms fade |
| LCD value crossfade | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.3s in, 0.3s out, 200ms hold |
| Handoff slide in | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.32s |
| Track label hover | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.16s |

### 0.5.4 Reduced motion

`prefers-reduced-motion: reduce`:
- The camera holds at `x = 0` (the VU meter centred). All five faders are visible at once, all at travel `0`. The strip is read as a whole, not travelled.
- The VU needle holds at `-30°` (rest). No breath, no audio response.
- The active fader cap does not pulse.
- The peak LED does not fire.
- The headline is printed on the desk at the centre, fully visible.
- The track labels are still interactive: clicking one scrolls the page to the section, no camera move.
- The handoff and readouts are in their final state from the first paint.

The reduced-motion composition is genuinely good: a full desk, all five channels visible, one headline, one meter at rest. It is the product shot, not a degraded version of it.

## 0.6 Stack and architecture

### 0.6.1 Files

```
features/landing-page/components/mastering-console/
├── console-stage.tsx                # top-level hero section (DOM overlay)
├── console-stage.module.css         # hero layout + track label positions
├── console-r3f.tsx                  # R3F <Canvas> wrapper
├── console-desk.tsx                 # desk body, roughness map, materials
├── console-faders.tsx               # 5 faders, travel animation, active state
├── console-vu.tsx                   # VU meter face, needle, peak LED
├── console-prints.tsx               # CanvasTexture painter (headline, serial, VU face)
├── console-camera.ts                # <PerspectiveCamera> + ScrollTrigger dolly
├── console-labels.tsx               # 5 track labels (DOM nav)
├── console-readouts.tsx             # 3 LCD readout cards (DOM)
├── console-readouts.module.css      # readout card styles
├── use-console-motion.ts            # writes progress + velocity + active index
└── index.ts                         # barrel: <MasteringConsole />
```

Plus one edit to `features/landing-page/rack-01/section-hero.tsx` to replace the `<PadSea />` mount with `<MasteringConsole />`. The `data-anim` attributes the rack hook queries for the rail and the handoff are preserved.

### 0.6.2 Hook contract

```ts
// use-console-motion.ts
export type ConsoleSection = 'about' | 'skills' | 'experience' | 'work' | 'contact'

export type ConsoleMotion = {
  progress: { current: number }
  velocity: { current: number }
  activeIndex: { current: number }
  activeSection: ConsoleSection
  reduced: boolean
  audio: { amplitude: number; playing: boolean }
}

export function useConsoleMotion(
  ref: RefObject<HTMLElement>,
  audioSource: { amplitude: number; playing: boolean },
): ConsoleMotion
```

The hook writes `progress`, `velocity` and `activeIndex` into refs every scroll frame, and exposes `activeSection` as React state (it changes only four times over the whole scroll, so a state update is fine here; the refs carry the per-frame values). The track labels read `activeSection` for their `aria-current` attribute.

### 0.6.3 Capability probe

Same `decideRuntime()` function as the other three concepts. The fallback is a static SVG of the desk from directly above: the strip outline, five fader rails with caps at their rest positions, the VU meter with the needle at rest, the headline as real text below. The fallback is the reduced-motion composition, drawn in 2D.

## 0.7 Code suggestion

### 0.7.1 Fader travel (`console-faders.tsx`)

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

import type { ConsoleMotion } from './use-console-motion'

const SECTION_COUNT = 5
const FADER_X0 = -1.6
const FADER_SPACING = 0.8
const FADER_Z = -0.1
const TRAVEL = 0.1

type Props = { motion: ConsoleMotion }

export function ConsoleFaders({ motion }: Props) {
  const capRefs = useRef<(Mesh | null)[]>([])

  const positions = useMemo(
    () =>
      Array.from({ length: SECTION_COUNT }, (_, i) => FADER_X0 + i * FADER_SPACING),
    [],
  )

  useFrame(() => {
    const p = motion.progress.current
    const active = motion.activeIndex.current

    capRefs.current.forEach((cap, i) => {
      if (!cap) return
      // Distance from the camera's current scroll position to this fader,
      // in fader-index units. 0 when the camera is parked on this fader.
      const cameraIndex = p * (SECTION_COUNT - 1)
      const d = Math.abs(cameraIndex - i)
      // Raised when d < 0.5, falling off smoothly. sine.inOut shape.
      const raised = d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * d)
      const targetZ = FADER_Z + TRAVEL * raised
      // Smooth the travel so a fast scroll does not snap the cap
      cap.position.z += (targetZ - cap.position.z) * 0.18
      // The active cap gets the signal colour and a faint emissive
      const mat = cap.material as any
      const isActive = i === active
      mat.color.lerp(isActive ? ACTIVE_COLOR : REST_COLOR, 0.12)
      mat.emissiveIntensity += ((isActive ? 0.15 : 0) - mat.emissiveIntensity) * 0.12
    })
  })

  return (
    <group>
      {positions.map((x, i) => (
        <group key={i} position={[x, 0, FADER_Z]}>
          {/* Rail */}
          <mesh position={[0, 0.002, 0]}>
            <boxGeometry args={[0.012, 0.004, 0.28]} />
            <meshStandardMaterial color={'var(--rail)'} roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Cap */}
          <mesh
            ref={(el) => (capRefs.current[i] = el)}
            position={[0, 0.012, 0]}
            castShadow
          >
            <boxGeometry args={[0.05, 0.02, 0.035]} />
            <meshStandardMaterial
              color={'var(--lcd-bg)'}
              roughness={0.35}
              metalness={0.5}
              emissive={'var(--primary)'}
              emissiveIntensity={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
```

The `cos` falloff is the key detail. A fader does not jump from down to up; it rises as the camera approaches and falls as the camera leaves, and the shape is a cosine, which has zero derivative at both ends. That is what makes the travel read as a hand moving, not a switch flipping.

### 0.7.2 VU needle (`console-vu.tsx`)

```tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import type { ConsoleMotion } from './use-console-motion'

const REST_DEG = -30
const MAX_DEG = 42
const IDLE_PERIOD = 0.5 // 120 BPM
const PEAK_THRESHOLD = 0.85

type Props = {
  motion: ConsoleMotion
  position: [number, number, number]
}

export function ConsoleVu({ motion, position }: Props) {
  const pivotRef = useRef<Group>(null)
  const ledRef = useRef<any>(null)
  const ledUntil = useRef(0)

  useFrame((state) => {
    if (!pivotRef.current) return
    const t = state.clock.elapsedTime

    let level: number
    if (motion.audio.playing) {
      // Live amplitude, 0..1. Boosted because the analyser's RMS sits low.
      level = Math.min(1, motion.audio.amplitude * 4)
    } else {
      // Idle breath at 120 BPM, never below 0.15 so the needle always moves
      level = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / IDLE_PERIOD))
    }

    const targetDeg = REST_DEG + (MAX_DEG - REST_DEG) * level
    const current = (pivotRef.current.rotation.z * 180) / Math.PI
    const next = current + (targetDeg - current) * 0.25
    pivotRef.current.rotation.z = (next * Math.PI) / 180

    // Peak LED: fires on crossing, stays lit 120ms, fades over 200ms
    const now = t
    if (level >= PEAK_THRESHOLD && ledUntil.current < now) {
      ledUntil.current = now + 0.12
    }
    if (ledRef.current) {
      const on = now < ledUntil.current
      const mat = ledRef.current.material
      const target = on ? 1 : 0
      mat.opacity += (target - mat.opacity) * (on ? 0.6 : 0.12)
    }
  })

  return (
    <group position={position}>
      {/* Meter housing */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.34, 0.02, 0.24]} />
        <meshStandardMaterial color={'var(--desk-edge)'} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Needle pivot at the bottom of the face */}
      <group ref={pivotRef} position={[0, 0.022, 0.06]}>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.002, 0.09, 0.001]} />
          <meshStandardMaterial color={'var(--secondary)'} />
        </mesh>
      </group>
      {/* Peak LED */}
      <mesh ref={ledRef} position={[0.2, 0.022, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.004, 16]} />
        <meshBasicMaterial color={'var(--primary)'} transparent opacity={0} />
      </mesh>
    </group>
  )
}
```

The needle's `lerp` factor of `0.25` per frame is the ballistic response: a real VU needle has mass and overshoots slightly. At 60fps, `0.25` reaches 95 percent of the target in about 11 frames (180ms), which matches a real 300ms VU ballistic closely enough to read as physical.

### 0.7.3 Desk-printed type (`console-prints.tsx`)

```tsx
'use client'

import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

type Print = {
  text: string
  font: string
  color: string
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
}

/**
 * Paints one or more lines onto a canvas and returns a texture. Called once per
 * print on mount; the desk never repaints. The canvas is sized to the physical
 * plate so the type stays crisp at the camera's working distance.
 */
export function useDeskPrint(
  prints: Print[],
  width: number,
  height: number,
): CanvasTexture {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [width, height])

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let y = 0
    for (const p of prints) {
      ctx.font = p.font
      ctx.fillStyle = p.color
      ctx.textAlign = p.align ?? 'left'
      ctx.textBaseline = p.baseline ?? 'top'
      ctx.fillText(p.text, 0, y)
      y += parseInt(p.font.match(/(\d+)px/)?.[1] ?? '48', 10) * 1.25
    }
    texture.needsUpdate = true
  }, [prints, texture])

  return texture
}
```

The desk print uses the same font stack as the rest of the page. The headline is painted with `750 ${size}px 'Syne', system-ui, sans-serif`, the serial with `650 20px 'Geist Mono', monospace`. No font is loaded for the canvas; the browser resolves from the already-loaded `next/font` faces.

### 0.7.4 Track labels (`console-labels.tsx`)

```tsx
'use client'

import type { ConsoleMotion, ConsoleSection } from './use-console-motion'
import styles from './console-stage.module.css'

const SECTIONS: { id: ConsoleSection; label: string; href: string }[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

export function ConsoleLabels({ motion }: { motion: ConsoleMotion }) {
  return (
    <nav className={styles.labels} aria-label="Sections">
      {SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={s.href}
          className={styles.label}
          aria-current={motion.activeSection === s.id ? 'true' : undefined}
          style={{ '--i': i } as React.CSSProperties}
        >
          <span className={styles.labelIndex}>{String(i + 1).padStart(2, '0')}</span>
          <span className={styles.labelText}>{s.label}</span>
        </a>
      ))}
    </nav>
  )
}
```

The `aria-current` attribute is the accessibility contract: a screen reader user hears which section they are in as they scroll, and the visual underline on the active label matches. The labels are real anchors to real sections (`#about`, `#skills`, `#experience`, `#work`, `#contact`), all of which exist on the page today.

## 0.8 Performance budget

| Metric | Budget | Notes |
| --- | --- | --- |
| First frame | < 1.2s after navigation | R3F dynamic-imported, one canvas |
| Steady-state frame time | < 9ms (120Hz) / < 16ms (60Hz) | Desk + 5 faders (10 meshes) + meter (3 meshes) |
| Draw calls | < 20 | desk, 5 rails, 5 caps, housing, needle, LED, 2 prints, VU face |
| `frameloop` | `'always'` while in view, `'never'` when scrolled past | IntersectionObserver swap |
| DPR clamp | `[1, 2]` | |
| Shadow map size | `1024` | desk receives, faders and meter cast |
| Roughness map | 512x512, generated on mount | ~40ms one-time cost, no network |
| CanvasTextures | 3 (headline plate, serial plate, VU face) | painted once, never repainted |
| Bundle cost | reuses existing three + r3f | No new dependencies |
| Reduced motion | Static desk, no per-frame work beyond the initial paint | `frameloop: 'demand'` |
| Mobile < 480px | Camera snaps between faders instead of travelling | fewer frames drawn, less scroll work |

## 0.9 Accessibility

| Concern | Treatment |
| --- | --- |
| `prefers-reduced-motion: reduce` | Camera holds at `x = 0`, all five faders at rest, needle at rest, no LED, no pulses. The full desk is visible as a single composition. Track labels still navigate. |
| `prefers-reduced-transparency: reduce` | No transparency in the scene; the atmosphere vignette is a gradient with solid stops on this branch. |
| Keyboard | The five track labels are real `<a>` elements in DOM order, reachable with Tab, activated with Enter. The link pads and handoff are reachable. The canvas is `tabindex="-1"`, `aria-hidden="true"`. |
| Screen reader | A visually hidden `<h1>` carries the headline. The `<nav>` has `aria-label="Sections"`. Each label carries `aria-current="true"` when its section is active, so a screen reader user gets the same positional information a sighted user gets from the raised fader. |
| Contrast | Headline `#f1eee5` on `#222827` (dark desk) = 12.1:1. Silkscreen `#8b8f89` on `#222827` = 5.2:1, above AA for `0.6875rem` bold. Track labels use `--card-foreground` at 12.1:1. Readouts inherit the existing LCD token set, already AA. |
| Target size | Track labels are `min-height: 44px` with `padding-block: 0.75rem`, meeting the 44px tap target on mobile. |
| Audio | The VU meter responds to the page's `MusicPlayer`. No autoplay; the idle breath is the 120 BPM fallback. |
| No nausea | The camera dolly is lateral and slow (`scrub: 0.5`), with no FOV change and no rotation. The reduced-motion opt-out holds the camera still. |

## 0.10 Acceptance criteria

1. The first paint shows the desk at `camera.x = -1.6`, the headline printed and fully visible, the five track labels above the strip, within 1.2s of navigation.
2. The headline, three LCD readouts, five track labels and the three link pads are visible above the fold on a 1280x720 viewport without scroll.
3. The headline does not exceed two lines at any supported viewport (max 13ch).
4. As scroll progress moves 0 → 1, the camera dollies from `x = -1.6` to `x = +1.6` with `sine.inOut` easing and `scrub: 0.5`.
5. Fader travel follows the cosine falloff: a fader is raised when the camera is within one index of it, at rest when two or more indices away. Two adjacent faders are never both at full raise.
6. The raised fader is `--primary` with `emissiveIntensity: 0.15`; the rest are `--lcd-bg` with `emissiveIntensity: 0`.
7. The VU needle breathes between `-30°` and `+8°` at 120 BPM when audio is off, and follows the live amplitude when the `MusicPlayer` is playing.
8. The peak LED fires when the needle passes 85 percent of its arc, stays lit for 120ms, and fades over 200ms.
9. Clicking a track label scrolls to the corresponding section (real `href`), sets `aria-current="true"` on that label, and the camera arrives at the matching fader position because both are driven by the same scroll value.
10. The About handoff slides in from `yPercent: 100` to `yPercent: 0` between `progress = 0.80` and `progress = 0.95`.
11. `prefers-reduced-motion: reduce` holds the camera at `x = 0`, all five faders at rest, the needle at `-30°`, the headline printed and visible, and the labels still navigable.
12. The WebGL probe falls back to the static top-down SVG of the desk with real headline text below.
13. Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms. R3F bundle is dynamic-imported.
14. The rack-hook's `useRackAnimations` does not throw on the new component: every `data-anim` attribute it queries for the rail and the handoff is present.

## 0.11 Risks and what to add when

| Risk | When to add the fix |
| --- | --- |
| The desk is a box. It has no brand-specific silhouette. | When the brand picks a reference desk (SSL, Neve, API), swap the body geometry for a chamfered extrusion. The fader and meter layout is already correct for a channel strip; only the body shape changes. |
| The camera dolly means the headline is off-screen for the second half of the scroll. | That is the design: the headline's job is the first screen. If a persistent headline is needed, add a second, smaller printed plate at `x = +1.6` carrying the name. |
| Five faders mapped to five sections assumes the page keeps five sections. | If the page grows to seven sections, the strip gets seven faders and the camera travel per fader shrinks. The `SECTION_COUNT` constant drives everything; nothing else changes. |
| The VU meter is the most detailed object on the strip and it may read as a gimmick if it never responds to real audio. | It responds to the existing `MusicPlayer`. If audio is never playing, the idle breath is honest (the desk is powered, nothing is playing), which is a real state, not a fake one. |
| The brushed-aluminium roughness map costs ~40ms on mount. | Move the map generation into a `requestIdleCallback` and start the desk with a flat `roughness: 0.55`, then swap the map in. The swap is invisible because it happens before the first scroll. |
| The strip is 4.8m wide and the camera only ever shows 3.2m of it, so 1.6m of geometry is never seen. | That is deliberate: the extra width is what makes the dolly feel like a real desk rather than a finite plane. If draw-call budget matters, cull the off-screen faders with a frustum check. |

ponytail: skipped: real per-section VU levels (each fader driving its own meter, like a real desk). One meter is enough to carry the motif; five meters would be five times the geometry for the same idea. Add when the page has real per-section audio data to encode.
