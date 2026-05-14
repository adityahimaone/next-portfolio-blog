# Tasks — Granular Task List 2026

> Atomic tasks for execution. Each linked to requirement (`requirements.md`) and sprint (`plan.md`).
> Format: `T-<id> [<priority>][<effort>][<sprint>] <title>` 
> Use checkbox to track. Update status as you go.

---

## Sprint 0 — Pre-flight

- [ ] **T-000** [P0][S][S0] Create backup branch `backup/pre-redesign-2026`
  - `git checkout -b backup/pre-redesign-2026 && git push -u origin backup/pre-redesign-2026`
  - Return to `main`

- [ ] **T-001** [P0][S][S0] Capture performance baseline
  - Run `ANALYZE=true pnpm build`
  - Save bundle report to `docs/design-2026/baseline-bundle.html`
  - Run Lighthouse on production URL (mobile + desktop), screenshot scores
  - Save to `docs/design-2026/baseline-lighthouse.json`

- [ ] **T-002** [P0][S][S0] Capture visual baseline
  - Open production site, take screenshot per section (hero, about, skills, exp, projects, contact, footer)
  - Save to `docs/design-2026/baseline-screenshots/`

- [ ] **T-003** [P0][S][S0] Confirm test infrastructure
  - Run `pnpm test` — all green
  - Run `pnpm test:performance` — verify works
  - Run `pnpm dev` — site loads without console errors

---

## Sprint 1 — Foundation & Performance

### Performance Foundation

- [ ] **T-100** [P0][M][S1] Fix LCP on Hero (R-H1)
  - File: `features/landing-page/components/hero-section.tsx`
  - Replace motion-wrapped `<h1>ADITYA</h1>` and subtitle `<p>` with plain HTML + CSS animation class
  - Add `animate-hero-name`, `animate-hero-desc` keyframes to `globals.css`
  - Use `animation-fill-mode: both` so element registers in DOM immediately for LCP
  - Verify: re-run Lighthouse, LCP < 3.5s mobile

- [ ] **T-101** [P0][S][S1] Verify preloader skip on return visit
  - File: `features/landing-page/animations/preloader.tsx`
  - Confirm `sessionStorage.getItem('preloaderShown')` skip path returns < 100ms
  - Add log to verify skip works
  - Test: open in fresh tab → preloader shows. Reload → skips.

- [ ] **T-102** [P1][S][S1] Update tsconfig target to ES2022 (R-perf P2)
  - File: `tsconfig.json`
  - Change `"target": "ES2017"` → `"target": "ES2022"`
  - Verify build still succeeds: `pnpm build`
  - Run bundle analyzer, confirm legacy polyfills reduced

- [ ] **T-103** [P1][M][S1] Audit & remove unused JS imports
  - `react-syntax-highlighter` — verify only loaded on `/blog/[slug]` route
  - `tone` — currently loaded in `features/landing-page/spotify/use-audio-engine.tsx` and `features/landing-page/components/contact/contact-section.tsx`
  - Confirm `dynamic()` boundaries set correctly
  - Remove unused exports

- [ ] **T-104** [P1][S][S1] Add prefers-reduced-motion global override (R-G1, NFR-11)
  - File: `app/globals.css`
  - Insert at top of `@layer base`:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```

- [ ] **T-105** [P1][M][S1] Add skeleton loaders to all dynamic imports (R-G5)
  - File: `features/landing-page/views/landing-page.tsx`
  - For each `dynamic(...)` call, add `loading: () => <SectionSkeleton />`
  - Create `features/landing-page/components/section-skeleton.tsx` with neutral pulse
  - Test: throttle network, verify CLS < 0.05

### Design Tokens Setup

- [ ] **T-110** [P0][M][S1] Create design tokens in globals.css
  - File: `app/globals.css`
  - Add CSS custom properties from `design-2026/tokens.md` Section 2.1-2.4
  - Define: `--surface-0/1/2/3`, `--text-primary/secondary/muted`, `--accent`, `--led-rec/play/mute/solo`
  - Both dark and light mode

- [ ] **T-111** [P1][S][S1] Update Tailwind config to use CSS vars
  - File: `tailwind.config` (check existence — currently using v4 with PostCSS)
  - If using Tailwind v4 inline theme: extend with custom color names mapping to CSS vars
  - Document at `tokens.md` Section 7

- [ ] **T-112** [P2][S][S1] Audit unused CSS in globals.css
  - Current globals.css is 632 lines — likely has dead rules
  - Search: which `.vinyl-record`, `.music-wave`, custom classes still used?
  - Remove unused classes
  - Goal: reduce to < 400 LOC

### About Section Refactor

- [ ] **T-120** [P0][L][S1] Refactor about-section.tsx file structure (R-A3, R-A5)
  - Source: `features/landing-page/components/about-section.tsx` (957 LOC)
  - Target structure:
    ```
    features/landing-page/components/about/
      about-section.tsx       (parent, < 250 LOC)
      types.ts                (Clip, Track interfaces)
      tracks-data.tsx         (the 3 tracks definition)
      components/
        time-ruler.tsx
        track-header.tsx
        clip-block.tsx
        detail-window.tsx
      clips/
        identity-clip.tsx     (was bio-main)
        now-playing-clip.tsx  (new — was audio-main, expanded)
        metrics-clip.tsx      (was stats-main)
    ```
  - Update import in `landing-page.tsx`
  - Verify visually identical to before (snapshot test)

- [ ] **T-121** [P0][M][S1] Drop STACK track from about (R-A1, R-A2)
  - File: `features/landing-page/components/about/tracks-data.tsx` (after T-120)
  - Remove track with id `stack`
  - Keep: IDENTITY, NOW_PLAYING, METRICS (3 tracks total)
  - Update grid layout (timeline rendering still 12 columns, just less rows now)

- [ ] **T-122** [P1][M][S1] Sync playhead to active clip (R-A4)
  - File: `features/landing-page/components/about/about-section.tsx`
  - When clip clicked, playhead should move to clip's start position smoothly
  - Currently playhead just runs at constant rate — change to:
    - Idle: stop at 0
    - Click clip: animate playhead to `clip.start * (100/12)%` over 300ms
    - Click play button: resume sweep from current position

### Quick Wins

- [ ] **T-130** [P0][S][S1] Update mixer label "2025" → "2026" (R-S1)
  - File: `features/landing-page/components/skills-section.tsx`
  - Find: `MIX-MASTER 2025`
  - Replace: `MIX-MASTER 2026`

- [ ] **T-131** [P0][S][S1] Remove floating notes background (R-G2)
  - File: `features/landing-page/views/landing-page.tsx`
  - Delete 3 `<m.div>` blocks rendering `♫`, `♩`, `♬`
  - Verify visual cleaner without them

- [ ] **T-132** [P1][S][S1] Hero "MODEL NO. AH-2026-MKIII" cleanup
  - Decide: keep or move to single location
  - Currently: appears in About `bio-main` clip
  - Recommendation: keep in About (more context), remove if it appears in Hero (it doesn't currently)

---

## Sprint 2 — Story Tightening

### Hero Updates

- [ ] **T-200** [P1][M][S2] Live Now Playing ticker in Hero (R-H2)
  - File: `features/landing-page/components/hero-section.tsx`
  - Currently: ticker uses `currentTrack` from `useAudio()` context (static "Edge of Desire")
  - Change: fetch `/api/now-playing` (existing endpoint), poll every 30s
  - Fallback: "Standby — currently silent" when no track
  - Use SWR or simple `useEffect` polling

- [ ] **T-201** [P1][S][S2] Hero subtitle copy update (R-H3)
  - File: `features/landing-page/components/hero-section.tsx`
  - Replace: `"Orchestrating code and rhythm into immersive digital experiences. Frontend Developer & Audio Enthusiast."`
  - With: `"Frontend Engineer at Fast 8 — building Bisadaya for thousands of jobseekers."`

- [ ] **T-202** [P1][S][S2] Add secondary CTA "Or jam with me →" (R-H4)
  - File: `features/landing-page/components/hero-section.tsx`
  - After transport bar, add ghost button linking to `#contact`
  - Style: text link with arrow icon, underline on hover

- [ ] **T-203** [P2][S][S2] Remove "New Release" rotated stamp from Hero
  - File: `features/landing-page/components/hero-section.tsx`
  - Find: `<motion.div ... className="absolute -top-4 -right-4 rotate-12 ... bg-red-600"`
  - Replace with: small version chip at top-right corner: `v2026.05`
  - Style: mono small text, less aggressive

### Skills Updates

- [ ] **T-210** [P1][M][S2] Add preset buttons to Skills mixer (R-S2)
  - File: `features/landing-page/components/skills-section.tsx`
  - Above mixer panel: 3 chips `[FRONTEND] [BACKEND] [DESIGN]`
  - Click triggers fader/knob animations to predefined positions
  - Add `MIXER_PRESETS` to `constants/index.ts`:
    ```ts
    export const MIXER_PRESETS = {
      frontend: { html: 95, css: 95, js: 95, ts: 95, react: 95, next: 95, ... },
      backend: { html: 50, css: 30, js: 80, ts: 75, react: 30, next: 30, go: 75, ... },
      design: { html: 90, css: 95, js: 70, figma: 95, ... },
    }
    ```

- [ ] **T-211** [P1][L][S2] Mobile horizontal scroll for mixer (R-S3)
  - Currently: mobile shows only `MIXER_DATA[0].channels.slice(-4)` (cut last 4 of 6)
  - Change: use `overflow-x-auto` on mixer container
  - All 6 fader visible via horizontal scroll
  - Add scroll snap for nicer feel: `snap-x snap-mandatory`

- [ ] **T-212** [P2][M][S2] Skill tooltip on hover/tap (R-S4)
  - Per skill, tooltip showing: "SINCE YYYY · USED IN N PROJECTS"
  - Add `since` and `usage` fields to `MIXER_DATA` channels
  - Use `@radix-ui/react-tooltip` or simple absolute-positioned div

### Experience Updates

- [ ] **T-220** [P1][S][S2] Extend EXPERIENCES constants with new fields (R-E1, R-E2)
  - File: `features/landing-page/constants/index.ts`
  - Add to ExperienceItem type:
    - `duration?: string` (e.g. "3y 7m")
    - `link?: string` (URL to artifact)
    - `current?: boolean` (mark currently active)
  - Populate for all 4 entries
  - Mark Fast 8 (id 1) with `current: true`

- [ ] **T-221** [P1][S][S2] Add ★ CURRENT badge in tracklist (R-E3)
  - File: `features/landing-page/components/experience-section.tsx`
  - Conditionally render badge next to role title when `exp.current === true`
  - Style: amber pill, mono small text "★ CURRENT"

- [ ] **T-222** [P2][S][S2] Add duration display in player detail (R-E1)
  - File: `features/landing-page/components/experience-section.tsx`
  - In selected job header, after period: `· 3y 7m`

- [ ] **T-223** [P2][S][S2] Add company link icon (R-E2)
  - In tracklist, when `exp.link` exists, add small external link icon
  - Click on icon opens link in new tab

### Projects Updates

- [ ] **T-230** [P1][S][S2] Extend PROJECTS_SHOWCASE with new fields (R-P1, R-P2)
  - File: `features/landing-page/constants/index.ts`
  - Add to `ProjectShowcaseItem`:
    - `metric?: string` (e.g. "10K+ visits", "Used by 3 enterprises")
    - `tech?: string[]` (replace hardcoded list)
    - `github?: string` (optional source link)
    - `role?: string` (e.g. "Solo dev", "FE Lead of 4")
  - Populate for all 6 entries (best-effort, can be empty if unknown)

- [ ] **T-231** [P1][M][S2] Add metric badge to project cards (R-P1)
  - File: `features/landing-page/components/projects-section.tsx`
  - Below project genre/year, add small badge with `metric` text
  - Style: mono small, amber accent if present, hidden if empty

- [ ] **T-232** [P1][M][S2] Dynamic tech stack in modal (R-P2)
  - File: `features/landing-page/components/projects-section.tsx`
  - Replace hardcoded `['React', 'Next.js', 'Tailwind', 'TypeScript']`
  - Use `selectedProject.tech || ['React', 'Next.js', 'Tailwind', 'TypeScript']` as fallback

- [ ] **T-233** [P1][M][S2] Sort/filter by genre (R-P3)
  - File: `features/landing-page/components/projects-section.tsx`
  - Above grid: chips derived from unique genres in PROJECTS_SHOWCASE
  - State: `selectedGenre = 'All'` default
  - Filter projects by genre or show all
  - Animate filtered grid with motion `layout`

- [ ] **T-234** [P2][S][S2] Total releases counter in header (R-P4)
  - File: `features/landing-page/components/projects-section.tsx`
  - Update header to: `Featured Releases · 06 RELEASES`

- [ ] **T-235** [P2][S][S2] GitHub source button in modal (R-P5)
  - When `selectedProject.github` exists, add second button next to "Listen to Track"
  - Icon: GitHub icon, label: "View Source"

### Contact Updates

- [ ] **T-240** [P1][M][S2] Surface preset chips in Contact UI (R-C2)
  - File: `features/landing-page/components/contact/contact-section.tsx`
  - Above launchpad grid: chips for each preset in `presets.ts`
  - Click triggers `playPreset(presetId)` (already implemented)
  - Style: mono labels, amber active state

- [ ] **T-241** [P1][S][S2] Subtle pulse on functional pads default (R-C3)
  - File: `features/landing-page/components/contact/contact-section.tsx`
  - For pads with `type: 'functional'`, add subtle CSS pulse animation
  - Should not be distracting, just hint at interactivity
  - Disable when looping (let LED pulse take over)

- [ ] **T-242** [P2][L][S2] Mobile pad sizing (R-C4)
  - Currently mobile is 4×6 grid, all 1×1
  - Change: functional pads (Email, GH, LI, Spotify, Resume) span 2 cells
  - Adjust mobile grid generation in `useMemo` block
  - Test on iPhone SE width (375px)

### Footer Updates

- [ ] **T-250** [P2][M][S2] Last commit badge (R-F1)
  - File: `features/layout/components/footer.tsx`
  - Create new server route `/api/last-commit` that fetches `https://api.github.com/repos/adityahimaone/next-portfolio-blog/commits?per_page=1`
  - Cache 1h via Next.js ISR (`export const revalidate = 3600`)
  - Display in footer: `Last shipped: 2 days ago · feat: redesign 2026`
  - Use `Intl.RelativeTimeFormat` for time delta

- [ ] **T-251** [P2][S][S2] Mini Now Playing strip (R-F2)
  - File: `features/layout/components/footer.tsx`
  - Bottom of footer, single line: `🎧 Currently spinning: <track>`
  - Use existing `/api/now-playing` endpoint
  - Hide if no track playing

---

## Sprint 3 — Visual Unification

### Color Migration

- [ ] **T-300** [P0][M][S3] Color audit: list all non-token color usage
  - Run grep:
    ```bash
    grep -rn "bg-purple\|bg-pink\|bg-blue-[45]00\|bg-orange\|bg-green-[45]00\|text-purple\|text-pink" features/ app/ components/
    ```
  - Save list to `docs/design-2026/color-audit.md`
  - Categorize: chrome (must change) vs content (vinyl colors, signal LEDs — keep)

- [ ] **T-301** [P0][L][S3] Migrate Experience section colors (R-G3)
  - File: `features/landing-page/components/experience-section.tsx`
  - Currently: `color: 'bg-purple-500/blue-500/pink-500/orange-500'` per experience item
  - Change: all neutral, but `accent amber` when selected
  - Spinning vinyl center: amber when selected, neutral otherwise

- [ ] **T-302** [P0][M][S3] Migrate About section colors (R-G3)
  - File: `features/landing-page/components/about/clips/*.tsx`
  - Replace track colors `text-blue-500/green-500/purple-500/amber-500` with neutral
  - Active clip indicator: amber accent
  - Status badges (OPERATIONAL etc): keep `--led-play` green (signal indicator, allowed)

- [ ] **T-303** [P0][M][S3] Migrate Skills section colors
  - File: `features/landing-page/components/skills-section.tsx`
  - Mixer corner LEDs (`bg-red-500`, `bg-yellow-500`, `bg-blue-500`) — keep as signal lights but remap to design tokens (`--led-rec`, `--led-solo`, `--led-mute`)

- [ ] **T-304** [P1][S][S3] Migrate Hero/Header signal indicators
  - File: `features/landing-page/components/hero-section.tsx`
  - Red pulse "LIVE SESSION" → keep but use `--led-rec` token
  - Amber LCD ticker → keep, already matches accent

### Typography Migration

- [ ] **T-310** [P1][M][S3] Set up display + mono fonts via next/font
  - File: `app/layout.tsx`
  - Import 3 fonts: display (Crimson Pro / Sentient), body (Inter), mono (JetBrains Mono)
  - Apply CSS vars: `--font-display`, `--font-body`, `--font-mono`
  - Update `app/globals.css` body to use `--font-body`

- [ ] **T-311** [P1][L][S3] Apply display font to all section H2 headings
  - Targets: hero `h1`, all section headings (`Featured Releases`, `Sonic Arsenal`, `The Workflow`, etc)
  - Use class: `font-display italic font-normal -tracking-[0.03em]`

- [ ] **T-312** [P1][M][S3] Apply mono font to all eyebrow labels & meta
  - Targets: section eyebrow labels (`◉ TRACKS`, `◉ AUDIO ENGINEERING`, etc), VST module labels, status indicators
  - Use class: `font-mono text-[11px] uppercase tracking-[0.16em]`

- [ ] **T-313** [P2][S][S3] Remove old Syne font (or keep as fallback)
  - File: `features/landing-page/components/hero-section.tsx`
  - Decide: remove Syne entirely, or keep as alt for Hero only
  - Recommendation: remove for consistency

### Section Dividers

- [ ] **T-320** [P1][L][S3] Implement musical section dividers (R-G4)
  - File: `components/section-divider.tsx`
  - Refactor to accept `variant` prop: `'cassette' | 'signal' | 'crossfade' | 'static'`
  - CSS-only animations (no motion library)
  - Each variant ~50-80px height
  - Examples in `design.md` Section 8

- [ ] **T-321** [P2][S][S3] Apply variants to landing page (R-G4)
  - File: `features/landing-page/views/landing-page.tsx`
  - Per `design.md` Section 8.2 mapping:
    - Hero → About: `signal`
    - About → Skills: `crossfade`
    - Skills → Experience: `signal`
    - Experience → Projects: `cassette`
    - Projects → Contact: `crossfade`

---

## Sprint 4 — Polish, Test, Ship

### Performance Final

- [ ] **T-400** [P0][M][S4] Convert images to AVIF/WebP
  - Files: `public/cover.jpg`, `public/nwjns.jpeg`, `public/Edge of Desire.jpg`, all `public/assets/*.png`
  - Use `cwebp` or `next/image` automatic optimization
  - Verify file sizes reduced 30-50%
  - Update `next.config.mjs` with `images.formats: ['image/avif', 'image/webp']` if not already

- [ ] **T-401** [P0][M][S4] Defer Tone.js via IntersectionObserver (R-C5)
  - File: `features/landing-page/components/contact/contact-section.tsx`
  - Currently `useAudioEngine` loads Tone immediately on component mount
  - Change: only load when ContactSection enters viewport (IntersectionObserver)
  - Show "Loading instruments..." during load
  - Verify: Tone.js NOT in initial bundle (bundle analyzer)

- [ ] **T-402** [P0][M][S4] Final Lighthouse pass
  - Run on staging: mobile + desktop
  - Target: mobile ≥ 85, desktop ≥ 95
  - Save report: `docs/design-2026/final-lighthouse.json`
  - Compare to baseline, document deltas in sprint report

- [ ] **T-403** [P1][S][S4] Bundle size verification (NFR-1, NFR-2)
  - Run `ANALYZE=true pnpm build`
  - Check first-load JS ≤ 180 KiB gzipped
  - Check first-load CSS ≤ 25 KiB gzipped
  - Document in `docs/design-2026/final-bundle.html`

### Accessibility Audit

- [ ] **T-410** [P0][M][S4] Audit all aria-label
  - Run grep: `grep -rn "aria-label" features/ app/ components/`
  - For each: verify label accurately describes element
  - Fix mismatches

- [ ] **T-411** [P0][M][S4] Keyboard navigation test
  - Tab through entire landing page
  - Verify: all interactive elements reachable
  - Verify: focus indicator visible (uses `--accent`)
  - Custom inputs (faders, knobs, pads) — add arrow key handlers

- [ ] **T-412** [P1][M][S4] Color contrast audit
  - Use Lighthouse accessibility scan
  - Verify all text meets WCAG AA (4.5:1)
  - Pay attention: `text-zinc-500` on `bg-zinc-900` — check with new amber
  - Fix failures

- [ ] **T-413** [P1][S][S4] Verify prefers-reduced-motion
  - DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
  - Reload site
  - Verify: no animations except essential

### Testing

- [ ] **T-420** [P0][M][S4] Manual cross-device test
  - iPhone SE simulator (375×667)
  - Pixel 6a simulator
  - Desktop 1280×800
  - Desktop 1920×1080
  - Verify: no layout broken, all interactive works

- [ ] **T-421** [P1][M][S4] Run full test suite
  - `pnpm test` — all green
  - `pnpm test:performance` — all green
  - Add new test: `tests/section-presence.test.ts` verifying all sections render

- [ ] **T-422** [P1][S][S4] Type check pass
  - `pnpm dlx tsc --noEmit` — zero errors

- [ ] **T-423** [P2][S][S4] Lint pass
  - `pnpm lint` — zero warnings (or document acceptable ones)

### Deploy & Document

- [ ] **T-430** [P0][M][S4] Deploy to staging
  - Push `design-2026/polish` branch
  - Run staging deploy
  - Verify production-like behavior
  - Smoke test all sections

- [ ] **T-431** [P0][M][S4] Production deploy
  - Merge `design-2026/polish` → `main`
  - Trigger production deploy via GitHub Actions
  - Monitor for 24h: errors, RUM metrics

- [ ] **T-432** [P1][S][S4] Update README
  - File: `README.md`
  - Add: "Design 2026" section linking to `docs/design-2026/`
  - Update screenshot

- [ ] **T-433** [P1][S][S4] Write sprint reports
  - Files: `docs/design-2026/reports/sprint-1.md` through `sprint-4.md`
  - Include: tasks closed, perf delta, lessons learned

- [ ] **T-434** [P2][S][S4] Update Hermes memory & save skill
  - Save learning: "Portfolio redesign 2026 approach worked — DAW preserved, single accent migration successful"
  - Update memory if any preferences crystalized

---

## Tracking Summary

**Total tasks**: ~70

**By priority**:
- P0: 22 (must-have, blockers)
- P1: 27 (should-have)
- P2: 19 (nice-to-have)

**By sprint**:
- Sprint 0: 4 tasks
- Sprint 1: 17 tasks
- Sprint 2: 21 tasks
- Sprint 3: 14 tasks
- Sprint 4: 14 tasks

**Effort estimate**: ~80-100 hours total (2-3 weeks full-time, 4 weeks part-time evenings/weekends)

---

## Notes

- Start each sprint by reading the corresponding `plan.md` section
- Update task status as you go (☐ → ⏳ → ✅)
- If task gets blocked, mark ❌ and add note inline
- If discovering new task, add to appropriate sprint with next available T-id
- Reference `requirements.md` R-id when committing (e.g. "feat: add live ticker (R-H2)")
