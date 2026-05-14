# Migration — Backward Compat & Rollback RETRO CONSOLE 2026

> Strategy buat ngeswitch dari "Studio Session" lama ke "Retro Console" baru tanpa break production.
> Companion: `plan.md` (sprint), `tasks.md` (granular).

---

## 1. Migration Strategy: Feature Flag + Archive

Pakai **feature flag** + **archive folder** approach. Lama tetap ada di repo, baru di-build paralel, swap via env var.

### 1.1 Feature Flag

```ts
// src/lib/flags.ts
export const FLAGS = {
  THEME_2026: process.env.NEXT_PUBLIC_THEME_2026 === 'true',
} as const;
```

```env
# .env.development
NEXT_PUBLIC_THEME_2026=true   # local dev: always new theme

# .env.production
NEXT_PUBLIC_THEME_2026=false  # production: kept old until launch ready
```

### 1.2 Page Routing

```tsx
// src/app/page.tsx
import { FLAGS } from '@/lib/flags';
import HomeOld from '@/_archive/2026-pre/home';
import HomeNew from '@/features/landing-page/home';

export default function Page() {
  return FLAGS.THEME_2026 ? <HomeNew /> : <HomeOld />;
}
```

Both versions co-exist. Decision diambil at build time (constant fold) sehingga tree-shake aman.

### 1.3 Archive Folder Structure

```
src/_archive/
└── 2026-pre/                          (lama, frozen)
    ├── home.tsx                       (entry untuk Studio Session)
    ├── about/
    │   ├── about-section.tsx
    │   ├── daw-clip.tsx
    │   └── ...
    ├── skills/
    │   ├── mixer-channel.tsx
    │   ├── fader.tsx
    │   ├── knob.tsx
    │   └── ...
    ├── experience/
    │   ├── vinyl-record.tsx
    │   └── tracklist.tsx
    ├── projects/
    │   ├── vinyl-sleeve.tsx
    │   └── album-cover.tsx
    └── contact/
        ├── launchpad.tsx
        └── tone-engine.tsx
```

Apa pun yang dipindah ke `_archive/` punya rule:
- TIDAK boleh di-import dari folder aktif
- Kalau ada test yang masih reference, copy test sekalian ke `_archive/__tests__/`
- File baru di `_archive/` tidak boleh ditambahkan setelah migration done — frozen

### 1.4 Archive Trigger Date

`_archive/2026-pre/` di-keep sampai 2 minggu post-launch. Setelah itu, kalau ga ada rollback, hapus folder via:

```bash
rm -rf src/_archive/2026-pre/
git commit -am "chore(cleanup): remove pre-2026 archive after 14 days stable"
```

---

## 2. Component Migration Map

| Old Component | Status | New Component |
|---------------|--------|---------------|
| `<Navigation />` | DELETE | `<HUDBar />` |
| `<HeroSection />` (Studio) | ARCHIVE | `<HeroSection />` (Title Screen) |
| `<AboutSection />` (DAW) | ARCHIVE | `<AboutSection />` (Character Select) |
| `<SkillsSection />` (Mixer) | ARCHIVE | `<SkillsSection />` (Inventory) |
| `<ExperienceSection />` (Discography) | ARCHIVE | `<ExperienceSection />` (Stage Select) |
| `<ProjectsSection />` (Vinyl Releases) | ARCHIVE | `<ProjectsSection />` (Game Library) |
| `<ContactSection />` (Launchpad) | ARCHIVE | `<ContactSection />` (Save Point) |
| `<Footer />` (Studio) | ARCHIVE | `<FooterStageClear />` |
| `<SectionDivider />` | REPLACE | `<StageDivider variant="..." />` |
| `<Mixer />`, `<Fader />`, `<Knob />` | DELETE | (none — removed) |
| `<VinylRecord />`, `<AlbumCover />` | DELETE | `<CartridgeCanvas />`, `<CartridgeSVG />` |
| `<Launchpad />`, `<Pad />` | DELETE | `<ChunkyButton />` (4 actions) |
| `<NowPlaying />` (Spotify ticker) | KEEP, RESKIN | Optional surface in About / Footer |
| `<MusicNote />`, `<FloatingNote />` | DELETE | (none — visual noise removed) |

---

## 3. Data Schema Migration

### 3.1 Constants File Refactor

`src/features/landing-page/constants/index.ts`:

| Old export | New export |
|------------|------------|
| `MIXER_DATA` (faders, knobs) | `INVENTORY_ITEMS` |
| `EXPERIENCES` | `EXPERIENCES` (extended with `duration`, `link`, `current`) |
| `PROJECTS_SHOWCASE` | `PROJECTS_LIBRARY` (extended with `metric`, `tech`, `github`, `category`) |
| `MARQUEE_PHRASES` (FM 96.0) | DELETE — Marquee section removed |
| `LAUNCHPAD_PRESETS` | DELETE |
| `LAUNCHPAD_PADS` | DELETE |
| `NOW_PLAYING_FALLBACK` | KEEP |

### 3.2 Inventory Items Schema

```ts
type InventoryItem = {
  id: string;
  name: string;                  // 'React', 'Next.js'
  icon: 'lucide-name' | string;  // lucide-react icon name
  years: number;
  projectsCount: number;
  mastery: 1 | 2 | 3 | 4 | 5;    // star rating
  category: 'frontend' | 'backend' | 'tooling' | 'design';
};

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'react',     name: 'React',     icon: 'react',     years: 4, projectsCount: 12, mastery: 4, category: 'frontend' },
  { id: 'nextjs',    name: 'Next.js',   icon: 'next',      years: 3, projectsCount: 10, mastery: 4, category: 'frontend' },
  // ...
];
```

### 3.3 Projects Library Schema

```ts
type Project = {
  id: string;
  title: string;
  genre: 'web3' | 'corporate' | 'productivity' | 'defi' | 'bio' | 'edu';
  year: number;
  metric: string;                // "10K+ visits"
  description: string;            // 2 sentences max
  tech: string[];                 // ['React', 'Next.js', 'Tailwind']
  liveUrl?: string;
  github?: string;                // optional
  cartridgeColor: string;          // grayscale + sticker hint, but enforced palette-safe
  thumbnail: string;
  use3D: boolean;                  // top 3 = true, bottom = false
};

export const PROJECTS_LIBRARY: Project[] = [
  { id: 'bisadaya', title: 'Bisadaya', genre: 'corporate', year: 2024, metric: 'Used by thousands', tech: [...], liveUrl: '...', cartridgeColor: '#2A2A2D', thumbnail: '...', use3D: true, description: '...' },
  // ...
];
```

### 3.4 Experiences Schema (extended)

```ts
type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;                  // 'Oct 2022 — Present'
  duration: string;                // '3y 7m' computed
  location: string;
  current: boolean;
  link?: string;                   // company URL or artifact
  bullets: string[];                // 3 bullet points max
  tech: string[];
};
```

---

## 4. Rollback Plan

### 4.1 Rollback Trigger Conditions

Trigger rollback kalau:
- Production crash > 5 min
- Critical bug menghambat user (e.g. Contact section unsubmittable)
- Performance regression Lighthouse mobile drop > 10 points dari pre-launch
- Adit decides "ga vibing"

### 4.2 Rollback Steps (Fast — < 5 min)

1. Set env var:
   ```bash
   ssh vps
   cd /var/www/next-portfolio-blog
   echo "NEXT_PUBLIC_THEME_2026=false" > .env.production.local
   ```

2. Rebuild:
   ```bash
   pnpm build
   pm2 restart portfolio
   ```

3. Verify production URL serves Studio Session lama
4. Tweet/Telegram ke Adit: `> ROLLBACK COMPLETE · STUDIO SESSION RESTORED`

### 4.3 Rollback Steps (Full — partial revert if archive deleted)

Kalau `_archive/` udah keburu di-delete:

1. `git revert <merge-commit-sha>` di branch baru
2. Push, deploy
3. ETA: 15-20 min

Alternatively, restore archive from git history:
```bash
git checkout <pre-merge-sha> -- src/features/landing-page/
git commit -am "revert: restore Studio Session theme"
```

### 4.4 Rollback Verification

After rollback:
- [ ] Production URL renders DAW interface (mixer, vinyl, launchpad)
- [ ] Tone.js loaded (launchpad working)
- [ ] No retro console references in DOM
- [ ] Lighthouse perf restored to pre-launch baseline

---

## 5. Phase-by-Phase Migration

### 5.1 Pre-Migration State (now)

- Studio Session live in production
- DAW components in `src/features/landing-page/`
- No retro console code

### 5.2 Sprint 1 End

- Tokens + fonts + header migrated
- DAW sections still active (header overlap OK selama theme flag false)
- Build passes both flag states

### 5.3 Sprint 2 End

- All 6 sections rewritten in retro console
- DAW components moved to `_archive/2026-pre/`
- Feature flag `THEME_2026=true` works in dev
- Production still serves Studio Session (flag still false di prod env)

### 5.4 Sprint 3 End (Pre-Launch)

- Polish complete
- Acceptance criteria all green
- Lighthouse production-grade
- Ready to flip flag

### 5.5 Launch Day

1. Set `NEXT_PUBLIC_THEME_2026=true` on production env
2. Rebuild, redeploy
3. Smoke test
4. Monitor for 1 hour: error rate, perf, manual click-through
5. Tweet/Telegram: `> NEW BUILD · v2026.05 SHIPPED`

### 5.6 Post-Launch Days 1-14

- Monitor error rate
- Track Vercel/RUM analytics
- Address bug reports in `bugfix.md`
- Keep `_archive/` intact

### 5.7 Day 14 Post-Launch

- If stable: delete `_archive/2026-pre/`
- Final cleanup commit

---

## 6. Asset Migration

### 6.1 Old Assets to Archive

```
public/
  cover.jpg                  → keep (still used as Spotify fallback if surfaced)
  memoji-1.png                → archive ke `public/_archive/`
```

### 6.2 New Assets to Create

```
public/
  3d/
    cartridge.glb              (NEW · ~50KB)
    save-crystal.glb           (optional, can be inline geometry)
    mascot-poster.webp         (NEW · 800×800 fallback poster)
    cartridge-poster.webp     (NEW · per project, ~40KB each)

  sfx/
    blip.wav                   (NEW · ~6KB)
    click.wav                  (NEW · ~8KB)
    confirm.wav                (NEW · ~10KB)
    coin.wav                   (NEW · ~10KB)
    boot.wav                   (NEW · ~16KB)
    select.wav                 (NEW · ~8KB)

  icons/
    cartridge.svg              (NEW)
    dpad.svg                   (NEW)
    buttons-abxy.svg           (NEW)
    coin.svg                   (NEW)
    save-crystal.svg           (NEW · 2D fallback)

  cursor-arrow.svg              (optional, post-MVP)
  cursor-pointer.svg            (optional, post-MVP)

  og.png                        (replace dengan title screen frame)
```

### 6.3 OG Image Update

Generate new OG image:
- Title screen capture with "ADIT HIMAONE · PRESS START" text
- 1200×630
- Format: PNG (better Twitter rendering)
- Drop ke `public/og.png`
- Update `src/app/layout.tsx` metadata

---

## 7. Test Migration

### 7.1 Existing Tests

```
__tests__/
  about-section.test.tsx        → archive (DAW-specific)
  mixer.test.tsx                 → delete (mixer removed)
  launchpad.test.tsx              → delete
  vinyl.test.tsx                   → delete
  hero-section.test.tsx           → rewrite untuk title screen
```

### 7.2 New Tests

```
__tests__/
  hud-bar.test.tsx                  (NEW)
  pause-menu.test.tsx                (NEW)
  inventory-grid.test.tsx            (NEW)
  stage-select-tile.test.tsx          (NEW)
  cartridge-canvas.test.tsx          (NEW · with R3F testing utils)
  save-crystal.test.tsx              (NEW)
  boot-screen.test.tsx               (NEW)
  stage-divider.test.tsx              (NEW)
  flags.test.ts                       (NEW · feature flag toggle test)
```

Use `@testing-library/react` + `@testing-library/jest-dom` (already installed).
3D test: mock R3F via `@react-three/test-renderer`.

---

## 8. CI/CD Updates

### 8.1 Build Matrix

`.github/workflows/ci.yml` (jika ada):

```yaml
strategy:
  matrix:
    flag: [true, false]
env:
  NEXT_PUBLIC_THEME_2026: ${{ matrix.flag }}
```

Build both states selama transition period (2 weeks pre-launch + 2 weeks post-launch).

### 8.2 Lighthouse CI

Add Lighthouse CI run per PR:
- Compare against baseline (pre-2026 perf)
- Fail PR if mobile drop > 10 points

---

## 9. Documentation Updates

Files yang perlu update post-launch:

- [ ] `README.md` — screenshots, tagline
- [ ] `docs/redesign-2026.md` — append "SHIPPED 2026-MM-DD"
- [ ] `docs/perf-fix-plan.md` — mark items resolved/superseded
- [ ] `docs/structure.md` — update folder map
- [ ] `docs/stack.md` — add R3F, three deps; remove tone

---

## 10. User-Facing Migration

### 10.1 Returning Visitors

Returning visitors saat launch akan liat:
- localStorage `_has_booted=true` (kalau sudah ada dari versi sebelumnya — actually, key ini baru, jadi semua visitor di-treat sebagai first-visit)
- → Boot sequence plays first time post-launch

Acceptable. UX trade-off: returning visitors get one boot screen on launch day.

### 10.2 Bookmarks / Direct Links

Anchors yang udah ada di luar (bookmarks, social shares):
- `#about` → still works, scrolls to STAGE-02
- `#projects` → still works, scrolls to STAGE-05
- `#contact` → still works, scrolls to STAGE-06
- `#hero` → may not exist, redirect to `#top` or root
- `#skills`, `#experience` → still work

Verify all anchor IDs preserved during migration. Add tests:

```ts
// __tests__/anchors.test.ts
test('all section anchors preserved', () => {
  const document = render(<HomePage />).baseElement;
  expect(document.querySelector('#about')).toBeTruthy();
  expect(document.querySelector('#skills')).toBeTruthy();
  expect(document.querySelector('#experience')).toBeTruthy();
  expect(document.querySelector('#projects')).toBeTruthy();
  expect(document.querySelector('#contact')).toBeTruthy();
});
```

### 10.3 SEO

Title + meta description update:

```tsx
// src/app/layout.tsx
export const metadata = {
  title: 'Adit Himaone · Frontend Engineer · v2026',
  description: 'Frontend Engineer at Fast 8 — building Bisadaya for thousands of jobseekers. Portfolio v2026: retro console edition.',
  openGraph: {
    title: 'Adit Himaone · Press Start',
    description: 'Frontend Engineer · Portfolio v2026',
    images: ['/og.png'],
  },
};
```

Don't change URL structure — same paths, same slugs. Search engines re-crawl naturally; no redirects needed.

---

## 11. Communication Plan

### 11.1 Pre-Launch Announce

Optional Telegram nudge to Adit a day before:
- `> CONSOLE READY · BOOT SEQUENCE FINAL · LAUNCH AT <DATE>`

### 11.2 Launch Announce

Adit's call to share publicly. Suggested template (X/Twitter):
```
> v2026 SHIPPED
> retro console edition · 4 colors · low-poly 3D
> press start at adityahimaone.com
```

### 11.3 Rollback Announce

If rollback happens, internal only:
- Telegram: `> ROLLBACK · cause: <reason> · investigating`
- No public announcement needed

---

## 12. Migration Checklist Summary

Pre-launch:
- [ ] All sections rewritten + archived
- [ ] Feature flag works both states
- [ ] Tone.js uninstalled
- [ ] R3F installed + lazy-loaded
- [ ] All anchor IDs preserved
- [ ] OG image regenerated
- [ ] Tests rewritten / new tests added
- [ ] Lighthouse mobile ≥ 85, desktop ≥ 95

Launch day:
- [ ] Flip env flag
- [ ] Rebuild + redeploy
- [ ] Smoke test
- [ ] Monitor 1h
- [ ] Update README screenshots

Day 14 post-launch:
- [ ] Delete `_archive/2026-pre/`
- [ ] Final docs cleanup
- [ ] Save skill `portfolio-retro-redesign-2026`
