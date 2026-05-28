# Signal Chain Tasks

> Source plan: Signal Chain Edition (Teenage Engineering Field × Audio Hardware)
> Active branch: feat/signal-chain
> Base: main

## Metaphor / Concept

Portfolio as a studio signal chain: every section is a hardware device in an audio signal path.
OP-1 → Marshall Amp → DJ Mixer → Turntable → DAP → Maschine → Patch Bay.

Theme: Teenage Engineering Field Series × Audio Hardware Storytelling
Colors: warm aluminum #D4CFCA, off-white #F0EDE8, matte black #1A1A1A, signal orange #FF5500, LED green #00FF41, screen teal #00B4D8
Fonts: SF Mono / JetBrains Mono (labels, readouts), Inter / DM Sans (body)
Texture: Brushed aluminum, grain, knurled knobs

## Status Foundation (built from main)

- [ ] Phase 0 — tokens, fonts, CSS custom properties, globals
- [ ] Phase 0 — color palette CSS vars scoped under .signal-chain-root
- [ ] Phase 0 — BootScreen (OP-1 style boot sequence)
- [ ] Phase 0 — TENavbar (TP-7 tape transport styled nav)

## Phase 1 — Hero "Live Session" (OP-1 Field) 🔥 ACTIVE
**Acceptance criteria:**
- [ ] Full-screen OP-1 Field top-down desk scene
- [ ] OP-1 SVG illustration with glowing OLED screen showing "ADITYA HIMAONE"
- [ ] Animated oscilloscope/Lissajous waveform on screen (Canvas)
- [ ] Knobs have hover rotation animation
- [ ] Status readout: WAVEFORM | STEREO | FILTER FREQ 440→1440
- [ ] CTA buttons: [▶ VIEW PORTFOLIO] [● RECORD SESSION]
- [ ] LCD marquee ticker below hero (amber on dark, monospaced, double-sided)
- [ ] Parallax layers: desk bg, OP-1 body, screen glow, floating notes
- [ ] 3-5% SVG noise filter overlay
**Files to create:**
- features/landing-page/components/hero/OP1Device.tsx
- features/landing-page/components/hero/HeroScreen.tsx
- features/landing-page/components/hero/LCDMarquee.tsx
- features/landing-page/components/hero/index.ts
**Files to modify:**
- features/landing-page/components/hero-section.tsx → redirect to hero/
- features/landing-page/views/landing-page.tsx (import path)

## Phase 2 — About "Signal Chain / Pre-Amplifier" + Skills "Sonic Arsenal"
**Acceptance criteria:**
- [ ] FL Piano Roll horizontal timeline with life event clips
- [ ] Marshall DSL20 amp illustration with animated VU meters
- [ ] Track headers sidebar (FL-style: TRACK 01..04)
- [ ] BPM / Status bar: 00:00:00 | 120 BPM | 4/4 | ● REC
- [ ] Scroll parallax: timeline 0.8x, amp 0.4x, knob 1.2x
- [ ] Pioneer DJM-900NXS2 4-channel mixer (Languages & Frameworks)
- [ ] TE TX-6 6-channel compact mixer (Tools)
- [ ] Channel faders at proficiency height, knob hover rotation, EQ indicators
- [ ] Hover → fader bounce, LED meter green
- [ ] Click → modal with oscilloscope proficiency reading
**Files to create:**
- features/landing-page/components/about/FLPianoRoll.tsx
- features/landing-page/components/about/MarshallAmp.tsx
- features/landing-page/components/about/TimelineClip.tsx
- features/landing-page/components/about/index.ts
- features/landing-page/components/skills/DJMixerPanel.tsx
- features/landing-page/components/skills/TX6Panel.tsx
- features/landing-page/components/skills/ChannelStrip.tsx
- features/landing-page/components/skills/Knob.tsx
- features/landing-page/components/skills/index.ts
**Files to modify:**
- features/landing-page/components/about-section.tsx → redirect to about/
- features/landing-page/components/skills-section.tsx → redirect to skills/

## Phase 3 — Experience "Career Discography" + Projects "Featured Releases"
**Acceptance criteria:**
- [ ] Turntable illustration (CDJ-3000 style) with spinning platter
- [ ] 4 vinyl records as job list, each with label design
- [ ] CDJ screen showing "Now Playing" job detail
- [ ] DAP device (A&K SP3000 style) with album grid screen
- [ ] Project cards as album artwork in DAP library
- [ ] Expanded "Now Playing" detail view with tech stack, duration, bitrate
- [ ] Semi-transparent HD800S/Z1R headphones beside DAP
**Files to create:**
- features/landing-page/components/experience/Turntable.tsx
- features/landing-page/components/experience/VinylRecord.tsx
- features/landing-page/components/experience/CDJScreen.tsx
- features/landing-page/components/experience/index.ts
- features/landing-page/components/projects/DAPDevice.tsx
- features/landing-page/components/projects/AlbumCard.tsx
- features/landing-page/components/projects/NowPlaying.tsx
- features/landing-page/components/projects/index.ts
**Files to modify:**
- features/landing-page/components/experience-section.tsx → redirect to experience/
- features/landing-page/components/projects-section.tsx → redirect to projects/

## Phase 4 — Contact "Session Booking" + Footer "Patch Bay" + PatchCable connectors
**Acceptance criteria:**
- [ ] Maschine Mk3 pad grid (4×4 interactive pads)
- [ ] Maschine screen with contact form
- [ ] Pad press → Tone.js tone + LED color pulse
- [ ] Patch bay footer with labeled ports (top=outputs, bottom=inputs)
- [ ] Hover → LED green + tooltip on footer ports
- [ ] Section-to-section PatchCable SVG connectors (draw on scroll)
**Files to create:**
- features/landing-page/components/contact/MaschineGrid.tsx
- features/landing-page/components/contact/MaschineScreen.tsx
- features/landing-page/components/contact/ContactPad.tsx
- features/landing-page/components/footer/PatchBay.tsx
- components/ui/PatchCableConnector.tsx
**Files to modify:**
- features/landing-page/components/contact/contact-section.tsx → integrate Maschine
- features/layout/components/footer.tsx → redirect to PatchBay

## Phase 5 — Polish. Parallax, responsiveness, audio, perf
**Acceptance criteria:**
- [ ] Parallax depths tuned per section
- [ ] Mobile responsive (devices scale down, parallax disabled <768px)
- [ ] Tablet (768-1024px) reduced parallax depth
- [ ] Audio (Tone.js) loaded on interaction only
- [ ] LazyMotion + domAnimation bundle
- [ ] Heavy SVGs lazy-loaded below fold
- [ ] Custom cursor (crosshair + ring)
- [ ] VU meter scroll indicator
- [ ] Patch cables animate on scroll (pathLength)
- [ ] Anti-slop checklist pass
**Files to modify:**
- features/landing-page/views/landing-page.tsx (VU meter, cursor)
- features/landing-page/animations/preloader.tsx (BootScreen)
- app/globals.css (noise filter, custom cursor)

## Visual Language Reference
| Section | Plan Color | Plan Hex | Usage |
|---|---|---|---|
| Global bg | Aluminum | #D4CFCA | Background panels |
| Global bg2 | Off-white | #F0EDE8 | Card surfaces |
| Dark | Matte black | #1A1A1A | Text, device bodies |
| Accent | Signal orange | #FF5500 | CTAs, active states, patch cable |
| LED | Green | #00FF41 | Status indicators, VU meter |
| Screen | Teal/Cyan | #00B4D8 | OLED screen content |

## How to resume
```
read_file(path='docs/signal-chain/tasks.md')
```
Then: "lanjut phase N" or "skip to phase 5 polish"
