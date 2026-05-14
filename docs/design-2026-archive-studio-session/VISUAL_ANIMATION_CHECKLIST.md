# Visual & Animation Tasks Checklist — Design 2026

## Sprint 1 — Foundation & Performance

### Design Tokens Setup
- [x] **T-110** [P0][M][S1] Create design tokens in globals.css
  - CSS custom properties added for surfaces, text, borders, accents
  - Both dark and light mode defined
  - Status: ✅ DONE

### Quick Wins
- [x] **T-130** [P0][S][S1] Update mixer label "2025" → "2026"
  - File: `features/landing-page/components/skills-section.tsx` line 205
  - Status: ✅ DONE

- [x] **T-131** [P0][S][S1] Remove floating notes background
  - File: `features/landing-page/views/landing-page.tsx`
  - Removed 3 `<m.div>` blocks with ♫, ♩, ♬ animations
  - Removed unused `floatingOpacity` variable
  - Status: ✅ DONE

- [x] **T-132** [P1][S][S1] Hero "MODEL NO. AH-2026-MKIII" cleanup
  - Decision: Keep in About section (more context)
  - Currently only in `features/landing-page/components/about-section.tsx`
  - Status: ✅ DECISION MADE (no code change needed)

---

## Sprint 2 — Story Tightening

### Hero Updates
- [x] **T-201** [P1][S][S2] Hero subtitle copy update
  - File: `features/landing-page/components/hero-section.tsx` line 106-109
  - Changed: "Orchestrating code and rhythm..." → "Frontend Engineer at Fast 8 — building Bisadaya..."
  - Status: ✅ DONE

- [x] **T-202** [P1][S][S2] Add secondary CTA "Or jam with me →"
  - File: `features/landing-page/components/hero-section.tsx` after transport bar
  - Added motion.a with arrow animation on hover
  - Links to #contact
  - Status: ✅ DONE

- [x] **T-203** [P2][S][S2] Remove "New Release" rotated stamp from Hero
  - File: `features/landing-page/components/hero-section.tsx` line 217-229
  - Replaced aggressive red badge with subtle version chip "v2026.05"
  - Positioned top-right corner, mono font, muted color
  - Status: ✅ DONE

- [ ] **T-200** [P1][M][S2] Live Now Playing ticker in Hero
  - Requires API integration (fetch `/api/now-playing`)
  - Status: ⏳ PENDING (logic task, not pure visual)

### Skills Updates
- [ ] **T-210** [P1][M][S2] Add preset buttons to Skills mixer
  - Above mixer panel: 3 chips `[FRONTEND] [BACKEND] [DESIGN]`
  - Click triggers fader/knob animations
  - Status: ⏳ PENDING

- [ ] **T-211** [P1][L][S2] Mobile horizontal scroll for mixer
  - Change mobile from slice(-4) to full overflow-x-auto
  - Add scroll snap
  - Status: ⏳ PENDING

- [ ] **T-212** [P2][M][S2] Skill tooltip on hover/tap
  - Per skill: "SINCE YYYY · USED IN N PROJECTS"
  - Status: ⏳ PENDING

### Experience Updates
- [ ] **T-220** [P1][S][S2] Extend EXPERIENCES constants with new fields
  - Add: `duration`, `link`, `current` fields
  - Status: ⏳ PENDING

- [ ] **T-221** [P1][S][S2] Add ★ CURRENT badge in tracklist
  - Conditional render when `exp.current === true`
  - Status: ⏳ PENDING

- [ ] **T-222** [P2][S][S2] Add duration display in player detail
  - Status: ⏳ PENDING

- [ ] **T-223** [P2][S][S2] Add company link icon
  - Status: ⏳ PENDING

### Projects Updates
- [ ] **T-230** [P1][S][S2] Extend PROJECTS_SHOWCASE with new fields
  - Add: `metric`, `tech`, `github`, `role`
  - Status: ⏳ PENDING

- [ ] **T-231** [P1][M][S2] Add metric badge to project cards
  - Status: ⏳ PENDING

- [ ] **T-232** [P1][M][S2] Dynamic tech stack in modal
  - Status: ⏳ PENDING

- [ ] **T-233** [P1][M][S2] Sort/filter by genre
  - Status: ⏳ PENDING

- [ ] **T-234** [P2][S][S2] Total releases counter in header
  - Status: ⏳ PENDING

- [ ] **T-235** [P2][S][S2] GitHub source button in modal
  - Status: ⏳ PENDING

### Contact Updates
- [ ] **T-240** [P1][M][S2] Surface preset chips in Contact UI
  - Status: ⏳ PENDING

- [ ] **T-241** [P1][S][S2] Subtle pulse on functional pads default
  - Status: ⏳ PENDING

- [ ] **T-242** [P2][L][S2] Mobile pad sizing
  - Status: ⏳ PENDING

### Footer Updates
- [ ] **T-250** [P2][M][S2] Last commit badge
  - Status: ⏳ PENDING

- [ ] **T-251** [P2][S][S2] Mini Now Playing strip
  - Status: ⏳ PENDING

---

## Sprint 3 — Visual Unification

### Color Migration
- [ ] **T-300** [P0][M][S3] Color audit: list all non-token color usage
  - Status: ⏳ PENDING

- [ ] **T-301** [P0][L][S3] Migrate Experience section colors
  - Status: ⏳ PENDING

- [ ] **T-302** [P0][M][S3] Migrate About section colors
  - Status: ⏳ PENDING

- [ ] **T-303** [P0][M][S3] Migrate Skills section colors
  - Status: ⏳ PENDING

- [ ] **T-304** [P1][S][S3] Migrate Hero/Header signal indicators
  - Status: ⏳ PENDING

### Typography Migration
- [ ] **T-310** [P1][M][S3] Set up display + mono fonts via next/font
  - Status: ⏳ PENDING

- [ ] **T-311** [P1][L][S3] Apply display font to all section H2 headings
  - Status: ⏳ PENDING

- [ ] **T-312** [P1][M][S3] Apply mono font to all eyebrow labels & meta
  - Status: ⏳ PENDING

- [ ] **T-313** [P2][S][S3] Remove old Syne font
  - Status: ⏳ PENDING

### Section Dividers
- [ ] **T-320** [P1][L][S3] Implement musical section dividers
  - Variants: `cassette`, `signal`, `crossfade`, `static`
  - Status: ⏳ PENDING

- [ ] **T-321** [P2][S][S3] Apply variants to landing page
  - Status: ⏳ PENDING

---

## Summary

**Completed (Sprint 1-2)**: 6 tasks
- T-110, T-130, T-131, T-132, T-201, T-202, T-203

**Pending (Sprint 2-3)**: 28+ tasks
- Skills mixer enhancements (T-210-212)
- Experience/Projects/Contact updates (T-220-242)
- Color migration (T-300-304)
- Typography setup (T-310-313)
- Section dividers (T-320-321)

**Next Priority**: T-210-212 (Skills mixer visual enhancements)

---

**Last Updated**: 2026-05-14 14:38 UTC
**Branch**: `redesign-2026`
**Status**: In Progress
