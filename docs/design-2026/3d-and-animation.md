# 3D & Animation — RETRO CONSOLE 2026

> Motion language, WebGL/R3F patterns, shader notes, sound design.
> Companion: `design.md` (visual identity), `tokens.md` (values).

---

## 0. Motion Philosophy

Motion harus terasa **mekanis & terhitung**, bukan smooth & organic. Semuanya kayak hardware lama:
- Transitions berbentuk **stepped** (frame-by-frame), bukan kurva halus
- Easing default = `steps(8, end)` atau `steps(4, end)` untuk vibe sprite animation
- 3D rendering = low-poly + vertex jitter + flat shading
- CRT scanline overlay konstan (toggleable)
- Boot sequence di first load (≤ 800ms)

Pikirin frame rate 30fps look intentional — feel ≠ janky, tapi feel = *retro game*.

---

## 1. Motion Tokens

### 1.1 Easing Library

```ts
export const EASE = {
  // STEPPED — sprite/pixel animation feel
  step8:    'steps(8, end)',
  step4:    'steps(4, end)',
  step12:   'steps(12, end)',

  // PIXEL CUBIC — snappy, slight anticipation
  pixel:    'cubic-bezier(0.36, 0, 0.66, -0.56)',
  pixelOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // overshoot bounce

  // STANDARD — when stepped doesn't fit
  decel:    'cubic-bezier(0, 0, 0.2, 1)',
  accel:    'cubic-bezier(0.4, 0, 1, 1)',
  linear:   'linear',
};
```

### 1.2 Duration Scale

```
instant   60ms   tap feedback, LED blink frame
fast     120ms   button press, hover state
base     200ms   card lift, panel reveal
slow     400ms   modal open, stage transition
stage    800ms   section change "loading" full sequence
boot    1600ms   first-load boot animation (intentional, sequenced)
```

### 1.3 Forbidden Animations

- ❌ Animating `width`, `height`, `top`, `left`, `padding`, `margin` (forces reflow)
- ❌ `box-shadow` animation with `blur` non-zero (expensive composite)
- ❌ Infinite-loop framer-motion components for backgrounds — pakai CSS keyframes
- ❌ Smooth bezier `(0.4, 0, 0.2, 1)` di section transitions — break the retro feel
- ❌ Parallax scroll yang ngubah `transform: translateY()` per scroll px — gunakan IntersectionObserver

---

## 2. 3D Scenes (React Three Fiber)

Stack: `@react-three/fiber` + `@react-three/drei`. **Gates**:
- Lazy-load via `next/dynamic` dengan `ssr: false` agar tidak masuk first-load bundle
- Static poster image fallback selama loading + buat `prefers-reduced-motion`
- GPUTier check di mount; kalau tier 0 → fallback static
- Resolusi ↓ 50% di mobile (`<dpr={[1, 1.5]}>` instead of `[1, 2]`)

### 2.1 Hero Mascot (Title Screen)

**Concept**: Low-poly bust/character rotating slowly, idle bob, vertex jitter.

```
File:        public/3d/mascot.glb (TBD — pending mascot decision)
Polygon:     ~300-500 tris
Material:    MeshFlatMaterial atau ShaderMaterial custom
Color:       #F5F5F2 base + RED accent (jacket / power button on chest)
Lighting:    Single directional light from camera-forward, intensity 1
Rotation:    Y-axis 0.15 rad/sec (slow & steady)
Idle:        sin(time * 1.2) * 0.05 unit Y bob
Jitter:      ±0.5 px random per frame on x,y projection (PS1-style wobble)
```

Implementation skeleton:

```tsx
// src/features/landing-page/components/hero/mascot-3d.tsx
'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Mascot() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.15;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
  });

  return (
    <mesh ref={ref}>
      {/* placeholder geometry until .glb ready */}
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#F5F5F2"
        flatShading
        emissive="#E10600"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

export function Mascot3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 4], fov: 35 }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <Mascot />
    </Canvas>
  );
}
```

### 2.2 Character Portrait (About Section)

**Concept**: Same mascot, framed inside a "character select" portrait box.

- Static rotation Y dimulai dari -0.3 rad → +0.3 rad sweep, repeat
- Camera lebih dekat (fov 25)
- Background canvas: solid `#1A1A1C` + 8×8 pixel grid overlay via shader

### 2.3 Project Cartridges

**Concept**: Setiap project = 3D game cartridge. Body grayscale, label sticker per project.

```
File:        public/3d/cartridge.glb (NES-shape silhouette, ~150 tris)
Variants:    color body via material color override per project
Label:       PlaneGeometry 0.8 × 0.5 with project image as DataTexture (256×256, no mipmap)
Animation:   idle slow sway sin(t) * 0.04 rad on Z, +0.5 unit Y on hover
Click:       launch animation — translate Z away from camera, then snap into "console slot"
```

Per-card canvas (bisa sangat ringan, multiple Canvas instances acceptable):

```tsx
function CartridgeCanvas({ color, label }: { color: string; label: string }) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 0.3, 2.4], fov: 30 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[1, 2, 3]} intensity={0.9} />
      <Cartridge color={color} label={label} />
    </Canvas>
  );
}
```

**Performance gate**: max 6 cartridge canvas concurrent. Untuk grid > 6, fallback ke 2D SVG cartridge silhouette.

### 2.4 Save Crystal (Contact Section)

**Concept**: Octahedron pulsing + slow rotation, RED emissive material.

```tsx
function SaveCrystal() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.4;
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.05;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#E10600"
        emissive="#E10600"
        emissiveIntensity={1.4}
        flatShading
      />
    </mesh>
  );
}
```

Glow tambahan via post-processing `<EffectComposer><Bloom intensity={0.6} /></EffectComposer>` — opsional, mahal di mobile, default OFF.

---

## 3. Shaders & WebGL Effects

### 3.1 Vertex Jitter (PS1-style wobble)

Tambah ke material custom untuk efek wobble khas PS1:

```glsl
// Vertex shader
uniform float uTime;
uniform float uJitterAmount;  // 0.0 - 1.0

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 viewPos  = viewMatrix * worldPos;
  vec4 clipPos  = projectionMatrix * viewPos;

  // Snap to integer pixel grid (PS1 fixed-point)
  float grid = 160.0;  // virtual resolution
  clipPos.xy = floor(clipPos.xy * grid / clipPos.w) * clipPos.w / grid;

  gl_Position = clipPos;
}
```

R3F integration:

```tsx
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const PixelMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#F5F5F2') },
  /* vertex */ vertexShader,
  /* fragment */ fragmentShader,
);
extend({ PixelMaterial });

// usage
<mesh>
  <icosahedronGeometry args={[1, 0]} />
  <pixelMaterial uColor="#F5F5F2" uTime={state.clock.elapsedTime} />
</mesh>
```

### 3.2 Affine Texture Mapping (no perspective correction)

PS1 didn't have perspective correct texturing — tekstur "swimming" saat poligon miring. Untuk approximate:

```glsl
// vertex
varying vec2 vUv;
varying float vW;
void main() {
  vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vUv = uv * clipPos.w;   // multiply by w
  vW = clipPos.w;
  gl_Position = clipPos;
}

// fragment
varying vec2 vUv;
varying float vW;
uniform sampler2D uTex;
void main() {
  vec2 affineUv = vUv / vW;
  gl_FragColor = texture2D(uTex, affineUv);
}
```

Optional. Pakai cuma di cartridge labels untuk authentic PS1 vibe.

### 3.3 CRT Post-Processing Shader

Full-screen shader untuk efek CRT (scanlines + curvature + chromatic aberration). Implement via `<EffectComposer>` custom pass:

```glsl
// fragment
uniform sampler2D tDiffuse;
uniform float uTime;
varying vec2 vUv;

vec2 curve(vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv *= 1.05;
  uv.x *= 1.0 + pow(abs(uv.y) / 6.0, 2.0);
  uv.y *= 1.0 + pow(abs(uv.x) / 5.0, 2.0);
  return uv * 0.5 + 0.5;
}

void main() {
  vec2 uv = curve(vUv);

  // out of bounds = black
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // chromatic aberration
  vec2 offset = vec2(0.0015, 0.0);
  float r = texture2D(tDiffuse, uv + offset).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - offset).b;
  vec3 color = vec3(r, g, b);

  // scanlines
  float scan = sin(uv.y * 800.0) * 0.04;
  color -= scan;

  // vignette
  float vignette = 1.0 - length(vUv - 0.5) * 0.6;
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
```

**Performance note**: Full-screen post FX expensive di mobile. Default ON desktop, OFF mobile, manual toggle in header (`[CRT: ON / OFF]`).

**Alternatif murah**: Pure CSS scanlines saja (sudah di `design.md` §7.3). Itu dulu yang default, post-processing optional v2.

---

## 4. Section Transitions

### 4.1 Pattern A — "LOADING" Bar

Pengganti `<SectionDivider />`. Triggered saat user scroll memasuki section baru.

```jsx
function LoadingBar() {
  return (
    <div className="container py-12">
      <div className="font-mono text-xs text-white-bone uppercase tracking-widest mb-2">
        LOADING NEXT STAGE...
      </div>
      <div className="h-2 bg-gray-deep border border-gray-2 overflow-hidden">
        <motion.div
          className="h-full bg-red"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.8, ease: 'steps(8, end)' as any }}
        />
      </div>
    </div>
  );
}
```

### 4.2 Pattern B — Glitch Cut

Untuk hero → about transition. 200ms hard cut: 3 frame static noise → next section.

```css
@keyframes glitch-cut {
  0%, 100% { opacity: 1; transform: translate(0, 0); }
  20%      { opacity: 0.4; transform: translate(-2px, 0); }
  40%      { opacity: 0.2; transform: translate(2px, 1px); }
  60%      { opacity: 0.1; transform: translate(-1px, -1px); }
  80%      { opacity: 0.7; transform: translate(0, 0); }
}
```

### 4.3 Pattern C — Door Wipe

Untuk experience → projects transition. RED door slides from top-bottom meets in middle, then opens. CSS-only, ~600ms.

### 4.4 Mapping

```
Hero        ──[loading]──  About
About       ──[glitch]──   Skills
Skills      ──[loading]──  Experience
Experience  ──[door]────   Projects
Projects    ──[loading]──  Contact
Contact     ──[glitch]──   Footer
```

Implementasi: `<StageDivider variant="loading|glitch|door" />`. CSS-only, no motion library dependency untuk divider.

---

## 5. Sound Design (Optional, Default Mute)

Audio cue mendukung "console feel" tapi user-facing default = MUTE. Toggle button di header `[ SFX: ON / OFF ]`.

### 5.1 Sound Library

| File | Trigger | Duration |
|------|---------|----------|
| `blip.wav` | Hover on button/card | 80ms |
| `click.wav` | Click action | 120ms |
| `confirm.wav` | Successful action (copy email) | 200ms |
| `coin.wav` | Insert coin / first interaction | 300ms |
| `boot.wav` | Page first load complete | 1200ms |
| `select.wav` | Stage select tile selected | 150ms |

Source rekomendasi: `freesound.org` (CC0), `8bitsfx.com`, atau generate custom via `jsfxr` (https://sfxr.me/).

### 5.2 Implementation

Pakai vanilla `Audio` API — tidak perlu Tone.js (Tone.js kemarin di-buang dari spec).

```tsx
// src/lib/sfx.ts
const cache = new Map<string, HTMLAudioElement>();
let enabled = false;

export function enableSfx() { enabled = true; }
export function disableSfx() { enabled = false; }
export function isEnabled() { return enabled; }

export function play(name: 'blip' | 'click' | 'confirm' | 'select') {
  if (!enabled) return;
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(`/sfx/${name}.wav`);
    audio.volume = 0.4;
    cache.set(name, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => { /* autoplay blocked */ });
}
```

---

## 6. 3D Asset Pipeline

### 6.1 Modeling Tools

- **Blender** (free) — primary modeling
- Export: glTF 2.0 binary (`.glb`)
- Compress: gltfpack atau Draco (target ≤ 50KB per model)

### 6.2 Modeling Rules (PS1-era authentic)

- **Polygon budget**: 200–500 tris per model
- **No subdivision surfaces** — keep angular
- **Flat shading** — no smooth normals
- **Single texture per model**, max 256×256, palette indexed if possible
- **No normal maps**
- **Vertex colors OK** (cheap)
- **Quads triangulated** before export

### 6.3 Mascot Decision (TBD pending Adit input)

**Option 1 — Abstract Geometry**
- Icosahedron / floating crystal
- Easiest to ship, no character commitment
- ~50 tris, ~5KB

**Option 2 — Game Boy / NES Console Character**
- A walking console (legs from a Game Boy body)
- Cute, memorable, brand-friendly
- ~300 tris, ~15KB
- Blender procedural generation possible

**Option 3 — Pilot / Astronaut Avatar**
- Adit-as-character, low-poly bust
- Most personal but most effort
- ~500 tris, ~30KB
- Needs reference photo + manual modeling

**Option 4 — Cartridge as Mascot**
- The cartridge IS the mascot — central object floating in hero
- Minimal modeling, brand consistency dengan project section
- ~150 tris, ~8KB

→ Gw rekomen **Option 4** untuk MVP (cheapest + cohesive). Upgrade ke Option 2 atau 3 di v2.

### 6.4 Testing Pipeline

1. Model di Blender → export `.glb`
2. Compress: `npx gltfpack -i model.glb -o model.opt.glb -cc -tc`
3. Validate: https://github.khronos.org/glTF-Validator/
4. Preview: https://gltf-viewer.donmccurdy.com/
5. Drop ke `public/3d/`
6. Load via `useGLTF('/3d/model.opt.glb')` (dari `@react-three/drei`)

---

## 7. Performance Budget

| Asset | Budget | Notes |
|-------|--------|-------|
| Hero Canvas first paint | ≤ 250ms after JS hydrate | poster image as fallback during load |
| Hero Canvas runtime | < 8ms / frame mobile | 30fps acceptable, 60fps target desktop |
| 3D model (each) | ≤ 50 KB gzipped | Draco compressed |
| Total 3D bundle | ≤ 200 KB | three + drei + r3f core ≈ 130KB, models ≈ 70KB |
| Shader code | ≤ 5 KB inline | per-shader |
| Sound effects total | ≤ 60 KB | 6 files × ~10KB |

**Lazy-load gates**:

```tsx
// hero
const Mascot3D = dynamic(
  () => import('./mascot-3d').then(m => m.Mascot3D),
  { ssr: false, loading: () => <MascotPoster /> }
);

// projects (per card)
const CartridgeCanvas = dynamic(
  () => import('./cartridge-canvas').then(m => m.CartridgeCanvas),
  { ssr: false, loading: () => <CartridgePoster /> }
);
```

`MascotPoster` = static `<Image>` 800×800 webp, exported once dari R3F snapshot.

---

## 8. Animation Inventory (cross-reference to design.md)

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Power LED dot | `opacity 1 → 0.55` infinite | 1.6s | ease-in-out |
| "PRESS START" text | `opacity 1 → 0` infinite | 1s | step(2) |
| 3D mascot rotation | continuous `Y rotation` | 0.15 rad/s | linear |
| 3D mascot bob | sine `Y position` | 1.2s | sin |
| Hero entrance | `opacity 0 → 1, y +12 → 0` | 400ms | step8 |
| Section reveal | `opacity 0 → 1, y +24 → 0` | 500ms | step8 |
| Stage tile hover | `box-shadow grow` | 120ms | linear |
| Cartridge eject | `Y +0.5 unit` | 200ms | pixelOut (overshoot) |
| Modal open | scale `0.9 → 1`, opacity `0 → 1` | 200ms | step4 |
| Loading bar fill | `width 0 → 100%` | 800ms | step8 |
| Glitch cut | keyframe RGB shake | 200ms | linear |
| Save crystal pulse | sine `scale 1 → 1.05` | 1.8s | sin |
| Score counter tick | mono digit increment | 60ms | step1 |
| Button press | `translate +2px,+2px` | 60ms | linear |
| Coin insert | bounce in `scale 0 → 1.2 → 1` | 300ms | pixelOut |
| Boot sequence (first load) | logo flash + scanline sweep | 1600ms | sequenced |

---

## 9. Boot Sequence (First Load)

Optional opening sequence pas first visit (≤ 1.6s, dismissible):

```
0.0s  ─ blank black screen
0.1s  ─ power LED red dot pop in (top-right)
0.3s  ─ "FIRSTPARTY" pixel logo fade in (white, center)
0.6s  ─ scanline sweep top→bottom (200ms)
0.8s  ─ "PRESS ANY KEY" blink x2 (auto-dismiss after)
1.6s  ─ transition to hero
```

Cookie / localStorage flag `_has_booted=true` — skip on subsequent visits.

```tsx
const [booted, setBooted] = useState(() => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('_has_booted') === 'true';
});

useEffect(() => {
  if (booted) return;
  const t = setTimeout(() => {
    setBooted(true);
    localStorage.setItem('_has_booted', 'true');
  }, 1600);
  return () => clearTimeout(t);
}, [booted]);

return booted ? <HomePage /> : <BootScreen />;
```

---

## 10. Reduced Motion Plan

Saat `prefers-reduced-motion: reduce`:

- 3D Canvas → static poster image
- LED dot → solid (no pulse)
- "PRESS START" → solid (no blink)
- Vertex jitter shader → disabled (use plain Standard material)
- CRT scanline → disabled
- Section transitions → instant fade (0.01ms duration via global override)
- Loading bar → fill instantly (no step animation)
- Boot sequence → skipped

Detection:

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Use as conditional in motion props:

```tsx
<motion.div
  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0, 1] }}
  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
/>
```

---

## 11. Open Questions for 3D & Animation

1. **Mascot choice** — Option 1 / 2 / 3 / 4 (see §6.3)? Gw rekomen Option 4 (cartridge as mascot).
2. **CRT scanline default** — ON atau OFF di first paint?
3. **Boot sequence** — implement atau skip (faster TTI)?
4. **Sound effects** — implement (default mute, opt-in) atau skip total?
5. **Custom shaders (vertex jitter, affine textures)** — implement v1 atau defer ke v2?
6. **Post-processing CRT shader** — implement atau cukup CSS scanlines?

Default rekomendasi gw kalo lu mau cepet ship MVP:
- Mascot = Option 4 (cartridge)
- CRT scanlines = CSS only (skip post-FX shader)
- Boot sequence = skip MVP
- Sound = skip MVP
- Vertex jitter = skip MVP, vanilla flat shading dulu
- Post-FX = skip MVP

Advanced version (v2) bisa enable semua di atas.

---

> Visual + 3D + Animation = ready. Next: konfirmasi open questions di atas, lalu rewrite `requirements.md`, `plan.md`, `tasks.md`, `story-map.md`.
