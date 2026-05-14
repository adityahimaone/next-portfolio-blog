# Design 2026 — Documentation Index

> Comprehensive redesign spec for `next-portfolio-blog` (Adit's portfolio)
> Created: 2026-05-14 · Owner: Adit · Spec author: Hermes

---

## Purpose

Folder ini berisi spec lengkap untuk redesign portfolio v2026. Pendekatannya structured ala Kiro spec — tiap dokumen punya tanggung jawab spesifik dan saling reference. Goal-nya: lu bisa eksekusi step-by-step tanpa harus mikir ulang context tiap buka file.

## Reading Order

Buat first-time reader (atau kalo balik lagi setelah break panjang), baca urut ini:

1. **`requirements.md`** — Apa yang harus dicapai dan kenapa. Acceptance criteria.
2. **`design.md`** — Visual direction, color system, typography, component patterns.
3. **`plan.md`** — Strategi eksekusi: sprint, milestone, dependencies.
4. **`tasks.md`** — Task list granular per file. Ini yang dipake harian.
5. **`performance.md`** — Performance budget, metric, fix list (extends `../perf-fix-plan.md`).
6. **`migration.md`** — Backward compat, deprecation path, rollback plan.
7. **`story-map.md`** — Section-by-section narrative + copy direction.
8. **`tokens.md`** — Design tokens (color, type, spacing, motion) — copy-paste ready.
9. **`bugfix.md`** — Known issues + technical debt yang harus dibereskan along the way.

## Document Status

| Doc | Status | Last Updated |
|-----|--------|--------------|
| requirements.md | DRAFT | 2026-05-14 |
| design.md | DRAFT | 2026-05-14 |
| plan.md | DRAFT | 2026-05-14 |
| tasks.md | DRAFT | 2026-05-14 |
| performance.md | DRAFT | 2026-05-14 |
| migration.md | DRAFT | 2026-05-14 |
| story-map.md | DRAFT | 2026-05-14 |
| tokens.md | DRAFT | 2026-05-14 |
| bugfix.md | DRAFT | 2026-05-14 |

## Related Docs

- `../redesign-2026.md` — High-level vision (parent doc, gw udah bikin sebelumnya)
- `../perf-fix-plan.md` — Existing performance plan (`Lighthouse audit · April 2026`)
- `../structure.md` — Repo structure overview
- `../stack.md` — Tech stack reference

## Conventions

- **Priority**: P0 (blocker), P1 (must-have), P2 (should-have), P3 (nice-to-have)
- **Effort**: S (< 4h), M (1-2 days), L (3-5 days), XL (1 week+)
- **Status**: ☐ todo · ⏳ in-progress · ✅ done · ❌ blocked · ⏸ paused
- **DAW shell preservation**: `❗DAW-PRESERVE` tag untuk anything yang tidak boleh diubah parent shell-nya per memory note
