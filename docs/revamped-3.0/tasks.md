# Revamped 3.0 → 4.0 Tasks

> Master task list untuk Portfolio Redesign 2026 — `adityahimaone.space`
> Source plan: `redesign-plan.md` v3.0 (May 2026)
> Active branch: `feat/revamped-4.0` (forked from `feat/revamped-3.0`)
> Snapshot of 3.0 preserved on branch `feat/revamped-3.0` for rollback.

---

## Metafor

> Portfolio = satu sesi produksi musik. Visitor scroll dari atas ke bawah = mengikuti satu sesi produksi lengkap. Setiap section = satu device/software berbeda dengan UI-nya sendiri. Tapi semua device ada di studio yang sama, dihubungkan kabel dan sinyal yang sama.

Benang merah:
- **Playhead** — garis tipis bergerak seiring scroll
- **BPM Counter** — di nav, tidak pernah berhenti
- **Track Color System** — konsisten satu language dari atas ke bawah

---

## Status Foundation (sudah ada di `feat/revamped-3.0`)

- [x] Phase 0 — CSS tokens (`--r3-*` variables), font stack, grain overlay
- [x] Phase 0 — `Playhead` component (scroll-driven, viewport-fixed, motion-reduced safe)
- [x] Phase 0 — `useBpmClock` hook (drift-free, visibility-aware)
- [x] Phase 0 — `MixerHeader` (sticky nav, channel strips with LED + mini-fader, IntersectionObserver)
- [x] Phase 0 — `Preloader` (boot log + sessionStorage skip + reduce-motion)
- [x] Existing Tone.js infra: `getTone()`, `BeatPad`, `SynthKnobs` (need r3 reskin)

**Section files yang udah ada di branch 3.0** (perlu audit per-section apa yang masih DAW-arrangement style vs synth/piano-roll/mixer/etc):
- `hero-section.tsx` — saat ini "DAW empty arrangement" → **harus diganti** ke Synth Workstation per plan
- `about-section.tsx` — perlu audit vs Piano Roll spec
- `skills-section.tsx` — perlu audit vs DJ Mixer spec
- `projects-section.tsx` — perlu audit vs Arrangement View spec
- `music-section.tsx` — perlu audit vs Reference Monitor spec
- `contact-section.tsx` — perlu audit vs Patch Bay + Bounce Dialog spec

---

## Phase 1 — Hero: Synthesizer Workstation 🔥 ACTIVE

> Device: Akai MPC / Sequential Prophet style synth. Visitor membuka workstation, melihat layar startup, lalu bisa "memainkan" synthesizer.

**Acceptance criteria:**
- [ ] LCD display zone — pixel/dot-matrix font, scanline overlay, phosphor glow, menampilkan preset info (nama Adit, tagline, oscillator state)
- [ ] Control panel zone — minimal 4 knobs (PITCH, FILTER CUTOFF, RESONANCE, VOLUME) dengan drag interaction
- [ ] Knob drag → real-time perubahan ke Tone.js state (cutoff filter, gain, dll)
- [ ] Oscillator type switch (saw / square / sine) — visual + audio
- [ ] PLAY/STOP button — trigger Tone.js sequence atau ambient drone
- [ ] Mini-keyboard 1 octave atau 8 MPC pads — click/tap = play note via Tone.js
- [ ] Setiap pad punya label kecil (profesi, tech, interest)
- [ ] Oscilloscope ambient layer di belakang — low opacity, animate
- [ ] Pitch bend wheel di sisi kiri (optional polish)
- [ ] CTA: `▼ scroll to play the session`
- [ ] Mobile responsive: knobs collapsed, hanya display + transport + pad bar
- [ ] `prefers-reduced-motion` honored (no auto oscillator wave loops)
- [ ] Audio context only starts on user gesture (Tone.start() on first interaction)
- [ ] No regression on `r3:armed` event broadcast (rest of page expects this)

**Files to create:**
- `features/landing-page/r3/synth-display.tsx` — LCD screen with scanlines + phosphor
- `features/landing-page/r3/synth-knob.tsx` — r3-themed knob (reskin SynthKnobs idea)
- `features/landing-page/r3/synth-pad.tsx` — keyboard/pad component
- `features/landing-page/r3/synth-oscilloscope.tsx` — canvas waveform background
- `features/landing-page/r3/use-synth-engine.ts` — Tone.js wiring (single shared synth + filter)

**Files to modify:**
- `features/landing-page/components/hero-section.tsx` — full rewrite to compose synth components
- `app/globals.css` — add LCD/scanline utilities (`.r3-lcd`, `.r3-scanlines`, `.r3-phosphor`)

---

## Phase 2 — About: FL Studio Piano Roll

> Hidup Adit sebagai komposisi MIDI. Sumbu X = waktu. Sumbu Y = significance.

**Acceptance criteria:**
- [ ] Horizontal piano roll grid component
- [ ] Note-bar component (start, length, pitch lane, color)
- [ ] Hover note → tooltip ala FL Studio note properties
- [ ] Color coding per kategori (learning, projects, career, pivots)
- [ ] Playhead integration (passes through this section)
- [ ] Toolbar visual props (select, draw, zoom — visual only)
- [ ] Prose section di bawah piano roll (2 paragraf, font Lora, "liner notes")
- [ ] Mobile: zoomed-in view, swipeable horizontal

---

## Phase 3 — Skills: DJ Mixer Hardware

> Pioneer DJM-900 style. Section paling "hardware" dari semua section.

**Acceptance criteria:**
- [ ] Layout 2 channel utama + master + (optional) channel 3 hidden
- [ ] EQ knobs per channel (HI/MID/LOW) — drag-able
- [ ] Channel fader (vertical, drag)
- [ ] LED dot proficiency system (5-dot)
- [ ] VU meter di master — animated (idle animation, atau audio-driven kalau hero synth playing)
- [ ] Crossfader — drag-able
- [ ] BPM/Sync display di atas mixer
- [ ] Cue buttons (highlight one channel)
- [ ] Channel 3 SYSTEMS slide-in animation
- [ ] Mobile: one channel visible, swipe untuk ganti channel

---

## Phase 4 — Projects: DAW Arrangement View

> Full-width arrangement grid. Multi-track horizontal timeline.

**Acceptance criteria:**
- [ ] Arrangement grid (tracks: FEATURED, WEB APP, TOOLS, SKETCHES)
- [ ] Clip component (warna by track color, length by scope)
- [ ] Click clip → expand panel detail (deskripsi, tech stack, GitHub link, demo)
- [ ] Featured track dengan star icon
- [ ] Track header dengan M/S buttons (filter projects)
- [ ] Sketches track auto-fetch GitHub repos
- [ ] Playhead highlight clip yang sedang "di bawah"
- [ ] Horizontal scroll (drag/swipe) di dalam section, page-scroll tetep vertical
- [ ] Mobile: clips sedikit lebih besar, swipeable

---

## Phase 5 — Music + Contact

### Music: Reference Monitor + DAP

**Acceptance criteria:**
- [ ] DAP device visual (kiri) — album art di display + scrolling track info
- [ ] Transport buttons functional via Spotify API
- [ ] Wheel/D-pad navigation
- [ ] Waveform monitor (kanan) — Tone.js analyzer FFT spectrum
- [ ] Level meter L/R
- [ ] Caption: "Reference track. Playing while everything above was being built."

### Contact: Patch Bay + Bounce Dialog

**Acceptance criteria:**
- [ ] Patch bay panel — SVG paths animasi snake dari jack kiri ke kanan
- [ ] Hover cable → label URL muncul
- [ ] Click → buka link
- [ ] Export dialog (style window with dropdowns + BOUNCE button)
- [ ] BOUNCE click → mailto, then progress bar render animation
- [ ] Final fade ke gelap dengan teks: "Session saved. // aditya_himawan_2026.flp // See you in the next one."

---

## Phase 6 — Thread + Polish

**Acceptance criteria:**
- [ ] Full playhead audit — playhead visible konsisten across all sections
- [ ] BPM counter never pauses (verify on every section)
- [ ] Track color system audit — accent colors konsisten
- [ ] Mobile responsive pass — every section
- [ ] `prefers-reduced-motion` audit — every animation honors
- [ ] Perf audit (per `perf-fix-plan.md` jika ada) — Lighthouse, bundle size, audio context lifecycle
- [ ] No layout shift on preloader exit
- [ ] Audio context cleanup on route change

---

## Visual Language Reference

```
Background deep:    #07070F       (--r3-studio in code: #090912)
Surface:            #0F0F1C       (--r3-console: #111120)
Surface elevated:   #161625       (--r3-rack: #18182a)
Border subtle:      #1E1E30       (--r3-edge: #25253a)
Border active:      #2E2E48
Text primary:       #EEEEF8       (--r3-text: #e8e8f8)
Text secondary:     #8888A8       (--r3-text-mute: #8b8ba8)
Text muted:         #3A3A58       (--r3-label: #3a3a55)
```

**Track colors (current code mapping):**
| Section | Plan color | Code token |
|---|---|---|
| HERO | #7B61FF (purple) | `var(--r3-clip)` #ff7043 |
| ABOUT | #FF7043 (orange) | `var(--r3-clip)` #ff7043 ✓ |
| SKILLS | #00E5FF (cyan) | `var(--r3-beat)` #4d9fff |
| PROJECTS | #39FF6E (green) | `var(--r3-signal)` #39ff6e ✓ |
| MUSIC | #FFD580 (amber) | `var(--r3-filament)` #ffd580 ✓ |
| CONTACT | #FF4D6D (red-pink) | `var(--r3-melody)` #c084fc |

> Note: ada divergence dengan plan — Hero & Skills & Contact pakai warna berbeda. Decision deferred ke Phase 6 polish.

**Type stack (current code):**
- Display: `Bricolage Grotesque, Inter Tight` (plan said Clash Display / Neue Montreal)
- Mono: `JetBrains Mono, Geist Mono` ✓
- Prose: `Lora, Source Serif 4` ✓
- Pixel/LCD: belum di-load, perlu add `Share Tech Mono` atau `VT323`

---

## How to call this doc

```
read_file(path='docs/revamped-3.0/tasks.md')
```

Atau kalau mau lanjut phase berikutnya tinggal:
> "lanjut phase 2 dari tasks.md"
> "skip ke phase 6 polish saja"
> "phase 3 dulu, skill mixer"
