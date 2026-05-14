# Bugfix & Tech Debt Tracker 2026

> Known bugs, tech debt, dan issue yang ditemuin selama redesign.
> Live document — update saat nemu issue.

---

## 1. Critical Bugs (Found During Audit)

### B-001 — LCP element wrapped in motion delay
- **Severity**: P0 (blocker for perf goal)
- **File**: `features/landing-page/components/hero-section.tsx:85-103`
- **Issue**: `<motion.h1>ADITYA</motion.h1>` has `initial={{ opacity: 0 }}` + `transition={{ delay: baseDelay + 0.1 }}` where `baseDelay=1`. Effectively LCP element invisible for 1.1s minimum, plus motion paint cost.
- **Fix**: T-100 (replace with CSS animation)
- **Status**: ☐ todo

### B-002 — Preloader sessionStorage skip not verified
- **Severity**: P1
- **File**: `features/landing-page/animations/preloader.tsx:21-30`
- **Issue**: Skip path exists but unclear if exits in <100ms. Could still cause LCP delay on return visit.
- **Fix**: T-101 (add timing log, verify)
- **Status**: ☐ todo

### B-003 — Tone.js loaded in initial bundle
- **Severity**: P1
- **File**: `features/landing-page/spotify/use-audio-engine.tsx`
- **Issue**: `tone` library imported eagerly even though only Contact section uses it. Adds ~150 KiB to first-load.
- **Fix**: T-401 (defer via IntersectionObserver)
- **Status**: ☐ todo

### B-004 — Floating notes infinite Motion components
- **Severity**: P2
- **File**: `features/landing-page/views/landing-page.tsx:80-131`
- **Issue**: 3 `motion.div` with `repeat: Infinity` running on landing page render constantly. Wastes GPU and JS.
- **Fix**: T-131 (delete entirely)
- **Status**: ☐ todo

### B-005 — All sections dynamic without skeleton
- **Severity**: P1
- **File**: `features/landing-page/views/landing-page.tsx:20-25`
- **Issue**: 6 `dynamic()` imports without `loading` prop. Causes layout collapse → CLS spike.
- **Fix**: T-105 (add SectionSkeleton)
- **Status**: ☐ todo

---

## 2. High Tech Debt

### T-D-001 — about-section.tsx is 957 LOC
- **Severity**: P0
- **File**: `features/landing-page/components/about-section.tsx`
- **Issue**: Single component with all clip content inline. Hard to maintain, slow to compile, blocks lazy load granularity.
- **Fix**: T-120 (split into per-clip files)
- **Status**: ☐ todo

### T-D-002 — globals.css has 632 LOC, likely dead code
- **Severity**: P2
- **File**: `app/globals.css`
- **Issue**: 632 lines suggest legacy classes (`.vinyl-record`, `.music-wave`) that may not be used anywhere.
- **Fix**: T-112 (audit + prune, target < 400 LOC)
- **Status**: ☐ todo

### T-D-003 — Hardcoded project tech stack
- **Severity**: P2
- **File**: `features/landing-page/components/projects-section.tsx:191-200`
- **Issue**: `['React', 'Next.js', 'Tailwind', 'TypeScript']` hardcoded for ALL projects. Misleading — different projects use different stacks.
- **Fix**: T-232 (use dynamic per-project from `tech` field)
- **Status**: ☐ todo

### T-D-004 — Skill duplication across sections
- **Severity**: P1
- **Files**: 
  - `features/landing-page/components/about-section.tsx` (Track 2 - STACK)
  - `features/landing-page/components/skills-section.tsx`
  - `features/landing-page/components/about-section.tsx` (in IDENTITY clip "Core Modules")
- **Issue**: Same skill data appears 3 times in different visualizations. User confused which is canonical.
- **Fix**: T-121 (drop STACK from About, keep Skills section + IDENTITY summary only)
- **Status**: ☐ todo

### T-D-005 — Section colors inconsistent
- **Severity**: P1
- **Files**: experience-section, about-section, skills-section
- **Issue**: 5+ accent colors used (purple, pink, blue, orange, amber, green). No design system rationale.
- **Fix**: T-300-304 (single amber accent migration)
- **Status**: ☐ todo

### T-D-006 — Mobile mixer cuts faders
- **Severity**: P1
- **File**: `features/landing-page/components/skills-section.tsx:297-305`
- **Issue**: Mobile shows only `MIXER_DATA[0].channels.slice(-4)` (last 4 of 6). Story breaks — user thinks Adit only knows 4 languages.
- **Fix**: T-211 (horizontal scroll, all 6 visible)
- **Status**: ☐ todo

---

## 3. Medium Tech Debt

### T-D-010 — `@next/mdx` version mismatch
- **Severity**: P2
- **File**: `package.json`
- **Issue**: `@next/mdx@14.2.13` while Next.js is `15.1.11`. Could cause subtle bugs.
- **Fix**: T-103 / bump to ^15.1.11
- **Status**: ☐ todo

### T-D-011 — `next.config.ts` empty
- **Severity**: P2
- **File**: `next.config.ts`
- **Issue**: File is 0 bytes / empty. There's also `next.config.mjs`. Unclear which one Next reads.
- **Fix**: Delete `next.config.ts`, keep `.mjs`. Or vice versa, but need single source.
- **Status**: ☐ todo

### T-D-012 — TypeScript target ES2017
- **Severity**: P1
- **File**: `tsconfig.json`
- **Issue**: ES2017 target ships polyfills for modern browsers that already support ES2022. ~11 KiB waste.
- **Fix**: T-102 (target ES2022)
- **Status**: ☐ todo

### T-D-013 — Hardcoded "MODEL NO. AH-2026-MKIII"
- **Severity**: P3
- **File**: `features/landing-page/components/about-section.tsx`
- **Issue**: Specific model number hardcoded in JSX. If lu update version, harus edit string.
- **Fix**: Move to constant or computed from package.json version
- **Status**: ☐ todo

### T-D-014 — Memoji used inconsistently
- **Severity**: P3
- **File**: `public/memoji-1.png`
- **Issue**: Memoji file exists but unclear where used. Search for `memoji-1.png` import:
  ```bash
  grep -rn "memoji" features/ app/ components/
  ```
- **Fix**: Either use prominently somewhere, or remove file
- **Status**: ☐ todo (audit needed)

### T-D-015 — Multiple background components unused
- **Severity**: P3
- **Files**: `components/*-background.tsx`
- **List of background components**:
  - `aurora-background.tsx`
  - `circular-equalizer-background.tsx`
  - `equalizer-background.tsx`
  - `flowing-lines-background.tsx`
  - `grid-distortion-background.tsx`
  - `hexagon-wave-background.tsx`
  - `oscilloscope-background.tsx`
  - `retro-grid-background.tsx`
  - `rhythm-background.tsx`
- **Issue**: 9 background variant components — likely most are unused experimentation. Adds repo bloat.
- **Fix**: Audit usage, delete unused. Move kept ones to `features/landing-page/spotify/` (where MusicBackground already lives).
- **Status**: ☐ todo

### T-D-016 — Spotify auth flow scattered
- **Severity**: P3
- **Files**: 
  - `app/api/spotify-auth/route.ts`
  - `app/api/callback/route.ts`
  - `app/api/now-playing/route.ts`
  - `app/spotify-setup/page.tsx`
- **Issue**: Spotify integration spread across 4 places. Could consolidate to a feature folder `features/spotify-integration/`.
- **Fix**: Optional refactor, not blocking redesign
- **Status**: ⏸ paused (not in scope)

---

## 4. Low Priority Tech Debt

### T-D-020 — Test coverage thin
- **Severity**: P3
- **Files**: `tests/`
- **Issue**: Only 2-3 tests exist (`performance-bug-condition`, `performance-preservation`). No component-level tests.
- **Fix**: Add component tests in Sprint 4 (T-421)
- **Status**: ☐ todo

### T-D-021 — `.deploy-trigger-*` files
- **Severity**: P3
- **Files**: `.deploy-trigger-20260502-022626`, `deploy-test.txt`, `dev-deploy-test2.txt`, `test-notify.txt`
- **Issue**: Trigger files shouldn't be committed to repo
- **Fix**: Move to `.gitignore`, delete tracked instances
- **Status**: ☐ todo

### T-D-022 — `analyze/nodejs.html` committed
- **Severity**: P3
- **File**: `analyze/nodejs.html`
- **Issue**: Bundle analyzer output should not be in repo
- **Fix**: Add `analyze/` to `.gitignore`
- **Status**: ☐ todo

### T-D-023 — Duplicate `morphing-dialog.tsx` and `slider.tsx` in components/
- **Severity**: P3
- **Files**: `components/morphing-dialog.tsx`, `components/slider.tsx`
- **Issue**: Top-level components — usage unclear. Slider also exists in features.
- **Fix**: Audit usage, either keep at top (truly shared) or move to feature folder
- **Status**: ☐ todo

---

## 5. Accessibility Issues

### A-001 — Custom inputs (faders, knobs) lack keyboard nav
- **Severity**: P1
- **Files**: `features/landing-page/components/skills-section.tsx`, `features/landing-page/components/contact/contact-section.tsx`
- **Issue**: Faders/knobs draggable via mouse but no arrow key support. Pads only respond to click, not Enter/Space.
- **Fix**: T-411 (add `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, arrow key handlers)
- **Status**: ☐ todo

### A-002 — `prefers-reduced-motion` not honored globally
- **Severity**: P1
- **File**: `app/globals.css`
- **Issue**: No media query override. Users with motion sensitivity see all animations full speed.
- **Fix**: T-104 (add global override)
- **Status**: ☐ todo

### A-003 — Color contrast unverified
- **Severity**: P1 (after color migration)
- **Files**: All sections
- **Issue**: New amber accent on dark surface needs WCAG AA verification. Some `text-zinc-500` on `bg-zinc-900` may fail.
- **Fix**: T-412 (Lighthouse a11y audit + manual check)
- **Status**: ☐ todo

### A-004 — Some `aria-label` may be inaccurate
- **Severity**: P2
- **Files**: Various
- **Issue**: e.g. `aria-label={isPlaying ? 'Pause Session' : 'Play Session'}` — good. But others like `aria-label={`Pad ${pad.id}`}` use ID which might be `dummy-3-2` — unhelpful.
- **Fix**: T-410 (audit and improve labels)
- **Status**: ☐ todo

### A-005 — Modal dialogs may not trap focus
- **Severity**: P2
- **Files**: 
  - `features/landing-page/components/about-section.tsx` (DetailWindow)
  - `features/landing-page/components/projects-section.tsx` (Project modal)
- **Issue**: Modal opens but Tab can leave the modal. Should focus-trap.
- **Fix**: Use Radix Dialog or implement focus trap manually
- **Status**: ☐ todo

---

## 6. Performance Bugs

### P-001 — `useAudioFrequency` hook called even if audio not playing
- **Severity**: P3
- **File**: `features/landing-page/components/hero-section.tsx:28`
- **Issue**: `const frequencyData = useAudioFrequency(audioRef.current)` runs always. The `ReactiveVisualizer` is dead code (`{false && isPlaying && ...}`) — hook should be conditional.
- **Fix**: Remove `useAudioFrequency` call from Hero (visualizer disabled)
- **Status**: ☐ todo

### P-002 — Images not optimized
- **Severity**: P1
- **Files**: `public/*.jpg`, `public/*.png`, `public/assets/*.png`
- **Issue**: PNG/JPG without AVIF/WebP variants
- **Fix**: T-400 (convert via cwebp or Squoosh)
- **Status**: ☐ todo

### P-003 — Multiple bundle entry for similar functionality
- **Severity**: P2
- **Files**: 9 background components in `components/`
- **Issue**: Each background-tsx file pulls into its own chunk if imported. Likely never bundled because unused.
- **Fix**: Audit usage, delete unused (T-D-015)
- **Status**: ☐ todo

### P-004 — Heavy initial CSS
- **Severity**: P2
- **File**: `app/globals.css` (632 LOC)
- **Issue**: All CSS shipped on every page even though some classes only apply to landing
- **Fix**: T-112 (audit) + Next.js automatic critical CSS
- **Status**: ☐ todo

---

## 7. Visual Bugs

### V-001 — Hero "New Release" stamp clips on small screens
- **Severity**: P2
- **File**: `features/landing-page/components/hero-section.tsx:217-228`
- **Issue**: Absolute-positioned stamp at `-top-4 -right-4` may be clipped on viewport <320px
- **Fix**: T-203 (replace with version chip, less prone to clipping)
- **Status**: ☐ todo

### V-002 — Mixer mobile layout cramped
- **Severity**: P2
- **File**: `features/landing-page/components/skills-section.tsx`
- **Issue**: At 375px width, mixer panels stack but inner padding too tight
- **Fix**: T-211 (mobile redesign with horizontal scroll)
- **Status**: ☐ todo

### V-003 — DAW timeline overflow on mobile
- **Severity**: P2
- **File**: `features/landing-page/components/about-section.tsx` (TimeRuler line 43-57)
- **Issue**: `min-w-[800px]` forces horizontal scroll on mobile but no scroll indicator
- **Fix**: Add scroll hint or rethink mobile DAW layout
- **Status**: ☐ todo

### V-004 — Project card vinyl partially hidden behind sleeve
- **Severity**: P3
- **File**: `features/landing-page/components/projects-section.tsx:62-82`
- **Issue**: Vinyl record slides out from behind sleeve on hover, but on mobile (no hover) vinyl stays hidden — discovery problem
- **Fix**: Add tap interaction for mobile (active state instead of hover)
- **Status**: ☐ todo (probably cover via existing `group-active:translate-x-[50%]`)

### V-005 — Section dividers look static/dead
- **Severity**: P3
- **File**: `components/section-divider.tsx`
- **Issue**: Static divider doesn't match musical theme of rest of site
- **Fix**: T-320 (musical variants)
- **Status**: ☐ todo

---

## 8. Content Bugs

### C-001 — Hero subtitle generic
- **Severity**: P1
- **File**: `features/landing-page/components/hero-section.tsx:106-110`
- **Issue**: "Orchestrating code and rhythm into immersive digital experiences" — sounds like AI wrote it
- **Fix**: T-201 (specific copy)
- **Status**: ☐ todo

### C-002 — Marquee phrases generic
- **Severity**: P2
- **File**: `features/landing-page/spotify/music-marquee.tsx:28-39`
- **Issue**: "WHERE CODE MEETS RHYTHM", "FRONTEND SYMPHONIES" — cliche metaphors
- **Fix**: Replace with personal/topical phrases (`story-map.md` Section 4.2)
- **Status**: ☐ todo

### C-003 — Project description first sentence too long for card
- **Severity**: P3
- **File**: `features/landing-page/constants/index.ts:223-294`
- **Issue**: Project descriptions ~30-50 words. Card displays only 1 line. Modal shows full but card preview cut off mid-sentence.
- **Fix**: Add `tagline?: string` field per project (1-line summary)
- **Status**: ☐ todo

### C-004 — Experience descriptions inconsistent voice
- **Severity**: P3
- **File**: `features/landing-page/constants/index.ts:101-177`
- **Issue**: Some bullets start "Led the development", others "Spearheaded", others "Maintained" — voice inconsistent
- **Fix**: Normalize to action-verb led, past tense, ≤ 12 words
- **Status**: ☐ todo

### C-005 — Some projects missing `metric` (impact)
- **Severity**: P2
- **File**: `features/landing-page/constants/index.ts`
- **Issue**: After T-230 add `metric` field, may not have data for all 6 projects
- **Fix**: Make optional. For projects without metric, hide badge gracefully.
- **Status**: ☐ todo (depends on T-230)

---

## 9. Build/Deploy Bugs

### D-001 — Multiple deploy trigger files in repo
- **Severity**: P3
- **Files**: `.deploy-trigger-20260502-022626`, `deploy-test.txt`, `test-notify.txt`, `dev-deploy-test2.txt`
- **Issue**: Files used to trigger deploys committed to repo
- **Fix**: Add to `.gitignore`, remove from history (or just untrack)
- **Status**: ☐ todo

### D-002 — Two next.config files
- **Severity**: P2
- **Files**: `next.config.ts`, `next.config.mjs`
- **Issue**: Both exist. Next.js will use one, but unclear which. Risk of misconfig.
- **Fix**: Keep one, delete other. Verify behavior unchanged.
- **Status**: ☐ todo

### D-003 — `analyze/` folder committed
- **Severity**: P3
- **File**: `analyze/nodejs.html`
- **Issue**: Bundle analyzer output should not be tracked
- **Fix**: Add `/analyze/` to `.gitignore`
- **Status**: ☐ todo

---

## 10. Discovered During Implementation

> Add new bugs/debt here as found during sprint execution.

### (template)
### B-XXX — Title
- **Severity**: PX
- **File**: `path/to/file.tsx:LINE`
- **Issue**: Description
- **Fix**: Solution / task ID
- **Found by**: Adit / Hermes / user
- **Status**: ☐ todo

---

## 11. Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P0 | Blocks ship; functional broken | Fix in current sprint |
| P1 | Major degradation, must fix before ship | Fix in current or next sprint |
| P2 | Noticeable issue, should fix | Fix within 2 sprints |
| P3 | Minor / cosmetic | Backlog, fix when convenient |

---

## 12. Issue Triage Process

1. Discover issue (during dev, audit, user report)
2. Add entry here with template above
3. Assign severity
4. Link to related task in `tasks.md` (if exists) or create new task
5. Update status as work progresses
6. Mark `✅ done` when resolved + reference fix commit

Don't let this doc go stale — every PR should update at least 1 entry here (close existing or note new).
