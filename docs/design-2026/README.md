# Design 2026 — Documentation Index

> Comprehensive redesign spec for `next-portfolio-blog` (Adit's portfolio)
> Theme: **RETRO CONSOLE** — red / gray / black / white
> Created: 2026-05-14 · Owner: Adit · Spec author: Hermes
> v2 (full theme replacement) — supersedes Studio Session theme

---

## Status: COMPLETE — Ready to Execute

Spec rewritten penuh. Theme DAW lama udah di-archive ke `../design-2026-archive-studio-session/`. 13 dokumen ready, total ~6000 baris.

All docs ✅ DRAFT v2 · 2026-05-14:
- ✅ `quickstart.md` — start here, day-by-day cheatsheet
- ✅ `design.md` — visual identity, palette, typography, sections, header HUD
- ✅ `tokens.md` — concrete CSS / Tailwind v4 / TS values
- ✅ `3d-and-animation.md` — WebGL, R3F, shaders, motion, sound
- ✅ `requirements.md` — goals + acceptance criteria
- ✅ `plan.md` — 3-week sprint roadmap
- ✅ `tasks.md` — granular task list per file
- ✅ `story-map.md` — copy direction per section
- ✅ `migration.md` — feature flag + rollback
- ✅ `performance.md` — perf budget + tactics
- ✅ `bugfix.md` — known issues + tech debt
- ✅ `VISUAL_ANIMATION_CHECKLIST.md` — pre-ship gate

---

## Reading Order

Just want to start coding (Day 1):
1. `quickstart.md` — start here
2. `tokens.md` — drop CSS vars
3. `tasks.md` Phase A items

Want full visual context:
1. `design.md`
2. `story-map.md`
3. `3d-and-animation.md`

Decision-maker review:
1. `requirements.md`
2. `plan.md`
3. `migration.md`

Pre-ship gate:
- `VISUAL_ANIMATION_CHECKLIST.md`

---

## Theme TL;DR

Bayangin lu nyalain Famicom / PS1 taun 1996. Layar CRT bulging. Power LED merah. Title screen pixel-perfect, rendered low-poly 3D character muter pelan dengan vertex jitter khas hardware tahun itu.

Palette: 4 warna saja
- 🔴 RED   `#E10600` — active state, brand, power LED
- ⚪ WHITE `#F5F5F2` — primary text
- ⚫ GRAY  `#2A2A2D` — surface plastic
- ⬛ BLACK `#0A0A0A` — page background

Section reframe (no more "tracks/releases"):
- Hero       → "TITLE SCREEN"
- About      → "CHARACTER SELECT"
- Skills     → "INVENTORY"
- Experience → "STAGE SELECT"
- Projects   → "GAME LIBRARY" (cartridges)
- Contact    → "SAVE POINT"
- Footer     → "STAGE CLEAR"

---

## Document Status (all DRAFT v2 · 2026-05-14)

| Doc | Lines | Purpose |
|-----|-------|---------|
| quickstart.md | 276 | Start here — day-by-day cheatsheet |
| design.md | 1051 | Visual identity, palette, sections, header HUD |
| tokens.md | 424 | CSS / Tailwind / TS values |
| 3d-and-animation.md | 624 | WebGL/R3F, shaders, motion, sound |
| requirements.md | 350 | Goals + acceptance criteria |
| plan.md | 343 | 3-week sprint roadmap |
| tasks.md | 711 | Granular task list per file |
| story-map.md | 485 | Copy direction per section |
| migration.md | 509 | Feature flag + rollback |
| performance.md | 418 | Perf budget + tactics |
| bugfix.md | 254 | Known issues + tech debt |
| VISUAL_ANIMATION_CHECKLIST.md | 400 | Pre-ship gate |
| **Total** | **~6000** | |

---

## Decisions Locked (Adit input 2026-05-14)

| Question | Answer |
|----------|--------|
| Mascot | Option 4 — cartridge (brand-cohesive) |
| MVP scope | B — Full Retro (all effects ON) |
| CRT default | ON (toggleable) |
| Section names | confirmed all 7 |
| Cartridge 3D | b — top 3 R3F + bottom 3 SVG |
| Header themed | yes — full HUD bar with stage indicator |
| Boot sequence | yes (1.6s, skip after first visit) |
| Sound effects | yes (default mute, opt-in) |
| Vertex jitter shader | yes (PS1-style wobble) |
| CRT post-FX shader | yes (default ON desktop, OFF mobile) |
| Light mode | functional toggle, not deep audit |
| Custom cursor | skip MVP (defer to v2) |
| Tone.js | DROPPED entirely |

Budget: 3 weeks · 18 working days · single owner (Adit) + Hermes assist.

---

## Related Docs

- `../design-2026-archive-studio-session/` — old DAW spec (frozen for reference)
- `../redesign-2026.md` — original high-level vision (now superseded by this spec)
- `../perf-fix-plan.md` — existing performance plan (still valid, will be merged into Phase 2 `performance.md`)
- `../structure.md` — repo structure overview
- `../stack.md` — tech stack reference

---

## Conventions

- **Priority**: P0 (blocker), P1 (must-have), P2 (should-have), P3 (nice-to-have)
- **Effort**: S (< 4h), M (1-2 days), L (3-5 days), XL (1 week+)
- **Status**: ☐ todo · ⏳ in-progress · ✅ done · ❌ blocked · ⏸ paused
