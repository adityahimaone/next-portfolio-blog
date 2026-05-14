# Plan — Sprint Strategy RETRO CONSOLE 2026

> Execution roadmap. Companion: `tasks.md` (granular task list per sprint).
> Total budget: 3 weeks (Full Retro mode B).

---

## 1. Sprint Map

```
WEEK 1                  WEEK 2                  WEEK 3
─────────────────────   ─────────────────────   ─────────────────────
SPRINT 1: FOUNDATION    SPRINT 2: 3D + SECTIONS  SPRINT 3: POLISH
─────────────────────   ─────────────────────   ─────────────────────

Day 1  · setup + tokens         · hero 3D mascot          · CRT post-FX shader
Day 2  · fonts + globals.css    · about character select  · vertex jitter
Day 3  · header HUD bar         · skills inventory grid   · boot sequence
Day 4  · pause menu mobile      · experience stage select · sound effects (sfx)
Day 5  · stage divider variants · projects cartridge 3D   · accessibility audit
                                                          · perf tuning
                                · contact save crystal    · cross-browser test
                                · footer stage clear      · final QA + ship
```

Daily checkpoints: 17:00 ada review window — kalo behind, descope ke `performance.md` v2 backlog.

---

## 2. Sprint 1 — FOUNDATION (Week 1)

**Goal**: layar boleh tetep DAW lama, tapi infrastruktur retro console udah siap. Toggle flag bisa swap.

### Day 1 — Setup + Tokens
- ☐ Install deps: `@react-three/fiber`, `@react-three/drei`, `three`, `gpu-tier`
- ☐ Drop `:root` CSS variables ke `globals.css` (lihat `tokens.md` §1)
- ☐ Configure Tailwind v4 `@theme` block (lihat `tokens.md` §2)
- ☐ Bikin `src/lib/design-tokens.ts` (TS constants)
- ☐ Bikin `src/lib/sfx.ts` skeleton (no audio files yet)

### Day 2 — Fonts + Reset
- ☐ Update `src/app/layout.tsx` — load VT323, Space Grotesk, Inter, JetBrains Mono via `next/font/google`
- ☐ Drop type scale classes (`.t-title-xl`, etc) ke `globals.css`
- ☐ Test font load: VT323 crisp di Retina, Inter no FOUT
- ☐ Add `prefers-reduced-motion` global override
- ☐ Add `::selection` styling

### Day 3 — Header HUD Bar (Desktop)
- ☐ Component: `<HUDBar />` di `src/components/layout/hud-bar.tsx`
- ☐ Zone 1: Brand (LED dot + "ADIT" display font)
- ☐ Zone 2: Stage indicator (mono uppercase, IntersectionObserver hookup)
- ☐ Zone 3: Nav links (5 links: Home / About / Work / Contact / Blog)
- ☐ Zone 4: Controls cluster placeholder buttons (CRT/SFX/Theme/Replay)
- ☐ Sticky positioning, z-index, border-bottom 2px white

### Day 4 — Pause Menu (Mobile)
- ☐ Component: `<PauseMenu />` overlay
- ☐ Hamburger D-pad icon trigger
- ☐ Fullscreen overlay, NES menu list style
- ☐ Keyboard navigation (↑/↓/Enter/Esc)
- ☐ Body scroll lock on open
- ☐ Tap-outside-close
- ☐ Animation: fade-in 200ms `steps(4, end)`

### Day 5 — Stage Divider + Globals
- ☐ Component: `<StageDivider variant="loading|glitch|door|static" />`
- ☐ Variant A: loading bar (steps animation)
- ☐ Variant B: glitch cut (CSS keyframes)
- ☐ Variant C: door wipe (CSS keyframes)
- ☐ Stage label HUD `<StageLabel num="01" name="TITLE" />`
- ☐ Replace existing `<SectionDivider />` usage globally
- ☐ Sprint 1 review: tokens + header + dividers all working

**Sprint 1 Definition of Done**:
- All 4 fonts loaded, no FOUT
- Header HUD bar renders desktop + mobile
- Pause Menu opens/closes via keyboard + click
- Stage dividers swappable via prop
- All Tailwind tokens resolved (no missing classes)
- Lighthouse perf still ≥ existing baseline (new fonts don't tank it)

---

## 3. Sprint 2 — 3D + SECTIONS (Week 2)

**Goal**: 6 section refactor lengkap dengan 3D + visual chrome retro console.

### Day 6 — Hero "TITLE SCREEN"
- ☐ Component: `<HeroSection />` rewrite — kosongin lama
- ☐ 3D Canvas: `<Mascot3D />` lazy via `dynamic()`
- ☐ Default geometry: cartridge `.glb` placeholder (sementara icosahedron)
- ☐ Title: VT323 144px "ADIT HIMAONE"
- ☐ "PRESS START" CTA blink, click scrolls
- ☐ Top + bottom HUD overlay (simple version, ga sticky karena sticky-nya HUD bar)
- ☐ CSS pixel grid background
- ☐ Radial vignette dari bottom

### Day 7 — About "CHARACTER SELECT"
- ☐ Component: `<AboutSection />` rewrite
- ☐ Split layout: 3D portrait left + stats right
- ☐ `<Mascot3D variant="portrait" />` reuse component, fov 25
- ☐ `<StatBar />` ASCII block component (5-7 stats)
- ☐ NES textbox dengan bio paragraph
- ☐ "CURRENTLY EQUIPPED" footer
- ☐ Delete `about-section.tsx` lama (DAW), archive ke `_archive/`
- ☐ File ≤ 250 LOC

### Day 8 — Skills "INVENTORY"
- ☐ Component: `<SkillsSection />` rewrite
- ☐ Refactor data: `MIXER_DATA` → `INVENTORY_ITEMS`
- ☐ 6×N grid square cells
- ☐ Cell hover: zoom 1.05 + RED glow
- ☐ Cell click: select + detail panel below
- ☐ Detail panel: nama / years / projects / mastery stars
- ☐ Keyboard: arrow keys navigate grid
- ☐ Mobile: 4 col responsive
- ☐ Delete mixer/fader/knob components, archive

### Day 9 — Experience "STAGE SELECT"
- ☐ Component: `<ExperienceSection />` rewrite
- ☐ 4 stage tile grid 240×240
- ☐ Tile hover: box-shadow lift (no transform)
- ☐ Current job tile: RED border + corner brackets
- ☐ Click: detail panel below (NES textbox)
- ☐ Add fields: `duration`, `link` di constants
- ☐ Default selected: Fast 8 (current)
- ☐ Mobile: horizontal scroll
- ☐ Delete vinyl/discography components, archive

### Day 10 — Projects "GAME LIBRARY"
- ☐ Component: `<ProjectsSection />` rewrite
- ☐ Top 3 projects: `<CartridgeCanvas />` (R3F per card)
- ☐ Bottom 3 projects: `<CartridgeSVG />` (2D fallback)
- ☐ Single shared `cartridge.glb`, color override per project
- ☐ Filter chip top: All + 6 categories
- ☐ Modal: full-screen, boot screen reveal
- ☐ Modal CTA: live demo + GitHub source
- ☐ Counter "06 CARTRIDGES" di header
- ☐ Add fields: `metric`, `tech`, `github` di constants
- ☐ Delete vinyl/album-cover components, archive

### Day 11 — Contact + Footer
- ☐ Component: `<ContactSection />` rewrite
- ☐ 3D save crystal (octahedron RED emissive)
- ☐ 4 "DAT" lines + 4 chunky button (A/B/X/Y)
- ☐ Click action: copy/open + SFX confirm
- ☐ Keyboard: A/B/X/Y/W keys
- ☐ Delete launchpad/Tone.js, uninstall `tone` package
- ☐ Component: `<FooterStageClear />` rewrite
- ☐ "STAGE CLEAR" blink title
- ☐ Live timer (session time)
- ☐ Last commit badge from GitHub API
- ☐ 4 social link chunky buttons

**Sprint 2 Definition of Done**:
- All 6 sections rendered with new theme
- 3D Canvas working in hero + about + projects + contact
- No DAW/mixer/vinyl/launchpad code left in active components (semua di `_archive/`)
- Lighthouse mobile ≥ 75 (intermediate; full polish di Sprint 3)
- Bundle size ≤ 220KB (will tighten in Sprint 3)

---

## 4. Sprint 3 — POLISH (Week 3)

**Goal**: 100% spec compliance + perf budget + a11y + ship-ready.

### Day 12 — CRT Post-FX Shader
- ☐ Implement `<CRTOverlay />` shader pass
- ☐ Toggle integration di Header controls
- ☐ Default ON desktop, OFF mobile
- ☐ Curvature + chromatic aberration + scanlines + vignette
- ☐ Persist state ke `localStorage`
- ☐ Performance test: 60fps maintained desktop dengan CRT ON

### Day 13 — Vertex Jitter Shader
- ☐ Custom `<PixelMaterial />` via `shaderMaterial` (drei)
- ☐ Apply ke mascot, cartridges, save crystal
- ☐ Affine texture mapping pada cartridge labels
- ☐ Toggle: jitter intensity slider in dev mode
- ☐ Test: visible PS1 wobble tanpa kelihatan broken

### Day 14 — Boot Sequence
- ☐ Component: `<BootScreen />`
- ☐ Animation timeline: LED → logo → scanline sweep → "PRESS ANY KEY" blink → transition
- ☐ localStorage flag `_has_booted`
- ☐ Skip param `?nb=1`
- ☐ Replay button di Header → reset flag, reload
- ☐ HUD bar drop-in animation post-boot
- ☐ Reduced motion: skip total

### Day 15 — Sound Effects
- ☐ Source 6 WAV files (≤ 60KB total): blip, click, confirm, coin, boot, select
- ☐ Generate via jsfxr or download CC0 dari freesound.org
- ☐ Drop ke `public/sfx/`
- ☐ Wire `play()` calls di hover/click handlers
- ☐ Toggle integration di Header controls
- ☐ Test: autoplay-blocked browser graceful (no error)

### Day 16 — Accessibility Audit
- ☐ Keyboard sweep: tab order, arrow keys di grids, Esc tutup modals
- ☐ Screen reader pass: NVDA / VoiceOver — semua section punya proper landmarks
- ☐ Color contrast audit per token combo (CSS-aware tool)
- ☐ Reduced motion test: semua effect graceful
- ☐ Focus visible: 2px RED outline check semua interactive
- ☐ ARIA: `aria-pressed` toggle, `aria-label` 3D canvas

### Day 17 — Performance Tuning
- ☐ Bundle analyzer pass
- ☐ Identify chunks > 80KB → code-split
- ☐ R3F lazy-load verify
- ☐ Image optimization: WebP/AVIF semua project thumbnails
- ☐ Font subsetting (latin only, sudah default)
- ☐ Lighthouse mobile target 85+
- ☐ Lighthouse desktop target 95+
- ☐ Compress GLB models via gltfpack

### Day 18 — Cross-browser + Final QA
- ☐ Safari 16+: WebGL2, custom font, sticky header
- ☐ Firefox 110+: same
- ☐ Mobile: iPhone SE, Pixel 6a, iPad mini
- ☐ Light mode: cek functional (not deep audit)
- ☐ Spotify API live test (real session)
- ☐ GitHub API live test (last commit)
- ☐ Manual test boot + skip + replay
- ☐ Manual test pause menu mobile
- ☐ Final visual QA: all 4 chrome colors, no outliers
- ☐ Production deploy
- ☐ Smoke test on production URL
- ☐ Lighthouse final report attached to PR

**Sprint 3 Definition of Done**:
- Lighthouse mobile ≥ 85, desktop ≥ 95
- All acceptance criteria passed (lihat `requirements.md` §7)
- Production smoke test passed
- No regression vs Sprint 2 (visual diff manual review)
- PR merged

---

## 5. Risk Buffer

Hari 19-21 (cadangan):
- Slipped feature dari Sprint 3
- Bug fix dari user testing
- Light mode audit (nice-to-have)
- Documentation update
- Skill creation (capture workflow buat reuse)

---

## 6. Dependency Graph

```
[tokens] ──> [fonts] ──> [globals.css]
                          │
                          ├─> [HUD bar]
                          ├─> [pause menu]
                          ├─> [stage divider]
                          │
                          ├─> [hero 3D]      ──> [vertex jitter]
                          ├─> [about 3D]      └─> [CRT post-FX]
                          ├─> [skills grid]
                          ├─> [experience]
                          ├─> [projects 3D]
                          ├─> [contact 3D]
                          ├─> [footer]
                          │
                          └─> [boot sequence] ──> [SFX]
                                                   │
                                                   └─> [a11y + perf]
```

Critical path: tokens → fonts → globals → header → sections → 3D effects → polish.

---

## 7. Branching Strategy

```
main                          (production)
  │
  └── feat/redesign-2026      (long-lived feature branch)
        │
        ├── feat/2026-tokens
        ├── feat/2026-header
        ├── feat/2026-hero
        ├── feat/2026-about
        ├── feat/2026-skills
        ├── feat/2026-experience
        ├── feat/2026-projects
        ├── feat/2026-contact
        ├── feat/2026-shaders
        ├── feat/2026-boot-sfx
        └── feat/2026-perf-a11y
```

Setiap sub-feature merge ke `feat/redesign-2026`. Final PR: `feat/redesign-2026 → main` di Day 18.

Old code archive di branch yang sama, folder `src/_archive/2026-pre/`.

---

## 8. Rollback Strategy

Lihat `migration.md` §4. Quick version:
- Feature flag `NEXT_PUBLIC_THEME_2026=true|false` di `.env`
- Default `false` selama development → DAW masih live
- Flip `true` setelah Sprint 3 selesai → retro console live
- Rollback: flip back to `false`, hot reload, no redeploy needed (kalo flag di build time, redeploy required — preferred: build-time const)

---

## 9. Communication Plan

- **Daily check-in**: 17:00 — gw kasih status di Telegram (telegram_status atau telegram_card)
- **Sprint review**: end of each week — gw kasih written report
- **Blocker escalation**: immediate Telegram if blocked > 2h
- **Final ship**: announcement post Adit-style ke socials (optional)

---

## 10. Success Metric Dashboard

Akhir Sprint 3 — gw kirim ini:

```
SPRINT REPORT · RETRO CONSOLE 2026

Lighthouse:        Mobile [86] ✓  Desktop [97] ✓
LCP:               1.9s mobile  ✓  1.2s desktop ✓
CLS:               0.03         ✓
Bundle (gzip):     186KB JS      ✓  24KB CSS    ✓
Sections:          6/6 done      ✓
3D scenes:         3/3 working   ✓
Effects:           CRT [✓] Jitter [✓] Boot [✓] SFX [✓]
A11y:              WCAG AA       ✓
Cross-browser:     ✓ Chrome 109+, Safari 16+, Firefox 110+
```

---

> Daily tasks granular: `tasks.md`. Story copy direction: `story-map.md`. Backward compat: `migration.md`.
