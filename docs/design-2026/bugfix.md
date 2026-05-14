# Bugfix — Known Issues + Tech Debt RETRO CONSOLE 2026

> Issues to address along the redesign. Some carry over dari `perf-fix-plan.md` lama.
> Companion: `tasks.md` (granular execution).

---

## 1. Carry-Over from Studio Session Era

Issues yang ada di repo sekarang tapi tidak di-fix sebelum redesign — di-kerjakan inline saat sprint.

### B1. About section file size 957 LOC
- **Severity**: P1
- **Fix**: rewrite to ≤ 250 LOC (lihat tasks.md E1)
- **Sprint**: Sprint 2 Day 7
- **Status**: ☐ TODO

### B2. Tone.js in first-load bundle
- **Severity**: P0
- **Fix**: Tone.js dropped entirely (Contact section redesigned)
- **Sprint**: Sprint 2 Day 11
- **Status**: ☐ TODO

### B3. Floating notes / decorative emoji background
- **Severity**: P2
- **Fix**: Removed in retro console redesign — visual noise gone
- **Sprint**: Implicit (deleted with section rewrites)
- **Status**: ☐ TODO

### B4. Multiple accent colors (5+)
- **Severity**: P0
- **Fix**: Single accent RED #E10600, palette enforced
- **Sprint**: Sprint 1 Day 1 (tokens) + audit Sprint 3
- **Status**: ☐ TODO

### B5. No `prefers-reduced-motion` global override
- **Severity**: P1
- **Fix**: Added to globals.css (lihat tokens.md §1)
- **Sprint**: Sprint 1 Day 2
- **Status**: ☐ TODO

### B6. Section dividers static + decorative
- **Severity**: P2
- **Fix**: Replaced with `<StageDivider variant />` (loading/glitch/door)
- **Sprint**: Sprint 1 Day 5
- **Status**: ☐ TODO

### B7. `dynamic()` imports tanpa skeleton
- **Severity**: P1 (CLS contributor)
- **Fix**: All `dynamic()` calls add `loading: () => <SectionSkeleton />`
- **Sprint**: Sprint 2 (per section)
- **Status**: ☐ TODO

### B8. Spotify ticker tidak ada fallback
- **Severity**: P2
- **Fix**: Empty state copy `> STANDBY · OFF AIR`
- **Sprint**: Sprint 2 (during About rewrite)
- **Status**: ☐ TODO

### B9. Project modal tech stack hardcoded
- **Severity**: P1
- **Fix**: New `tech` field per project (data schema migration §3.3)
- **Sprint**: Sprint 2 Day 10 (Projects)
- **Status**: ☐ TODO

### B10. Experience section: no current job indicator
- **Severity**: P1
- **Fix**: New `current: boolean` field, RED border on current tile
- **Sprint**: Sprint 2 Day 9
- **Status**: ☐ TODO

---

## 2. New Issues Likely to Surface (Predicted)

Based on tech stack changes + retro theme demands. Add to this list as encountered.

### B11. R3F SSR errors
- **Symptom**: "ReferenceError: window is not defined" during build
- **Cause**: 3D components must not SSR
- **Fix**: Wrap all 3D imports in `dynamic({ ssr: false })`
- **Status**: PROACTIVE — handle in Sprint 2 Day 6

### B12. Custom shader compilation errors per browser
- **Symptom**: Black canvas on Safari/Firefox, works on Chrome
- **Cause**: GLSL precision qualifiers, WebGL2 vs WebGL1 differences
- **Fix**: Test cross-browser, add `precision mediump float;` to fragment, fallback to plain material
- **Status**: PROACTIVE — handle in Sprint 3 Day 13

### B13. VT323 font hairlines
- **Symptom**: VT323 too thin to read at small sizes
- **Cause**: Font designed for ≥ 32px
- **Fix**: Strict rule: VT323 only for display ≥ 32px (enforce via lint)
- **Status**: PROACTIVE — documented in design.md §3.3

### B14. Boot sequence flicker
- **Symptom**: Boot screen disappears then reappears briefly during hydrate
- **Cause**: Hydration mismatch — server renders boot, client checks localStorage and unmounts
- **Fix**: Mount boot only after `useEffect` confirms localStorage state, render `null` initially
- **Status**: PROACTIVE — handle in Sprint 3 Day 14

### B15. CRT shader breaks dark/light mode
- **Symptom**: Light mode + CRT scanlines = unreadable
- **Cause**: Scanline overlay uses `mix-blend-mode: multiply` which works on dark only
- **Fix**: Different blend mode per theme, or auto-disable CRT on light mode
- **Status**: PROACTIVE — handle in Sprint 3 Day 12

### B16. Pause menu scroll lock leaks
- **Symptom**: Body scroll still works when pause menu open on iOS Safari
- **Cause**: iOS Safari `overflow: hidden` doesn't fully lock
- **Fix**: Use `position: fixed; top: -${scrollY}px` trick, restore on close
- **Status**: PROACTIVE — handle in Sprint 1 Day 4

### B17. Stage indicator stuck on wrong section
- **Symptom**: HUD bar shows "STAGE-03" while user is at STAGE-04
- **Cause**: IntersectionObserver threshold tuning, simultaneous overlapping sections
- **Fix**: Use rootMargin + threshold tuple, prefer last-entered section if multiple intersect
- **Status**: PROACTIVE — handle in Sprint 1 Day 3

### B18. Cartridge canvas too many WebGL contexts
- **Symptom**: "Too many WebGL contexts" warning, canvases rendering empty
- **Cause**: Browser limit ~16 simultaneous WebGL contexts; 6 cards × 1 each = 6 (OK) but cumulative across page (mascot 1 + portrait 1 + cartridge 3 + crystal 1 = 6) = 6 (OK)
- **Fix**: Stay under 8 contexts at once; if exceed, use offscreen rendering pattern with single context (advanced)
- **Status**: PROACTIVE — keep cartridge 3D top 3 only

### B19. Scroll-snap conflicts with hash anchors
- **Symptom**: `#about` link scrolls to wrong section due to scroll-snap
- **Cause**: `scroll-snap-type` on `<html>` interferes with anchor jumps
- **Fix**: Don't add scroll-snap to root; only to specific overflow containers (mobile experience tiles only)
- **Status**: PROACTIVE — handle in Sprint 2 Day 9

### B20. SFX autoplay blocked
- **Symptom**: First user interaction triggers no sound
- **Cause**: Browser autoplay policy requires gesture
- **Fix**: Default mute, opt-in via Header SFX button. First click of SFX-on triggers `play().catch()` which warms up
- **Status**: PROACTIVE — documented in 3d-and-animation.md §5

### B21. Tailwind v4 @theme not picking up custom colors
- **Symptom**: `bg-red` class doesn't apply, falls back to default
- **Cause**: Tailwind v4 needs `@theme` block in correct CSS file (globals.css imported by app)
- **Fix**: Verify `@theme` is in entry CSS, not nested
- **Status**: PROACTIVE — handle in Sprint 1 Day 1

### B22. localStorage SSR error
- **Symptom**: Build fails with "localStorage is not defined"
- **Cause**: Reading localStorage in component body during SSR
- **Fix**: Always wrap in `useEffect` or `typeof window !== 'undefined'` check
- **Status**: PROACTIVE — code review checklist

### B23. Image alt text inconsistent
- **Symptom**: Lighthouse a11y warning
- **Cause**: Some `<Image>` use `alt=""` (decorative) others meaningful, some missing
- **Fix**: Audit pass, decorative = `alt=""`, meaningful = descriptive
- **Status**: PROACTIVE — Sprint 3 Day 16

### B24. NEXT_PUBLIC_THEME_2026 cache mismatch
- **Symptom**: Flag flip but old theme still serving
- **Cause**: Next.js build-time constant baked in; need rebuild
- **Fix**: Always rebuild after env change; or runtime flag with cookie (slower)
- **Status**: ACCEPTED TRADE-OFF — build-time flag faster runtime

### B25. lucide-react icon bloat
- **Symptom**: First-load includes icons not used
- **Cause**: Default import `import { Foo } from 'lucide-react'` works fine if `experimental.optimizePackageImports` is set
- **Fix**: Verify `next.config.js` has `optimizePackageImports: ['lucide-react']`
- **Status**: PROACTIVE — config check Sprint 1 Day 1

---

## 3. Tech Debt Backlog (Defer to Post-Launch)

### TD1. Light mode deep audit
Light mode functional but not visually polished per section. Defer to v2.

### TD2. Custom cursor
Optional polish. Skip MVP.

### TD3. Konami code easter egg
Story-map.md §10 mentions. Defer to v2.

### TD4. Service Worker / offline mode
Performance.md §12. Defer to v2.

### TD5. Multi-language version
Out of scope (requirements §3 / §8).

### TD6. Real-time visit counter (footer "visit #N")
Story-map.md §10. Defer to v2.

### TD7. Recording mode di Contact (capture sequence)
Studio Session-era backlog item. Now obsolete (Tone.js dropped). Killed.

### TD8. Audio glue / Tone.js section automation
Killed (Tone.js dropped).

### TD9. 3D mascot upgrade from cartridge to character
Currently mascot = cartridge (Option 4). v2 may upgrade to Option 2 (Game Boy character) or Option 3 (Adit avatar).

### TD10. Server-side analytics
Currently Vercel Analytics free tier. Defer enhancement.

---

## 4. Bug Reporting Process

### 4.1 During Sprint

- Encountered bug → log in this file under Section 5 (Active Bugs)
- Severity: P0 (blocker) / P1 (must fix) / P2 (should fix) / P3 (nice fix)
- Fix in current sprint if P0/P1, defer to backlog if P2/P3

### 4.2 Post-Launch

- User-reported bugs go to Linear/GitHub Issues
- Triage weekly
- Hotfix critical, batch P2 monthly

---

## 5. Active Bugs (live tracker — update as encountered)

> Empty during planning phase. Append entries here selama implementation.

```
### B-XXX. [Title]
- Severity: P[0-3]
- Reported by: [name/sprint]
- Sprint: [N]
- Steps to reproduce: ...
- Expected: ...
- Actual: ...
- Fix: ...
- Status: ☐ TODO / ⏳ IN PROGRESS / ✅ FIXED / ❌ BLOCKED
```

---

## 6. Verified Resolutions (after fix)

> Move entries here from Section 1, 2, 5 once fixed and verified in production.

(empty)

---

## 7. Cross-Reference

- Performance issues → also tracked in `performance.md`
- Migration / rollback risks → `migration.md` §4
- Acceptance criteria gates → `requirements.md` §7

---

> Update entries as you go. Don't let bugs accumulate silently.
