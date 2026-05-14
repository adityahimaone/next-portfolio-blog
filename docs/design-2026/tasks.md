# Tasks — Granular Execution List RETRO CONSOLE 2026

> Per-file, per-component task breakdown. Companion: `plan.md` (sprint structure).
>
> Format:
> - **Status**: ☐ todo · ⏳ in-progress · ✅ done · ❌ blocked · ⏸ paused
> - **Priority**: P0 · P1 · P2 · P3
> - **Effort**: S (<4h) · M (1-2d) · L (3-5d)

---

## Phase A — Setup & Tokens (Day 1-2)

### A1. Install dependencies
**Status**: ☐ · **P0** · S

```bash
pnpm add @react-three/fiber @react-three/drei three
pnpm add detect-gpu
pnpm remove tone
```

Verify: `pnpm tsc --noEmit` passes, no peer dep warnings.

### A2. CSS Variables
**Status**: ☐ · **P0** · S
- File: `src/app/globals.css`
- Drop `:root { --red: ... }` block (paste from `tokens.md` §1)
- Add light mode `[data-theme='light']` block
- Add `prefers-reduced-motion` global override

### A3. Tailwind v4 @theme
**Status**: ☐ · **P0** · S
- File: `src/app/globals.css`
- Add `@theme { --color-red: ... }` block (paste from `tokens.md` §2)
- Verify class `bg-red`, `text-white-bone`, `border-gray-2` resolve in dev

### A4. TS Constants
**Status**: ☐ · **P0** · S
- File: `src/lib/design-tokens.ts` (NEW)
- Paste TS export from `tokens.md` §3
- Import in: `src/lib/sfx.ts`, `src/components/3d/*` later

### A5. Type scale CSS
**Status**: ☐ · **P0** · S
- File: `src/app/globals.css`
- Drop `.t-title-xl`, `.t-heading-l`, etc dari `tokens.md` §4
- Verify class `.t-title-xl` di hero renders VT323 144px

### A6. Font loading
**Status**: ☐ · **P0** · S
- File: `src/app/layout.tsx`
- Replace existing font setup with VT323 + Space Grotesk + Inter + JetBrains Mono (`tokens.md` §7)
- Apply `${vt323.variable} ${heading.variable}` etc to `<html>`
- Remove `Syne` font import

---

## Phase B — Header / HUD Bar (Day 3-4)

### B1. HUDBar component
**Status**: ☐ · **P0** · M
- File: `src/components/layout/hud-bar.tsx` (NEW)
- Sticky top, 56px desktop / 48px mobile
- 4 zones (lihat `design.md` §4.5.1)
- Background `var(--gray-deep)`, border-bottom 2px white

### B2. Brand zone
**Status**: ☐ · **P0** · S
- Power LED dot pulsing red (use `<PowerLED />` component)
- "ADIT" display font 24px white

### B3. Stage indicator with IntersectionObserver
**Status**: ☐ · **P1** · M
- File: `src/hooks/use-current-stage.ts` (NEW)
- Hook returns `{ num, name }` of currently visible section
- Threshold 0.4
- Update Zone 2 of HUDBar via context or prop

### B4. Nav links
**Status**: ☐ · **P0** · S
- 5 links: Home / About / Work / Contact / Blog
- Mono uppercase 12px, hover white, active underline RED 2px
- Anchor links scroll to `#about`, `#projects`, etc

### B5. Controls cluster
**Status**: ☐ · **P0** · M
- 4 toggle button: CRT / SFX / Theme / Replay
- File: `src/components/layout/hud-controls.tsx` (NEW)
- Persist state ke `localStorage`
- Icons: lucide `Monitor` (CRT), `Volume2/VolumeX` (SFX), `Sun/Moon` (Theme), `RotateCcw` (Replay)

### B6. PauseMenu (mobile)
**Status**: ☐ · **P0** · M
- File: `src/components/layout/pause-menu.tsx` (NEW)
- Hamburger D-pad icon trigger
- Fullscreen overlay, NES menu list style
- Keyboard: ↑/↓/Enter/Esc
- Body scroll lock
- Tap-outside-close

### B7. Replace existing nav
**Status**: ☐ · **P0** · S
- File: `src/components/navigation.tsx` (existing — DELETE atau archive)
- Replace usage in `src/app/layout.tsx` dengan `<HUDBar />`

---

## Phase C — Stage Divider (Day 5)

### C1. StageDivider component
**Status**: ☐ · **P0** · M
- File: `src/components/ui/stage-divider.tsx` (NEW or rewrite if exists)
- Variants: `loading` | `glitch` | `door` | `static`
- CSS-only animations (no motion library)

### C2. Variant: Loading bar
**Status**: ☐ · **P0** · S
- "LOADING NEXT STAGE..." mono uppercase
- Bar fills 0 → 100% in 800ms `steps(8, end)` on viewport intersect

### C3. Variant: Glitch cut
**Status**: ☐ · **P1** · S
- 200ms RGB shake keyframe animation
- 5 keyframes: 0% → 20% → 40% → 60% → 80% → 100%

### C4. Variant: Door wipe
**Status**: ☐ · **P1** · S
- RED door slides top-bottom meet middle
- 600ms total, ~300ms close + 300ms open
- Pure CSS clip-path or transform

### C5. StageLabel component
**Status**: ☐ · **P0** · S
- File: `src/components/ui/stage-label.tsx` (NEW)
- HUD-style label: `STAGE-NN // <NAME>`
- Power LED dot prefix (optional `glowing` variant)

---

## Phase D — Hero "TITLE SCREEN" (Day 6)

### D1. HeroSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/hero/hero-section.tsx` (rewrite)
- Archive old: `src/_archive/2026-pre/hero-section.tsx`
- New layout: lihat `design.md` §5.1
- `data-stage-num="01" data-stage-name="TITLE"`

### D2. Mascot3D component
**Status**: ☐ · **P0** · M
- File: `src/components/3d/mascot-3d.tsx` (NEW)
- Lazy via `dynamic({ ssr: false })`
- R3F Canvas, dpr={[1, 1.5]}, antialias false
- Cartridge geometry (placeholder icosahedron until .glb ready)
- Idle bob + Y rotation 0.15 rad/s

### D3. Mascot poster fallback
**Status**: ☐ · **P0** · S
- File: `public/3d/mascot-poster.webp` (NEW asset)
- 800×800 webp screenshot of 3D mascot rendered offline
- Used as `loading` prop fallback dan reduced-motion fallback

### D4. Title block
**Status**: ☐ · **P0** · S
- VT323 144px "ADIT HIMAONE"
- Sub: Space Grotesk 14px uppercase "FRONTEND ENGINEER · v26"

### D5. PressStart CTA
**Status**: ☐ · **P0** · S
- File: `src/components/ui/press-start.tsx` (NEW)
- Blink animation (1s steps 2)
- Click scrolls to `#about`
- SFX confirm on click

### D6. Hero HUD overlays
**Status**: ☐ · **P1** · S
- Top: power LED + stage label + version
- Bottom: P1 indicator + © FIRSTPARTY

### D7. Background pixel grid + vignette
**Status**: ☐ · **P1** · S
- 8×8 pixel grid CSS background-image
- Radial vignette from bottom (warm subtle gradient — use red 5% opacity)

---

## Phase E — About "CHARACTER SELECT" (Day 7)

### E1. AboutSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/about/about-section.tsx` (rewrite)
- Archive old (957 LOC DAW version) → `src/_archive/2026-pre/about-section.tsx`
- Target ≤ 250 LOC
- `data-stage-num="02" data-stage-name="CHARACTER"`

### E2. Portrait3D component
**Status**: ☐ · **P0** · S
- Reuse `Mascot3D` with `variant="portrait"` prop
- Camera fov 25, position closer
- Slow Y sweep (-0.3 → +0.3 rad)

### E3. StatBar component
**Status**: ☐ · **P0** · S
- File: `src/components/ui/stat-bar.tsx` (NEW)
- ASCII block bar, props: label, value
- Use Unicode `█` (U+2588) and `░` (U+2591)

### E4. Stats data
**Status**: ☐ · **P0** · S
- File: `src/features/landing-page/constants/index.ts`
- Add `CHARACTER_STATS` array: REACT 85, NEXT.JS 92, TYPESCRIPT 80, MOTION 62, SHIPPING 90

### E5. Bio NES textbox
**Status**: ☐ · **P1** · S
- File: `src/components/ui/nes-textbox.tsx` (NEW)
- 2 sentence bio max
- "▼" pointer top-left, white border 2px

### E6. "CURRENTLY EQUIPPED" footer
**Status**: ☐ · **P1** · S
- Mono uppercase line
- RED dot + "BISADAYA · FAST 8"

### E7. Delete DAW components
**Status**: ☐ · **P0** · S
- Identify DAW-specific files in `src/features/landing-page/components/about/`
- Move to `src/_archive/2026-pre/about/`
- Remove imports from current section

---

## Phase F — Skills "INVENTORY" (Day 8)

### F1. SkillsSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/skills/skills-section.tsx` (rewrite)
- Archive mixer code → `src/_archive/2026-pre/skills/`
- `data-stage-num="03" data-stage-name="INVENTORY"`

### F2. Inventory data refactor
**Status**: ☐ · **P0** · S
- File: `src/features/landing-page/constants/index.ts`
- Refactor `MIXER_DATA` → `INVENTORY_ITEMS`
- Schema: `{ id, name, icon, years, projectsCount, mastery, category }`

### F3. InventoryGrid component
**Status**: ☐ · **P0** · M
- File: `src/components/ui/inventory-grid.tsx` (NEW)
- 6×N grid square cells (80×80 desktop, 64×64 mobile)
- Cell hover: zoom 1.05, RED outline glow
- Cell selected: filled state

### F4. Cell keyboard nav
**Status**: ☐ · **P1** · S
- Arrow keys move selection
- Enter selects → opens detail panel
- Tab skips entire grid (treat as roving tabindex)

### F5. Detail panel
**Status**: ☐ · **P0** · S
- Below grid
- Shows: nama / years / projects / mastery (5-star with `★ ★ ★ ★ ☆`)

### F6. Mobile: 4 col grid
**Status**: ☐ · **P1** · S
- `grid-cols-4` on mobile, `grid-cols-6` on desktop

---

## Phase G — Experience "STAGE SELECT" (Day 9)

### G1. ExperienceSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/experience/experience-section.tsx` (rewrite)
- Archive vinyl/discography code → `src/_archive/2026-pre/experience/`
- `data-stage-num="04" data-stage-name="CAREER"`

### G2. StageSelectTile component
**Status**: ☐ · **P0** · M
- File: `src/components/ui/stage-select-tile.tsx` (NEW)
- 240×240 desktop
- Border GRAY-LIGHT 2px, current job RED border + corner brackets glow
- Hover: box-shadow lift (no transform translate)

### G3. Add data fields
**Status**: ☐ · **P0** · S
- File: `src/features/landing-page/constants/index.ts`
- Add `duration` (computed string "3y 7m") + `link` (artifact URL) per experience
- Mark current job: `current: true`

### G4. Default selected: current job
**Status**: ☐ · **P0** · S
- On mount, find experience where `current === true`, set as initial selection

### G5. Detail panel (NES textbox)
**Status**: ☐ · **P0** · S
- Use `<NesTextbox />` component
- Show: role / period / 3 bullet description / tech list

### G6. Keyboard nav
**Status**: ☐ · **P1** · S
- Arrow keys navigate tiles
- Enter selects

### G7. Mobile: horizontal scroll
**Status**: ☐ · **P1** · S
- `overflow-x-auto`, `scroll-snap-type: x mandatory`
- Tiles `min-w-[240px]`

---

## Phase H — Projects "GAME LIBRARY" (Day 10)

### H1. ProjectsSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/projects/projects-section.tsx` (rewrite)
- Archive vinyl-sleeve code → `src/_archive/2026-pre/projects/`
- `data-stage-num="05" data-stage-name="RELEASES"`

### H2. CartridgeCanvas (3D)
**Status**: ☐ · **P0** · M
- File: `src/components/3d/cartridge-canvas.tsx` (NEW)
- R3F Canvas per card (top 3 only)
- Single shared `cartridge.glb`, color override prop
- Idle sway + hover eject animation

### H3. CartridgeSVG (2D fallback)
**Status**: ☐ · **P0** · S
- File: `src/components/ui/cartridge-svg.tsx` (NEW)
- 2D NES cartridge silhouette SVG
- Used for cards 4-6 dan reduced motion

### H4. Cartridge .glb model
**Status**: ☐ · **P1** · M
- Model NES cartridge in Blender (~150 tris)
- Export glTF binary, compress with gltfpack
- Drop ke `public/3d/cartridge.glb` (target ≤ 50KB)

### H5. ProjectCard component
**Status**: ☐ · **P0** · M
- File: `src/components/ui/project-card.tsx` (NEW)
- Top half: 3D canvas atau SVG (per props)
- Bottom: title, genre, year, metric line
- Hover: card border RED, cartridge eject

### H6. FilterChip
**Status**: ☐ · **P0** · S
- File: `src/components/ui/filter-chip.tsx` (NEW)
- Toggle chip: All / Web3 / Corporate / Productivity / DeFi / Bio / Edu
- Active state: RED bg + RED border

### H7. ProjectModal rewrite
**Status**: ☐ · **P1** · M
- File: `src/components/ui/project-modal.tsx` (rewrite)
- Boot screen reveal animation (1.5s sequenced)
- Body: title, description, metric, tech stack (dynamic), CTA buttons
- CTA: Live demo + GitHub source

### H8. Add data fields
**Status**: ☐ · **P0** · S
- File: `src/features/landing-page/constants/index.ts`
- Add `metric` (string), `tech` (string[]), `github` (optional string), `category` per project

### H9. Counter "06 CARTRIDGES"
**Status**: ☐ · **P1** · S
- Header above grid
- Auto-derived from data length

---

## Phase I — Contact "SAVE POINT" (Day 11)

### I1. ContactSection rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/contact/contact-section.tsx` (rewrite)
- Archive launchpad/Tone.js code → `src/_archive/2026-pre/contact/`
- `data-stage-num="06" data-stage-name="SAVE"`

### I2. SaveCrystal component
**Status**: ☐ · **P0** · S
- File: `src/components/3d/save-crystal.tsx` (NEW)
- Octahedron geometry, RED emissive material
- Pulsing scale 1 → 1.05, slow Y rotation
- Optional `<Bloom />` post-FX (default off mobile)

### I3. DAT lines
**Status**: ☐ · **P0** · S
- 4 lines: CONTACT.DAT / SOCIAL.DAT / LINK.DAT / CV.DAT
- Mono uppercase, RED `>` prefix
- Hover: RED highlight + SFX blip

### I4. ChunkyButton component
**Status**: ☐ · **P0** · S
- File: `src/components/ui/chunky-button.tsx` (NEW)
- 4 buttons A/B/X/Y with shadow offset 4px
- Click feedback: translate 2px,2px

### I5. Action handlers
**Status**: ☐ · **P0** · S
- A: copy email → toast NES textbox "COPIED!"
- B: open LinkedIn (new tab)
- X: open GitHub (new tab)
- Y: download CV PDF

### I6. Keyboard shortcuts
**Status**: ☐ · **P1** · S
- A key → A action
- S → B action (B key already bound to back)
- D → X action
- F → Y action

### I7. Uninstall Tone.js
**Status**: ☐ · **P0** · S
- `pnpm remove tone`
- Verify no `from 'tone'` imports left: `rg "from 'tone'" src/`

---

## Phase J — Footer "STAGE CLEAR" (Day 11)

### J1. FooterStageClear rewrite
**Status**: ☐ · **P0** · M
- File: `src/features/landing-page/components/footer/footer-section.tsx` (rewrite)
- Archive existing footer → `src/_archive/2026-pre/footer/`
- `data-stage-num="CLEAR" data-stage-name="FOOTER"`

### J2. STAGE CLEAR title
**Status**: ☐ · **P0** · S
- VT323 64px "★ STAGE CLEAR ★"
- Blink animation 1s steps 2
- RED color + glow

### J3. Stats panel
**Status**: ☐ · **P0** · S
- PLAYER (static "ADIT")
- TIME (live counter — session time, hh:mm:ss)
- SCROLL (snapshot at footer view, % rounded)
- SECTIONS (6/6)
- RANK (static "S")

### J4. Last commit badge (GitHub API)
**Status**: ☐ · **P1** · M
- File: `src/app/api/last-commit/route.ts` (NEW) — Next.js Route Handler with ISR cache 1h
- Fetch `https://api.github.com/repos/adityahimaone/next-portfolio-blog/commits?per_page=1`
- Return: `{ sha, message, date }`
- Display: `LAST SHIPPED · {date} · {message}`

### J5. 4 social link chunky buttons
**Status**: ☐ · **P0** · S
- HOME / BLOG / GITHUB / LINKEDIN
- Use `<ChunkyButton />`

### J6. Copyright line
**Status**: ☐ · **P0** · S
- `© 2026 · ADIT · MADE IN JAKARTA · INSERT COIN ↻`

---

## Phase K — Boot Sequence + SFX (Day 14-15)

### K1. BootScreen component
**Status**: ☐ · **P1** · M
- File: `src/components/layout/boot-screen.tsx` (NEW)
- Full overlay z-index 200
- Sequenced timeline: 0ms → 100ms → 300ms → 600ms → 800ms → 1600ms
- Auto-dismisses + sets `localStorage._has_booted = 'true'`

### K2. Boot trigger logic
**Status**: ☐ · **P1** · S
- File: `src/app/page.tsx`
- Check `localStorage._has_booted` on mount
- Skip if `?nb=1` URL param
- Render `<BootScreen />` if first visit

### K3. Replay button wiring
**Status**: ☐ · **P2** · S
- HUDControls Replay button → reset flag + reload

### K4. Source SFX files
**Status**: ☐ · **P1** · S
- Generate via jsfxr (https://sfxr.me/) atau download CC0 freesound
- 6 files: blip / click / confirm / coin / boot / select
- Drop ke `public/sfx/`
- Total budget ≤ 60KB

### K5. SFX library
**Status**: ☐ · **P1** · S
- File: `src/lib/sfx.ts` (already created in A4 — wire up here)
- `play(name)`, `enableSfx()`, `disableSfx()`
- Cache audio elements

### K6. Wire SFX calls
**Status**: ☐ · **P1** · M
- Hover handlers: `play('blip')` (button, card)
- Click handlers: `play('click')` (button), `play('confirm')` (action)
- Stage select tile: `play('select')`
- First interaction: `play('coin')` once

---

## Phase L — Custom Shaders (Day 12-13)

### L1. PixelMaterial shader
**Status**: ☐ · **P1** · M
- File: `src/components/3d/shaders/pixel-material.ts` (NEW)
- Vertex shader: snap to integer pixel grid (PS1 wobble)
- Fragment shader: flat color
- Use `shaderMaterial` from drei

### L2. Apply to mascot
**Status**: ☐ · **P1** · S
- File: `src/components/3d/mascot-3d.tsx`
- Replace `meshStandardMaterial` → `<pixelMaterial />`

### L3. Apply to cartridges
**Status**: ☐ · **P1** · S
- File: `src/components/3d/cartridge-canvas.tsx`
- Same swap

### L4. Affine UV mapping (cartridge labels)
**Status**: ☐ · **P2** · M
- File: `src/components/3d/shaders/affine-tex.ts` (NEW)
- Vertex: `vUv = uv * w`
- Fragment: `texture2D(uTex, vUv / vW)`
- Apply to cartridge label plane only

### L5. CRT post-FX EffectComposer
**Status**: ☐ · **P1** · L
- File: `src/components/3d/effects/crt-effect.tsx` (NEW)
- Use `@react-three/postprocessing` library (or custom EffectComposer)
- Curvature + chromatic aberration + scanlines + vignette
- Toggle controlled via Header CRT button
- Default ON desktop, OFF mobile

### L6. CRT CSS scanlines (cheap fallback)
**Status**: ☐ · **P0** · S
- File: `src/components/layout/crt-overlay.tsx` (NEW)
- Repeating-linear-gradient overlay
- Z-index 9999, mix-blend-mode multiply
- Always rendered when CRT ON, regardless of post-FX availability

---

## Phase M — Performance & Accessibility (Day 16-17)

### M1. Bundle analyzer
**Status**: ☐ · **P0** · S
- Run `pnpm next build && pnpm next-bundle-analyzer`
- Identify chunks > 80KB
- Code-split candidates: cartridge-canvas, save-crystal, crt-effect

### M2. R3F lazy verify
**Status**: ☐ · **P0** · S
- Verify `dynamic({ ssr: false })` semua 3D components
- First-load JS should NOT include `three`

### M3. Image optimization
**Status**: ☐ · **P0** · M
- All `public/projects/*.png` → WebP via `cwebp` or `sharp`
- All `public/cover.jpg` → WebP
- Max 800×800 @ 1x, 1600×1600 @ 2x

### M4. GLB compression
**Status**: ☐ · **P1** · S
- `npx gltfpack -i model.glb -o model.opt.glb -cc -tc`
- Verify ≤ 50KB per model

### M5. Color audit script
**Status**: ☐ · **P1** · S
- File: `scripts/audit-colors.ts` (NEW)
- Scan `src/**/*.{tsx,ts,css}` for hex codes
- Reject any not in approved palette
- Run as pre-commit hook

### M6. Keyboard sweep manual test
**Status**: ☐ · **P0** · S
- Tab through entire site, no traps
- Arrow keys di Skills grid + Experience tiles
- Esc tutup PauseMenu + ProjectModal
- Document any issues in `bugfix.md`

### M7. Reduced motion test
**Status**: ☐ · **P0** · S
- macOS Settings → Accessibility → Reduce Motion ON
- Verify: 3D static, no blink, no boot, no scanline animation
- Document any leaks

### M8. Color contrast audit
**Status**: ☐ · **P0** · S
- Use https://webaim.org/resources/contrastchecker/
- Test: WHITE on BLACK, RED on BLACK, WHITE-DIM on GRAY-DEEP
- All combos AA pass

### M9. ARIA labels audit
**Status**: ☐ · **P1** · S
- Verify all `<button>`, `<canvas>`, custom widgets have `aria-label`
- All toggles have `aria-pressed`
- 3D Canvas has `aria-hidden="true"` + parent SR text

### M10. Lighthouse final
**Status**: ☐ · **P0** · S
- Run on production URL
- Mobile target ≥ 85, desktop ≥ 95
- Document in PR description

---

## Phase N — Cross-browser + Ship (Day 18)

### N1. Safari 16+ test
**Status**: ☐ · **P0** · S
- WebGL2 working, custom font loads, sticky header behaves
- 3D mascot renders without flicker

### N2. Firefox 110+ test
**Status**: ☐ · **P0** · S
- Same checks, plus check that VT323 renders sharp

### N3. Mobile testing
**Status**: ☐ · **P0** · M
- iPhone SE 2 (375×667): 3D fallback poster, layout integrity
- Pixel 6a (Android Chrome): 3D scaled DPR 1.5
- iPad mini (768×1024): tablet breakpoint

### N4. Light mode functional check
**Status**: ☐ · **P2** · S
- Toggle theme button, verify variables flip
- Spot check 3 sections render readable

### N5. API live tests
**Status**: ☐ · **P1** · S
- Spotify: real session, verify Now Playing in About section "currently equipped" line (or wherever surfaced)
- GitHub: real fetch, verify last commit badge

### N6. Boot + skip + replay manual test
**Status**: ☐ · **P0** · S
- Fresh visit (clear localStorage): boot plays
- Refresh: boot skipped
- `?nb=1`: boot skipped
- Replay button: localStorage cleared, page reloads, boot plays again

### N7. Pause Menu mobile manual test
**Status**: ☐ · **P0** · S
- Tap hamburger: opens
- Tap nav item: closes + scrolls
- Tap outside: closes
- Esc / × button: closes
- Body scroll locked while open

### N8. Visual diff manual review
**Status**: ☐ · **P0** · M
- Side-by-side: pre-2026 vs 2026
- Check no DAW/mixer/vinyl/launchpad copy or visual remnant
- Verify 4-color palette: scan with browser dev tools color picker

### N9. Production deploy
**Status**: ☐ · **P0** · S
- Merge `feat/redesign-2026` → `main`
- VPS deploy via existing PM2 + Nginx pipeline
- Smoke test production URL

### N10. Lighthouse final report
**Status**: ☐ · **P0** · S
- Production URL Lighthouse run
- Attach JSON + screenshot to PR
- Verify acceptance criteria all green

---

## Phase O — Cleanup (post-ship)

### O1. Delete `_archive/2026-pre/`
**Status**: ☐ · **P3** · S
- Wait 2 weeks post-ship
- If no rollback needed, delete archive folder

### O2. Update README
**Status**: ☐ · **P3** · S
- File: `README.md`
- Update screenshots
- Update tagline to retro console phrasing

### O3. Update OG image
**Status**: ☐ · **P2** · S
- File: `public/og.jpg` or `public/og.png`
- Generate new OG: title screen frame with "ADIT HIMAONE · PRESS START"
- Update meta tags

### O4. Save skill
**Status**: ☐ · **P3** · S
- Capture this redesign workflow as a skill
- File: `~/.hermes/skills/portfolio-retro-redesign-2026/`
- Include: theme decision rubric, font/palette setup, 3D scaffold

---

## Summary by Priority

| Priority | Count | Effort total |
|----------|-------|--------------|
| P0 (must) | 56 | ~14 days |
| P1 (should) | 28 | ~5 days |
| P2 (nice) | 6 | ~1 day |
| P3 (post) | 4 | ~0.5 day |

Buffer: ~0.5 day per sprint = 1.5 day total cushion.

---

> Updates ke status: edit checkbox `☐` → `⏳` → `✅`. Track via daily standup.
