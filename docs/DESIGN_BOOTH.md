# Glass Booth — Projects · Bookmarks · Blog

A ground-up redesign of `/projects`, `/bookmarks`, `/blog` and `/blog/[slug]`, built
from the language of the landing page's **rack 01**: near-black LCD ground,
signal-orange silkscreen, hardware dock, music-player objects. Stack unchanged:
Next.js 15, React 19, Tailwind v4, CSS Modules, `motion/react`.

> This document supersedes `design.md` (SIGNAL, side two) for these three pages.
> The earlier SIGNAL chrome is still in the repo and still serves the landing
> page; the two systems coexist.

---

## 1. Research: what to borrow, what to leave

**Liquid glass (Apple HIG / WWDC25).** Glass belongs to the **functional layer**
(tab bars, toolbars, sidebars, sheets, menus) floating over the **content layer**,
and should not be used on list rows, cards, media or long scrolling content.
Related rules that matter here:

- Don't stack glass on glass.
- Tint only to convey meaning (one primary action), not on everything.
- In steady states, avoid content intersecting glass at rest.
- Test on real hardware, because specular and lensing effects don't render
  faithfully everywhere.

**Music-app patterns worth stealing.** Apple Music and Spotify libraries solved
"many items, one list" long ago: a sidebar of playlists, track rows where the
index number becomes a play button on hover, 1:1 art as the visual unit, a
persistent mini-player that expands into a full transport, podcast chapters as
markers on a scrubber.

**What the rack already teaches.** `--lcd-black`, `--signal-orange`, `--chassis`,
`--slate`, `--lcd-green`, the orange mono eyebrow with a short top rule, huge tight
display titles, mono hints on the right, screws, LCD readouts, and the bottom dock.

### Take-aways that shaped the build

1. Glass is the **controls**, not the content. Content is flat, dark and
   typographic.
2. Immersion comes from a **room** (ambient colour that changes per channel), one
   **hero object** per page, and **motion that answers input** — not more
   decoration.
3. Every music motif must carry real data: waveform length = reading time,
   plays = views, LED colour = category, catalogue number = index.

---

## 2. The idea

The landing page is the **rack**. These three pages are the **booth behind it**: a
dark listening room with three sources you can route into.

| Page | Source | Familiar pattern | Hero object |
| --- | --- | --- | --- |
| `/projects` | **Crate** of releases | record store / album grid | the *Now Spinning* release |
| `/bookmarks` | **Library** of playlists | Spotify/Apple Music library | the playlist sidebar + track list |
| `/blog` | **Releases** and a reader | albums, tracklist, podcast chapters | the chapter scrubber |

One shared shell holds it together:

- **Room:** the ambient background, whose hue follows the current channel.
- **Dock:** one floating glass control that navigates *and* morphs into whatever
  transport the page needs.
- **Cover:** every item has a **1:1** cover, real or generated.

Three zones per page at most, one accent colour per view, and only two blurred
layers on screen at any time.

---

## 3. Shared system

### 3.1 The Room (background)

Layers, back to front: `--lcd-black`; a **colour wash** of two soft radial
gradients in the current channel hue, crossfading over 700ms; a grain tile at 4–5%
opacity (`/noise.png`) which stops the gradients banding and gives glass something
to sit on; and a vignette.

| Context | Wash hue |
| --- | --- |
| `/projects` | the open release's `palette.a` |
| `/bookmarks` | `CATEGORY_COLORS[category].accent` for the selected playlist |
| `/blog` | derived from the post's first tag |
| `/blog/[slug]` | the post's palette, kept for the whole read |

Glass needs colour behind it to have anything to refract, which is why this is a
wash and not flat black. The wash is CSS gradients, so it costs no image bytes and
almost no GPU.

**Theme.** Dark-first, like the rack's Work section. In light mode it becomes a
"daylight room": `--chassis` ground, a frosted-white glass variant, and the wash at
12% opacity. Light is a token swap, implemented in the same `:root` / `.dark` pair.

### 3.2 The Dock (the only persistent glass)

Floating, bottom-centre, one glass capsule. The destinations never disappear: the
current page's transport grows in beside them, so the control layer changes shape
instead of swapping.

```
idle          [ ⌂ ][ ▣ ][ 🔖 ][ ☰ ][ ♪ ]              destinations, active = orange dot
/blog/[slug]  [ ⌂ ][ ◀ ]  ▂▃▅▇▅▃  ch.3 · 4:12 / 9:40  [ ☰ ]
/bookmarks    [ ⌂ ][ ▣ ][ 🔖 ][ ☰ ][ ♪ ]  |  ⤮ Shuffle
/projects     [ ⌂ ][ ▣ ][ 🔖 ][ ☰ ][ ♪ ]  |  ◀ ▶ Switchyard · 0:07 / 3:05
```

- Pages register **slot content** through `useDockSlot()`, and the capsule morphs
  with `layout` animations.
- The glass recipe uses the rack's existing `--dock-*` tokens. The active
  destination gets the only tint on the page (signal orange).
- Keyboard: `g` then `p` / `b` / `l` jumps between pages, `/` focuses search,
  `j` / `k` move the list, `Enter` opens.
- Mobile: the dock stays bottom-centre and the slot wraps to its own row.
- The legacy `MagneticDock` returns `null` on these three routes, so only one
  glass bar composites in that corner.

### 3.3 Glass tokens (`app/globals.css`)

Booth tokens are prefixed `--booth-*` so they cannot collide with the SIGNAL
tokens of the same name still used by the landing chrome.

```css
:root {
  --booth-r-panel: 20px;  --booth-r-control: 999px;  --booth-r-cover: 14px;

  --glass-fill: linear-gradient(140deg, rgba(255,255,255,.7),
                               rgba(255,255,255,.38) 50%, rgba(255,255,255,.55));
  --glass-blur: blur(18px) saturate(1.5);
  --glass-edge: rgba(29,30,28,.14);
  --glass-shadow: inset 0 1px 0 #fff, 0 14px 40px -16px rgba(29,30,28,.35);
  --flat-fill: rgba(29,30,28,.04);      /* rows: translucent, never blurred */
  --flat-fill-hover: rgba(29,30,28,.08);
  --hairline: rgba(29,30,28,.12);
}
.dark { /* the same shape at 0.14 tint and blur(20px) saturate(1.7) */ }
```

`.glass` is the blurred surface. `.flat` is the content surface: translucent, no
blur, so it looks like the same material and is free to scroll.

**Glass budget (hard rule, verified in the browser).** At most **two** blurred
layers per view: the dock, plus one of {bookmarks sidebar, Now Spinning panel,
blog filter dock, chapter cue sheet}. Rows, covers, cards, chips and the reader
column use `--flat-fill` and never `backdrop-filter`. This is why control chips
use `.booth-control` (flat) rather than `.glass` — a page with a 40-chip filter
row would otherwise spend the entire budget on chips.

Optional real refraction (SVG `feDisplacementMap`) is applied to the dock only, and
only when `CSS.supports('backdrop-filter','url(#x)')` is true **and**
`hardwareConcurrency > 4`.

`prefers-reduced-transparency`, `prefers-contrast: more` and
`prefers-reduced-motion` are handled once, globally.

### 3.4 Cover (1:1 everywhere)

Every project, post and bookmark can show a square cover. The shared `<Cover>`
uses a real image when one exists, and otherwise renders a **deterministic
generated cover** as inline SVG — gradient field, concentric arcs, big initials,
catalogue number in silkscreen — seeded by slug via `hashSeed`, so it is stable
across builds.

The generated fallback matters because most items have no image. `scripts/
generate-work-covers.mjs` re-exports the existing project artwork as 1:1 WebP
covers with sharp, so the turntable and crate always have a square to show.

### 3.5 Page header (rack style)

```
─── (short orange rule)
02 / LIBRARY                                    (orange mono eyebrow)
Things worth keeping.                           (huge tight display title, Syne)
                                        SHUFFLE ⤮   42 saved   (mono hint, right)
```

Sentence-case titles, no accent-coloured word, no decorative eyebrow beyond the
index and name. The right-hand mono hint shows real counts.

---

## 4. `/projects` — the Crate

**Zones:** Now Spinning, Crate, Recently played.

- **Now Spinning** is the open release. Big 1:1 sleeve on the left with the record
  sliding out behind it and spinning, a plain credits line, and two actions. The
  wash behind it uses that project's palette.
- **Crate** is a responsive grid of 1:1 sleeves (2 / 3 / 5 columns). No card
  chrome — just the cover with a catalogue tag. Hover or focus: the sleeve lifts
  and tilts, the record peeks 26% out from behind, the title brightens. Clicking
  **promotes it into Now Spinning** in place, so the common path never needs a
  modal.
- **Liner notes** open as a glass sheet from Now Spinning: tracklist of highlights,
  role, stack and the link out. Reachable with `Esc`, backdrop click or the close
  button; body scroll is locked while open.
- **Filter** is a small segmented control of genres in the crate header.
- **Recently played** is the live `getRepos()` data as a compact table (name,
  language dot, stars, pushed). It is the honest, real-time layer. A failed fetch
  produces one inline sentence, not an empty gap.

**Motion.** The record slides out once on load. After that, motion only answers
hover, focus and click.

---

## 5. `/bookmarks` — the Library

**Zones:** playlist sidebar, pinned shelf, track list.

- **Sidebar (control layer, the one blurred surface).** Categories are "playlists",
  each with a channel LED (from `CATEGORY_COLORS`, which had been implemented but
  imported nowhere) and a count. Selecting one changes the room's wash. Sticky on
  desktop; a horizontal chip row on mobile.
- **Pinned shelf** shows featured bookmarks as 1:1 favicon tiles.
- **Track rows (flat, no blur).** 44px tall: index / favicon tile / title / host /
  ↗. On hover the index becomes a **play glyph**; the row is still a plain anchor,
  so the affordance is decorative and the link always works. Row background goes
  `--flat-fill` → `--flat-fill-hover` and a 2px LED lights the left edge.
  Description is a tooltip only; tags stay searchable and out of sight.
- **Search** matches title, url, category, tags and description; `/` focuses it.
- **Shuffle** opens a random bookmark from the current playlist, and lives in the
  dock slot.
- **Admin** (add / edit / delete) keeps its API and behaviour; the modal is a glass
  sheet on the same tokens. `Esc` closes it and the delete confirmation.
- **Empty state** gives direction, not mood.

---

## 6. `/blog` and `/blog/[slug]` — Releases and the Reader

### 6.1 List: releases

- **Lead release:** pinned posts as a large 1:1 cover with waveform, runtime and
  plays. At most two, only when unfiltered.
- **Tracklist rows (flat):** index in `A1 … B1` across sides of six, a 44px cover
  thumbnail, title, a waveform whose length and height derive from the reading
  time, the runtime, and plays from the view counter. Waveform, runtime and plays
  are all real data.
- Filters (search, tag, sort) are URL-driven via `searchParams`, so a filtered view
  is shareable. The tag row scrolls horizontally with a fade mask and shows counts.

### 6.2 Reader: chapter scrubber

- **Scroll is playback.** Reading progress fills the waveform inside the dock, and
  elapsed / remaining derive from `readingTime`. The readouts update at ~4Hz, not
  per frame.
- **H2 headings are chapters.** They appear as tick marks on the waveform, and the
  current chapter's title shows in the dock. Click a tick, or open the chapter list
  — a glass popover on desktop, a bottom sheet on mobile — to jump.
- **Prev / next** in the dock step through the tracklist order.
- **Paper mode** (formerly Kindle) is a toggle in the chapter list, with its filter
  scoped to the article container rather than the whole page.
- **Code blocks** use the LCD family: a header row with the language in silkscreen
  and a copy button, flat and always dark.
- **Related posts** are three compact track rows ("Next in the crate").
- The article column sits on solid ground so the wash never competes with reading.

---

## 7. Component skeleton

```
components/booth/
├─ booth-shell.tsx     // Room + Dock provider, mounted by app/(booth)/layout.tsx
├─ room.tsx            // ambient background (channel-driven)
├─ dock.tsx            // the morphing glass dock
├─ dock-slot.tsx       // context: pages register their transport into the dock
├─ cover.tsx           // real or generated 1:1 cover
├─ record.tsx          // CSS record (grooves + label)
├─ control.tsx         // flat control surface (chips, filters) — never blurred
├─ page-header.tsx     // rack-style eyebrow / title / hint
└─ hooks.ts            // useMediaQuery, useReducedMotion, useRefraction

components/work/       // the landing page's 05 / Selected work turntable
├─ work.tsx            // scroll driver + composition
├─ use-work-scroll.tsx // scroll → activeIndex, trackProgress, tonearm angle
├─ ambient-backdrop.tsx, glass-panel.tsx, now-playing.tsx
├─ turntable.tsx, sleeve-crate.tsx, transport.tsx, liner-notes.tsx
└─ work.module.css

app/(booth)/layout.tsx // the shell; owns Room, Dock and the dock-slot context
app/(booth)/{projects,bookmarks,blog}/…
data/projects.ts       // WorkProject, WORK_PROJECTS, palettes, trackLabel
scripts/generate-work-covers.mjs
```

The booth layout is a **route group layout**, not a per-page wrapper: pages
register their transport into the dock through context, and a component cannot
consume a provider that it renders itself.

Kept as they were: `getRepos()`, `content/bookmarks.json` and `/api/bookmarks`,
`features/blog/lib/blog.ts`, `/api/views/[slug]`, `components/waveform-data.ts`,
`CATEGORY_COLORS`, the admin modal's logic.

---

## 8. Performance and accessibility

**Performance**

- List pages and their data stay **server components**; client islands are the
  Dock, Room, filters, keyboard hook and the reader's scrubber.
- Generated covers are SVG — zero image bytes for most items. Real images use
  `next/image` with `sizes`, and only the first is `priority`.
- Animate `transform` and `opacity` only. No blur on rows, covers or the reader.
- The two-blur budget is enforced by construction, not by convention: chips use
  the flat control class, and the legacy dock stands down on booth routes.
- The ambient wash is gradients, not a blurred image.
- Refraction only on the dock, and only behind the Chromium + core-count gate.

**Accessibility**

- The dock is a `nav` with `aria-current`; icon-only links carry `aria-label`;
  hit targets are ≥ 44px.
- Track lists use real anchors inside `ul`/`li`; the play glyph is decorative.
  Keyboard `j`/`k` is additive, not required.
- Sleeve buttons carry the project name; generated covers have `role="img"` and a
  label.
- The scrubber has a text equivalent (`chapter · elapsed / total`) and is not the
  only way to navigate — the chapter list is a normal list of buttons.
- Colour is never the only signal: LEDs sit beside a printed name, the pinned star
  has a label, and the active filter is a lit pill with `aria-pressed`.
- `prefers-reduced-motion`, `prefers-reduced-transparency` and
  `prefers-contrast: more` are handled once, globally.

---

## 9. Build order

| # | Phase | Ships on its own? |
| --- | --- | --- |
| 1 | Tokens, `Room`, `Cover`, `PageHeader`, cover generation | yes, invisible until used |
| 2 | Dock + slot context, mounted in `app/(booth)/layout.tsx` | yes |
| 3 | `/bookmarks` Library (lowest risk, biggest UX win, data untouched) | yes |
| 4 | `/projects` Crate: Now Spinning, crate grid, recently played, liner sheet | yes |
| 5 | `/blog` releases list, then the reader with the chapter scrubber | yes |
| 6 | `components/work` turntable, replacing the old rack-01 work section | yes |
| 7 | Housekeeping: dead rack-01 work code, its GSAP blocks, sitemap, metadata | yes |

**Constraints.** `BlogMeta` field names and `published` semantics are asserted by
`tests/performance-preservation.test.ts` and must not change. Projects and
bookmarks have no automated tests, so they are verified by eye at 390 / 768 / 1280
/ 1600px in both themes.

---

## 10. Decisions taken during the build

1. **Dark plus daylight, not dark-only.** The token swap is cheap, and the site
   already ships a light theme.
2. **Generated covers as fallback**, not everywhere — a real cover always wins.
3. **The dock replaces the top-bar and header nav on these three routes**, so there
   is a single navigation control. The legacy `MagneticDock` returns `null` here.
4. **Plays** come from the existing view counter and render on the lead release,
   the tracklist rows and the reader header. No extra request.
5. **Chapter ticks are positioned against document scroll height** rather than the
   article's own box, because the dock scrubber tracks page-level reading progress.
6. **Chips are flat, not glass** — discovered during the build that a blurred chip
   per tag exhausted the two-layer budget, so the control class is intentionally
   translucent-only.
