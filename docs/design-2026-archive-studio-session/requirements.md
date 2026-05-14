# Requirements — Design 2026

> Goals, constraints, dan acceptance criteria untuk portfolio redesign 2026.

---

## 1. Vision Statement

Portfolio Adit harus jadi **studio session yang konsisten** — bukan kumpulan section dengan metaphor music yang tabrakan. User harus inherit "studio world" sejak hero sampai footer, dengan story yang mengalir kayak side A album: ada intro, ada climax, ada outro.

**Tagline 2026:** "Frontend Engineer at Fast 8 — orchestrating code like a producer, building Bisadaya for thousands of jobseekers."

## 2. Primary Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G1 | Lighthouse Performance 85+ on mobile, 95+ on desktop | Verified via PageSpeed Insights production URL |
| G2 | LCP < 2.5s mobile, < 1.5s desktop | Lab data + RUM data after 7 days |
| G3 | CLS < 0.05 site-wide | All sections (with `dynamic()` import) have skeleton |
| G4 | Single visual language across sections | Color audit: 1 accent, signal lights only as exceptions |
| G5 | No story duplication across sections | Skills appear in 1 section only (Skills/Mixer) |
| G6 | Mobile-first usable | All interactive elements ≥ 44×44px touch target |
| G7 | Accessible | WCAG 2.1 AA compliance, prefers-reduced-motion respected |
| G8 | Memorable interactive moment per section | At least 1 "wow" interaction per section, intentional not random |

## 3. Non-Goals

Things gw secara sengaja **tidak** target di rilis ini:

- ❌ Three.js / WebGL hero
- ❌ Internationalization (Indonesian + English versions)
- ❌ CMS migration (content tetap di-codify)
- ❌ Backend changes (Spotify/GitHub API integration tetap pake yang existing)
- ❌ Blog redesign (out of scope, focus ke landing)
- ❌ Pivot ke non-music theme (DAW metaphor adalah moat, jangan dibuang)

## 4. Constraints

### 4.1 Hard Constraints (cannot be violated)

- **C1: DAW shell preservation** — About section "The Workflow" parent DAW interface (timeline, tracks, clips, playhead, mute/solo) tidak boleh diganti. Hanya inner content yang boleh refactor. Per memory note 2026-04 prefs.
- **C2: Tech stack frozen** — Next.js 15.1, React 19, Tailwind v4, Motion 12. Tidak nambah framework baru.
- **C3: No external CMS** — Content tetap di `features/landing-page/constants/index.ts` dan `content/blog/*.md`.
- **C4: VPS deployment compatibility** — Output harus bisa deploy ke VPS via PM2 + Nginx (current infra).
- **C5: Bundle size budget** — JS first-load max 180 KiB (gzipped), CSS max 25 KiB (gzipped).

### 4.2 Soft Constraints (preferred, can be negotiated)

- **C6: Tone.js retained** — Launchpad section pake Tone. Boleh di-defer load tapi jangan dibuang.
- **C7: Motion library kept** — Pake `motion` (formerly framer-motion). Migration ke vanilla GSAP tidak diizinkan kecuali ada gain perf signifikan.
- **C8: Existing data structure** — `EXPERIENCES`, `PROJECTS_SHOWCASE`, `MIXER_DATA` boleh di-extend (tambah field), tapi struktur dasarnya tetap.

## 5. Functional Requirements

### 5.1 Hero Section
- **R-H1**: LCP element (`<h1>` "ADITYA") harus paint dalam < 2s mobile
- **R-H2**: Now Playing ticker harus pull live data dari Spotify API (`/api/now-playing`), fallback ke "Standby" kalo API fail atau no track
- **R-H3**: Subtitle copy harus spesifik (mention current company), bukan generic "orchestrating code"
- **R-H4**: Secondary CTA "Or jam with me →" yang scroll ke `#contact`
- **R-H5**: Hero harus tetap interactive (Play/Pause audio button kept), tapi animation entry tidak boleh delay LCP element

### 5.2 About Section ❗DAW-PRESERVE
- **R-A1**: Refactor dari 4 track → 3 track (drop "STACK" track yang duplicate Skills)
- **R-A2**: 3 tracks final: IDENTITY, NOW_PLAYING (current activity), METRICS
- **R-A3**: Clip content harus split per file di `features/landing-page/components/about/clips/`
- **R-A4**: Playhead harus visually sync ke clip yang aktif (sekarang playhead jalan random ga sync)
- **R-A5**: Total file size `about-section.tsx` harus < 250 LOC (sekarang 957)

### 5.3 Skills Section
- **R-S1**: Label "MIX-MASTER 2025" → "MIX-MASTER 2026"
- **R-S2**: Tambah preset buttons: `[FRONTEND] [BACKEND] [DESIGN]` yang animate fader/knob ke posisi sesuai role
- **R-S3**: Mobile: horizontal scroll mixer (drag-to-pan), bukan cut 4 fader
- **R-S4**: Hover/tap fader/knob: tooltip dengan "SINCE YYYY · USED IN N PROJECTS"

### 5.4 Experience Section
- **R-E1**: Field `duration` per experience ("2y 4m") di constants
- **R-E2**: Field `link` per experience (link to artifact: company / project demo)
- **R-E3**: Badge `★ CURRENT` untuk experience dengan period yang masih "PRESENT"
- **R-E4**: Tracklist selector behavior tetap, tapi current job di-default selected on load

### 5.5 Projects Section
- **R-P1**: Field `metric` per project (1 line: "10K visits", "Used by 3 enterprises", etc)
- **R-P2**: Field `tech` per project (array of tech names) — replace hardcoded `['React', 'Next.js', 'Tailwind', 'TypeScript']` di modal
- **R-P3**: Sort/filter by `genre` di top section (chips: All / Web3 / Corporate / Productivity / etc)
- **R-P4**: Total release counter di header: "06 RELEASES"
- **R-P5**: Modal harus include: live demo link button (existing) + GitHub source link (new, optional field)

### 5.6 Contact Section
- **R-C1**: Pre-tease CTA di Hero (R-H4)
- **R-C2**: Preset buttons di UI (sekarang udah ada di data tapi belum di-surface)
- **R-C3**: Functional pads (Email/GH/LI/Spotify/Resume) harus ada subtle pulse default
- **R-C4**: Mobile: functional pads span 2 cells, dummy pads tetap 1 cell
- **R-C5**: Tone.js library harus deferred load (IntersectionObserver) — tidak masuk first-load bundle

### 5.7 Footer
- **R-F1**: "Last commit" badge yang pull dari GitHub API repo `next-portfolio-blog`
- **R-F2**: Mini Now Playing (1 line) yang mirror Spotify status

### 5.8 Global / Cross-cutting
- **R-G1**: `prefers-reduced-motion` global override di `globals.css`
- **R-G2**: Floating notes ♫ ♩ ♬ background dihapus (visual noise, perf cost)
- **R-G3**: Single accent color system: amber (#FF6B35) untuk semua active state
- **R-G4**: Section dividers diganti dari static ke musical transition (cassette rewind, signal flow)
- **R-G5**: All `dynamic()` imports harus punya `loading: () => <SectionSkeleton />`

## 6. Non-Functional Requirements

### 6.1 Performance
- **NFR-1**: First-load JS ≤ 180 KiB gzipped
- **NFR-2**: First-load CSS ≤ 25 KiB gzipped
- **NFR-3**: Lighthouse Performance ≥ 85 mobile, ≥ 95 desktop
- **NFR-4**: LCP ≤ 2.5s mobile (4G throttled), ≤ 1.5s desktop
- **NFR-5**: CLS ≤ 0.05 site-wide
- **NFR-6**: TBT ≤ 200ms mobile
- **NFR-7**: INP ≤ 200ms (interaction to next paint)

### 6.2 Accessibility
- **NFR-8**: Color contrast WCAG 2.1 AA (4.5:1 normal text, 3:1 large text)
- **NFR-9**: All interactive elements keyboard-navigable
- **NFR-10**: All `aria-label` accurate (audit existing labels first)
- **NFR-11**: `prefers-reduced-motion` respected globally
- **NFR-12**: All custom inputs (faders, knobs, pads) have keyboard alternative

### 6.3 Browser Support
- Per `package.json` browserslist:
  - Chrome ≥ 109
  - Edge ≥ 109
  - Firefox ≥ 110
  - Safari ≥ 16
  - Not dead

### 6.4 Device Support
- **NFR-13**: Tested on iPhone SE 2 (smallest modern viewport, 375×667)
- **NFR-14**: Tested on mid-range Android (Pixel 6a or equivalent)
- **NFR-15**: Tested on desktop 1280×800 (smallest common laptop)
- **NFR-16**: Tested on desktop 1920×1080 and 2560×1440

## 7. Acceptance Criteria

Redesign dianggap "done" kalo semua poin di bawah lulus:

### 7.1 Performance Gate
- [ ] Lighthouse mobile Performance ≥ 85 (verified production URL)
- [ ] Lighthouse desktop Performance ≥ 95
- [ ] No "Reduce unused JavaScript" warning > 30 KiB
- [ ] No "Eliminate render-blocking resources" warning
- [ ] Bundle analyzer: no chunk > 80 KiB gzipped

### 7.2 Visual Gate
- [ ] Color audit: only amber (#FF6B35) used as accent across sections
- [ ] Section spacing follows token system (`docs/design-2026/tokens.md`)
- [ ] Typography: H1/H2 use display font, meta/labels use mono font
- [ ] No floating decorative emoji background
- [ ] Section dividers transition with musical metaphor

### 7.3 Story Gate
- [ ] Skills mentioned in 1 section only (Skills/Mixer)
- [ ] Each section has section-specific copy (no generic placeholder)
- [ ] Hero subtitle mentions current company
- [ ] Experience badge `★ CURRENT` displayed on Fast 8 entry
- [ ] Projects modal shows project-specific tech stack (not hardcoded)

### 7.4 Functionality Gate
- [ ] Now Playing live data working (test with active Spotify session)
- [ ] Now Playing fallback working (when no track playing)
- [ ] Contact launchpad still triggers sound (Tone.js loaded on demand)
- [ ] Skills preset buttons animate faders/knobs to expected positions
- [ ] Projects sort/filter by genre works
- [ ] All `aria-label` accurate (manual audit pass)

### 7.5 Quality Gate
- [ ] Zero console errors in production build
- [ ] Zero TypeScript errors
- [ ] All Jest tests passing
- [ ] About section file ≤ 250 LOC
- [ ] No `tone.js` in first-load bundle (verified via bundle analyzer)

## 8. Out-of-Scope (For This Spec)

Hal-hal di bawah ada di backlog tapi tidak masuk milestone redesign 2026:

- Internationalization (Bahasa Indonesia version)
- Blog post layout redesign
- New blog content
- Newsletter / RSS subscription feature
- Comment system
- Search functionality
- Recording mode di Contact (capture sequence + shareable link) — moved to backlog
- Audio glue (Tone.js section automation) — moved to backlog
- 3D visualization apa pun

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Refactor about-section bikin regression visual | Medium | High | Snapshot test sebelum refactor, side-by-side compare di staging |
| Tone.js deferred load break Contact section | Low | High | Feature flag, gradual rollout, fallback static UI |
| Color migration touch banyak file | High | Medium | Centralized via tokens.md, search-and-replace systematic |
| Performance regression dari new fonts | Medium | Medium | Use `next/font` (already done for Syne), `font-display: swap` |
| Mobile mixer scroll break landscape orientation | Low | Low | Test on iPad mini landscape, fallback to compact view |
| GitHub API rate limit (footer last-commit) | Medium | Low | Cache 1h via Next.js ISR, fallback to "Recently updated" string |

## 10. Dependencies

### Internal (within repo)
- `perf-fix-plan.md` (existing) — most P1-P6 fixes overlap with this spec
- `redesign-2026.md` (existing) — high-level vision

### External
- Spotify API access (existing setup, lu udah punya callback flow)
- GitHub API access (read-only, public repos, no auth needed)
- Vercel/VPS deployment access

## 11. Stakeholders

- **Owner**: Adit (Aditya Himawan)
- **Implementer**: Adit + Hermes (CLI agent assist)
- **Reviewer**: Adit
- **End user**: Recruiters, fellow devs, freelance clients
