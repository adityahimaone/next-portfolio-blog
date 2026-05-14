# Requirements — RETRO CONSOLE 2026

> Goals, constraints, dan acceptance criteria untuk portfolio redesign 2026 v2.
> Companion: `design.md` (visual), `tokens.md` (values), `3d-and-animation.md` (motion).

---

## 1. Vision Statement

Portfolio Adit harus jadi **retro console game** yang dimainin sebelum jadi dibaca. Audience masuk → boot screen → title screen → stage select → game library → save point → stage clear. Visual: 4 warna chrome (RED / WHITE / GRAY / BLACK), pixel typography, low-poly 3D, CRT scanlines, vertex jitter PS1-style, sound effect optional.

Theme replacement penuh — TIDAK ADA carry-over dari "Studio Session" lama. Mixer, vinyl, launchpad, DAW timeline, music ticker → SEMUA di-archive.

**Tagline 2026**: `> PRESS START · Frontend Engineer at Fast 8 · Now playing: bisadaya v2`

---

## 2. Primary Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G1 | Single visual language: RED/WHITE/GRAY/BLACK only | Color audit script (lihat tasks.md) — 0 outliers |
| G2 | Lighthouse Performance 85+ mobile, 95+ desktop | PageSpeed Insights production URL |
| G3 | LCP ≤ 2.5s mobile, ≤ 1.5s desktop | Lab + RUM 7 days |
| G4 | CLS ≤ 0.05 site-wide | All `dynamic()` imports punya skeleton |
| G5 | INP ≤ 200ms | Real user metrics post-launch |
| G6 | Theme cohesion: 7 sections inherit same retro game world | Manual review checklist (story-map.md §3) |
| G7 | Mobile-first usable | All interactive ≥ 44×44px touch target |
| G8 | Accessible | WCAG 2.1 AA, prefers-reduced-motion respected |
| G9 | Memorable hero | 3D mascot (cartridge) renders within 250ms after hydrate |
| G10 | Bundle stays sane | First-load JS ≤ 200KB gzipped (raised from 180KB to fit R3F core) |

---

## 3. Non-Goals

Eksplisit di luar scope:

- ❌ Internationalization (Bahasa Indonesia version)
- ❌ CMS migration (content tetap codified)
- ❌ Backend changes (Spotify API, GitHub API integration tetap existing)
- ❌ Blog post redesign (out of scope, focus landing only)
- ❌ DAW/music metaphor revival
- ❌ Light mode polish (light mode supported tapi tidak ada audit)
- ❌ Multi-page game flow (linear scroll, bukan SPA navigation between sections)

---

## 4. Constraints

### 4.1 Hard Constraints (cannot violate)

- **C1** — Tech stack frozen: Next.js 15.1, React 19, Tailwind v4, Motion 12. Tambahan: `@react-three/fiber`, `@react-three/drei`, `three`. NO new framework di luar ini.
- **C2** — No external CMS. Content tetap di `features/landing-page/constants/index.ts`.
- **C3** — VPS deploy compatibility. Output bisa deploy ke VPS via PM2 + Nginx (current infra).
- **C4** — Bundle budget: first-load JS ≤ 200KB gzipped, CSS ≤ 30KB gzipped.
- **C5** — Color palette frozen: 4 chrome (RED #E10600 / WHITE #F5F5F2 / GRAY #2A2A2D / BLACK #0A0A0A) + 4 derivatives. Apa pun di luar = REJECT.
- **C6** — Theme nama "RETRO CONSOLE" tidak boleh diganti mid-flight (commit kalau memang udah pivot, jangan goyah).

### 4.2 Soft Constraints (preferred, negotiable)

- **C7** — Motion library `motion` (formerly framer-motion) tetap dipakai untuk in-app interactions; CSS keyframes untuk infinite/background animations.
- **C8** — Tone.js DROPPED entirely (tidak ada launchpad lagi). SFX pakai vanilla `Audio` API.
- **C9** — Existing data structure `EXPERIENCES`, `PROJECTS_SHOWCASE` boleh di-extend (tambah field), tapi struktur dasarnya tetap.
- **C10** — Custom shaders (vertex jitter, CRT post-FX) implement v1 — Adit chose Full Retro mode (B).

---

## 5. Functional Requirements per Section

### 5.1 Header / HUD Bar

- **R-N1**: Sticky di top, 56px desktop / 48px mobile, solid `var(--gray-deep)` background, 2px white bottom border
- **R-N2**: 4 zones: Brand / Stage indicator / Nav links / Controls
- **R-N3**: Stage indicator update via IntersectionObserver — sync ke section yang sedang visible (threshold 0.4)
- **R-N4**: Controls cluster: CRT toggle / SFX toggle / Theme toggle / Replay button — state persisted di localStorage
- **R-N5**: Mobile: hamburger D-pad icon → fullscreen "PAUSE MENU" overlay
- **R-N6**: Pause Menu keyboard: ↑/↓/Enter/Esc support
- **R-N7**: Drop-in animation pas boot sequence selesai
- **R-N8**: Reduced motion: skip drop-in, LED solid, no pulse

### 5.2 Hero — "TITLE SCREEN" (STAGE-01)

- **R-H1**: LCP element (`<h1>`) paint dalam < 2s mobile
- **R-H2**: Low-poly 3D cartridge floating + idle bob + slow Y rotation, vertex jitter ON
- **R-H3**: "PRESS START" CTA blink 1s (steps 2), click scrolls ke `#about`
- **R-H4**: Boot sequence di first visit (1.6s), skip via localStorage flag `_has_booted`
- **R-H5**: Power LED red dot di top HUD pulsing 1.6s
- **R-H6**: Top-bottom HUD overlay shows session info
- **R-H7**: Background CSS pixel grid + radial vignette (subtle)
- **R-H8**: Reduced motion: 3D static, no blink, no boot

### 5.3 About — "CHARACTER SELECT" (STAGE-02)

- **R-A1**: Split layout: 3D portrait (left) + stats panel (right)
- **R-A2**: 3D portrait: cartridge (lebih dekat camera, fov 25), slow Y sweep
- **R-A3**: Stats panel: ASCII block stat bars (`StatBar` component), 5-7 stats
- **R-A4**: NES textbox dengan bio paragraph (2 sentences max)
- **R-A5**: "CURRENTLY EQUIPPED" footer line
- **R-A6**: Total file `about-section.tsx` ≤ 250 LOC

### 5.4 Skills — "INVENTORY" (STAGE-03)

- **R-S1**: 6×N grid square cells (80×80px desktop, 64×64 mobile)
- **R-S2**: Hover: cell zoom 1.05 + RED outline glow + SFX blip
- **R-S3**: Click: cell selected, detail panel below shows: nama / years / projects / mastery stars
- **R-S4**: Skill data: refactor `MIXER_DATA` → `INVENTORY_ITEMS` array
- **R-S5**: Keyboard: arrow keys navigate grid (Mega Man style)
- **R-S6**: Mobile: 4 col grid

### 5.5 Experience — "STAGE SELECT" (STAGE-04)

- **R-E1**: 4 stage tile grid (240×240 desktop, scroll horizontal mobile)
- **R-E2**: Current job tile: RED border + corner brackets glow
- **R-E3**: Detail panel below: NES textbox dengan role bullets
- **R-E4**: Field `duration` per experience ("3y 7m") di constants
- **R-E5**: Field `link` per experience untuk artifact
- **R-E6**: Default selected on load: current job (Fast 8)
- **R-E7**: Keyboard select: arrow keys

### 5.6 Projects — "GAME LIBRARY" (STAGE-05)

- **R-P1**: 3 col desktop, 2 col tablet, 1 col mobile
- **R-P2**: Top 3 projects = 3D cartridge canvas (R3F), bottom = 2D SVG silhouette (perf)
- **R-P3**: Cartridge per project: warna body grayscale + sticker color (mirror palette restriction — RED accent only)
- **R-P4**: Filter chip top: All / Web3 / Corporate / Productivity / DeFi / Bio / Edu
- **R-P5**: Hover: cartridge eject (Y +0.5 unit), card border RED
- **R-P6**: Click: full-screen modal — boot screen reveals project detail
- **R-P7**: Field `metric` per project ("10K visits", "Used by 3 enterprises")
- **R-P8**: Field `tech` array per project (replace hardcoded modal stack)
- **R-P9**: Modal CTA: live demo + GitHub source (kalo ada)
- **R-P10**: Counter di header "06 CARTRIDGES"

### 5.7 Contact — "SAVE POINT" (STAGE-06)

- **R-C1**: 3D save crystal (octahedron RED emissive), pulsing scale
- **R-C2**: 4 "DAT" lines (email/social/linkedin/cv)
- **R-C3**: 4 chunky button: A=copy email, B=open LinkedIn, X=open GitHub, Y=download CV
- **R-C4**: Click action: SFX confirm (kalo SFX ON), tooltip "COPIED!" (jangan toast — pixel textbox)
- **R-C5**: Keyboard: A=A key, B=S, X=D, Y=F (gamepad-style)
- **R-C6**: NO Tone.js (deleted)
- **R-C7**: NO functional pad / launchpad (deleted)

### 5.8 Footer — "STAGE CLEAR"

- **R-F1**: "STAGE CLEAR" judul, blink 1s
- **R-F2**: Stats: PLAYER / TIME (live session timer) / SCROLL (snapshot at view) / SECTIONS (6/6) / RANK (S)
- **R-F3**: Last commit badge dari GitHub API (cache 1h via Next.js ISR)
- **R-F4**: 4 social link sebagai chunky button rectangle
- **R-F5**: Copyright line: `© 2026 · ADIT · MADE IN JAKARTA · INSERT COIN ↻`

### 5.9 Global / Cross-cutting

- **R-G1**: `prefers-reduced-motion` global override di `globals.css`
- **R-G2**: CRT scanline overlay default ON (toggleable di header)
- **R-G3**: Vertex jitter PS1 shader implemented untuk semua 3D scene
- **R-G4**: CRT post-processing shader (curvature + chromatic aberration) — toggle, default ON desktop, OFF mobile
- **R-G5**: Boot sequence implemented (1.6s, skippable)
- **R-G6**: SFX library (6 files) loaded on demand, default mute
- **R-G7**: Custom cursor optional (skipped MVP, defer to v2 polish)
- **R-G8**: Light mode functional (basic toggle), tidak ada section-by-section audit (best-effort)
- **R-G9**: All `dynamic()` imports punya `loading: () => <SectionSkeleton />`
- **R-G10**: Section dividers `<StageDivider variant="loading|glitch|door" />`

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-1**: First-load JS ≤ 200 KiB gzipped (R3F adds ~80KB, three core ~50KB)
- **NFR-2**: First-load CSS ≤ 30 KiB gzipped
- **NFR-3**: Lighthouse Performance ≥ 85 mobile, ≥ 95 desktop (production URL, simulated 4G)
- **NFR-4**: LCP ≤ 2.5s mobile (4G throttled), ≤ 1.5s desktop
- **NFR-5**: CLS ≤ 0.05 site-wide
- **NFR-6**: TBT ≤ 200ms mobile
- **NFR-7**: INP ≤ 200ms (per RUM)
- **NFR-8**: 3D Canvas: hero ≤ 250ms after hydrate, runtime < 8ms/frame mobile (30fps OK)
- **NFR-9**: Total 3D bundle ≤ 200KB (R3F + drei + models)

### 6.2 Accessibility

- **NFR-10**: Color contrast WCAG 2.1 AA — tested per token combo
- **NFR-11**: Pixel font (VT323) min 16px (jangan body text)
- **NFR-12**: All `aria-label` accurate
- **NFR-13**: Keyboard nav: tab through, arrow keys di grid (skill, experience tiles), Esc tutup modal
- **NFR-14**: 3D Canvas: `aria-hidden="true"`, parent has SR fallback text
- **NFR-15**: `prefers-reduced-motion` respected globally — see 3d-and-animation.md §10
- **NFR-16**: Custom inputs (toggle controls) punya `aria-pressed`
- **NFR-17**: Focus visible: 2px RED outline, no `outline: none`

### 6.3 Browser Support

Per `package.json` browserslist:
- Chrome ≥ 109
- Edge ≥ 109
- Firefox ≥ 110
- Safari ≥ 16
- Not dead

WebGL2 required untuk 3D + shader. Fallback: static poster image kalau no WebGL.

### 6.4 Device Testing

- **NFR-18**: iPhone SE 2 (375×667) — 3D fallback poster mode
- **NFR-19**: Pixel 6a (mid-Android) — 3D scaled DPR 1.5
- **NFR-20**: MacBook Air 13" (1280×800) — full 3D + post-FX
- **NFR-21**: Desktop 1920×1080, 2560×1440 — full chrome on

---

## 7. Acceptance Criteria

Redesign dianggap "done" kalo semua di bawah lulus:

### 7.1 Visual Gate

- [ ] Color audit: hanya 4 chrome + 4 derivatives, 0 outliers (script: `scripts/audit-colors.ts`)
- [ ] Typography: VT323 pakai display saja, tidak ada body text < 14px
- [ ] Section dividers `<StageDivider />` semua diganti, tidak ada `<SectionDivider />` lama
- [ ] Header / HUD bar match `design.md` §4.5
- [ ] Setiap section punya `data-stage-num` + `data-stage-name`
- [ ] Pause Menu (mobile) keyboard accessible

### 7.2 Performance Gate

- [ ] Lighthouse mobile Performance ≥ 85 (production URL)
- [ ] Lighthouse desktop Performance ≥ 95
- [ ] Bundle analyzer: no chunk > 80 KiB gzipped
- [ ] R3F lazy-loaded (not in first-load bundle)
- [ ] CRT scanline overlay tidak nge-blokir scroll perf (test 60fps scroll)

### 7.3 Story Gate

- [ ] Setiap section punya stage label STAGE-NN
- [ ] Hero subtitle mention current company specific
- [ ] Experience badge "★ CURRENT" displayed on Fast 8
- [ ] Projects modal show project-specific tech (not hardcoded)
- [ ] Footer "STAGE CLEAR" + live timer working
- [ ] No DAW/mixer/vinyl/launchpad copy left in repo

### 7.4 Functionality Gate

- [ ] Boot sequence renders + skippable + remembers via localStorage
- [ ] CRT toggle working, persists state
- [ ] SFX toggle working, default mute, plays blip on hover when ON
- [ ] Theme toggle working (dark default, light alt)
- [ ] 3D mascot (cartridge hero) renders + idle bob + jitter
- [ ] Project cartridge canvas: top 3 = 3D, bottom = SVG fallback
- [ ] Save crystal pulses + clickable
- [ ] Stage indicator updates per scroll position
- [ ] Pause Menu opens on hamburger click, closes on Esc/×/tap-outside
- [ ] Filter chips di Projects working
- [ ] Last commit badge pulls from GitHub API

### 7.5 Accessibility Gate

- [ ] Keyboard nav: tab + arrow keys di grids
- [ ] Reduced motion: 3D static, no blink, no boot, no pulse
- [ ] Focus visible: 2px RED outline visible on all interactive
- [ ] Color contrast: AA pass for body text (check WHITE on BLACK = 18.5:1 ✓)
- [ ] Pause Menu: keyboard navigable, Esc closes

### 7.6 Quality Gate

- [ ] Zero console errors in production build
- [ ] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] All Jest tests passing (`pnpm test`)
- [ ] About section file ≤ 250 LOC
- [ ] No `tone.js` import in repo (`rg 'from .tone' src/` returns 0)
- [ ] No `framer-motion` direct import (use `motion`)

---

## 8. Out-of-Scope

- Internationalization
- Blog post layout redesign
- New blog content
- Newsletter / RSS subscription
- Comment system
- Search functionality
- Multi-language site
- Audio recording / Tone.js features
- Cassette / vinyl / mixer UI components
- Real game mechanics (it's still a portfolio, not a playable game)

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| R3F bundle balloons first-load | High | High | Lazy-load via `dynamic({ssr:false})`, code-split per section |
| Vertex jitter shader buggy on certain GPUs | Medium | Medium | Feature detect, fallback ke flat material |
| CRT post-FX kills mobile FPS | High | Medium | Default OFF mobile, CSS scanlines fallback |
| Custom font (VT323) FOUT | Medium | Low | `font-display: swap`, system mono fallback |
| Boot sequence annoys returning visitors | Low | Medium | localStorage flag, skip on subsequent visits, also skip via `?nb=1` query |
| Sound effects autoplay blocked by browser | High | Low | Default mute (require user opt-in), `play().catch()` graceful |
| Color migration touches banyak file | High | Medium | Centralized via tokens, sed bulk replace + manual review |
| Pixel font unreadable di mobile | Medium | Medium | Strict rules: VT323 ≥ 32px only, body pakai Inter |
| GitHub API rate limit (footer last-commit) | Medium | Low | Cache 1h via Next.js ISR, fallback ke "Recently shipped" string |
| Cartridge 3D models bigger than budget | Medium | Medium | Single shared `.glb`, swap material color per project (no separate meshes) |

---

## 10. Dependencies

### Internal (within repo)
- `perf-fix-plan.md` — performance fixes (akan di-merge ke `performance.md`)
- `redesign-2026.md` — superseded oleh spec ini, archive

### External (new deps)
- `@react-three/fiber` ^9.x
- `@react-three/drei` ^10.x
- `three` ^0.165.x
- `gpu-tier` (detect GPU capability)

### External (existing, kept)
- `motion` ^12.x
- `lucide-react`
- `next-themes`
- Spotify API (existing setup)
- GitHub REST API (no auth needed for public repo)

### External (removed)
- ~~`tone`~~ — Tone.js dropped entirely

---

## 11. Stakeholders

- **Owner**: Adit (Aditya Himawan)
- **Implementer**: Adit + Hermes (CLI agent assist)
- **Reviewer**: Adit
- **End user**: Recruiters, fellow devs, freelance clients

---

## 12. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-14 | Theme replacement: Studio Session → Retro Console | Refinement insufficient; user wanted extreme change |
| 2026-05-14 | Mascot = cartridge (Option 4) | Brand-cohesive (Projects = cartridges), cheap to model |
| 2026-05-14 | MVP scope = Full Retro (B) | User picked all-effects-on, 2-3 weeks budget |
| 2026-05-14 | Cartridge 3D = top 3 + SVG fallback (b) | Balance perf vs visual richness |
| 2026-05-14 | CRT default ON | User chose ON (typo "OM" → "ON") |
| 2026-05-14 | Section names confirmed | All 7 names accepted |
| 2026-05-14 | Header/navbar themed too | User explicit request |
