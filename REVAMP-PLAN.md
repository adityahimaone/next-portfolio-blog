# V1 Portfolio Revamp Plan — `revamped-1.0`

**Theme:** Music/DAW (preserved 100% — timeline, tracks, clips, playhead, mute/solo, vinyl, mixer board, drum pads).
**Approach:** Tighten interactions, fix a11y, drop dead weight, modernize patterns. Shell sacred, content/UX/motion polished.
**Source:** Multi-agent analysis (3 parallel sub-agents, kr-opus-4.7).

---

## Priority Tiers

### Tier 1 — High Impact / Low Risk (executed first)

**Hero**
- Remove dead `ReactiveVisualizer` import + `{false && ...}` block (~15 KB gzip savings)
- Fix h1 a11y: 2× h1 tags (`ADITYA` + `HIMAONE`) → 1 h1 with sr-only + visual spans
- Smooth scroll for `TRACKS` anchor → `#projects` (currently jumps)
- Memoize LCD marquee duration to stop recompute per track change
- Mobile clamp player: `max-w-[95vw]` + badge offset clamping
- Reduced-motion guard via `useReducedMotion()`

**About modal**
- Full a11y pass: `role="dialog" aria-modal="true" aria-labelledby` + ESC key handler + focus trap
- Mobile sizing: `h-[90dvh] max-h-[700px]` (replace hardcoded `max-h-[500px]`)
- Toolbar timer: replace `Date.now() % 10` (re-renders every render) with `setInterval` only when playing

**Skills**
- Tighten motion: Knob `duration: 0.6` (was 1.5s + 0.5s delay), Fader `duration: 0.5`
- VU Meter: `useMemo` random durations to stop re-shuffle on parent re-render
- Add numeric tooltip on Fader/Knob hover/focus
- Reduced-motion guard

**Projects**
- Always-visible action buttons (top-right corner) — no hover gating
- Title `line-clamp-2 min-h-[3.5rem]` instead of `truncate`
- Card a11y: `role="button" tabIndex={0} onKeyDown` Enter/Space
- Modal description: expand toggle, not silent `line-clamp-4`

**NowPlaying / Music**
- Fix `Math.random()` in render path (hydration mismatch risk) — pre-compute via `useMemo`
- `aria-live="polite"` region announcing `Now playing: ...`
- Bump Spotify polling 10s → 30s (or use SWR focus revalidation)
- Pause `useAnimationFrame` in MusicBackground when `document.hidden`

### Tier 2 — Medium Impact (next pass)

- Faders/Knobs: full keyboard a11y (`role="slider"`, `aria-valuemin/max/now`, ArrowUp/Down ±5%)
- Experience: `role="tablist"` + `role="tab"` + `aria-selected` + ArrowDown/Up nav
- Experience: replace counter with prev/next buttons + `[` `]` shortcut
- Mobile experience: `scrollIntoView` on selection if `< 1024px`
- Projects: per-project `tech: string[]` + `repoUrl` for secondary GitHub link
- Contact: keyboard shortcuts (QWERTY pad mapping) + `aria-pressed` for loops
- Music player: MediaSession API (lock screen / Bluetooth controls)
- Music player: graceful autoplay-policy detection + "tap to enable" overlay
- Music player: mobile tap-to-expand (replace hover-only)

### Tier 3 — Optional Modern Wins

- Hero parallax → CSS `animation-timeline: scroll()` with `@supports` progressive enhancement
- About clip → modal: View Transitions API with `viewTransitionName`
- About: 1-2 more clips per track to fill timeline arrangement

---

## Files Touched in 1.0

```
features/landing-page/components/hero-section.tsx
features/landing-page/components/about-section.tsx
features/landing-page/components/skills-section.tsx
features/landing-page/components/experience-section.tsx
features/landing-page/components/projects-section.tsx
features/landing-page/components/contact/contact-section.tsx
features/landing-page/spotify/now-playing.tsx
features/landing-page/spotify/music-player.tsx
features/landing-page/spotify/music-background.tsx
```

## Files Untouched (DAW shell preserved)

- Track headers, M/S buttons, playhead, ruler, timeline grid
- Mixer board chassis, screws, channel strips, master section
- Vinyl record visuals, tonearm, turntable platter
- Drum pad grid layout, cabinet/amp framing, USB-C decoration

## Out of Scope for 1.0

- Adding new sections / removing existing sections
- Refactoring constants/data shape (would force breaking changes for V2/V3)
- Replacing motion library or adding new dependencies
- Server-side caching for Spotify API

## Verification (when Adit pulls in Mac)

- `npm run lint` — no new warnings
- `npm run build` — clean build, no type errors
- `/` route — visual smoke test, all sections render
- Lighthouse a11y score — should bump from current baseline
- Reduced-motion toggle in DevTools — animations should disable gracefully

---

Generated 2026-05-25 by multi-agent synthesis.
