# Plan: Neumorphism Redesign — Full Landing Page

## Branch: `feat-neumorphism` (already created from main)

---

## 1. globals.css — Neumorphism Utilities + Background Fix

Add to `app/globals.css`:

```css
/* Neumorphism */
.neu-raised {
  box-shadow: 8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.7);
}
.dark .neu-raised {
  box-shadow: 8px 8px 16px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.05);
}
.neu-pressed {
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.08), inset -4px -4px 8px rgba(255,255,255,0.7);
}
.dark .neu-pressed {
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(255,255,255,0.05);
}
.neu-flat {
  box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5);
}
.dark .neu-flat {
  box-shadow: inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.03);
}
```

Update body background: `#f0f0f3` (light) / `#18181b` (dark) — required for neumorphism shadows to show.

---

## 2. Header — Neumorphism

File: `features/layout/components/header.tsx`

**Current:** `bg-linear-to-b from-zinc-100 to-zinc-200` with `shadow-xl`
**Change to:**
- Outer header: `neu-raised bg-[#f0f0f3] dark:bg-zinc-900 rounded-b-2xl`
- Power switch: keep skeuomorphic (dark inset) — this is the contrast that makes it premium
- Nav knobs: keep skeuomorphic knobs but add `neu-raised` hover effect
- Mobile toggle: keep skeuomorphic
- Input jack: keep skeuomorphic

The pattern: **neumorphic casing** + **skeuomorphic controls** = premium audio gear look.

---

## 3. Footer — Neumorphism

File: `features/layout/components/footer.tsx`

**Current:** `bg-white dark:bg-zinc-950` with `border-t border-zinc-200`
**Change to:**
- Outer footer: `neu-raised bg-[#f0f0f3] dark:bg-zinc-900 rounded-t-3xl mt-8`
- Social links cards: keep gradient cards but add neumorphic shadow on hover
- Tech stack badges: `neu-flat` style, subtle inset
- Bottom bar: keep as-is (inside neumorphic container)
- Status badge: `neu-raised` green glow

---

## 4. Sonic Arsenal — Outer Neumorphism + Oscilloscope + New Channel

File: `features/landing-page/components/skills-section.tsx`

**Outer casing:**
- `neu-raised bg-[#f0f0f3] dark:bg-zinc-900 rounded-3xl p-4`
- Inner casing stays `shadow-inner border border-zinc-400/50 bg-zinc-300 dark:bg-zinc-950`

**Oscilloscope:**
- Import `Oscilloscope` from `features/music/components/oscilloscope.tsx`
- Place next to VU Meter: `flex flex-row gap-4`
- VU Meter: 150px wide, Oscilloscope: fills remaining space
- Both inside a container that sits in the top-right panel of the mixer

**New channel: DAW & PLUGINS**
Add to constants:
```ts
{
  id: 'daw',
  label: 'DAW & PLUGINS',
  type: 'knob',
  channels: [
    { name: 'ABLETON', level: 80 },
    { name: 'LOGIC', level: 70 },
    { name: 'FL ST', level: 60 },
    { name: 'VST', level: 75 },
  ],
}
```

Render as 4th section in the mixer grid, same knob style as Frameworks/Tools.

---

## 5. Experience Section — Neumorphism

File: `features/landing-page/components/experience-section.tsx`

**Tracklist (left):**
- Container: `neu-raised bg-[#f0f0f3] dark:bg-zinc-900 rounded-2xl p-2`
- Track items: `neu-flat` on hover
- Active track: `neu-pressed` inset shadow + indicator bar

**Player (right):**
- Container: `neu-raised bg-[#f0f0f3] dark:bg-zinc-900 rounded-3xl`
- Vinyl record: keep spinning, add neumorphic shadow ring
- Player controls: `neu-flat` bottom panel

---

## 6. Section Dividers — Music Themed

Replace `SectionDivider` with themed dividers:

### `features/landing-page/dividers/tape-reel-divider.tsx`
Two animated spinning circles (reels) connected by a thin line. Motion: rotate.

### `features/landing-page/dividers/vinyl-divider.tsx`
Small spinning vinyl record. Uses existing vinyl CSS classes.

### `features/landing-page/dividers/waveform-divider.tsx`
Animated SVG sine wave line. CSS animation.

### `features/landing-page/dividers/cassette-divider.tsx`
Mini cassette tape shape with animated reels.

**Usage in landing-page.tsx:**
- Hero→About: `TapeReelDivider`
- About→Skills: `VinylDivider`
- Skills→Experience: `WaveformDivider`
- Experience→Projects: `CassetteDivider`

---

## 7. Music/DAP Elements

### a. Audio Visualizer Background (Hero)
- Import `AudioReactiveBg` from `features/music/components/audio-reactive-bg.tsx`
- Wrap hero content in it, mode="bars", intensity="subtle"
- Only visible when music playing

### b. Floating Music Notes (Already exists)
- Keep existing notes in landing-page.tsx
- Add 2 more notes for density

### c. Sticky Mini-Player (Already exists)
- Enhance with `neu-raised` frame
- Position: fixed bottom-right

### d. Tape Deck Decorative
- Import `TapeDeck` from `features/music/components/tape-deck.tsx`
- Place as decorative element next to skills section (hidden on mobile, visible on xl)

---

## 8. Implementation Order

1. `globals.css` — neumorphism utilities + bg color update
2. `constants/index.ts` — add DAW mixer data
3. `header.tsx` — neumorphism casing
4. `footer.tsx` — neumorphism casing
5. Create dividers (4 files)
6. `skills-section.tsx` — outer neu, oscilloscope, new channel
7. `experience-section.tsx` — apply neumorphism
8. `landing-page.tsx` — swap dividers, add audio bg, tape deck
9. Git commit + push

---

## Files Modified/Created

| File | Action |
|------|--------|
| `app/globals.css` | ADD neu utilities |
| `features/landing-page/constants/index.ts` | ADD DAW channel |
| `features/layout/components/header.tsx` | MODIFY neu casing |
| `features/layout/components/footer.tsx` | MODIFY neu casing |
| `features/landing-page/components/skills-section.tsx` | MODIFY neu + oscilloscope |
| `features/landing-page/components/experience-section.tsx` | MODIFY neu |
| `features/landing-page/views/landing-page.tsx` | MODIFY dividers + audio bg |
| `features/landing-page/dividers/tape-reel-divider.tsx` | CREATE |
| `features/landing-page/dividers/vinyl-divider.tsx` | CREATE |
| `features/landing-page/dividers/waveform-divider.tsx` | CREATE |
| `features/landing-page/dividers/cassette-divider.tsx` | CREATE |
