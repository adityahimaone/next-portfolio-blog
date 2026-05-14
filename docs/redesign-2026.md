# Portfolio Redesign 2026 — Recommendation
> next-portfolio-blog · Frontend audit + visual direction
> Author: Hermes (for Adit) · 2026-05-14

---

## TL;DR — 30 Detik Versi

Portfolio lu udah punya **identitas yang kuat** (music/DAW metaphor). Itu DNA-nya, jangan dibuang. Tapi ada 3 problem fundamental:

1. **Story-nya overlap** — Skills muncul di 3 tempat (Hero "core modules", About "Technical Specifications", Skills "Mixer"). User jadi bingung mana yang kanon.
2. **Visual fatigue** — Setiap section pake frame skeumorphic berat (mixer dalem mixer dalem section). Lu kehilangan ritme. Music itu butuh **silence between notes** — bukan cuma loud.
3. **Performance ngorbanin first impression** — LCP ~5.5s, preloader nutupin element penting, semua section di-`dynamic()` import tanpa skeleton.

**Solusi 2026:** Pertahankan DAW theme, tapi treat tiap section kayak track berbeda dalam album yang sama — bukan 6 mixer ditumpuk. Tambahin "negative space" (silence). Fix performa biar sound systemnya kedengeran sebelum lu pindah lagu.

**Tema 2026 yang gw rekomen:** **"Studio Session — Refined"** (mature DAW, less skeumorphism, more editorial typography, layered glass instead of plastic boxes).

---

## 1. Audit Per Section — Story Map

| # | Section | Label | Story Sekarang | Problem |
|---|---------|-------|----------------|---------|
| 1 | Hero | LIVE SESSION | "Album cover" — nama artist + transport | Logo + "MODEL NO. AH-2026-MKIII" + "New Release" badge → 3 visual hierarchy bertabrakan |
| 2 | Marquee | "WHERE CODE MEETS RHYTHM" | Track separator | Bagus, tapi statis |
| 3 | About | ARRANGEMENT VIEW · The Workflow | DAW timeline w/ 4 tracks (bio, stack, stats, audio) | Section paling padat (957 LOC). Stats + Skills overlap dengan section lain. Detail VST modal heavy |
| 4 | Skills | AUDIO ENGINEERING · Sonic Arsenal | Mixer board (faders + knobs) | Story bagus, tapi static skill bars di About bikin redundant |
| 5 | Experience | CAREER DISCOGRAPHY · The Collection | Track selector + spinning vinyl | Strong! Story-nya clear |
| 6 | Projects | TRACKS · Featured Releases | Vinyl sliding out dari sleeve | Strong, hover interaction memorable. Modal "liner notes" oke |
| 7 | Contact | SESSION BOOKING · Launch Collaboration | Launchpad/MPC dengan Tone.js | **Killer feature** — tapi posisinya di footer, banyak orang ga pernah scroll |

### Story Flow Saat Ini (linear)
```
Hero  ──▶  Marquee  ──▶  About (DAW)  ──▶  Skills (Mixer)  ──▶  Exp (Player)  ──▶  Projects (Vinyl)  ──▶  Contact (Launchpad)
   ↑           ↑              ↑                   ↑                  ↑                    ↑                       ↑
 album        FM            studio            console           playlist             physical              live performance
 cover       radio          control            board                                  release
```

Konsep keren, tapi user nyambung kalo story-nya ngalir. Sekarang yang kerasa: tiap section restart dari 0 dengan frame yang beda bentuk.

---

## 2. Tema 2026 Direction

### REKOMENDASI UTAMA: "Studio Session — Refined"

**Inti:** Tetap DAW/music, tapi naikin level dari "skeuomorphic plastic" ke "professional studio aesthetic." Think **Splice / Ableton 12 marketing site / Native Instruments Komplete** — bukan logic Pro X tahun 2008.

#### Prinsip Visual

| Sebelum | Sesudah |
|---------|---------|
| Plastic mixer w/ screws di setiap corner | Cinematic dark studio dengan reflective surface |
| Banyak `border + shadow + bg-zinc-200` | Glass layer + subtle gradient (dark mode dominant) |
| Floating notes (♫ ♩ ♬) di background | Subtle waveform / spectrum trail follow scroll |
| Saturated section colors (purple/pink/orange) | Single accent (electric amber atau plasma cyan) + grayscale |
| Sans-serif Syne italic | Editorial mix: **Editorial New / Migra / PP Neue Machina** untuk headline + **JetBrains Mono / IBM Plex Mono** untuk meta |

#### Color Palette 2026 (proposed)

```
Background:     #0A0A0B (near-black, warm)  /  #FAFAF8 (paper white)
Surface 1:      #131316
Surface 2:      #1C1C20
Border:         rgba(255,255,255,0.06)
Text primary:   #EDEDED
Text muted:     #8A8A8E
ACCENT:         #FF6B35  (electric amber — VU-meter glow)
ACCENT alt:     #00E5FF  (signal cyan — only for active states)
```

**Kenapa amber?** Itu warna lampu LED pada hardware audio profesional (Neve, SSL, UAD). Match sama "PLAYING" indicator yang lu udah pake di Hero.

### ALTERNATIF (kalo mau pivot)

- **Option B — "Sonic Brutalism"**: editorial 80vw typography, no boxes, cuma teks raksasa + minimal rules. Risk: terlalu jauh dari DNA lu.
- **Option C — "Liquid Glass 2026"**: blur + gradient + Apple-style depth. Risk: clash sama ide hardware/physical music.

Stick to **A**. Itu evolution, bukan revolution.

---

## 3. Per-Section Recommendation

### 3.1 Hero — "Album Cover Drop"

**Problem sekarang:**
- 3 elemen kompetisi: nama gigantis "ADITYA HIMAONE" + LCD ticker + "New Release" rotated stamp
- "MODEL NO. AH-2026-MKIII" di About duplicate vibe yang sama
- Vinyl notes floating background bikin noise tanpa nambah info

**Recommendation:**
1. **Pilih satu hero anchor**: nama besar ATAU transport bar — bukan dua-duanya seukuran sama
2. **Ganti "New Release" stamp** jadi version chip kecil (`v2026.05`) di pojok — masih tetap "release" vibe tapi ga rotational stamp yang udah cliche
3. **Tambah Now Playing live** sebagai LCD content — bukan static "Edge of Desire" string. Pake real Spotify "now playing" lu (lu udah ada API route-nya `/app/api/now-playing/`)
4. **Hero subtitle** → ganti dari generik "Orchestrating code and rhythm" ke statement spesifik: 
   > "Frontend Engineer at Fast 8 — building Bisadaya for thousands of jobseekers"
   
   Concrete > poetic. People hire concrete.
5. **Scroll cue** — tambahin animated "drop the needle" indicator (vinyl arm turun) instead of generic chevron

**Performance kritis di sini:**
- `<h1>` ADITYA = LCP element. Sekarang dia di-wrap `motion.h1` initial opacity 0 + delay. **WAJIB CSS-only animation** (sesuai perf-fix-plan.md P1)
- Preloader 1200ms masih nutupin LCP — pertimbangin **No preloader sama sekali first visit**, ganti pake skeleton/optimistic render

### 3.2 Marquee — "FM Radio Interlude"

**Sekarang:** Static loop, music phrases jalan.

**Recommendation:**
- Keep, tapi sync ke audio frequency kalo Hero "Play" lagi running. Jadi marquee kecepatannya nge-react ke BPM. Lu udah punya `useAudioFrequency` hook.
- Tambah text content yang **personal**, bukan generic ("Coding to the beat"). Contoh: "🎧 Currently looping: Clean Architecture · 📻 Now spinning: Edge of Desire (Sunrise Mix)"

### 3.3 About — "The Workflow" (DAW Timeline)

**ATTENTION:** This is core identity. Per memory notes lu — **DAW shell harus dipertahankan**, redesign cuma inner modal content.

**Problem:**
- 957 LOC dalam 1 file. Sebagian besar buat MODAL CONTENT yang udah encode 4 tracks × clips × VST headers
- "Technical Specifications" di sini DUPLIKASI dengan "Sonic Arsenal" (Skills section)
- Stats tab duplicate juga (years/projects bars vs experience section)

**Recommendation:**

**Refactor story-nya jadi 3 track aja, bukan 4:**

| Track | Konten | Story |
|-------|--------|-------|
| **IDENTITY** (track 1) | Bio + signal flow timeline + status + I/O ports | Siapa lu |
| **NOW PLAYING** (track 2) | Spotify live + currently learning + current company link | Apa yang lu lagi kerjain |
| **METRICS** (track 3) | Output history bars + commits + simple "what makes me tick" | Kontribusi lu |

Buang "STACK/Technical Specifications" track — pindahin semua ke Skills section. Skills section yang represent stack, About represent person.

**Visual:**
- Reduce VST modal chrome (3 fake knobs di header, screws). Itu bagus 1 kali, ga perlu setiap clip
- Tambahin **playhead progress** beneran ngepasin ke clip yang aktif — sekarang playhead jalan tapi ga sync sama clip apapun

**Code health:**
- Pisahin tiap clip content ke file sendiri (`about/clips/identity-clip.tsx` etc) — file 957 LOC nyusahin maintenance
- Memoize `tracks` array, sekarang regenerate setiap render

### 3.4 Skills — "Sonic Arsenal" (Mixer)

**Sekarang strong banget:** real interaktif fader + knob + VU meter. Bagus.

**Tapi:**
- Mixer 2025 di label, ganti ke 2026
- Mobile cuma show 4 fader (potong yang lain) — story lu broken di mobile
- Knobs tarik manual via `onPan` — UX kayanya niche, banyak user ga ngerti

**Recommendation:**
1. **Ganti label** "MIX-MASTER 2025" → "MIX-MASTER 2026"
2. **Mobile experience**: bikin scroll horizontal mixer panel (drag-to-pan kayak DAW beneran) instead of cut. Lu bisa show 6 fader semua tinggal scroll
3. **Tambah "preset" buttons** di top mixer: `[FRONTEND]` `[BACKEND]` `[DESIGN]` — klik = faders otomatis posisi sesuai role. Itu ngajarin user gimana cara ngeliat skill lu sambil interactive. Sekaligus tighten link sama Contact section yang juga pake "presets"
4. **Story tighten**: tambah caption kecil di bawah mixer → "Each fader = years of practice. Drag to remix the role."
5. Hover knob bisa show "SINCE 2017" / "USED IN 12 PROJECTS" — kasih konteks

### 3.5 Experience — "The Collection" (Discography)

**Strong.** Vinyl spinning + tracklist selector + period badge. Story matang.

**Suggestion kecil:**
- Tambahin **"DURATION"** = lama kerja di tiap track ("2y 4m") — kayak album track length. Saat ini cuma show period range
- Tambahin **link to artifact** kalo ada — link ke Bisadaya untuk Fast 8, etc. Cantelin rilisnya
- "Now Playing" di footer player area show selected job sebagai "currently playing" — bagus, tapi kalo belum di-click track 1 = "Now Playing", buat eksplisit
- Buat highlight job sekarang (Fast 8) dengan badge "★ CURRENT" di tracklist — sekarang lu cuma rely sama urutan

### 3.6 Projects — "Featured Releases" (Vinyl Sleeves)

**Strong.** Hover effect (vinyl slide out from sleeve) memorable banget.

**Improvement:**
1. **Proof of impact**: setiap card cuma title + genre + year. Tambahin **1 metric per project** — "100K+ visits", "Used by 3 enterprises", "Featured on Vercel" — apapun yang ada
2. **Modal "Liner Notes"** — keren, tapi bisa lebih jauh:
   - Tambahin **role lu spesifik** ("Solo dev", "FE Lead of 4")
   - **Tech stack** yang lu pake (sekarang hardcode "React, Next.js, Tailwind, TypeScript" — itu sama di semua project, buat dynamic per project)
   - **Live demo link button** + **GitHub source link** kalo ada
   - **Screenshot gallery** kalo ada (sekarang 1 image)
3. **Sort/filter by genre** di top: "All / Web3 / Corporate / Productivity" — kayak filter di Apple Music
4. **Total releases counter** di header: "06 / 06 RELEASES" — kayak album count

### 3.7 Contact — "Launch Collaboration" (Launchpad)

**KILLER FEATURE.** Tone.js launchpad bikin tap-to-trigger sound + tap-functional-pad-buka-link. Memorable.

**Tapi posisinya rugi:**
- Di paling bawah → kebanyakan user ga sampe situ
- Setelah 6 section heavy, user udah capek

**Recommendation:**
1. **Pre-tease at Hero**: kasih CTA secondary "Or jam with me →" yang scroll langsung ke Contact. People love instant gratification.
2. **Tambah preset row di tab UI** — sekarang lu udah ada presets data (`presets.ts`). Surface ke UI dengan label genre: "[CHILL] [TRAP] [LOFI]" — playful entry buat user yang takut nyentuh launchpad
3. **Functional pads (Email, Github, Spotify, etc)** — kasih **subtle pulse** by default biar user tau itu interactive. Sekarang silent sampe di-hover
4. **Recording mode**: tambah button "RECORD" yang capture sequence tap user, terus generate shareable link `?seq=xyz` — viral mechanic. (Future feature, nice-to-have)
5. **Mobile UX**: 4×6 grid masih bisa diiritin — pad terlalu kecil di iPhone. Make functional pads (Email/GH/LI/Spotify/Resume) span 2 cells, dummy pads tetep 1.

### 3.8 Footer — "Liner Notes Final"

Sekarang udah lengkap (Brand + nav + tech stack). Saran:
- Tambahin **"Last commit"** badge — pull dari GitHub API. Show portfolio is alive.
- **Currently spinning** mini player (kecil, 1 line) yang nge-mirror Spotify status. Closure cantik.

---

## 4. Visual Story Sync — Big Changes

### 4.1 Buang duplikasi
- About → buang "Technical Specifications" + "Core Modules" track. Skills section yang punya domain itu.
- About Stats → cukup ringkasan 3 angka, jangan ulangi experience bar

### 4.2 Konsisten color story
Sekarang section pake banyak color berbeda (purple, blue, pink, orange di experience; green untuk stats; amber/blue/yellow di skills). 

**Saran**: 1 accent color (amber #FF6B35) untuk semua "active state" (playhead, selected pad, current track, LED on). Section background semua zinc/neutral. Variation cuma di **chroma signal lights** (red=record, green=play, amber=active, blue=signal flow). Itu konvensi audio gear beneran.

### 4.3 Section transition
Sekarang antar section lu pake `<SectionDivider />` static. Upgrade ke:
- **Cassette tape rewinding** animation between Experience → Projects
- **Mixing board signal flow line** between Hero → About
- **Crossfader sweep** between Projects → Contact

Subtle, ga ganggu performa kalo CSS-only.

### 4.4 Audio glue (opsional)
Saat user "Play" di hero, **biarin musik nemenin selama scroll**. Hook ke section yang aktif buat ngubah filter (low-pass saat Skills, reverb saat About, dll) menggunakan `Tone.js` yang udah dipake di Contact. Tone of the section literally = sound of the section.

Cuma worth it kalau lu commit ke audio-first DNA. Else, skip — bisa annoy user.

---

## 5. Performance — Visual & Engineering

### Critical (do first — uda di `perf-fix-plan.md`, gw extend)

| # | Issue | Fix |
|---|-------|-----|
| P1 | LCP 5.5s | CSS animation untuk hero `<p>`, kill motion delay, cap preloader 1200ms (sebagian udah done — verify di build) |
| P2 | Legacy JS 11 KiB | Set tsconfig target ES2022, browserslist sudah ada di package.json — bagus |
| P3 | Render-blocking CSS | Critical CSS inline + `next/font` (lu udah `Syne` from `next/font/google` — bagus) |
| P4 | Unused JS | `react-syntax-highlighter` cuma butuh di blog post page → already lazy. `tone.js` cuma butuh di Contact → confirmasi udah `dynamic()` |
| P5 | Non-composited animations | Audit motion props yang animate `width/height/left/top` → ganti ke `transform/opacity` |

### Tambahan dari gw

**P7 — About section bundle bloat (957 LOC)**
- Pisahin clip content jadi MDX/ts files. Lazy load tiap modal content saat klik clip. Saving estimate: ~25 KiB initial.

**P8 — Reduce decorative animations**
- Floating ♫ ♩ ♬ di landing page = 3 motion components running infinite. Replace with 1 SVG sprite + CSS animation. Save ~3 KiB JS + GPU work.

**P9 — Preloader strategy**
- First visit: skeleton screen (CSS-only) instead of full preloader. Preloader is 80s nostalgia — but 80s is your style **only if** lu sanggup nge-bayar performance budget-nya. Right now nggak.

**P10 — Image optimization audit**
- `public/cover.jpg`, `nwjns.jpeg`, `Edge of Desire (Sunrise Mix).jpg` → convert ke WebP/AVIF. Use `next/image` dengan `priority` cuma untuk hero image (kalo ada).
- Project thumbnails di `public/assets/` → resize ke 800w max, current keliatan original.

**P11 — Bundle analyzer**
- Lu udah punya `@next/bundle-analyzer`. Jalanin `pnpm build && ANALYZE=true pnpm build` → screenshot biggest chunks → kasih ke gw, gw bantu prune.

**P12 — Lazy boundary fix**
```tsx
// landing-page.tsx — semua section di-`dynamic()` tanpa skeleton
const AboutSection = dynamic(() => import('../components/about-section').then(...))
```
Tambahin `loading: () => <SectionSkeleton />` biar layout stable (CLS metric).

**P13 — Tone.js code split**
- Tone bundle ~150 KiB. Defer load sampe user benar-benar scroll deket Contact section (intersection observer). Sekarang masuk bundle saat user buka /contact route atau Hero "Play" pertama.

### Animation performance budget

Untuk smooth 60fps, lu boleh:
- **Max 3 simultaneous motion animations** running visible viewport
- **No `box-shadow`/`filter` animations** (force layer recalc)
- **Always animate `transform` + `opacity`** — lainnya pertimbangin lagi
- **Subscribe to `prefers-reduced-motion`** — sekarang belum gw liat di global CSS, semua user dapet animation full

Tambahin di `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Quick Wins vs Deep Changes

### 1-day quick wins (high impact, low effort)
1. ✅ Update mixer label `2025` → `2026`
2. ✅ Replace static "Edge of Desire" Hero ticker dengan live Spotify now playing
3. ✅ Add `prefers-reduced-motion` global override
4. ✅ Add `★ CURRENT` badge di experience selector buat current job
5. ✅ Tambah "Or jam with me →" CTA secondary di Hero pointing to Contact section
6. ✅ Spam reduction: hapus floating ♫ ♩ ♬ background notes (visual noise)
7. ✅ Hero subtitle: ganti generic copy → spesifik (current company + audience)

### 1-week medium changes
1. About section: refactor jadi 3 track (buang Stack track, surface ke Skills)
2. Skills: tambah `[FRONTEND][BACKEND][DESIGN]` preset buttons buat fader auto-position
3. Projects: tambah 1 metric per card + tech stack dynamic per project
4. Performance: complete `perf-fix-plan.md` P1-P6
5. Section dividers: replace static dengan musical transition (cassette rewind, signal flow line)

### 2-week deep changes
1. Refactor `about-section.tsx` (957 LOC → file per clip)
2. Implement single-accent color system (amber for active state, retire purple/pink/blue/orange section colors)
3. Audio glue: tone-the-section sebagai user scroll (Tone.js filter automation)
4. Mobile experience: horizontal scroll mixer board, larger functional pads
5. Recording mode di Contact (capture sequence + shareable link)

---

## 7. Visual Design Token Update (proposed)

```ts
// tailwind config / CSS vars
:root {
  /* Surface */
  --surface-0: #0A0A0B;        /* page bg */
  --surface-1: #131316;        /* card */
  --surface-2: #1C1C20;        /* nested card */
  --border: rgba(255,255,255,0.06);
  
  /* Text */
  --text-primary: #EDEDED;
  --text-secondary: #A8A8AC;
  --text-muted: #6E6E73;
  
  /* Accent — single signal */
  --accent: #FF6B35;            /* amber — active/playing/recording state */
  --accent-glow: 0 0 12px rgba(255, 107, 53, 0.4);
  
  /* Signal lights (small accents only) */
  --led-rec: #FF3B30;
  --led-play: #34C759;
  --led-mute: #007AFF;
  --led-solo: #FFCC00;
  
  /* Type */
  --font-display: 'Editorial New', 'Migra', serif;  /* headlines */
  --font-body: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Typography hierarchy
```
H1 hero:        clamp(56px, 12vw, 144px) · Editorial New italic, light weight
H2 section:     clamp(36px, 6vw, 72px)   · Editorial New, regular
H3 card:        24px                     · Inter, semibold
Body:           16px                     · Inter, regular, line-height 1.6
Meta/labels:    11px                     · JetBrains Mono, uppercase, tracking-widest
```

Kunci: editorial heading + monospace meta = "studio rack labels meets fashion mag." It's mature.

---

## 8. Story Synchronization — One-line per Section

Lu boleh adopt ini sebagai voice/copy direction biar tiap section "say something":

| Section | Tagline | Copy direction |
|---------|---------|----------------|
| Hero | LIVE SESSION · `v2026.05` | "Currently spinning at Fast 8 · Building Bisadaya" |
| Marquee | FM 96.0 — Adit's Channel | Real-time: now learning, now building, now listening |
| About | THE WORKFLOW | "Here's the arrangement: identity, current loop, output history" |
| Skills | SONIC ARSENAL | "Drag the faders. Pick a preset. See how I'd sound on your team." |
| Experience | CAREER DISCOGRAPHY | "Five tracks, one career. Hit play on each." |
| Projects | FEATURED RELEASES | "Six records out. Pick one — I'll tell you what went into the mix." |
| Contact | LAUNCH COLLABORATION | "Tap a pad. Make a beat. Send me a message — or just jam." |
| Footer | END OF SIDE A | "More on the B-side: blog ↗ · resume ↗ · github ↗" |

Konsisten metaphor language di setiap section bikin user **inheriting the world**. Saat ini campur antara musical metaphor + tech jargon — pilih satu sebagai dominant.

---

## 9. Implementation Roadmap (Suggested)

### Sprint 1 (Week 1) — Story tighten + perf foundation
- [ ] About: refactor 4 track → 3 track, pisahin clip content per file
- [ ] Hero: kill motion wrapper LCP, CSS-only animation, replace static ticker dengan live now-playing
- [ ] Performance P1-P3 from perf-fix-plan.md
- [ ] Add `prefers-reduced-motion` global rule
- [ ] Update mixer "2025" → "2026"

### Sprint 2 (Week 2) — Visual unification
- [ ] Color token migration ke single-accent (amber)
- [ ] Section dividers: musical transitions
- [ ] Skills: preset buttons + mobile horizontal scroll
- [ ] Projects: metric per card + dynamic stack per project
- [ ] Floating notes: replace with subtle scroll-following waveform

### Sprint 3 (Week 3) — Polish & audio glue
- [ ] Typography migration (Editorial New / Migra / JetBrains Mono)
- [ ] Tone.js section automation (low-pass on scroll)
- [ ] Contact: pre-tease CTA at hero, surface preset buttons
- [ ] Footer: last commit badge + mini player

### Sprint 4 (Week 4) — Performance final pass
- [ ] Bundle analyzer audit + tree-shake
- [ ] Image conversion to AVIF/WebP  
- [ ] Tone.js IntersectionObserver-deferred load
- [ ] Lighthouse target: Performance 90+, LCP < 2s, CLS < 0.05
- [ ] Real device test (iPhone SE, mid-range Android)

---

## 10. Things gw Tinggalkan Dengan Sengaja

- **Three.js / WebGL hero** — overkill, ga match performa target
- **Cursor trail effect** — udah ada `custom-cursor.tsx`, bagus, ga perlu lebih
- **Section snap scroll** — udah lu pake (`snap-y snap-mandatory`), keep it
- **Theme switcher** — keep, gw assume udah work
- **Blog page** — out of scope dokumen ini, focus ke landing
- **Contact form**: lu udah pake launchpad jadi gateway-nya — ga perlu form tradisional. Bagus.

---

## Appendix — Files Yang Perlu Diubah

| Priority | File | Type | Notes |
|----------|------|------|-------|
| P0 | `features/landing-page/components/hero-section.tsx` | Edit | LCP fix, ticker live data, copy |
| P0 | `app/globals.css` | Edit | reduced-motion, hero-desc keyframe |
| P0 | `features/landing-page/animations/preloader.tsx` | Verify | already capped 1200ms — ensure sessionStorage skip works |
| P1 | `features/landing-page/components/about-section.tsx` | **Refactor** | 957 → split clips per file, drop Stack track |
| P1 | `features/landing-page/components/skills-section.tsx` | Edit | "2025" → "2026", presets, mobile scroll |
| P1 | `features/landing-page/constants/index.ts` | Edit | Add `metric` field per project, `link` per experience |
| P2 | `features/landing-page/components/projects-section.tsx` | Edit | metric chip, dynamic stack, sort/filter |
| P2 | `features/landing-page/components/experience-section.tsx` | Edit | duration field, current badge, links |
| P2 | `components/section-divider.tsx` | Replace | musical transition variants |
| P3 | `tailwind.config` / globals.css tokens | Edit | new color system |
| P3 | `features/layout/components/footer.tsx` | Edit | last commit + mini player |

---

## Closing

DAW metaphor lu adalah **moat** — banyak portfolio frontend, tapi sedikit yang punya identity audio engineering yang konsisten. Don't kill it. Tighten it.

Approach gw di rekomen ini: 80% refine, 20% remove. Yang lu udah punya bagus banget. Yang kurang itu **silence between the notes**.

Setelah sprint 1-2 done (~2 minggu), portfolio lu bakal kerasa kayak album proper, bukan demo tape. After sprint 4 done, performa-nya juga match dengan visual ambition-nya.

---

*Ada pertanyaan / mau gw drill-down ke section tertentu, kasih tau aja.*
