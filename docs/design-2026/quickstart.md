# Quickstart — RETRO CONSOLE 2026

> Practical guide buat lu mulai eksekusi besok pagi tanpa harus baca semua doc dulu.

---

## 0. TL;DR

```bash
cd ~/Development/next-portfolio-blog
git checkout -b feat/redesign-2026

# install deps
pnpm add @react-three/fiber @react-three/drei three detect-gpu
pnpm remove tone

# ready to start Sprint 1
```

Theme: RETRO CONSOLE · 4 colors (RED #E10600 / WHITE #F5F5F2 / GRAY #2A2A2D / BLACK #0A0A0A) · low-poly 3D · CRT scanlines · pixel typography.

---

## 1. What's in This Folder

```
docs/design-2026/
├── README.md                  · index + status
├── quickstart.md              · this file (start here)
├── design.md                  · visual identity (palette, type, sections, header)
├── tokens.md                  · CSS vars, Tailwind config, TS constants
├── 3d-and-animation.md        · WebGL/R3F, shaders, motion, sound
├── requirements.md            · goals + acceptance criteria
├── plan.md                    · 3-week sprint roadmap
├── tasks.md                   · granular task list per file
├── story-map.md               · copy direction per section
├── migration.md                · feature flag + rollback strategy
├── performance.md             · perf budget + tactics
├── bugfix.md                  · known issues + tech debt
└── VISUAL_ANIMATION_CHECKLIST.md  · ship gate checklist
```

Old DAW spec di `../design-2026-archive-studio-session/` — frozen reference.

---

## 2. Reading Order

Pilih sesuai kebutuhan:

**Just want to start coding** (Day 1):
1. quickstart.md (you are here)
2. tokens.md → drop CSS vars
3. tasks.md → Phase A items

**Want full visual context** (planning day):
1. design.md
2. story-map.md
3. 3d-and-animation.md

**Decision-maker review**:
1. requirements.md
2. plan.md
3. migration.md

**Implementation reference** (during sprint):
- design.md — section layouts
- tokens.md — values
- 3d-and-animation.md — 3D scenes & shaders
- VISUAL_ANIMATION_CHECKLIST.md — pre-ship gate

---

## 3. Day-by-Day Quick Reference

| Day | Focus | Primary docs |
|-----|-------|--------------|
| 1 | Install + tokens | tokens.md §1, §2 |
| 2 | Fonts + globals | tokens.md §7 |
| 3 | Header HUD bar | design.md §4.5 |
| 4 | Pause Menu | design.md §4.5.6 |
| 5 | Stage Divider | 3d-and-animation.md §4 |
| 6 | Hero TITLE SCREEN | design.md §5.1, story-map.md §4.2 |
| 7 | About CHARACTER | design.md §5.2, story-map.md §4.3 |
| 8 | Skills INVENTORY | design.md §5.3, story-map.md §4.4 |
| 9 | Experience STAGE SELECT | design.md §5.4 |
| 10 | Projects GAME LIBRARY | design.md §5.5, 3d-and-animation.md §2.3 |
| 11 | Contact + Footer | design.md §5.6, §5.7 |
| 12 | CRT post-FX shader | 3d-and-animation.md §3.3 |
| 13 | Vertex jitter shader | 3d-and-animation.md §3.1 |
| 14 | Boot sequence | 3d-and-animation.md §9 |
| 15 | Sound effects | 3d-and-animation.md §5 |
| 16 | A11y audit | requirements.md §6.2, §7.5 |
| 17 | Perf tuning | performance.md |
| 18 | Cross-browser + ship | VISUAL_ANIMATION_CHECKLIST.md |

---

## 4. Key Decisions Locked

| Question | Answer |
|----------|--------|
| Theme | RETRO CONSOLE (full replacement) |
| Palette | RED / WHITE / GRAY / BLACK + 4 derivatives |
| Mascot | Cartridge (Option 4 — brand-cohesive) |
| MVP scope | FULL RETRO (B) — all effects ON |
| CRT default | ON (toggleable via Header) |
| SFX default | OFF (mute, opt-in) |
| Theme default | dark (light mode supported best-effort) |
| Section names | TITLE / CHARACTER / INVENTORY / CAREER / RELEASES / SAVE / STAGE-CLEAR |
| Cartridge 3D | Top 3 = R3F canvas, bottom = SVG fallback |
| Header themed | Yes — HUD bar with stage indicator + controls |
| Boot sequence | Yes (1.6s, skip after first visit) |
| Vertex jitter | Yes (PS1-style wobble) |
| Tone.js | DROPPED entirely |
| Light mode | functional toggle, not deep audit |

---

## 5. Tech Stack at a Glance

**Kept**:
- Next.js 15.1, React 19, TypeScript
- Tailwind v4
- Motion 12 (formerly framer-motion)
- next-themes
- lucide-react

**Added**:
- @react-three/fiber
- @react-three/drei
- three
- detect-gpu (capability detection)

**Removed**:
- tone (Tone.js)
- ~~Syne~~ font (replaced by VT323 + Space Grotesk + Inter + JetBrains Mono)

---

## 6. Commands Cheatsheet

```bash
# develop
pnpm dev                    # localhost:3000

# build + preview
pnpm build && pnpm start

# type check
pnpm tsc --noEmit

# bundle analyze
ANALYZE=true pnpm build

# lighthouse local
pnpm lighthouse:local       # alias kalau udah di-set di scripts

# audit colors (custom script — bikin di Sprint 3)
node scripts/audit-colors.mjs

# uninstall Tone
pnpm remove tone

# install R3F stack
pnpm add @react-three/fiber @react-three/drei three detect-gpu
```

---

## 7. File Move Cheatsheet

| Old | New / Action |
|-----|--------------|
| `src/components/navigation.tsx` | DELETE → replace with `src/components/layout/hud-bar.tsx` |
| `src/features/landing-page/components/about/about-section.tsx` (957 LOC) | ARCHIVE → rewrite to ≤ 250 LOC |
| `src/features/landing-page/components/skills/mixer-channel.tsx` | ARCHIVE → DELETE concept |
| `src/features/landing-page/components/projects/vinyl-sleeve.tsx` | ARCHIVE → replace with `cartridge-card.tsx` |
| `src/features/landing-page/components/contact/launchpad.tsx` | ARCHIVE → replace with save-point UI |
| `src/components/section-divider.tsx` | REWRITE → `<StageDivider />` with variants |
| Constants `MIXER_DATA` | RENAME → `INVENTORY_ITEMS` |
| Constants `MARQUEE_PHRASES` | DELETE — Marquee section removed |
| `tone` package | UNINSTALL |

---

## 8. Visual Cue Cheatsheet

| Element | Style |
|---------|-------|
| Page bg | `var(--black)` `#0A0A0A` |
| Card bg | `var(--gray-deep)` `#1A1A1C` |
| Primary text | `var(--white)` `#F5F5F2` |
| Accent | `var(--red)` `#E10600` |
| Border | `var(--gray-light)` `#4A4A4D` |
| Power LED | 8px round RED dot, pulse 1.6s |
| Display font | VT323 ≥ 32px |
| Body font | Inter |
| HUD font | JetBrains Mono uppercase tracking 0.1em |
| Border radius | `0` (except LED dots = `9999px`) |
| Box shadow | offset only (e.g. `4px 4px 0 0 var(--red)`) — no blur |
| Easing | `steps(8, end)` for stepped/sprite feel |

---

## 9. "I'm Stuck" — Where to Look

| Stuck on | Look in |
|----------|---------|
| Color won't apply | tokens.md §2 (Tailwind v4 @theme) |
| 3D rendering issue | 3d-and-animation.md §2 |
| Shader compile error | 3d-and-animation.md §3 + bugfix.md B12 |
| SSR error from R3F | bugfix.md B11 |
| LCP regression | performance.md §4 |
| Bundle too big | performance.md §3.1, §3.2 |
| Header scroll bug | bugfix.md B17 |
| Pause menu scroll lock leak | bugfix.md B16 |
| Boot sequence flickering | bugfix.md B14 |
| Section copy direction | story-map.md §4 |
| Component pattern reuse | design.md §6 |

---

## 10. Sanity Checks Before Each Commit

- [ ] `pnpm tsc --noEmit` no errors
- [ ] `pnpm test` passing (if tests touched)
- [ ] No `console.log` left in src/
- [ ] No new color hex outside palette
- [ ] No `from 'tone'` import
- [ ] No `width`/`height`/`top`/`left` animation
- [ ] All 3D Canvas wrapped in `dynamic({ ssr: false })`
- [ ] Reduced motion graceful (test in DevTools)

---

## 11. Definition of "Stage Done"

A section/stage is "done" when:
- ✅ Has `data-stage-num` + `data-stage-name`
- ✅ Visual matches design.md spec
- ✅ Copy lifted from story-map.md
- ✅ All tasks under that phase in tasks.md checked
- ✅ Keyboard accessible
- ✅ Reduced motion graceful
- ✅ Lighthouse no regression
- ✅ Reviewed by Adit (visual approval)

---

## 12. Quick Win Order (Day 1 Energy)

Kalo lu mau ngerasain progress cepet di Day 1:
1. Drop CSS vars → buka site → semua warna berubah ✓
2. Install fonts → refresh → typography baru ✓
3. Bikin `<HUDBar />` placeholder di header → langsung kelihatan retro ✓

Done. Sisanya tinggal eksekusi sprint.

---

## 13. When to Ask Hermes for Help

- Stuck on shader code (GLSL)
- Need help debug 3D performance
- Color audit script writing
- Visual diff between sprints
- Lighthouse interpretation

```
"hermes, help debug vertex jitter shader, output is black canvas in safari"
```

---

> Now go. Press start.
