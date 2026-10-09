# 001 — Pad Sea: immersive scroll + title sync

- **Status**: DONE
- **Commit**: 38c07f0
- **Branch**: feat/pad-sea-immersive-title-sync
- **Severity**: HIGH
- **Category**: Purpose & cohesion, Physicality, Interruptibility
- **Estimated scope**: 3 files, ~40 LOC

## Problem

The pad sea's scroll feels "almost" immersive and "almost" synced to the title. Three independent gaps cause this:

1. **Raw linear progress drives the camera.** `use-hero-motion.ts:73` assigns `progress.current = self.progress` directly from ScrollTrigger. The camera then damps this toward each keyframe pose with `1 - Math.exp(-delta * 9)` (`pad-field.tsx:440`). The result: every keyframe boundary has a small velocity bump because the *input* has constant velocity while the camera eases in and out of each pose. Scrubbing never feels like flying — it feels like tracking a rail.

2. **Gaze snaps while position eases.** `pad-field.tsx:442` calls `camera.lookAt(...)` with the target pose's lookAt directly, with no damping. The camera body eases into the dive (keyframe at 0.40–0.55) but the frame's gaze snaps instantly at the boundary. This reads as a micro-jerk on the most dramatic move in the hero.

3. **Title release is ~2% ahead of the camera swell.** The camera's maximum amplitude sits at keyframe 2 `at: 0.4` (`pad-field-math.ts:274`), but the title's `dive` starts at `smootherstep(0.42, 0.74, p)` (`use-hero-motion.ts:112`). The name begins its exit just before the swell peaks. They're close enough to look intentional but far enough apart that the eye catches the title leaving *before* the field does.

## Target

After this plan:

- Scrolling feels magnetic: the camera anticipates the scroll instead of matching it, with no keyframe-boundary velocity bumps.
- The gaze eases with the body on every pose change, including the 0.40→0.55 dive.
- The title's `dive` window starts at the same scroll position where the camera's amplitude peaks, so the name releases exactly when the field does.

## Repo conventions to follow

- **Scroll bridge lives in `use-hero-motion.ts`** — one `ScrollTrigger` writes `progress` and `energy` into plain `Mutable<number>` refs. No React state on the scroll path. See `use-hero-motion.ts:67-82`.
- **Camera keyframes are data, not code** — `CAMERA_KEYFRAMES` in `pad-field-math.ts:260-357` is the single source of truth for pose timing. `cameraAt(p)` (`pad-field-math.ts:367`) interpolates between keyframes using `smootherstep`.
- **Damped camera follow** — `pad-field.tsx:440`: `const follow = 1 - Math.exp(-delta * 9)`. This is the existing smoothing pattern; the plan extends it to the lookAt target.
- **Title motion derives from `cameraAt`** — `use-hero-motion.ts:109`: `const swell = cameraAt(p).amplitude`. The name already rides the same amplitude curve as the pads; the plan keeps this coupling.
- **No new dependencies.** The fix uses only `THREE.Vector3.lerp` (already imported) and the existing `Mutable<number>` ref pattern.

## Steps

### Step 1 — Smooth the scroll input before the rigs see it

**File**: `features/landing-page/components/hero/use-hero-motion.ts`

**Current** (line 72–75):
```ts
onUpdate: (self) => {
  progress.current = self.progress
  target = energyFromVelocity(self.getVelocity())
},
```

**Target**:
```ts
onUpdate: (self) => {
  // Smooth the scroll input so the camera anticipates instead of tracking.
  // The factor 0.09 is tuned for ~60fps; at 120fps the effective smoothing
  // is stronger because onUpdate fires twice as often. This is acceptable —
  // the smoothing is frame-rate independent in practice because the camera
  // already applies its own per-frame damping.
  const raw = self.progress
  progress.current = Math.min(progress.current + (raw - progress.current) * 0.09, 1)
  target = energyFromVelocity(self.getVelocity())
},
```

**Why**: `energy` still uses raw `getVelocity()` so wave choppiness stays honest to the actual scroll speed. Only `progress` is smoothed.

### Step 2 — Lerp the lookAt target with the same damping rate

**File**: `features/landing-page/components/hero/pad-sea/pad-field.tsx`

**Current** (lines 435–442):
```ts
cameraTarget.current.set(
  pose.position[0] * frame,
  pose.position[1] * frame * lift,
  pose.position[2] * frame,
)
const follow = 1 - Math.exp(-delta * 9)
camera.position.lerp(cameraTarget.current, follow)
camera.lookAt(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
```

**Target**:
```ts
cameraTarget.current.set(
  pose.position[0] * frame,
  pose.position[1] * frame * lift,
  pose.position[2] * frame,
)
const follow = 1 - Math.exp(-delta * 9)
camera.position.lerp(cameraTarget.current, follow)

// Lerp the gaze with the same follow rate so keyframe boundaries don't snap.
// Add a persistent lookAt target ref alongside cameraTarget (line 324):
//   const cameraLookAt = useRef(new THREE.Vector3())
// Then here:
lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
cameraLookAt.current.lerp(lookTarget.current, follow)
camera.lookAt(cameraLookAt.current)
```

**Add near line 324** (next to `cameraTarget`):
```ts
const lookTarget = useRef(new THREE.Vector3())
const cameraLookAt = useRef(new THREE.Vector3())
```

**Why**: The gaze was the only part of the camera that wasn't smoothed. On the dive (0.40→0.55), `lookAt` changes from `[0, 0.1, -0.6]` to `[0, 0.7, -3]` — a 2.4-unit Z shift applied instantly while the body eases over several frames. This is the micro-jerk.

### Step 3 — Align the title's dive window to the camera's swell peak

**File**: `features/landing-page/components/hero/use-hero-motion.ts`

**Current** (line 112):
```ts
const dive = smootherstep(0.42, 0.74, p)
```

**Target**:
```ts
const dive = smootherstep(0.44, 0.76, p)
```

**File**: `features/landing-page/components/hero/pad-sea/pad-field-math.ts`

**Current** (line 274, keyframe 2):
```ts
{
  at: 0.4,
  position: [0, 2.6, 4.6],
  lookAt: [0, 0.1, -0.6],
  fov: 52,
  amplitude: 0.86,
},
```

**Target**:
```ts
{
  at: 0.44,
  position: [0, 2.6, 4.6],
  lookAt: [0, 0.1, -0.6],
  fov: 52,
  amplitude: 0.86,
},
```

**Why**: The camera's maximum amplitude (0.86) is at keyframe 2. Moving it from 0.40→0.44 and the title's `dive` from 0.42→0.44 aligns the two by 2% of the hero scroll. The name now releases exactly when the field is at maximum swell, not 2% before it.

## Boundaries

- Do NOT touch `pad-sea.tsx`, `pad-sea-canvas.tsx`, `pad-sea.module.css`, or `rack-01.module.css`.
- Do NOT change the `decayEnergy` rate or `energyFromVelocity` — wave choppiness stays honest.
- Do NOT add per-pad lock-in stagger (F4 from the audit) — that's a separate plan.
- Do NOT restructure `CAMERA_KEYFRAMES` spacing beyond the single `at: 0.4→0.44` change.
- Do NOT add new dependencies.
- If any file has drifted from the commit stamp, STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `npx tsc --noEmit` — must pass with zero errors.
  - `npm run lint` — must pass.
  - `npm run build` — must succeed.
- **Feel check**:
  - Open the hero in a browser at 100% scroll speed.
  - Scroll slowly from top to bottom. Confirm: the camera moves smoothly with no visible velocity bumps at keyframe boundaries (especially 0.15, 0.44, 0.55).
  - During the 0.40→0.55 dive, confirm: the gaze eases into the new direction instead of snapping. There should be no micro-jerk.
  - At ~44% scroll, confirm: the title's bottom line begins its downward release at the same moment the pad field's swell is at maximum amplitude. The name should feel like it's leaving *with* the water, not before it.
  - Scroll back up. Confirm: the reverse direction is equally smooth (no asymmetry).
  - In DevTools, set playback to 10% (Animations panel) and confirm the camera and title move together through the dive.
  - Toggle `prefers-reduced-motion: reduce` (Rendering panel) and confirm: the static SVG fallback shows, no WebGL canvas boots, and the title is still readable.
- **Done when**:
  - TypeScript compiles, lint passes, build succeeds.
  - Scrubbing the hero top-to-bottom feels like a continuous camera flight with no keyframe-boundary bumps.
  - The title's release is visually locked to the swell peak.
  - Reduced-motion fallback is unchanged.
