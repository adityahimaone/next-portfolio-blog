# Visual & Animation Checklist — RETRO CONSOLE 2026

> Ship gate: every box checked before merge to main.
> Companion: `design.md`, `3d-and-animation.md`, `tokens.md`.

---

## A. Palette Audit

- [ ] Only 4 chrome colors (RED / WHITE / GRAY / BLACK) + 4 derivatives (red-dim / white-dim / gray-light / gray-deep) used
- [ ] No blue, green, purple, amber, cyan, pink, orange remaining
- [ ] Run `scripts/audit-colors.ts` — 0 violations
- [ ] Hex `#E10600` not used inline anywhere — all via `var(--red)` or `text-red`
- [ ] Vinyl color array deleted from constants
- [ ] No `bg-zinc-*`, `bg-slate-*` used outside derivatives map

---

## B. Typography

- [ ] VT323 loaded via `next/font/google`
- [ ] Space Grotesk loaded
- [ ] Inter loaded
- [ ] JetBrains Mono loaded
- [ ] Old `Syne` font reference deleted from layout
- [ ] VT323 only used at ≥ 32px (display, hero, section headlines)
- [ ] Body text uses Inter, not VT323
- [ ] HUD uses JetBrains Mono uppercase tracking 0.1em
- [ ] No `font-smoothing: antialiased` on `.font-display`
- [ ] All headings uppercase (or display style)
- [ ] No FOUT — `font-display: swap` active

---

## C. Header / HUD Bar

- [ ] Sticky top, 56px desktop / 48px mobile
- [ ] Solid `var(--gray-deep)` background, NO transparency / blur
- [ ] 2px solid white bottom border
- [ ] Zone 1: Power LED dot (pulsing red) + "ADIT" display font
- [ ] Zone 2: Stage indicator updates per section (IntersectionObserver)
- [ ] Zone 3: 5 nav links (Home / About / Work / Contact / Blog)
- [ ] Zone 4: 4 toggle buttons (CRT / SFX / Theme / Replay)
- [ ] State persists to localStorage
- [ ] Mobile: hamburger D-pad icon shows
- [ ] Mobile: Pause Menu opens on click
- [ ] Pause Menu: keyboard ↑/↓/Enter/Esc
- [ ] Pause Menu: body scroll locked when open
- [ ] HUD bar drop-in animation post-boot
- [ ] Reduced motion: skip drop-in, LED solid

---

## D. Hero — TITLE SCREEN (STAGE-01)

- [ ] `data-stage-num="01" data-stage-name="TITLE"`
- [ ] LCP < 2.5s mobile (text-based H1)
- [ ] 3D mascot lazy-loaded (no SSR)
- [ ] 3D mascot poster fallback during load
- [ ] Mascot Y rotation + idle bob
- [ ] Vertex jitter shader applied (PS1 wobble)
- [ ] "PRESS START" CTA blinks 1s steps 2
- [ ] CTA click scrolls to STAGE-02
- [ ] Top HUD overlay: power LED + stage label + version
- [ ] Bottom HUD overlay: P1 indicator + © FIRSTPARTY
- [ ] CSS pixel grid background (8x8, low opacity)
- [ ] Radial vignette from bottom (red 5% opacity)
- [ ] Reduced motion: 3D static, no blink

---

## E. About — CHARACTER SELECT (STAGE-02)

- [ ] `data-stage-num="02" data-stage-name="CHARACTER"`
- [ ] Split layout: 3D portrait (left) + stats panel (right)
- [ ] 3D portrait: cartridge close-up, fov 25, slow Y sweep
- [ ] StatBar component used for 5-7 stats
- [ ] ASCII block bars (`█` / `░`)
- [ ] NES textbox dengan bio (2 sentences max)
- [ ] "▼" pointer top-left of textbox
- [ ] "CURRENTLY EQUIPPED" footer line with red dot prefix
- [ ] File `about-section.tsx` ≤ 250 LOC
- [ ] DAW components archived to `_archive/2026-pre/about/`

---

## F. Skills — INVENTORY (STAGE-03)

- [ ] `data-stage-num="03" data-stage-name="INVENTORY"`
- [ ] 6×N grid square cells (80×80 desktop, 64×64 mobile)
- [ ] Cell hover: zoom 1.05 + RED outline glow
- [ ] Cell selected: filled state + detail panel
- [ ] Detail panel below grid: name / years / projects / mastery stars
- [ ] Keyboard: arrow keys navigate (roving tabindex)
- [ ] Mobile: 4 col grid
- [ ] `INVENTORY_ITEMS` data refactored from `MIXER_DATA`
- [ ] Mixer / fader / knob components archived

---

## G. Experience — STAGE SELECT (STAGE-04)

- [ ] `data-stage-num="04" data-stage-name="CAREER"`
- [ ] 4 stage tile grid (240×240 desktop)
- [ ] Tile hover: box-shadow lift, NO transform translate
- [ ] Current job tile: RED border + corner brackets
- [ ] Detail panel below: NES textbox with role bullets
- [ ] `duration` field per experience ("3y 7m")
- [ ] `link` field per experience
- [ ] `current: true` on Fast 8
- [ ] Default selected: current job on load
- [ ] Keyboard: arrow keys navigate
- [ ] Mobile: horizontal scroll (overflow-x-auto, scroll-snap)
- [ ] Vinyl / discography components archived

---

## H. Projects — GAME LIBRARY (STAGE-05)

- [ ] `data-stage-num="05" data-stage-name="RELEASES"`
- [ ] 3 col desktop, 2 col tablet, 1 col mobile
- [ ] Top 3 projects: 3D cartridge canvas
- [ ] Bottom 3 projects: 2D SVG cartridge silhouette
- [ ] Single shared `cartridge.glb` (≤ 50KB)
- [ ] Cartridge body grayscale, sticker color
- [ ] Filter chip top: All / Web3 / Corporate / Productivity / DeFi / Bio / Edu
- [ ] Hover: cartridge eject Y +0.5 + card border RED
- [ ] Click: full-screen modal opens
- [ ] Modal: boot screen reveal animation
- [ ] Modal: project detail + tech stack (dynamic)
- [ ] Modal CTA: live demo + GitHub source (when exists)
- [ ] Counter "06 CARTRIDGES" header
- [ ] `metric`, `tech`, `github`, `category` fields per project
- [ ] Vinyl / album-cover components archived

---

## I. Contact — SAVE POINT (STAGE-06)

- [ ] `data-stage-num="06" data-stage-name="SAVE"`
- [ ] 3D save crystal (octahedron) with RED emissive
- [ ] Pulsing scale 1 → 1.05
- [ ] Slow Y rotation
- [ ] 4 DAT lines (CONTACT / SOCIAL / LINK / CV)
- [ ] 4 chunky buttons (A=copy email, B=LinkedIn, X=GitHub, Y=CV)
- [ ] Action confirms via NES textbox tooltip "COPIED!"
- [ ] Keyboard: A/S/D/F keys trigger actions
- [ ] No Tone.js (verify `pnpm list tone` returns nothing)
- [ ] No launchpad / pad components
- [ ] Footer prompt: "> NO FORMS. JUST A KEY PRESS."

---

## J. Footer — STAGE CLEAR

- [ ] `data-stage-num="CLEAR" data-stage-name="FOOTER"`
- [ ] "★ STAGE CLEAR ★" title VT323 64px
- [ ] Title blink animation 1s steps 2
- [ ] Stats panel: PLAYER / TIME (live) / SCROLL / SECTIONS / RANK
- [ ] Live timer increments every second
- [ ] Last commit badge from GitHub API
- [ ] ISR cache 1h
- [ ] 4 social link chunky buttons
- [ ] Copyright line: `© 2026 · ADIT · MADE IN JAKARTA · INSERT COIN ↻`
- [ ] "INSERT COIN" hover triggers coin SFX

---

## K. Section Dividers

- [ ] `<StageDivider variant="loading" />` between Hero → About
- [ ] `<StageDivider variant="glitch" />` between About → Skills
- [ ] `<StageDivider variant="loading" />` between Skills → Experience
- [ ] `<StageDivider variant="door" />` between Experience → Projects
- [ ] `<StageDivider variant="loading" />` between Projects → Contact
- [ ] `<StageDivider variant="glitch" />` between Contact → Footer
- [ ] CSS-only animations (no motion library)
- [ ] Triggered via IntersectionObserver

---

## L. 3D Effects

- [ ] PixelMaterial (vertex jitter) applied to mascot
- [ ] PixelMaterial applied to cartridges (top 3)
- [ ] PixelMaterial applied to save crystal
- [ ] Affine UV mapping on cartridge labels
- [ ] CRT EffectComposer (curvature + chromatic + scanline + vignette)
- [ ] CRT default ON desktop, OFF mobile
- [ ] CRT toggle works (Header button → state persists)
- [ ] CSS scanlines fallback (always available, lighter)
- [ ] Reduced motion: shaders disabled, plain materials

---

## M. Boot Sequence

- [ ] Boot screen renders on first visit
- [ ] Sequence: 0ms → 100ms → 300ms → 600ms → 800ms → 1600ms
- [ ] LED red dot fade in
- [ ] "FIRSTPARTY" pixel logo fade in
- [ ] Scanline sweep top → bottom
- [ ] "PRESS ANY KEY" blink x2
- [ ] Auto-dismiss at 1.6s
- [ ] localStorage `_has_booted='true'` set
- [ ] Skip on subsequent visits
- [ ] `?nb=1` URL param skips boot
- [ ] Replay button (Header) resets flag
- [ ] HUD bar drop-in after boot
- [ ] Reduced motion: skip total

---

## N. Sound Effects (SFX)

- [ ] 6 WAV files in `public/sfx/` (≤ 60KB total)
  - [ ] blip.wav (hover)
  - [ ] click.wav (click)
  - [ ] confirm.wav (action confirm)
  - [ ] coin.wav (insert coin easter egg)
  - [ ] boot.wav (boot complete)
  - [ ] select.wav (stage select)
- [ ] SFX library `src/lib/sfx.ts` working
- [ ] Default: mute (off)
- [ ] Toggle on Header → state persists
- [ ] Hover sound: blip
- [ ] Click sound: click
- [ ] Action confirm: confirm
- [ ] Stage select: select
- [ ] First interaction: coin (one-shot)
- [ ] Boot complete: boot

---

## O. Animation Tokens

- [ ] Easing `steps(8, end)` used for stepped/sprite motion
- [ ] Easing `steps(4, end)` used for fast tap
- [ ] Pixel cubic `(0.36, 0, 0.66, -0.56)` for snappy
- [ ] Standard `decel/accel` only when stepped doesn't fit
- [ ] Duration tokens: instant 60ms / fast 120ms / base 200ms / slow 400ms / stage 800ms / boot 1600ms
- [ ] No bezier `(0.4, 0, 0.2, 1)` in section transitions
- [ ] No `width/height/top/left` animations
- [ ] No `box-shadow` blur animations during scroll
- [ ] No infinite-loop motion components for backgrounds (use CSS keyframes)

---

## P. Iconography

- [ ] lucide-react icons stroke 2px (chunky)
- [ ] lucide-react icons square line cap
- [ ] lucide-react icons outline only (filled only on active)
- [ ] Custom SVG icons created and optimized:
  - [ ] cartridge.svg
  - [ ] dpad.svg (mobile hamburger)
  - [ ] buttons-abxy.svg
  - [ ] coin.svg
  - [ ] save-crystal.svg
- [ ] All custom SVG ≤ 1KB SVGO optimized

---

## Q. Surface Treatments

- [ ] Pixel grid CSS background (8×8, 3% opacity)
- [ ] Plastic gray housing surface (radial gradient)
- [ ] CRT scanlines fixed overlay (CSS, default ON)
- [ ] Phosphor glow on RED text only
- [ ] Border radius 0 default (only LED dots have border-radius)

---

## R. Reduced Motion

When `prefers-reduced-motion: reduce`:

- [ ] 3D Canvas → static poster image
- [ ] LED dot → solid (no pulse)
- [ ] "PRESS START" → solid (no blink)
- [ ] Vertex jitter shader disabled
- [ ] CRT post-FX disabled
- [ ] CRT scanlines kept (static, no animation)
- [ ] Section transitions instant fade
- [ ] Loading bar fills instantly
- [ ] Boot sequence skipped
- [ ] Save crystal: no pulse
- [ ] Cartridge: no eject hover
- [ ] All `transition-duration` capped to 0.01ms (global override)

---

## S. Accessibility

- [ ] All interactive elements ≥ 44×44px touch target
- [ ] Color contrast WCAG 2.1 AA pass per token combo
- [ ] Keyboard nav: tab order logical
- [ ] Arrow keys di Skills grid + Experience tiles
- [ ] Esc closes Pause Menu, ProjectModal
- [ ] Focus visible: 2px RED outline (no `outline: none`)
- [ ] All `aria-label` accurate
- [ ] All toggles have `aria-pressed`
- [ ] 3D Canvas `aria-hidden="true"` + parent SR fallback text
- [ ] Skip link to main content (optional polish)
- [ ] Section landmarks proper (`<section>` + `aria-labelledby`)

---

## T. Cross-Browser

- [ ] Chrome 109+
- [ ] Edge 109+
- [ ] Safari 16+ (WebGL2, custom font, sticky)
- [ ] Firefox 110+
- [ ] iOS Safari (latest)
- [ ] Android Chrome (latest)

---

## U. Mobile

- [ ] iPhone SE 2 (375×667) layout integrity
- [ ] Pixel 6a tested
- [ ] iPad mini 768×1024 tablet breakpoint
- [ ] 3D Canvas DPR clamped to 1.5
- [ ] CRT post-FX OFF mobile
- [ ] Cartridges 2D SVG only on mobile (override use3D)
- [ ] Pause Menu lazy-loaded
- [ ] Touch targets 44×44 min
- [ ] No horizontal scroll except intentional (Experience tiles)

---

## V. Performance Gate

- [ ] Lighthouse mobile Performance ≥ 85
- [ ] Lighthouse desktop ≥ 95
- [ ] LCP mobile ≤ 2.5s
- [ ] CLS ≤ 0.05
- [ ] Bundle first-load JS ≤ 200KB gzipped
- [ ] Bundle first-load CSS ≤ 30KB gzipped
- [ ] No chunk > 80KB
- [ ] Three.js tree-shaken (verify in bundle analyzer)
- [ ] All `dynamic()` imports working (no SSR for 3D)

---

## W. Quality Gate

- [ ] `pnpm tsc --noEmit` zero errors
- [ ] `pnpm test` all passing
- [ ] `pnpm next build` succeeds
- [ ] Zero console errors in production build
- [ ] No `tone.js` import in src/ (`rg "from 'tone'" src/` returns 0)
- [ ] No `framer-motion` direct (use `motion` package)
- [ ] No `console.log` left in production code

---

## X. Story / Copy

- [ ] All 7 stage labels present (`STAGE-01` through `STAGE-CLEAR`)
- [ ] Hero subtitle mentions Fast 8 + Bisadaya
- [ ] No DAW/mixer/vinyl/launchpad copy left in repo (`rg "track|vinyl|mixer|launchpad" src/` minimal)
- [ ] Music metaphor terms removed (track, B-side, etc.)
- [ ] Game/console metaphor present in section headings
- [ ] CTAs action-verb led (PRESS, OPEN, SAVE, EJECT)
- [ ] Empty states in retro voice (`> SIGNAL LOST`)

---

## Y. Final Manual QA (Sprint 3 Day 18)

- [ ] Fresh visit: boot plays + scanlines + retro feel intact
- [ ] Refresh: boot skipped
- [ ] Toggle CRT: visual change applied
- [ ] Toggle SFX: hover plays sound
- [ ] Toggle Theme: light mode functional
- [ ] Click each section nav: scrolls correctly
- [ ] Click filter chips Projects: filters work
- [ ] Click cartridge: modal opens with details
- [ ] Click Contact A button: email copies + tooltip
- [ ] Reach footer: timer counts up, rank S
- [ ] Open Pause Menu mobile: nav + controls accessible
- [ ] Esc closes overlays
- [ ] Reduced motion mode: graceful degradation

---

## Z. Sign-Off

- [ ] Adit reviewed visually — vibing
- [ ] Adit approved performance metrics
- [ ] PR description includes Lighthouse JSON
- [ ] Final merge to main
- [ ] Production smoke test passed

---

> Don't ship without all boxes checked. If a box stays unchecked, file as bug or trade-off note.
