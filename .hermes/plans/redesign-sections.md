# Section Redesign Research & Plan
**Branch:** feat/redesign-sections
**Date:** 2026-05-28

---

## Current State Analysis

### 1. About Section (about-section.tsx)
- **Current:** DAW/Ableton-inspired timeline with clip blocks, tracks (Identity/Stack/Stats/Spotify), playhead animation, mute/solo controls
- **Modal content:** VST-style detail window with screws, LCD title, fake knobs — full DAW aesthetic
- **Strengths:** Creative concept, interactive (mute/solo/play), good layout inside modal
- **Issues:** Modal content is busy — VST header takes ~80px, knobs decorative, lots of chrome competing with actual bio content

### 2. Skills Section (skills-section.tsx)
- **Current:** Audio mixer board with faders (languages), knobs (frameworks/tools), VU meter, power switch
- **Strengths:** Unique concept, interactive knobs/faders, good visual weight
- **Issues:** 
  - Very heavy component (~360 lines), lots of custom physics (drag, spring animations)
  - Skills data hardcoded in MIXER_DATA constants
  - Knobs hard to read actual skill levels
  - Mobile layout cuts to 4 items only

### 3. Experience Section (experience-section.tsx)
- **Current:** "Career Discography" — tracklist selector (left) + detail player (right) with spinning vinyl
- **Strengths:** Good 2-column layout, clean selection UX, animated transitions
- **Issues:** Music metaphor less relevant here, vinyl spinner is decorative noise, "Now Playing" footer doesn't add value

### 4. Projects Section (projects-section.tsx)
- **Current:** Album cover grid with vinyl sliding out on hover, detail modal with "Liner Notes"
- **Strengths:** Cool hover interaction (vinyl slides out), good card structure
- **Issues:** Modal has hardcoded tech tags (React/Next.js/Tailwind/TypeScript for ALL projects), vinyl metaphor doesn't fit real projects

---

## Design Research Findings

### From Sparkbites (DESIGN.md references)

**Linear.app — Dark, Precise, Information-Dense**
- Background: `rgb(8, 9, 10)` — near-black
- Surface depth via 1-3 RGB value increments (not shadows)
- Typography: Inter Variable, weights 510/590 (between regular/medium, medium/semibold)
- Borders: `rgba(255, 255, 255, 0.08)` — moonlight on glass
- Ring shadows: `rgba(0, 0, 0, 0.33) 0 0 0 1px` for contained elements
- Max radius: 8px for cards
- Color accent: muted indigo `#5E6AD2`
- Negative letter-spacing as size increases
- **Takeaway:** Surface hierarchy through luminance, not decoration. Typography weight creates emphasis, not color.

**Matteosantoro.dev — Minimal Developer Portfolio**
- System font stack (ui-sans-serif) — no loading, no FOUT
- Opacity-based black/white palette (no named colors)
- Flat cards with `rgba(0,0,0,0.05)` surfaces
- Slate hover states
- Maximum simplicity
- **Takeaway:** Developer portfolios work best with restraint. Content > chrome.

### From Magic UI Components

**BentoGrid** — Grid layout for feature showcase:
- `auto-rows-[22rem] grid-cols-3 gap-4`
- Cards with hover reveal CTA
- Dark mode: `dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]`
- Good for: About section content blocks, Skills grid

**Marquee** — Infinite scroll:
- Horizontal/vertical, pause-on-hover, reverse
- Good for: Skills ticker, tech stack showcase

---

## Redesign Proposals

### Proposal A: "Clean Linear-Inspired" (Recommended)
Strip music metaphors. Keep existing structure but modernize with Linear-like surface depth, clean typography, and subtle animations.

### Proposal B: "Bento-First"
Replace all sections with bento grid layouts. Each skill/experience/project is a card in a unified grid system.

### Proposal C: "Hybrid — Keep Music, Clean Execution"
Keep the music/DAW theme but clean up the implementation — reduce chrome, focus on content readability.

---

## Detailed Redesign for Proposal A

### About Section — "Clean Modal Content"
**Goal:** Keep the DAW timeline as the section wrapper, but redesign the MODAL CONTENT inside clips.

Changes:
- Remove VST header chrome (screws, LCD, fake knobs) from modal
- Replace with clean header: name + role + status badge
- Content flows as a clean card layout (spec sheet left, modules right)
- Keep the "signal flow" timeline but simplify
- Add subtle surface depth (Linear-style `rgba` borders)
- Status panel stays but without the heavy green treatment

### Skills Section — "Marquee + Clean Grid"
**Goal:** Replace mixer board with a more scannable, modern layout.

Changes:
- Replace mixer metaphor with **bento-style grid** + **marquee ticker**
- Top: Marquee scrolling tech logos (infinite scroll, pause on hover)
- Bottom: BentoGrid with 3 columns:
  - Col 1 (span 2): "Frontend" — large card with skill bars
  - Col 2: "Languages" — compact list
  - Col 3 (span 2): "Frameworks" — compact list with icons
  - Col 4: "Tools" — compact list
- Skills data stays in constants, just different presentation
- Much lighter implementation (~150 lines vs 360)

### Experience Section — "Timeline Cards"
**Goal:** Replace music player metaphor with a professional timeline.

Changes:
- Remove vinyl spinner, "Now Playing" footer
- Left sidebar: vertical timeline with year markers + connecting line
- Right: clean card with role, company, description
- Active state: subtle left accent bar (keep existing motion)
- Add period badge at top of detail card
- Keep AnimatePresence transitions

### Projects Section — "Clean Cards + Detail Modal"
**Goal:** Keep album cover cards but fix the modal.

Changes:
- Cards: keep hover image zoom, remove vinyl sliding out
- Replace with simple image scale + subtle overlay on hover
- Modal: remove "Production Credits" hardcoded tags
- Replace with actual project tech stack from data
- Remove "Listen to Track" CTA, use "View Project" with ArrowUpRight
- Keep 2-column modal layout (image left, content right)

---

## Components to Install (if Proposal A)

```bash
# Magic UI Marquee (for skills ticker)
npx shadcn@latest add "https://magicui.design/r/marquee.json"
```

No other new deps needed — existing motion/react, lucide-react, tailwind sufficient.

---

## Implementation Order
1. Skills section (biggest change — mixer → bento + marquee)
2. About modal content (clean up chrome)
3. Experience section (vinyl → timeline)
4. Projects section (fix modal + simplify cards)
