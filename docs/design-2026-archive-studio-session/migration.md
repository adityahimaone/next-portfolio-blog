# Migration Plan 2026

> Backward compat strategy, deprecation path, rollback playbook.

---

## 1. Migration Philosophy

**Incremental, not big-bang.** Setiap PR harus:
- Bisa di-merge independen ke `design-2026/<sprint>` branch
- Tidak break section lain yang belum di-migrate
- Punya rollback path yang jelas

**No flag day.** Tidak ada single "rilis 2026" yang ngubah semua sekaligus. Tiap section migrate satu-satu, di-staging dulu, baru produksi.

---

## 2. Branch & Release Strategy

### 2.1 Branch Tree

```
main (production, current state)
  ├── backup/pre-redesign-2026  ←  snapshot, never modified
  │
  └── design-2026/foundation  (Sprint 1 base)
        ├── feat/perf-lcp-fix
        ├── feat/about-refactor
        ├── feat/design-tokens
        └── feat/quick-wins
              │
              ▼ (merge into design-2026/foundation when sprint done)
              │
              └── design-2026/story  (Sprint 2 base, branched off foundation)
                    ├── feat/skills-presets
                    ├── feat/projects-metric
                    └── ...
                          │
                          ▼
                          └── design-2026/visual  (Sprint 3)
                                │
                                ▼
                                └── design-2026/polish  (Sprint 4)
                                      │
                                      ▼
                                      └── PR → main
```

### 2.2 Merge Rules

- `feat/*` → `design-2026/<sprint>`: requires PR, self-review OK
- `design-2026/<sprint>` → `design-2026/<next-sprint>`: requires PR, manual smoke test
- `design-2026/polish` → `main`: requires PR, full Lighthouse + cross-device test
- `main` → production: auto via existing GitHub Action (`.github/workflows/deploy.yml`)

### 2.3 Tagging

Each sprint completion:
```bash
git tag -a v2026-sprint-1 -m "Sprint 1: Foundation & Performance"
git push --tags
```

Final release:
```bash
git tag -a v2026.0.0 -m "Design 2026 — Studio Session Refined"
git push --tags
```

---

## 3. Per-File Migration Checklist

### 3.1 Files Touched (high-impact)

| File | Risk | Migration Strategy |
|------|------|-------------------|
| `app/globals.css` | High | Add tokens at TOP of file, leave existing classes intact for now. Audit + remove dead classes in T-112 (later). |
| `app/layout.tsx` | Medium | Add new fonts (Inter, Crimson Pro, JetBrains Mono) alongside Syne. Don't remove Syne until T-313. |
| `tailwind.config` | Medium | If using v4 inline `@theme`, extend in globals.css. No separate config file change needed. |
| `tsconfig.json` | Low | Single line change (target ES2017→ES2022). Verify build, rollback if break. |
| `next.config.ts/.mjs` | Low | Verify only — likely no change needed |
| `package.json` | Medium | Bump `@next/mdx` to ^15.1.11. Verify blog post still renders. |
| `features/landing-page/views/landing-page.tsx` | Medium | Add skeleton loaders one by one, test each |
| `features/landing-page/components/hero-section.tsx` | High | LCP fix risky — snapshot before/after, manual visual test |
| `features/landing-page/components/about-section.tsx` | Very High | 957 → 250 LOC refactor; do in dedicated PR with snapshot tests |
| `features/landing-page/components/skills-section.tsx` | Medium | Add presets, mobile scroll — additive, low risk |
| `features/landing-page/components/experience-section.tsx` | Low | Add fields + badge — additive |
| `features/landing-page/components/projects-section.tsx` | Medium | Add metric + filter — moderate refactor |
| `features/landing-page/components/contact/contact-section.tsx` | High | Tone.js defer load risky |
| `features/layout/components/footer.tsx` | Low | Add last commit + mini player — additive |
| `features/landing-page/constants/index.ts` | Low | Extend types + data — backward compatible |
| `components/section-divider.tsx` | Medium | Add variant prop, default to current behavior for backward compat |

### 3.2 Pattern: Backward-Compatible Refactor

Buat tiap component yang di-refactor major (e.g. about, contact), follow pattern:

1. **Step 1 — Move, don't transform**: 
   ```
   features/landing-page/components/about-section.tsx
   →
   features/landing-page/components/about/about-section.tsx
   ```
   Move first. Update imports. Verify still works.

2. **Step 2 — Extract, don't redesign**: 
   Pull out helpers (TimeRuler, TrackHeader, ClipBlock) to separate files.
   Verify still works visually identical.

3. **Step 3 — Refactor data**: 
   Move tracks data to `tracks-data.tsx`. Drop STACK track.
   Verify visual changes intentional.

4. **Step 4 — Polish**: 
   Apply new design tokens, copy updates.
   Final visual + perf check.

Each step = 1 PR. Each PR mergeable independent.

---

## 4. Deprecation Path

### 4.1 Things Being Removed (with deprecation grace)

| Item | When Removed | Grace Period | Replacement |
|------|-------------|--------------|-------------|
| Syne font (Google) | Sprint 3 (T-313) | Keep until display font tested | Crimson Pro / Sentient |
| Floating notes (♫ ♩ ♬) | Sprint 1 (T-131) | None — straight delete | (none, intentional removal) |
| "MODEL NO. AH-2026-MKIII" | Sprint 1 (T-132) | None | (consolidated to single location) |
| "New Release" rotated stamp | Sprint 2 (T-203) | None | Small version chip |
| Static `<SectionDivider />` | Sprint 3 (T-320) | Behind `variant="static"` prop | Musical variants |
| About STACK track | Sprint 1 (T-121) | None | (covered by Skills section) |
| Hero motion-wrapped LCP | Sprint 1 (T-100) | None | CSS-only animation |
| Eager Tone.js load | Sprint 4 (T-401) | Keep until IntersectionObserver tested | Deferred load |
| Section-specific colors (purple/pink/blue/orange chrome) | Sprint 3 (T-300-304) | Audit then migrate per-section | Single amber accent |
| Hardcoded project tech stack | Sprint 2 (T-232) | Fall back to existing list if `tech` field empty | Dynamic per project |

### 4.2 Things Being Renamed/Moved

| Old Path | New Path | When |
|----------|----------|------|
| `features/landing-page/components/about-section.tsx` | `features/landing-page/components/about/about-section.tsx` | Sprint 1 (T-120) |
| (clip content inline) | `features/landing-page/components/about/clips/*.tsx` | Sprint 1 (T-120) |
| `MIX-MASTER 2025` (string) | `MIX-MASTER 2026` (string) | Sprint 1 (T-130) |
| (no preset constants) | `MIXER_PRESETS` constant in constants/index.ts | Sprint 2 (T-210) |

### 4.3 Imports That Will Break

After T-120 (about refactor):
```diff
- import { AboutSection } from '@/features/landing-page/components/about-section'
+ import { AboutSection } from '@/features/landing-page/components/about'
```

But `dynamic()` import in `landing-page.tsx` is the only consumer — easy fix. Verify barrel export at new path:

```ts
// features/landing-page/components/about/index.ts
export { AboutSection } from './about-section'
```

---

## 5. Data Migration

### 5.1 Constants Extension (constants/index.ts)

**ExperienceItem type** (add fields):
```diff
export interface ExperienceItem {
  readonly id: number
  readonly role: string
  readonly type: string
  readonly company: string
  readonly location: string
  readonly period: string
  readonly color: string
+ readonly duration?: string       // "3y 7m"
+ readonly link?: string           // company/project URL
+ readonly current?: boolean       // is current job?
  readonly description?: readonly string[]
  readonly isGroup?: boolean
  readonly items?: readonly { ... }[]
}
```

Existing entries get optional fields → no breaking change. Populate gradually.

**ProjectShowcaseItem type** (add fields):
```diff
export interface ProjectShowcaseItem {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly image: string
  readonly url: string
  readonly genre?: string
  readonly year?: string
  readonly vinylColor: string
  readonly vinylIcon: LucideIcon
+ readonly metric?: string         // "10K+ visits"
+ readonly tech?: string[]         // ["React", "Tone.js", ...]
+ readonly github?: string         // optional source link
+ readonly role?: string           // "Solo dev" / "FE Lead of 4"
}
```

**MixerGroup type** (add fields per channel):
```diff
export interface MixerGroup {
  readonly id: string
  readonly label: string
  readonly type: string
  readonly channels: readonly {
    readonly name: string
    readonly level: number
+   readonly since?: number        // year started learning
+   readonly usage?: number        // # of projects used in
  }[]
}
```

**New constant**: MIXER_PRESETS
```ts
export const MIXER_PRESETS = {
  frontend: {
    languages: { html: 95, css: 95, js: 95, ts: 95, go: 30, swift: 20 },
    frameworks: { react: 95, next: 95, remix: 70, jquery: 80 },
    tools: { vscode: 95, figma: 90, git: 95, motion: 95 },
  },
  backend: {
    languages: { html: 50, css: 30, js: 80, ts: 75, go: 75, swift: 40 },
    frameworks: { react: 30, next: 50, remix: 30, jquery: 20 },
    tools: { vscode: 95, figma: 30, git: 95, motion: 30 },
  },
  design: {
    languages: { html: 90, css: 95, js: 70, ts: 60, go: 10, swift: 30 },
    frameworks: { react: 75, next: 70, remix: 30, jquery: 50 },
    tools: { vscode: 80, figma: 99, git: 80, motion: 95 },
  },
} as const
```

---

## 6. Rollback Playbook

### 6.1 Rollback Levels

**Level 1 — Single PR rollback (most common)**:
```bash
# Revert PR via GitHub UI, or:
git revert <commit-sha>
git push origin design-2026/<sprint>
```

**Level 2 — Sprint rollback**:
```bash
# Reset sprint branch to start of sprint
git checkout design-2026/<sprint>
git reset --hard <sprint-start-tag>
git push --force-with-lease origin design-2026/<sprint>
```

**Level 3 — Full redesign rollback (emergency)**:
```bash
# Restore from backup branch
git checkout main
git reset --hard backup/pre-redesign-2026
git push --force-with-lease origin main
# Trigger production redeploy
```

### 6.2 Rollback Triggers

Auto-rollback (Level 3) if:
- Production crashes 5+ min sustained
- Lighthouse Performance drops > 20 points vs baseline
- Critical accessibility regression detected (Lighthouse a11y < 70)

Manual rollback decision (Level 1-2) if:
- Visual regression noticed by user/Adit
- Console errors in production
- API integration broken (Spotify/GitHub)

### 6.3 Rollback Communication

When rolling back, document in `docs/design-2026/incidents.md`:
```md
# Incident Report — <date>

**Trigger**: <what went wrong>
**Detection**: <how detected, who/when>
**Rollback level**: 1 / 2 / 3
**Action taken**: <commit reverted, etc>
**Root cause**: <after analysis>
**Prevention**: <how to avoid next time>
```

---

## 7. Testing Migration

### 7.1 Test File Updates

When refactoring component, update its test:
```diff
- import { AboutSection } from '@/features/landing-page/components/about-section'
+ import { AboutSection } from '@/features/landing-page/components/about'
```

### 7.2 New Tests to Add

| Test | When |
|------|------|
| `tests/sections-render.test.ts` — verify all 7 sections render | Sprint 4 (T-421) |
| `tests/lcp-element.test.ts` — verify hero h1 in DOM immediately | Sprint 1 (T-100) |
| `tests/skeleton-loader.test.ts` — verify skeleton renders during dynamic load | Sprint 1 (T-105) |
| `tests/preset-presets.test.ts` — verify Skills preset buttons trigger fader change | Sprint 2 (T-210) |

### 7.3 Snapshot Tests

For visual regression, consider adding `@testing-library/jest-dom` snapshot for major components:
- AboutSection track structure
- ExperienceSection tracklist
- ProjectsSection grid
- ContactSection launchpad

---

## 8. Production Deploy Checklist

Each merge to `main` (final or sprint sub-rilis):

**Pre-deploy**:
- [ ] All tests passing (`pnpm test`)
- [ ] Type check clean (`pnpm dlx tsc --noEmit`)
- [ ] Build success (`pnpm build`)
- [ ] Lighthouse local pass (mobile + desktop)
- [ ] Bundle size within budget
- [ ] Manual smoke test on local dev
- [ ] Cross-device test (mobile sim + desktop)
- [ ] Visual diff vs previous (manual)

**Deploy**:
- [ ] Merge PR to `main`
- [ ] GitHub Action `deploy.yml` triggered
- [ ] Watch deploy log
- [ ] Verify production URL responds
- [ ] Smoke test production (load page, check sections, test interactives)

**Post-deploy**:
- [ ] Monitor Vercel Analytics for 1h
- [ ] No console errors reported
- [ ] No 404/500 spike
- [ ] Update changelog in README or `CHANGELOG.md`
- [ ] Update `docs/design-2026/reports/sprint-<n>.md`

---

## 9. Backward Compatibility Guarantees

### 9.1 URLs

All existing URLs must continue working:
- `/` (home)
- `/blog` (blog list)
- `/blog/[slug]` (blog post)
- `/projects` (projects subpage)
- `/contact` (contact subpage)
- `/music` (music subpage)
- `/api/now-playing` (existing API)
- `/api/callback` (Spotify auth)
- `/api/spotify-auth` (Spotify auth)
- `/api/views/[slug]` (analytics)
- `/rss.xml` (RSS feed)
- `/sitemap.xml` (sitemap)
- `/robots.txt`

If any URL changes, add redirect via `next.config.mjs` `redirects()`.

### 9.2 RSS / Sitemap

Blog post URLs in RSS must remain stable. Don't refactor `app/rss.xml/route.ts` URL pattern.

### 9.3 OG Images

`app/blog/[slug]/opengraph-image.tsx` generates OG images. Existing share links pointing to images must continue working — don't change route pattern.

---

## 10. Communication Plan

### 10.1 Internal (Adit only)

- Sprint reports: `docs/design-2026/reports/sprint-<n>.md`
- Decision log: append to `plan.md` Section 11
- Incidents: `docs/design-2026/incidents.md`

### 10.2 External (visitors)

Soft-announce via:
- Blog post: "Why I redesigned my portfolio (again)" — already exists at `content/blog/why-i-rebuilt-my-portfolio.md` (likely from previous redesign — write new one)
- Hero version chip: `v2026.05` — auto-communicates fresh release
- Footer last-commit badge: `Last shipped: feat: redesign 2026`
- Tweet/social (lu boleh skip kalo ga aktif sosmed)

### 10.3 Recruiter-facing

If portfolio shared during job search, mention "Recently rebuilt for 2026" in cover letter linking to the blog post.

---

## 11. Post-Migration Cleanup

After ship (post Sprint 4):

- [ ] Delete merged feature branches: `git branch -d feat/*`
- [ ] Keep `backup/pre-redesign-2026` branch indefinitely (history)
- [ ] Archive sprint branches as tags: `git tag archive/sprint-1 design-2026/foundation && git branch -D design-2026/foundation`
- [ ] Update `docs/design-2026/README.md` status table (all DRAFT → SHIPPED)
- [ ] Move `docs/design-2026/` to `docs/archive/design-2026/` once next redesign starts
- [ ] Reset memory bank: clear redesign-specific TODOs
