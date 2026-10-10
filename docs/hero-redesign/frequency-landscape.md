# Frequency Landscape - Hero Concept 2

> A scroll-driven 3D topographic terrain whose elevation IS the audio spectrum. The camera flies the surface; the headline is the horizon.

This is one of four candidate redesigns for `features/landing-page/rack-01/section-hero.tsx`. It deliberately drops the existing device wall, the pad sea, the broken-light name, and the rack-collapse chapter. The editorial panel, the LCD readouts, the bottom rail and the About handoff survive (Section 9) and are re-composed on top of the terrain.

## 0.0 Design Read

> Reading this as: a premium-consumer audio-product hero (DAP / music language) for a technical hiring audience, with the `Signal` warm-aluminium + signal-orange + LCD-green brand, leaning on a single cinematic R3F camera move over a 3D terrain, dials `VARIANCE 7 / MOTION 9 / DENSITY 3`.

- VARIANCE 7: one asymmetric composition. Headline sits left-of-centre, terrain extends right, rail and handoff hold the bottom edges.
- MOTION 9: scroll = one continuous camera move, the only idle is a 4s breath. No parallax soup.
- DENSITY 3: one focal subject (the terrain), one accent (the ridge), one headline, three readouts.

## 0.1 Premise

Music is not visualised as bars. It is visualised as **landscape**: elevation = amplitude at a given frequency bin, longitude = the spectrum reading left-to-right (low to high), time = scroll progress. The first screen is a single ridge glowing in the dark, the headline floating above it as horizon fog, three LCD readouts anchoring the bottom-left. Scroll pushes the camera forward: at frame 0 the camera sits above and behind the surface, at frame 1 it has flown through the highest peak and the back of the terrain is now the floor.

The terrain is the page's own data. The spectrum is a synthetic 64-band envelope derived deterministically from the page hash, so two visits render the same surface and the artist's intent (what frequencies are loud, what frequencies are quiet) is real and visible. The page does not invent data; it encodes the brand's sound signature into the surface itself.

## 0.2 Concept

```
viewport edge (top, left, right)
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   HEADLINE (Syne 750, left, 60% of viewport width)          │
│   Built for the moment after launch.                         │
│                                                              │
│        ░░░░░  ░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░               │  ← terrain (WebGL)
│      ░▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░                │
│    ░▒▓▓▓███████████████████████████████████████▓▒▒░          │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │  ← LCD readouts
│  │  4+ yrs │  │ 3 teams │  │ 15K+ us │                        │     (Orbitron 600)
│  └─────────┘  └─────────┘  └─────────┘                        │
│                                                              │
│  [ See the works ↓ ]  [ Read the notes ↗ ]  [ Resume ↗ ]    │  ← three link pads
│                                                              │
└──────────────────────────────────────────────────────────────┘
   rail: 64 bands / 120 BPM / web audio   About Aditya →
   handoff: Next signal / 02  Profile
```

The terrain is the only 3D element. The headline, the readouts and the link pads are DOM overlays anchored to the hero's CSS-grid layout. The terrain shares z-index 0; the overlays sit on z-index 2 with `pointer-events: auto` on the pads and `pointer-events: none` on the readouts and the headline (so the canvas stays interactive for `prefers-reduced-motion` to receive the pointer).

## 0.3 Visual specification

### 0.3.1 Color usage (locked to brand tokens)

| Element | Light | Dark | Token |
| --- | --- | --- | --- |
| Terrain base | `#9d9a90` | `#1a1d1c` | new `--terrain-base` (one shade off `--card`) |
| Terrain mid | `#bcb6a8` | `#2a2f2d` | new `--terrain-mid` |
| Ridge emissive | `#36564d` | `#7abb5e` | `--secondary` |
| Ridge peak | `#7abb5e` | `#a0d18a` | `--secondary-light` |
| Atmosphere fog | `rgba(231,230,221,0.78)` | `rgba(13,17,16,0.82)` | `--background` + alpha |
| Headline ink | `#1a1d1c` | `#f1eee5` | `--card-foreground` |
| LCD panel | `--lcd-bg` | `--lcd-bg` | unchanged |
| Signal orange (one peak fader) | `--primary` | `--primary` | unchanged |

The ridge is the only emissive element. The signal orange appears exactly once in the entire composition: on a single fader cap parked at the leftmost end of the spectrum, lit dim. This is the rule: a single accent, used as a brand mark, not as decoration. Without it the page reads as moss-green-on-charcoal (the existing brand), with it the page reads as SIGNAL.

### 0.3.2 Typography (existing stack, no new fonts)

| Role | Family | Spec | Notes |
| --- | --- | --- | --- |
| Headline | Syne | `750 clamp(2.5rem, 5.5vw, 5.5rem) / 0.96` | tracking `-0.045em`; max `13ch`; two lines max |
| Subtext | Geist | `400 1.0625rem / 1.6` | max `60ch`; one paragraph, no bullet list |
| LCD readout value | Orbitron | `600 0.875rem` | `font-variant-numeric: tabular-nums` |
| LCD readout label | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Silkscreen rail | Geist Mono | `650 0.6875rem` | tracking `0.12em`, uppercase |
| Link pad | Space Grotesk | `650 0.9375rem` | tracking `-0.01em` |

The headline ink matches the LCD-green ridge's brightness in the dark theme, so the headline reads as the horizon fog over the ridge. In the light theme the headline is a deep warm grey that contrasts against the cream ground.

### 0.3.3 Materials and lighting

- Terrain: `MeshStandardMaterial` with `roughness: 0.85`, `metalness: 0.1`, `flatShading: true`. `flatShading: true` is the choice: smooth shading on a frequency surface looks like a ski slope, faceted shading looks like a topographical relief map. The brand reads as instrumented, not recreational.
- A custom `onBeforeCompile` shader injects a per-vertex emissive based on `z > ridgeThreshold * (1 + 0.15 * sin(time))` so the ridge pulses at the page's 120 BPM idle.
- One `DirectionalLight` from `(3, 5, 4)`, intensity `0.6`, warm tint `#fff2e2`, casting shadows on the terrain only.
- One `HemisphereLight`, sky `#3a4140`, ground `#0d1110`, intensity `0.35`, fills the shadow side.
- A `RoomEnvironment` from `three-stdlib` (already a transitive dep of `@react-three/drei` via `three`) for the subtle rim reflection on the ridge.
- No bloom, no DoF, no god rays. Three lights total. The composition reads as lit, not filtered.

### 0.3.4 Surface geometry

- `PlaneGeometry(24, 24, 200, 200)`, rotated `-PI/2` around X so the surface is horizontal.
- Z displacement is a per-vertex offset: `z[i,j] = spectrum[i] * 1.4 * falloff(j)` where `falloff(j) = max(0, 1 - j/200)` so the surface drops off to a flat back plane. This means the front edge is the loudest, the back edge is silent, and the camera path can fly through the high front and emerge into the low back.
- `spectrum` is a 64-element array, smoothed with a Hann window, each element `0..1`. The array is generated once on mount from a Mulberry32-seeded `Math.random()` so the shape is deterministic per build but varies between builds. The shape itself is composed of 6 overlapping Gaussian peaks at musical intervals (root, fifth, octave, minor third, major third, octave) so the surface looks like a frequency response, not like noise.

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

`container-type: inline-size` lets the headline's `cqi` units scale with the hero's own width, not the viewport. This is what makes the headline type behave correctly on split-screen desktop and full-bleed mobile without per-breakpoint overrides.

### 0.4.2 Z-layers

| z | Element | Pointer |
| --- | --- | --- |
| 0 | R3F `<Canvas>` (terrain) | n/a |
| 1 | Atmosphere gradient overlay | none |
| 2 | Headline + subtext | none on text, auto on link pads |
| 3 | LCD readouts | none on labels, auto on values |
| 4 | Bottom rail + link pads | auto |
| 5 | About handoff (rack-hook) | auto |

The existing rack hook's `useRackAnimations` already addresses `[data-anim="hero-section"]`, `[data-anim="hero-panel"]`, `[data-anim="hero-rail"]`, `[data-anim="hero-atmosphere"]`, `[data-anim="hero-boot"]` and `[data-anim="hero-handoff"]`. All of those `data-anim` values are preserved on the new component so the boot, the panel collapse and the handoff keep working without edits to `use-rack-animations.ts`.

### 0.4.3 Responsive collapse

| Breakpoint | Headline scale | Terrain camera FOV | Readouts |
| --- | --- | --- | --- |
| `< 480px` | `clamp(2.25rem, 8vw, 3rem)` | `42°` | stacked, full width |
| `480 - 768px` | `clamp(2.5rem, 7vw, 3.5rem)` | `38°` | row of three |
| `768 - 1280px` | `clamp(3rem, 5.5vw, 4.5rem)` | `34°` | row of three |
| `>= 1280px` | `clamp(3.5rem, 5.5vw, 5.5rem)` | `30°` | row of three with margin to headline |

Below 768px the FOV widens so the terrain fills more of the viewport. Below 480px the headline drops to two short lines (the existing copy already fits this constraint).

## 0.5 Motion choreography

### 0.5.1 Idle (0..0.05 scroll, or no scroll yet)

- Terrain ridge pulses at 120 BPM (one `Math.sin(elapsed * Math.PI * 2 / 0.5)` cycle, amplitude `0.05`). This is the page's own heartbeat; the bottom rail prints `120 BPM`.
- Camera holds at `(0, 4.2, 6.0)`, looking at `(0, 0.6, 0)`. Subtle parallax: `camera.x = lerp(camera.x, mouseX * 0.15, 0.05)` so the camera nudges with the pointer (no spring, lerp is enough; springs on idle look like a toy).
- The LCD readouts cycle through three values every 4s: `years → teams → users` and back. Each value fades in over `0.45s` with a 200ms hold, fades out over `0.3s`. The label stays put.

### 0.5.2 Scroll timeline

| Progress | Camera | Terrain | Headline | Readouts | Handoff |
| --- | --- | --- | --- | --- | --- |
| `0.00` | `(0, 4.2, 6.0)` | full surface visible, idle pulse | `opacity: 0` → `1` over 0.4s, `translateY(8px)` → `0` | `opacity: 0` → `1` over 0.6s, staggered 80ms | hidden |
| `0.05` | holds | idle | in place | in place | hidden |
| `0.05 - 0.45` | dolly forward to `(0, 1.6, 1.5)`, ease-in-out | ridge stays sharp, base softens slightly with distance fog | holds at `1` | hold | hidden |
| `0.45 - 0.70` | pushes through ridge | ridge moves offscreen below, base surface flattens to back plane | holds | hold | hidden |
| `0.70 - 0.95` | rises to `(0, 2.4, 0.8)`, tilts -3° X | surface is now a horizon line; flat back plane dominates | starts to blur (`filter: blur(0 → 2px)`) and fade (`opacity: 1 → 0.32`) | blur, fade | starts to translate in (`yPercent: 100 → 0`) |
| `0.95 - 1.00` | holds, vignette darkens | flat | locked at `0.32` opacity | locked at `0.32` opacity | fully in, `opacity: 1` |

The whole choreography is a single `ScrollTrigger` writing `progress` and `velocity` into a singleton, read inside the R3F `useFrame` on every frame. No re-renders. Same pattern the existing `useHeroMotion` uses for the pad sea.

### 0.5.3 Easing and timing

| Use | Curve | Duration |
| --- | --- | --- |
| Boot reveal | `cubic-bezier(0.22, 1, 0.36, 1)` (existing `--ease-out`) | 0.45s |
| Camera dolly | GSAP `power2.inOut` | scrub, 0.5s smoothing (`scrub: 0.5`) |
| Headline blur/fade on exit | `cubic-bezier(0.22, 1, 0.36, 1)` | scrub |
| LCD value crossfade | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.3s in, 0.3s out, 200ms hold |
| Handoff slide in | `cubic-bezier(0.22, 1, 0.36, 1)` | 0.32s |
| Ridge pulse | sine wave, 0.5s period (120 BPM) | continuous |
| Camera idle parallax | linear lerp, factor `0.05` per frame | continuous |

`scrub: 0.5` on the ScrollTrigger (not `scrub: true`) is the choice: a 0.5s smoothing window means a fast flick does not snap the camera, a slow scroll does not lag.

### 0.5.4 Reduced motion

`prefers-reduced-motion: reduce`:
- Terrain renders the deterministic spectrum at full amplitude, no pulse, no scroll-driven camera. Camera holds at `(0, 4.2, 6.0)` for the entire scroll.
- Headline, readouts, and handoff collapse to instant state (no fade, no blur, no slide).
- The boot sequence (rack-hook) still plays its 0.45s reveal because that is a comprehension aid, not a motion flourish.

## 0.6 Stack and architecture

### 0.6.1 Files

```
features/landing-page/components/frequency-landscape/
├── landscape-stage.tsx           # top-level hero section (DOM overlay)
├── landscape-stage.module.css    # hero layout + grid for overlays
├── landscape-r3f.tsx             # R3F <Canvas> wrapper
├── landscape-terrain.tsx         # PlaneGeometry + spectrum + emissive shader
├── landscape-ridge-shader.ts     # onBeforeCompile emissive injection
├── landscape-camera.ts           # <PerspectiveCamera> + ScrollTrigger wiring
├── landscape-readouts.tsx        # three LCD readout cards (DOM)
├── landscape-readouts.module.css # readout card styles (replaces pad-sea module)
├── spectrum-data.ts              # deterministic 64-band envelope generator
├── use-landscape-motion.ts       # writes progress + velocity, exposes to R3F
└── index.ts                      # barrel: <FrequencyLandscape />
```

Plus one edit to `features/landing-page/rack-01/section-hero.tsx` to replace the `<PadSea />` mount with `<FrequencyLandscape />`. The `data-anim` attributes the rack hook queries are preserved on the new component.

### 0.6.2 Hook contract

```ts
// use-landscape-motion.ts
export type LandscapeMotion = {
  progress: { current: number }   // 0..1
  velocity: { current: number }   // signed, px/s
  reduced: boolean                // true if prefers-reduced-motion: reduce
}

export function useLandscapeMotion(ref: RefObject<HTMLElement>): LandscapeMotion
```

The hook mounts a single `ScrollTrigger` on `ref.current`, writes `progress` and `velocity` into refs on every scroll frame, and tears it down on unmount. `useFrame` in the R3F tree reads these refs directly. The existing `useHeroMotion` is the exact same pattern, and the new hook should sit next to it.

### 0.6.3 Capability probe

Same as the pad sea: one `decideRuntime()` function returns `'on' | 'off'`. Inputs:
- `prefers-reduced-motion: reduce` → `'on'` (still render, but with the no-motion timeline).
- `prefers-reduced-transparency: reduce` → `'on'`.
- `(navigator as any).connection?.saveData === true` → `'off'` (fall back to a static SVG composition).
- A one-shot WebGL probe: create a `<canvas>`, get a `webgl` context, draw one pixel, read it back. If the read fails, `'off'`.
- `window.matchMedia('(max-width: 480px) and (max-height: 720px)').matches` → `'on'` (small viewports always render; perf budget tighter there).
- Default: `'on'`.

When `'off'`, the canvas is replaced by a static SVG silhouette: the same terrain at the same camera angle, drawn as filled polygons in `--terrain-base` and `--secondary`, no ridge emissive, no pulse. The composition still reads.

## 0.7 Code suggestion

### 0.7.1 Spectrum generator (`spectrum-data.ts`)

```ts
import { mulberry32 } from '@/lib/rng'

/**
 * A deterministic 64-band amplitude envelope. Composed of 6 Gaussian peaks at
 * musical intervals (root, fifth, octave, m3, M3, octave) so the surface reads
 * as a frequency response rather than noise. Two builds with the same seed
 * produce the same surface; changing the seed changes the page's signature.
 */
export function generateSpectrum(seed: number, bins = 64): Float32Array {
  const rand = mulberry32(seed)
  const peaks = [
    { bin: 4, sigma: 2.4, amp: 0.6 + rand() * 0.2 },
    { bin: 10, sigma: 1.6, amp: 0.85 + rand() * 0.1 },
    { bin: 18, sigma: 2.0, amp: 0.95 + rand() * 0.05 },
    { bin: 24, sigma: 1.4, amp: 0.5 + rand() * 0.15 },
    { bin: 32, sigma: 1.8, amp: 0.7 + rand() * 0.1 },
    { bin: 48, sigma: 3.2, amp: 0.4 + rand() * 0.2 },
  ]
  const out = new Float32Array(bins)
  for (let i = 0; i < bins; i++) {
    let v = 0
    for (const p of peaks) {
      const d = (i - p.bin) / p.sigma
      v += p.amp * Math.exp(-0.5 * d * d)
    }
    out[i] = Math.min(1, Math.max(0, v))
  }
  // Hann smoothing pass so the surface does not ridge on bin boundaries
  const smoothed = new Float32Array(bins)
  for (let i = 0; i < bins; i++) {
    const w = (x: number) => 0.5 * (1 - Math.cos((Math.PI * 2 * x) / (bins - 1)))
    let n = 0
    let s = 0
    for (let k = -3; k <= 3; k++) {
      const j = i + k
      if (j < 0 || j >= bins) continue
      s += out[j] * w(j)
      n += w(j)
    }
    smoothed[i] = s / n
  }
  return smoothed
}
```

### 0.7.2 Terrain mesh (`landscape-terrain.tsx`)

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Mesh } from 'three'

import { generateSpectrum } from './spectrum-data'
import { injectRidgeEmissive } from './landscape-ridge-shader'

const RIDGE_THRESHOLD = 0.72

type Props = {
  progressRef: { current: number }
  reduced: boolean
}

export function LandscapeTerrain({ progressRef, reduced }: Props) {
  const meshRef = useRef<Mesh>(null)
  const geometry = useMemo(() => {
    const geo = new (require('three').PlaneGeometry)(24, 24, 200, 200)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  // Build the elevation once. The same data drives the SVG fallback.
  const elevation = useMemo(() => generateSpectrum(20260509), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const pulse = reduced ? 0 : 0.05 * Math.sin((t * Math.PI * 2) / 0.5)
    const pos = (meshRef.current.geometry.attributes.position as any)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Map x in [-12, 12] to bin in [0, 63]
      const bin = Math.max(0, Math.min(63, Math.round(((x + 12) / 24) * 63)))
      const amp = elevation[bin]
      // Front edge is loudest, back edge is silent
      const falloff = Math.max(0, 1 - (z + 12) / 24)
      const y = amp * 1.4 * falloff + pulse
      pos.setY(i, y)
    }
    pos.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        color={new Color('var(--terrain-base)')}
        roughness={0.85}
        metalness={0.1}
        flatShading
        onBeforeCompile={(shader) =>
          injectRidgeEmissive(shader, RIDGE_THRESHOLD)
        }
      />
    </mesh>
  )
}
```

### 0.7.3 Ridge emissive shader (`landscape-ridge-shader.ts`)

```ts
/**
 * Inject a per-vertex emissive contribution based on world-space Y. Anything
 * above the ridge threshold glows in --secondary (LCD green). The threshold
 * breathes with a sine of elapsed time at 120 BPM so the ridge pulses.
 */
export function injectRidgeEmissive(
  shader: any,
  threshold: number,
): void {
  shader.uniforms.uRidgeColor = { value: new Color('#7abb5e') }
  shader.uniforms.uThreshold = { value: threshold }
  shader.uniforms.uTime = { value: 0 }

  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
       varying float vRidgeHeight;`,
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vRidgeHeight = transformed.y;`,
    )

  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
       uniform vec3 uRidgeColor;
       uniform float uThreshold;
       uniform float uTime;
       varying float vRidgeHeight;`,
    )
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float breath = uThreshold * (1.0 + 0.15 * sin(uTime * 12.566));
       float ridge = smoothstep(breath - 0.05, breath + 0.05, vRidgeHeight);
       totalEmissiveRadiance += uRidgeColor * ridge * 0.85;`,
    )

  // uTime is updated from useFrame in the parent component
  ;(shader as any)._ridgeTime = true
}
```

The parent updates `shader.uniforms.uTime.value = state.clock.elapsedTime` every frame. The shader is a real `onBeforeCompile` injection, not a separate `ShaderMaterial`: the terrain still receives shadows and the standard PBR lighting, and the ridge only adds an emissive contribution on top. This is what makes the page look lit, not filtered.

### 0.7.4 Scroll camera (`landscape-camera.ts`)

```tsx
'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera as DreiPerspectiveCamera } from '@react-three/drei'
import gsap from 'gsap'

import type { LandscapeMotion } from './use-landscape-motion'

const FRAMES = [
  { p: 0.0, x: 0, y: 4.2, z: 6.0, fov: 32, lookY: 0.6 },
  { p: 0.5, x: 0, y: 1.6, z: 1.5, fov: 36, lookY: 0.3 },
  { p: 0.85, x: 0, y: 2.4, z: 0.8, fov: 40, lookY: 0.0 },
  { p: 1.0, x: 0, y: 2.4, z: 0.8, fov: 40, lookY: 0.0 },
]

type Props = { motion: LandscapeMotion }

export function LandscapeCamera({ motion }: Props) {
  const camRef = useRef<any>(null)
  const { camera } = useThree()
  const lookTarget = useRef<[number, number, number]>([0, 0.6, 0])

  useFrame(() => {
    if (!camRef.current) return
    const p = motion.progress.current
    // Find the surrounding keyframes
    const a = FRAMES.findLast((f) => f.p <= p) ?? FRAMES[0]
    const b = FRAMES.find((f) => f.p > p) ?? FRAMES[FRAMES.length - 1]
    const t = (p - a.p) / Math.max(0.0001, b.p - a.p)
    const ease = gsap.parseEase('power2.inOut')(t)
    camRef.current.position.set(
      a.x + (b.x - a.x) * ease,
      a.y + (b.y - a.y) * ease,
      a.z + (b.z - a.z) * ease,
    )
    lookTarget.current = [
      0,
      a.lookY + (b.lookY - a.lookY) * ease,
      0,
    ]
    camRef.current.lookAt(...lookTarget.current)
    if (Math.abs(camRef.current.fov - (a.fov + (b.fov - a.fov) * ease)) > 0.01) {
      camRef.current.fov = a.fov + (b.fov - a.fov) * ease
      camRef.current.updateProjectionMatrix()
    }
  })

  return (
    <DreiPerspectiveCamera
      ref={camRef}
      makeDefault
      fov={32}
      near={0.1}
      far={100}
      position={[0, 4.2, 6.0]}
    />
  )
}
```

### 0.7.5 Reduced-motion fallback (the SVG silhouette)

```tsx
function LandscapeFallback() {
  // Render the same terrain as an SVG path. The spectrum data is the same;
  // we just don't animate it. The ridge is a single stroke, the base is a
  // filled polygon. This is what `decideRuntime === 'off'` mounts.
  const elevation = generateSpectrum(20260509)
  const W = 1600
  const H = 400
  const step = W / elevation.length
  const basePoints: string[] = []
  const ridgePoints: string[] = []
  for (let i = 0; i < elevation.length; i++) {
    const x = i * step
    const y = H - elevation[i] * 200
    basePoints.push(`${x},${y}`)
    if (elevation[i] > 0.7) ridgePoints.push(`${x},${y}`)
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.fallback} aria-hidden>
      <polygon
        points={`0,${H} ${basePoints.join(' ')} ${W},${H}`}
        fill="var(--terrain-mid)"
      />
      <polyline
        points={ridgePoints.join(' ')}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="2"
      />
    </svg>
  )
}
```

The fallback is real, not an apology. It renders the same spectrum at the same amplitude. The user on a `saveData` connection gets the same composition, just static.

## 0.8 Performance budget

| Metric | Budget | Notes |
| --- | --- | --- |
| First frame | < 1.2s after navigation | R3F dynamic-imported, no synchronous boot |
| Steady-state frame time | < 8ms (120Hz) / < 16ms (60Hz) | One mesh, 200x200 segments, 40k vertices; computed once per frame |
| Draw calls | < 6 | terrain (1) + ridge highlight (0, shader-side) + 2 lights + 1 ambient + envmap |
| `frameloop` | `'always'` while in view, `'never'` when scrolled past | IntersectionObserver swap, same as pad sea |
| DPR clamp | `[1, 2]` | retina still sharp, no 3x waste |
| Shadow map size | `1024` | terrain only, single directional light |
| Bundle cost | `three` and `@react-three/fiber` are already on this page; the new component adds ~6KB gz | No new dependencies |
| Reduced motion | Camera holds, no per-frame work after first paint | R3F `frameloop` switches to `'demand'` |
| Mobile < 480px | Terrain drops to `64x64` segments via prop; 4k vertices instead of 40k | The detail is invisible at 200px tall |

The 200x200 grid is the worst case. A 1280x720 viewport at DPR 2 = 2560x1440 device pixels; 40k vertices is well under the budget for any laptop GPU shipped in the last five years. Phones throttle WebGL fast enough that the DPR clamp is the only safety needed.

## 0.9 Accessibility

| Concern | Treatment |
| --- | --- |
| `prefers-reduced-motion: reduce` | Camera holds at frame 0, no scroll-driven move, no ridge pulse, instant state transitions on overlays. The terrain is still rendered (the static spectrum is the page's identity), the user just does not see it move. |
| `prefers-reduced-transparency: reduce` | No transparency in the scene; the atmosphere gradient is the only alpha layer and it is solid on this branch. |
| Keyboard | All three link pads, the resume link, and the About handoff are reachable with Tab. The hero itself is not interactive; the canvas has `tabindex="-1"` and `aria-hidden="true"`. The `data-anim="hero-section"` element keeps a single `role="region"` with `aria-label="Hero"`. |
| Screen reader | A visually hidden `<h1>` carries the headline copy (`Aditya Himawan, Frontend Engineer`). The 3D scene is `aria-hidden`. The readouts expose their values through `aria-live="polite"` only when they cycle, which is suppressed under reduced motion. |
| Contrast | Headline in light mode `#1a1d1c` on `#e7e6dd` = 13.6:1. Headline in dark mode `#f1eee5` on `#141817` = 14.8:1. LCD readouts inherit the existing LCD token set, already AA. |
| Pointer cancel | Touch users do not get the idle parallax (gated behind `pointerType !== 'touch'` in the pointer-move handler, same as the existing hero). |
| No nausea | Scroll-driven 3D camera moves are the single highest-vestibular-load pattern. The `prefers-reduced-motion` opt-out is mandatory, not optional. No autoplaying animation on load: the terrain is at frame 0 the moment it renders. |

## 0.10 Acceptance criteria

1. The first paint shows the terrain at frame 0 (camera at `(0, 4.2, 6.0)`, looking at the front edge of the surface) within 1.2s of navigation.
2. The headline, three LCD readouts, three link pads and the bottom rail are visible above the fold on a 1280x720 viewport without scroll.
3. The headline does not exceed two lines at any supported viewport (max 13ch).
4. The ridge pulses at 120 BPM (one cycle per 500ms) when the page is idle, amplitude 0.05 of the peak elevation.
5. The camera dollies from `(0, 4.2, 6.0)` to `(0, 2.4, 0.8)` as scroll progress moves 0 → 1, with `power2.inOut` easing and 0.5s scrub smoothing.
6. The headshell `transform: translate(0, 8px); opacity: 0` at `progress = 0` and `transform: translate(0, 0); opacity: 1` by `progress = 0.05` (boot reveal).
7. The About handoff slides in from `yPercent: 100` to `yPercent: 0` between `progress = 0.70` and `progress = 0.95`.
8. The three LCD readouts cycle through `(years, teams, users)` every 4s when idle; cycle stops when the user hovers any of the three, resumes 1.5s after `pointerleave`.
9. `prefers-reduced-motion: reduce` returns the terrain to frame 0 with the headshell, readouts, and handoff in their final state. No scroll-driven change. The ridge does not pulse.
10. The WebGL probe falls back to the static SVG silhouette when WebGL is unavailable or `navigator.connection.saveData === true`. The SVG renders the same spectrum, the headline and readouts stay in place.
11. Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms. The R3F bundle is dynamic-imported so it does not block first paint.
12. The existing rack-hook's `useRackAnimations` does not throw on the new component: every `data-anim` attribute it queries is present, and the queries return real elements.

## 0.11 Risks and what to add when

| Risk | When to add the fix |
| --- | --- |
| The spectrum data is synthetic. A future music-page integration could drive it from the actual track. | When the `/music` page ships its player; one hook returns the live spectrum, `generateSpectrum` becomes the offline fallback. |
| A 200x200 grid can stutter on low-end Android. | Drop to 128x128 segments behind a `navigator.hardwareConcurrency < 4` check. One prop. |
| The headline blurs on exit. If the user scrolls back up, the blur eases back. | A single CSS `transition` on the `.heroHeadline` rule; not animation, just `transition: filter 0.3s var(--ease-out), opacity 0.3s var(--ease-out)`. |
| The terrain has no audio on mobile (autoplay policy). | Acceptable. The page's own `MusicPlayer` already requires a user gesture before it can play; the terrain is a visual, not an audio producer. |
| The signal-orange fader cap at the leftmost bin is the only accent. A user could mistake it for a button. | It is not a button. It has `pointer-events: none` and `aria-hidden="true"`. A tooltip on the readout below explains "Peak fader / signal" for sighted users. |

ponytail: skipped: envmap-driven `MeshPhysicalMaterial` (the brushed-aluminium look). Add when the design read leans more product-photography; current read leans editorial, so flatShading + standardMaterial is enough.

---

## 12. As built

Implementation shipped in `features/landing-page/components/frequency-landscape/`. Deviations from the spec above, and why.

| Spec said | Built | Why |
| --- | --- | --- |
| Terrain tokens `--terrain-base: #9d9a90` / `#1a1d1c`, per theme | One pair, theme-invariant: `#333a37` / `#454d49`, plus `--terrain-ridge` and `--terrain-fog` | The hero stage paints its own dark chassis (`#171917`) in *both* schemes, so a light-theme cream terrain would have sat under cream hero type at ~1.4:1 contrast. The hero is a dark room in either theme; the tokens are declared in the base `:root` and `.dark` inherits. |
| `metalness: 0.1`, `MeshStandardMaterial` | `metalness: 0.06`, `roughness: 0.68`, no envmap | There is no environment map in the scene, and a metal with nothing to reflect renders black. A rough dielectric under one strong key is what makes the facets read. |
| Ridge threshold `0.72` | `0.58`, with a wider `smoothstep` and a valley-darkening term in the same injection | At `0.72` only the single tallest band lit and the ridge read as a dot rather than a crest. The valley term is what turns a lit sheet into relief. |
| 200x200 grid, elevation rebuilt per frame | 200x200 desktop / 96x96 compact, elevation baked once, breath as a shader uniform | Rebuilding 40k vertex positions plus `computeVertexNormals()` per frame is the difference between 60fps and a slideshow, and the breath is a uniform offset the GPU does for free. |
| Camera dolly to `(0, 1.6, 1.5)` with `power2.inOut` via GSAP | Four keyframes, CPU-interpolated in `useFrame` from the progress ref | A GSAP tween per frame is the thing the performance notes warn against, and the shot had to *end* past the crest looking down the far slope so the handoff lands on a flat horizon. Frames also carry a per-band FOV offset, which a single tween could not. |
| Headline ink in `--card-foreground`, per theme | Unchanged from the existing rack type stack; the giant name was demoted to a watermark | The panel already carried the page's display type. Promoting the terrain did not require a second headline, and two competing display treatments would have been the actual regression. |
| Name stays a neon sign | Name is a `0.13`-opacity embossed watermark | The terrain is the subject now. At full brightness the neon name fought the ridge for the eye. |
| Wall vignette unchanged | Left-hand `0.62` stop removed, top/bottom gradient rebuilt | The old vignette was tuned for a bright pad sea and crushed the terrain to black. |
| Panel holds to `progress = 0.70` | Panel fades by `~0.22`, owned by `useRackAnimations` | That hook is existing tuned behaviour and the whole point of preserving it. The hero reads as two acts: content, then a camera flight over empty landscape into the About handoff. |

Added to `app/globals.css`: `--terrain-base`, `--terrain-mid`, `--terrain-ridge`, `--terrain-fog`.

Preserved so the existing hooks keep working: `.hero`, `.heroStage`, `.heroDeviceWall` (empty, its `::after` is still the scrim), `.heroEditorialPanel`, `.heroAtmosphere`, `.heroBottomRail`, `.heroAboutHandoff`, `.heroBootSequence`, `.heroBackdropName`, and the `data-anim="hero-panel" | "hero-rail" | "hero-handoff" | "hero-name"` attributes.

Verified: `tsc --noEmit` clean, `eslint` clean, desktop at 1440x900 (canvas boots, no console errors, no horizontal overflow, ridge green present in every hero frame). Not verified in-browser: mobile breakpoints and the `prefers-reduced-motion` / no-WebGL fallback paths.
