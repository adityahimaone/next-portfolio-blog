# Editorial v4.0 Tasks

> Source plan: Portfolio Redesign — v3.0 (classical painterly illustrations × refined typography × deep parallax)
> Active branch: feat/editorial-v4
> Snapshot of prior version preserved on feat/revamped-4.0

## Metaphor / Concept

Redesign total visual language portfolio dari hardware/music aesthetic (DAW synth workstation) ke **editorial fine-art** yang terinspirasi structured.money: classical illustrations sebagai primary visual, serif display headline yang commanding, achromatic palette yang sophisticated, dan smooth multi-layer parallax scroll di setiap section.

Semua content dari v2 **dipertahankan dan dimapping ulang** — tidak ada yang hilang, hanya presentasi yang berubah total.

---

## Status Foundation (already in feat/revamped-4.0)

- [x] Preloader component (akan di-redesign ke sequence baru)
- [x] Playhead + BPM clock (akan di-remove, tidak perlu di editorial style)
- [x] Audio engine + Tone.js integration (akan di-retain untuk music section)
- [x] Feature-based folder structure (`features/landing-page/`)
- [x] Tailwind v4 setup
- [x] Next.js 15 App Router
- [x] Content mapping dari v2 (about, skills, projects, experience, music, contact)

---

## Phase 0 — Foundation & Design Tokens ✅ DONE

**Acceptance criteria:**
- [x] Tailwind v4 @theme tokens untuk color palette (canvas, slate, smoke, ink, off-white, accent-grey, dark-surface, dark-card)
- [x] Typography tokens (Playfair Display + Inter via next/font)
- [x] Spacing + radius tokens (section-gap, card-padding, element-gap, radius-card, radius-button, radius-pill)
- [x] CSS variables injected ke globals.css
- [x] Lenis smooth scroll provider setup
- [x] ParallaxLayer component (reusable Framer Motion + useScroll)
- [x] useCursorFollower hook (lerp-based cursor tracking)
- [x] Cursor follower DOM element (global, z-index 9999)
- [x] Preloader redesign (new sequence: title fade → subtitle → line extend → fade out)
- [x] Header component (transparent → solid on scroll, ghost nav links)
- [ ] Illustration assets downloaded + optimized (Next.js Image) — SKIP (manual)

**Files to create:**
- `app/globals.css` — @theme tokens + Lenis setup
- `features/landing-page/hooks/use-parallax-layer.ts` — ParallaxLayer hook
- `features/landing-page/hooks/use-cursor-follower.ts` — cursor follower hook
- `features/landing-page/components/parallax-layer.tsx` — reusable component
- `features/landing-page/components/cursor-follower.tsx` — global cursor element
- `features/landing-page/components/preloader-v4.tsx` — new preloader sequence
- `features/landing-page/components/header-v4.tsx` — new header with scroll detection
- `public/illustrations/` — hero-bg.jpg, hero-fg.png, about-portrait.jpg, skills-*.jpg, experience-bg.jpg, contact-bg.jpg, music-bg.jpg

**Files to modify:**
- `app/layout.tsx` — add Lenis provider, cursor follower, new fonts (Playfair Display)
- `tailwind.config.ts` — @theme tokens
- `features/landing-page/views/landing-page.tsx` — orchestrator untuk new sections

---

## Phase 1 — Preloader + Hero ✅ DONE

**Acceptance criteria:**
- [x] Preloader sequence (1200ms total: title fade → subtitle → line → fade out)
- [x] Hero full-viewport layout (100vh, overflow hidden)
- [x] Hero: 5-layer stack (bg dark surface, illustration A, illustration B, radial gradient vignette, centered content)
- [x] Hero: parallax speeds (0.10, 0.25, 0.55 per layer)
- [x] Hero: centered content (label, line, name, subtitle, CTA button)
- [x] Hero: cursor follower integration (40px circle, expand on hover)
- [x] Hero: scroll indicator (bottom center, fade out on scroll)
- [x] Mobile responsive (parallax disabled, stacked layout)

**Files to create:**
- `features/landing-page/components/hero-section-v4.tsx`
- `features/landing-page/components/scroll-indicator.tsx`

**Files to modify:**
- `features/landing-page/views/landing-page.tsx` — swap hero-section to hero-section-v4

---

## Phase 2 — About + Skills ✅ DONE

**Acceptance criteria:**
- [x] About: two-column layout (illustration left, prose right)
- [x] About: circular mask illustration (480px diameter)
- [x] About: stats cards (2x2 grid, hover lift animation)
- [x] About: parallax on illustration (0.30 speed)
- [x] Skills: dark alternating section (--color-dark-surface)
- [x] Skills: three-column feature cards
- [x] Skills: illustration per card (parallax 0.20–0.25)
- [x] Skills: [ + - ] expand toggle (Framer Motion layout animation)
- [x] Skills: proficiency indicator (dot system 1–5) on expand
- [x] Mobile responsive (stack to single column)

**Files to create:**
- `features/landing-page/components/about-section-v4.tsx`
- `features/landing-page/components/skills-section-v4.tsx`
- `features/landing-page/components/skill-card.tsx`
- `features/landing-page/components/stats-card.tsx`

**Files to modify:**
- `features/landing-page/views/landing-page.tsx` — swap sections

---

## Phase 3 — Experience + Projects ✅ DONE

**Acceptance criteria:**
- [x] Experience: canvas section, vertical timeline (central line, alternating left/right entries)
- [x] Experience: entry cards (--color-smoke background, 9px radius, 32px padding)
- [x] Experience: background illustration layer (opacity 0.06, parallax 0.08)
- [x] Experience: hover lift animation on cards
- [x] Experience: pulsing dot animation on timeline
- [x] Projects: dark section (--color-dark-surface)
- [x] Projects: featured full-width card (16/7 aspect ratio)
- [x] Projects: 2-column grid cards (4/5 aspect ratio)
- [x] Projects: in-card image parallax on hover (scale + translateY)
- [x] Projects: overlay gradient + text panel
- [x] Mobile responsive (single column)

**Files to create:**
- `features/landing-page/components/experience-section-v4.tsx`
- `features/landing-page/components/experience-card.tsx`
- `features/landing-page/components/projects-section-v4.tsx`
- `features/landing-page/components/project-card-v4.tsx`

**Files to modify:**
- `features/landing-page/views/landing-page.tsx` — swap sections

---

## Phase 4 — Music Player + Contact 🔥 ACTIVE

**Acceptance criteria:**
- [ ] Music: canvas section (--color-slate background)
- [ ] Music: two-column layout (now playing card left, prose right)
- [ ] Music: now playing card (album art circular mask, progress bar, controls, waveform visualizer)
- [ ] Music: Tone.js integration retained (audio engine from revamped-4.0)
- [ ] Music: background illustration (opacity 0.08, parallax 0.12)
- [ ] Contact: full-viewport closing section (100vh, --color-ink background)
- [ ] Contact: multi-layer parallax (illustration, vignette, centered content)
- [ ] Contact: email button (ghost style, mailto link)
- [ ] Contact: social links (GitHub, LinkedIn, Email)
- [ ] Contact: footer text (copyright)
- [ ] Mobile responsive

**Files to create:**
- `features/landing-page/components/music-section-v4.tsx`
- `features/landing-page/components/now-playing-card.tsx`
- `features/landing-page/components/contact-section-v4.tsx`

**Files to modify:**
- `features/landing-page/views/landing-page.tsx` — swap sections
- `features/landing-page/spotify/music-player.tsx` — adapt to new card style

---

## Phase 5 — Polish + Responsive

**Acceptance criteria:**
- [ ] All parallax speeds tuned (visual audit on Mac)
- [ ] Cursor follower variants (default, hover-link, hover-project, hover-image)
- [ ] Mobile responsive verified (375px viewport, all sections)
- [ ] Reduce motion: @media (prefers-reduced-motion) — disable parallax + cursor
- [ ] LCP optimization (lazy load illustrations, priority hero)
- [ ] Dark mode tested (if applicable)
- [ ] Loading + error states designed
- [ ] Anti-slop checklist passed
- [ ] Buttons always visible (no hover-only essentials)
- [ ] Content audit: semua v2 content terpetakan ke v4

**Files to modify:**
- All section components — responsive tweaks
- `app/globals.css` — @media (prefers-reduced-motion)
- `features/landing-page/views/landing-page.tsx` — final orchestration

---

## Visual Language Reference

| Section | Plan Color | Code Token | Status |
|---------|-----------|-----------|--------|
| Canvas BG | #EBEBEB | --color-canvas | ⏳ Phase 0 |
| Slate BG | #C4C3B6 | --color-slate | ⏳ Phase 0 |
| Smoke BG | #E7E5E4 | --color-smoke | ⏳ Phase 0 |
| Ink (text) | #000000 | --color-ink | ⏳ Phase 0 |
| Off-white | #DFDCD5 | --color-off-white | ⏳ Phase 0 |
| Accent Grey | #595855 | --color-accent-grey | ⏳ Phase 0 |
| Dark Surface | #0F0F0F | --color-dark-surface | ⏳ Phase 0 |
| Dark Card | #1A1A1A | --color-dark-card | ⏳ Phase 0 |
| Display Font | Playfair Display | --font-display | ⏳ Phase 0 |
| UI Font | Inter | --font-ui | ⏳ Phase 0 |

---

## How to Call This Doc

```bash
read_file(path='~/apps/next-portfolio-blog/docs/editorial-v4/tasks.md')
```

**Resume commands:**
- "lanjut phase 1" → start Hero + Preloader
- "lanjut phase 2" → start About + Skills
- "lanjut phase 3" → start Experience + Projects
- "lanjut phase 4" → start Music + Contact
- "lanjut phase 5" → start Polish + Responsive

---

## Notes

- **No build on VPS.** Commit + push only. Adit verifies on Mac.
- **Illustration sourcing:** Artvee.com, Met Museum, Rawpixel public domain.
- **Reuse from revamped-4.0:** Tone.js audio engine, preloader pattern, playhead logic (adapt for new style).
- **Content preservation:** All v2 content (about text, skills list, projects, experience timeline, music) stays — only visual presentation changes.
- **Branch strategy:** `feat/editorial-v4` is the working branch. `feat/revamped-4.0` remains frozen snapshot.
