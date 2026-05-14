# Plan — Execution Strategy 2026

> Sprint roadmap, milestones, dependencies. Companion: `tasks.md` (granular).

---

## 1. Approach Philosophy

**80% refine, 20% remove.** Portfolio existing udah punya identitas kuat. Goal redesign ini bukan "ulang dari nol" tapi:

1. **Tighten the story** — buang duplikasi, sharpen narrative per section
2. **Unify visual language** — single accent, consistent typography, less skeumorphic chrome
3. **Fix performance** — LCP, bundle size, animation budget
4. **Polish interaction** — every interactive element harus *intentional*

**Order of operations**: Performance foundation FIRST, then story tighten, then visual polish. Kenapa? Karena perf fix touch banyak file, kalo dilakuin di akhir bisa break visual yang udah polished.

---

## 2. Sprint Plan (4 weeks)

### Sprint 0 — Pre-flight (½ day)
**Goal**: Foundation safety nets sebelum mulai ngubah apa pun.

- Backup branch: `backup/pre-redesign-2026`
- Run `pnpm build && ANALYZE=true pnpm build` — capture baseline bundle size
- Run Lighthouse on production, capture baseline metrics → save to `docs/design-2026/baseline.json`
- Take visual snapshots (browser_vision or screenshot) per section
- Confirm test runner working: `pnpm test`

### Sprint 1 — Foundation & Performance (Week 1)
**Goal**: Fix LCP, reduce bundle, establish design tokens.

**Themes**:
- Performance P1-P3 (LCP, polyfills, render-blocking CSS)
- Design tokens migration setup (CSS vars, Tailwind config)
- Critical bug fixes (preloader, motion delay)

**Outputs**:
- LCP ≤ 3.5s mobile (intermediate target)
- Tokens.md applied to globals.css
- About section refactored (957 LOC → split)
- Quick wins from `redesign-2026.md` shipped (label 2026, kill floating notes)

### Sprint 2 — Story Tightening (Week 2)
**Goal**: Eliminate duplication, sharpen per-section narrative.

**Themes**:
- About 4-track → 3-track refactor (drop STACK)
- Skills add presets + mobile horizontal scroll
- Experience add duration + current badge + links
- Projects add metric + dynamic tech + filter
- Footer last commit + mini player

**Outputs**:
- All section copy aligned to `story-map.md`
- Constants extended (metric, tech, link, github fields)
- All `dynamic()` imports have skeleton

### Sprint 3 — Visual Unification (Week 3)
**Goal**: Apply 2026 visual language consistently.

**Themes**:
- Color migration (single accent amber, retire purple/pink/blue/orange)
- Typography swap (display + mono fonts via next/font)
- Section dividers musical transitions
- Hero polish: live ticker, secondary CTA, kill stamp
- Contact: preset chips, pulse pads, mobile pad sizing

**Outputs**:
- Color audit pass: only amber accent + signal LEDs
- All sections use new typography hierarchy
- Section dividers musical (CSS-only)

### Sprint 4 — Polish, Test, Ship (Week 4)
**Goal**: Final quality pass, performance verification, ship.

**Themes**:
- Performance final pass (P4-P7, image optimization)
- Accessibility audit (a11y checklist)
- Cross-device testing (iPhone SE, Android, desktop)
- Lighthouse target verification
- Documentation update

**Outputs**:
- Lighthouse mobile ≥ 85, desktop ≥ 95
- All `aria-label` audited and accurate
- All Jest tests passing
- README updated with new design system reference
- Production deploy + RUM monitoring

---

## 3. Milestone Calendar

| Milestone | Date Target | Gate Criteria |
|-----------|-------------|---------------|
| M0 — Pre-flight done | Day 0 | Baseline captured, backup branch pushed |
| M1 — Foundation done | End Week 1 | LCP < 3.5s mobile, tokens.md in globals.css, about-section.tsx < 250 LOC |
| M2 — Story done | End Week 2 | No skill duplication, all sections have spec'd content |
| M3 — Visual unified | End Week 3 | Color audit pass, typography migration done, transitions musical |
| M4 — Ship | End Week 4 | Production deploy, Lighthouse target hit |

---

## 4. Dependency Graph

```
Sprint 0 (Pre-flight)
    │
    ▼
Sprint 1 ─────────────────┐
  Tokens setup            │
  Perf P1-P3              │
  About refactor          │
                          ▼
              Sprint 2 ───────────────┐
                Story tightening      │
                Constants extension   │
                Skeletons             │
                                      ▼
                          Sprint 3 ───────────────┐
                            Color migration       │
                            Typography swap       │
                            Transitions           │
                            Hero polish           │
                                                  ▼
                                       Sprint 4 ────┐
                                         Final perf │
                                         A11y       │
                                         Test       │
                                         Deploy     │
                                                    ▼
                                                  SHIP
```

**Critical path**: Pre-flight → Foundation → Story → Visual → Ship.

**Parallelizable**:
- Within Sprint 1: tokens + perf P1-P3 + about refactor (can do independently)
- Within Sprint 2: each section's tightening (independent)
- Within Sprint 3: color migration touches all files but can do per-section

---

## 5. Risk Mitigation Schedule

| Risk | Sprint | Mitigation |
|------|--------|------------|
| Perf fix break visual | S1 | Snapshot before each PR, run perf test before merge |
| About refactor regression | S1 | Side-by-side comparison staging vs prod, manual test all 3 tracks |
| Color migration miss spots | S3 | Grep audit `bg-purple|bg-pink|bg-blue-(400|500)` post-migration |
| Tone.js deferred load break Contact | S3 | Feature flag, fallback to immediate load if IntersectionObserver fail |
| Lighthouse target not hit | S4 | Buffer 2 days end of S4 for last-mile perf tweaks |

---

## 6. Branching Strategy

```
main (production)
  │
  ├── backup/pre-redesign-2026 (snapshot, never merged)
  │
  └── design-2026/foundation (Sprint 1)
        │
        ├── feat/perf-lcp-fix
        ├── feat/about-refactor
        └── feat/design-tokens
              │
              └── design-2026/story (Sprint 2)
                    │
                    ├── feat/skills-presets
                    ├── feat/projects-metric
                    └── ...
                          │
                          └── design-2026/visual (Sprint 3)
                                │
                                └── design-2026/polish (Sprint 4)
                                      │
                                      └── PR → main
```

**Rule**: setiap sprint merge ke `design-2026/<sprint-name>`, baru di akhir merge `main`. Tidak merge ke `main` per feature — terlalu noisy.

---

## 7. Definition of Done (per task)

Task dianggap "done" kalo:
- [ ] Code committed to feature branch
- [ ] TypeScript no errors (`tsc --noEmit`)
- [ ] No console errors in dev mode
- [ ] Manually tested on Chrome desktop + iPhone Simulator
- [ ] Visual matches `design.md` spec
- [ ] If perf-related: Lighthouse run, metric noted
- [ ] If accessibility-touching: keyboard nav verified
- [ ] If destructive: backup branch confirmed exists

## 8. Definition of Done (per sprint)

Sprint dianggap "done" kalo:
- [ ] All P0-P1 tasks closed
- [ ] Gate criteria met (lihat M1-M4 above)
- [ ] No regressions vs baseline
- [ ] Hermes session checkpoint saved
- [ ] Notes ditambah ke `bugfix.md` kalo ada teknis debt baru

---

## 9. Communication Pattern

Setiap akhir sprint, generate **sprint report** ke `docs/design-2026/reports/sprint-<n>.md`:

```md
# Sprint <n> Report — <date>

## Tasks Closed
- ✅ T-001 ...

## Tasks Carried Over
- ⏳ T-005 ...

## Performance Delta
| Metric | Before | After | Target |
| ... | ... | ... | ... |

## Visual Changes
[screenshots / before-after]

## Risks Realized
- ...

## Next Sprint Focus
- ...
```

---

## 10. Tools & Commands Reference

```bash
# Bundle analysis
ANALYZE=true pnpm build

# Lighthouse local
npx lighthouse http://localhost:3000 --view

# Performance test (existing)
pnpm test:performance

# Type check
pnpm dlx tsc --noEmit

# Format
pnpm dlx prettier --write .

# Lint
pnpm lint
```

---

## 11. Decision Log

Decisions yang udah diambil di spec ini, jangan re-debate kecuali ada info baru:

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Keep DAW theme | Strongest moat, brand identity |
| D2 | Single amber accent | Reduce visual noise, focus attention |
| D3 | Editorial display + mono labels | Studio rack feel + mature elevation |
| D4 | Drop STACK track from About | Duplicate of Skills section |
| D5 | Keep Tone.js but defer load | Killer feature, but lazy load |
| D6 | No 3D / WebGL | Out of scope, perf budget |
| D7 | next/font for typography | Already used (Syne), keep pattern |
| D8 | Section dividers CSS-only | Avoid motion library overhead |
| D9 | Free fonts MVP, paid fonts later | Don't block on font licensing |
| D10 | Recording mode in backlog | Nice-to-have, not core |

---

## 12. Backlog (Post-Ship)

Hal yang udah identify tapi tidak masuk redesign 2026:

- Recording mode di Contact (capture sequence + shareable link, viral mechanic)
- Tone.js section automation (audio glue per section)
- Theme variant switcher (e.g. "Studio mode" / "Vinyl mode" / "Cassette mode")
- Blog post layout redesign
- Search functionality
- i18n (Bahasa Indonesia)
- 3D vinyl in Projects modal (if perf budget allows)
- Sound design audit (custom UI sounds per interaction)
