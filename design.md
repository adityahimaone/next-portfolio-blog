# design.md — SIGNAL, side two

Design spec for a ground-up redesign of **`/projects`**, **`/bookmarks`** and **`/blog`** (list + article), bringing them into the same visual world as the landing page's studio-rack concept and its liquid glass material.

This document is the source of truth for those three pages. Implementation follows §5.

## 0.0 Premise

The landing page (`features/landing-page/rack-01`) is a full piece of studio hardware: a drag-scroll rack of record players, DAW faders, LCD readouts, screws and silkscreen labels. The three archive pages currently sit beside it speaking a quieter, unrelated language — plain `bg-card` / `border-border` Tailwind cards on projects and blog, a half-migrated local token system on bookmarks, and on the article page a hardcoded `zinc-*` palette that doesn't match the brand at all.

This spec brings the three pages into the same world without turning them into a second landing page. They are **the record shop behind the studio**: things you shipped, things you keep, things you wrote. Hardware vocabulary, but shelves and index cards — not knobs.

**One memorable device per page. Everything else stays disciplined.**

| Page | Concept | The one device |
| --- | --- | --- |
| `/projects` | The release shelf | On hover, the record slides out of its sleeve and a tonearm drops |
| `/bookmarks` | The crate index | No device. Density and typography are the whole thing — this is the quiet page |
| `/blog` | Liner notes | Reading progress is a transport scrub bar over a real waveform, not a bar |

### Relationship to prior work

`docs/SIGNAL_ARCHIVE_REDESIGN_PLAN.md` deliberately removed "decorative grids, vinyl, or equalizer effects" from these pages. This spec reverses that decision on purpose — which means it inherits the exact criticism that caused it. The answer is one rule:

> **Every music motif encodes something real.** Waveform height = article length. Catalog number = project index. LED colour = channel. Runtime = reading time. No data, no motif.

A vinyl that means nothing is decoration. A vinyl whose label artwork, catalogue spine and spin-state (currently playing) carry information is interface. Apply the rule to every candidate element; anything that fails gets cut.

## 0.1 Design plan

**Color — reuse, do not reinvent.** The brand already is warm aluminium + signal orange + moss. Light mode: `#e7e6dd` ground, `#f4f1e6` panel. Dark mode: `#141817` ground, `#222827` panel, `#ff5a1f` signal.

Name the risk honestly: a cream ground with a terracotta accent is one of the commonest tells of generated design. Here it is neutralised by what is assembled on top of it — mono silkscreen labels, LCD-dark insets, hairline metal rules, screws — and in dark mode it reads as signal orange on charcoal equipment rather than a warm editorial palette. **Keep the palette exactly as-is; change what it is assembled into.**

All values below are already live in `app/globals.css`:

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--background` | `#e7e6dd` | `#141817` | the room |
| `--card` | `#f4f1e6` | `#222827` | the panel |
| `--primary` | `#b84716` | `#ff5a1f` | signal — active state, playhead, one accent per view |
| `--secondary` | `#36564d` | `#7abb5e` | monitor — LED "on", live, healthy |
| `--accent` | `#c99032` | `#e0b75a` | lamp — featured / lead single only |
| `--lcd-bg` / `--lcd-text` | `#17201e` / `#7abb5e` | `#0d1110` / `#7abb5e` | readouts, code blocks, meters |

**Type — two voices plus machine.**

| Role | Family | Spec |
| --- | --- | --- |
| Display (page title) | Syne | `750 clamp(2.5rem, 5vw, 4.5rem)/0.96`, tracking `-0.05em`, max `13ch` — unchanged, it already works |
| Section head | Space Grotesk | `650 clamp(1.125rem, 2vw, 1.5rem)`, tracking `-0.02em`, sentence case |
| Item title | Syne | `650 1.25rem` → `1.5rem`, tracking `-0.03em` |
| Body | Geist | `0.9375rem/1.6`, measure `max 68ch` |
| Silkscreen | Geist Mono | `650 0.6875rem`, tracking `0.12em`, uppercase |
| Meter / counter | Orbitron | `600 0.75rem`, `font-variant-numeric: tabular-nums` |

Silkscreen is the discipline point. It is **only** for data a machine would print — catalog number, runtime, host, star count, date, byte size. It is never a decorative tracked-out eyebrow above a heading. Headings stay sentence case: no accent word in a different colour, no `A · B · C` meta strings, no arrow appended to link text.

**Layout.** One shell for all three pages:

```
max-width: 1280px  (token: --shell-max)
padding-inline: clamp(1rem, 3vw, 2rem)
padding-top: 4rem              clears the fixed TopBar
section gap: 2rem
```

`/projects` and `/blog` already use `max-w-7xl` (1280) and `/bookmarks` already uses `1280px` — they agree. Put the number in one token so it stops drifting.

**Radii.** Three values, hierarchy expressed by size, not one radius on everything:

- `--r-panel: 0.75rem` — panels, header, dialogs
- `--r-control: 0.5rem` — chips, inputs, icon buttons
- `--r-sleeve: 1rem` — release and post rows

**Principles.**

1. A motif must carry data (§0.0).
2. Glass is a material for **controls**, never for content surfaces. Never on list rows.
3. Light mode stays solid. Blur lives in dark mode only — already the rule in `bookmarks.module.css` and `top-bar.module.css`; promote it from local to global.
4. One orchestrated entrance per page (the header transport assembling). After that, motion only answers an action.
5. Before shipping, remove one accessory.

## 0.2 Global tokens → `app/globals.css`

Every value below is lifted from what already ships and works — `features/bookmarks/bookmarks.module.css:36-53` and `features/layout/components/top-bar.module.css:2-19`. This promotes a proven recipe; it does not invent one.

```css
:root {
  /* Liquid glass — light mode is solid, no blur (brand rule) */
  --glass-fill: var(--muted);
  --glass-fill-hover: color-mix(in srgb, var(--primary) 12%, var(--muted));
  --glass-edge: var(--border);
  --glass-blur: none;
  --glass-spec: none;
  --glass-shadow: none;
  --lift: -1px;

  /* Shell */
  --shell-max: 1280px;
  --r-panel: 0.75rem;
  --r-control: 0.5rem;
  --r-sleeve: 1rem;

  /* Motion */
  --dur-fast: 160ms;
  --dur-med: 320ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

.dark {
  --glass-fill: linear-gradient(150deg,
    rgba(255, 255, 255, 0.11),
    rgba(255, 255, 255, 0.03) 42%,
    rgba(255, 255, 255, 0.06));
  --glass-fill-hover: linear-gradient(150deg,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0.06) 42%,
    rgba(255, 255, 255, 0.10));
  --glass-edge: rgba(255, 255, 255, 0.16);
  --glass-blur: blur(14px) saturate(1.7);
  --glass-spec: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  --glass-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22),
                  inset 0 -10px 18px -14px rgba(255, 112, 64, 0.55),
                  0 8px 22px -14px rgba(0, 0, 0, 0.6);
  --lift: -2px;
}
```

Two global classes, applied from TSX alongside CSS-module classes:

- **`.glass-1`** — controls: chips, buttons, inputs, icon buttons.
  `border: 1px solid var(--glass-edge); background: var(--glass-fill); box-shadow: var(--glass-shadow), var(--glass-spec); backdrop-filter: var(--glass-blur)`. Hover adds the `::before` sheen fade, `border-color: var(--primary)` and `transform: translateY(var(--lift))` — the exact recipe already in the bookmarks filter bar.
- **`.glass-2`** — floating surfaces: sticky filter dock, article cue sheet, modals, confirm dialogs. Same but `blur(18px) saturate(1.8)` and a stronger `0 20px 60px -20px` drop shadow.

**Blur budget: at most two blurred layers on screen at once** — the `TopBar` chips plus one `.glass-2`. A `backdrop-filter` per row in a long list is a scroll-jank guarantee, which is precisely why crate rows and tracklist rows are not glass.

Guard once, globally, instead of in every module:

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-1, .glass-2 { backdrop-filter: none; background: var(--card); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also add a `--silkscreen` shorthand, and per-item record colours via CSS custom properties (`--record-label`, `--record-accent`) set inline per item — the pattern already proven by `PROJECT_PALETTES` in `features/landing-page/rack-01/rack-01.tsx`.

## 0.3 Shared chrome — restyle `SignalArchiveHeader` once

`features/layout/components/signal-archive.tsx` + `.module.css` is rendered by all three pages. One pass buys the consistency across all of them — and it is the single highest-risk file in this redesign, because a change here lands three places at once.

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar: glass mark chip · theme chip · hairline rule (keep)  │
├──────────────────────────────────────────────────────────────┤
│ ◀ Back     [Projects 01] [Bookmarks 02] [Blog 03]   ● REC    │ transport
├──────────────────────────────────────────────────────────────┤
│  OUTPUT 01 / RELEASED WORK      ╭─────╮                      │
│  Shipped work                   │  ◉  │  record OR page      │ title: Syne
│  description (max 44rem)        ╰─────╯  aside (slot)        │
├──────────────────────────────────────────────────────────────┤
│ ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮  waveform · playhead 24%      0:00 / 3:12   │ timeline, 30px
└──────────────────────────────────────────────────────────────┘
```

- Transport bar becomes `.glass-1`. The **active** nav pill keeps a solid `--primary` fill — a lit button reads as state more clearly than a translucent one — but gains the specular top edge.
- The `.record` aside rotates slowly **only while the global `MusicPlayer` is actually playing**, read from `useAudio()` in `features/landing-page/spotify/audio-context.tsx`. The header visibly answers whether audio is on, which satisfies §0.0.
- The timeline waveform's 16 hardcoded bar heights are replaced by a deterministic series derived from the page's own content count (5 releases, 8 bookmarks, 11 posts), and the playhead sits at that page's position in the 01/02/03 sequence. Both come from `components/waveform-data.ts` (§3.1).
- Add a `● REC` LED at the right edge in `--secondary` with `--led-glow`; it pulses in dark mode only.
- Props API is unchanged: `{ label, title, description, activeSection, aside? }`.
- The nav's `01 / 02 / 03` numbering stays — the nav genuinely is a sequence, so the numbering is earned rather than borrowed.
- Mobile (≤760px) keeps the existing 3-column nav collapse and hides the record. The timeline stays: it's the page's identity card.

---

## 1. `/projects` — The release shelf

**Content reality.** `app/projects/page.tsx` (server) → `features/projects/views/projects-page.tsx` (`'use client'`), fed by `FEATURED_PROJECTS` (5 entries, `features/projects/constants/index.ts`) and `getRepos()` (`features/projects/lib/github.ts`, `revalidate: 3600`, filters archived). Two dormant fields: `FeaturedProject.image` is declared but rendered nowhere; `demo` is set on only one of five. `app/projects/page.tsx` has no `metadata` at all.

**Layout.**

```
SignalArchiveHeader (aside = record)

A-side · 5 releases                          ← Space Grotesk head + count silkscreen
┌──────┬──────────────────────────────────────────────┬───────────────┐
│  AH  │ Portfolio 2025                               │      ◉ vinyl  │
│  001 │ Production frontend system for…              │      half-out │
│      │ Next.js, React 19, Tailwind v4, TS, Motion   │      rotates  │
│      │ ★ 12 · TypeScript · pushed 3d   [Code][Live] │      on hover │
└──────┴──────────────────────────────────────────────┴───────────────┘

Session log · recent pushes
  NAME               LANGUAGE      ★   PUSHED
  switchyard         TypeScript    4   2d ago        ← data table, mono
```

**Featured release row** — rewrite `features/projects/components/project-card.tsx`, new `features/projects/projects.module.css` (this page must move off inline utilities because a sleeve needs pseudo-elements).

- Grid: `64px minmax(0, 1fr) clamp(140px, 18vw, 220px)`. Row is `overflow: hidden`, `border-radius: var(--r-sleeve)`, panel background, hairline border, `inset 0 1px 0` top highlight — the rack-01 module chassis recipe (`rack-01.module.css:1744-1758`) at page scale.
- **Spine** (col 1): vertical catalogue number `AH-001` in silkscreen over a solid `--record-label` colour block from a `PROJECT_PALETTES`-style array. This is the Discogs move — a shelf reads as a shelf because the spines differ.
- **Copy** (col 2): title in Syne 650; description `0.9375rem`, `max-width: 62ch`; credits line — tech set as plain comma-separated mono text, **not** five pill chips per row. Chip soup is the SaaS tell; a record's credits are typeset, not badged. Stats line `★ 12 · TypeScript · pushed 3 days ago` with one language dot in `--secondary`. Actions right-aligned: `View code`, `Live demo` as `.glass-1` buttons, 44px tall, hover lift + sheen.
- **Plate** (col 3): the record, CSS-drawn with no image dependency, reusing rack-01's groove stack — `repeating-radial-gradient(circle, transparent 0 4px, rgba(255,255,255,.08) 4px 5px)` over `radial-gradient(circle, var(--record-label) 0 18%, … 21.5% 100%)`. At rest ~40% of the disc hides behind the sleeve edge; on `:hover` / `:focus-within` it travels out to ~78% and rotates `12deg`, while a 1px tonearm line swings in from the top-right corner. `transition: transform var(--dur-med) var(--ease-out)`. Below `md` the plate becomes a 44px strip along the top edge — the sleeve turns into a 7" single rather than vanishing.
- Where `project.image` exists, it becomes the **record label artwork** (`next/image`, `object-fit: cover`, circular mask) instead of the flat colour. Finally using a field that already exists.

**Session log** — replaces the four-across grid of `ProjectCardMini` cards with a real `<table>`: 8 rows, columns `NAME / LANGUAGE / ★ / PUSHED`, mono, 44px rows, hairline separators, `text-transform: none`, name cell → `--primary` on hover, entire row clickable. This is *more* informative than the current cards (which clamp descriptions to two lines) and it is visually distinct from the release rows above it — which is what a page holding two different kinds of content needs. Mobile: `NAME` and `PUSHED` on two lines, language folded into a colour dot.

**States.**
- GitHub fetch failure currently returns `[]` and renders nothing. Replace with one inline line in `--muted-foreground`: *"Session log unavailable — the last fetch from GitHub failed. The releases above are cached."* Explains what happened and what's still valid; no mood, no apology.
- No skeletons: the page is server-rendered.

**Motion.** Page load: header transport assembles — playhead drops, waveform bars rise, 20ms stagger. Rows do not animate in. A shelf doesn't assemble itself.

## 2. `/bookmarks` — The crate index

**Reference read — designengineer.tools.** A heading per category, then a run of plain text links. No cards, no descriptions, no visible tags. ~200 links scannable in seconds. The current page renders **8** links as `min-height: 14rem` cards with descriptions, tag buttons, category stamps and a "Visit" pill — roughly 4× the vertical cost per link for a tenth of the density.

**Target.**

```
SignalArchiveHeader (aside = crate meter: 8 saved · 6 channels · 4 featured)
┌ ⌕ search crates…                                       ⌘K · Manage ┐ .glass-2, sticky
├────────────────────────────────────────────────────────────────────┤
│ Inspiration                                                 1 link │ header + hairline
│    Awwwards                                           awwwards.com │ ← host on hover
│                                                                      │
│ Audio & DAW                                                   2      │
│    Tone.js ★                                          tonejs.org     │
│    MDN Web Audio                                 developer.mozilla.org│
```

- **No cards. Rows only.** Section = channel name (Space Grotesk `0.9375rem`/650) + count in silkscreen at the right + a hairline rule running to the container edge (generalising the existing `.groupHeader::after` in `bookmarks.module.css`). Links flow in a grid: 1 column < 760px, 2 columns ≥ 760px, 3 columns ≥ 1200px.
- **Row anatomy:** 40px min-height (44px hit target via padding), `18px` favicon square rendered grayscale at `opacity: .7`, title `0.875rem` Geist, optional `★` for featured with `aria-label="Featured"`. On hover/focus: favicon to full colour and `opacity: 1`; title → `--primary` with `underline-offset` animating 2→5px; **host** fades in right-aligned in mono `0.6875rem`, already available from `extractDomain()` in `features/bookmarks/utils/favicon.ts`. A 3px LED in the channel colour lights on the left edge — the same reveal the current `.listCard::before` uses.
- Rows are **not** glass, not rounded, not bordered. Solid. This is the deliberately quiet page; all material interest stays in the header and the one sticky control bar.
- **Keeps:** search across title/description/url/category/tags (already implemented in `views/bookmarks-page.tsx`), admin add/edit/delete plus the in-page confirm dialog, category grouping (forced on), the `content/bookmarks.json` shape, and `/api/bookmarks`.
- **Drops:** grid/list toggle, group toggle, sort control, featured-only toggle, and the permanently-visible tag chip row. Tag data stays and remains searchable through the search field. `CATEGORY_COLORS` in `features/bookmarks/constants/categories.ts` — a complete per-category colour map, including `glow` and `accentColor`, imported nowhere — becomes the channel LED palette, so the page gets colour discipline with zero new data.
- Descriptions become a `title` attribute tooltip only. The list stays clean; the detail is there when wanted.
- `components/bookmark-admin-modal.tsx` is currently 100% Tailwind with `bg-black/80`, `border-red-500/50`, `bg-zinc-*` — a visual outlier against the module system. Rebuild it on `.glass-2` + module tokens.
- Sort becomes fixed and correct for an index: featured first, then A–Z within channel.
- Empty state keeps the dashed box, but the copy gives direction: *"Nothing in this channel yet. Clear the search to see all crates, or add one from Manage."*
- Fix: `/bookmarks` is missing from `app/sitemap.xml/route.ts`.

## 3. `/blog` — Liner notes

**Content reality:** 11 published posts, ~15.5k words, 55+ distinct tags, 2 pinned, and two ~2,500-word devops runbooks that are mostly fenced code. `blog-list`/`blog-card` use semantic tokens while `blog-header`, `blog-post` prose overrides, `related-posts`, `table-of-contents`, `view-counter` and the Kindle pod use hardcoded `zinc-*` with `dark:` pairs that ignore the warm palette entirely.

> **The single biggest visual win on this page is deleting every `zinc-*` literal and moving onto theme tokens.** Everything else here is refinement next to that.

### 3.1 `/blog` list — tracklist

```
SignalArchiveHeader (aside = record)
┌ ⌕ search notes        [Latest ▾]   All  nextjs (4)  devtools (4)  vps (4) ┐ .glass-2
├───────────────────────────────────────────────────────────────────────────┤
│ SIDE A                                                                    │
│ ┌──────┬────────────────────────────────────────┬──────────────┬────────┐ │
│ │  A1  │ Setting Up Hermes Agent        LEAD    │ ▂▄▆▂▃▅▂▇▃ 2.2k │ 23 min│ │ pinned
│ ├──────┼────────────────────────────────────────┼──────────────┼────────┤ │
│ │  A2  │ Deploying Next.js to a VPS             │ ▃▅▂▆▃▅▂▄▃ 1.3k │ 7 min │ │
│ │  A3  │ …                                      │              │        │ │
```

- Post row uses the same grid skeleton as a release row — index gutter / copy / plate — so the two pages rhyme. The gutter holds **`A1 A2 B1 …`**: a tracklist genuinely is sequenced into sides, so the numbering is information again rather than decoration.
- The right plate is **the waveform as the word count.** New `components/waveform-data.ts` turns `readingTime` into N bars, deterministically seeded so builds are stable; `aria-hidden`, with the runtime as adjacent text. A 550-word post gets a short low trace, the 2,800-word runbook a tall long one. Readers can size an article before opening it — the motif pays for itself. The same module feeds the header timeline (§0.3).
- Meta line: `12 Apr 2026 · 7 min read · 340 views`. One formatter, used in all four places that currently disagree (`month: 'long'` vs `'short'`).
- Pinned posts become a `LEAD SINGLE` marker with a record-label plate in `--accent`; max two, shown only when unfiltered (current behaviour, kept).
- **Extract `components/tag-chip.tsx`** — tags are currently four different inline styles across `blog-card`, `blog-card-pinned`, `blog-header` and `blog-list`. One component: mono, squared, `.glass-1` in dark, with a count (`nextjs (4)`) so the filter teaches you the shape of the archive.
- Filter dock collapses into one sticky `.glass-2` bar; the tag row scrolls horizontally using the existing `no-scrollbar` utility.
- **Add `searchParams`** to `app/blog/page.tsx` (Next 15 async `searchParams: Promise<…>`) so `?tag=nextjs&q=vps&sort=asc` is shareable and server-rendered. Filters are `useState`-only today, so no filtered view can be linked.

### 3.2 `/blog/[slug]` — liner notes

- Column `max-w-[68ch]` on theme tokens. Headings Syne; body Geist `1.0625rem/1.7` — long-form gets looser leading. `prose` overrides recoloured off tokens; `blockquote` becomes a marginal note with a `--primary` rule.
- **Reading progress becomes a transport scrub bar.** In place of the fixed `h-[3px] bg-primary` strip: a slim fixed bar carrying the article's own waveform, the played portion filled in `--primary`, a playhead marker, and a mono `4:12` elapsed/total derived from `readingTime`. Reading is literally scrubbing a track, and it shares grammar with the header timeline so it reads as one system. Also fix `box-shadow: 0 0 10px rgba(var(--primary), 0.8)` — `--primary` is a hex, so that declaration silently does nothing.
- **Cue sheet** (the TOC sidebar at `xl`): `.glass-2` panel; the active item gets a playhead tick instead of a plain bar; the existing max-height scroll handles the 16-heading article. Mobile drawer keeps its behaviour, gets restyled.
- **Kindle mode:** keep the control and the `body.e-ink-mode` class API, relabel to `Paper`. Replace the full-viewport `backdrop-filter: grayscale() sepia()` overlay at `z-index: 999999` — it greys out the sticky TOC and progress bar and costs a compositor layer on every scroll frame — with a scoped `filter` on the article container plus a paper surface token. Same experience, no page-wide filter.
- **Code blocks** are the dominant visual payload on this site. Keep the always-dark shell but retint onto the LCD family (`--lcd-bg`, `--lcd-text`, `--lcd-dim`); the header row reads as a channel strip — language silkscreen left, `.glass-1` copy button right. Remove `mx-1` from inline `code`, which injects stray margin mid-sentence.
- Related posts become *"Also in the crate"*: three compact rows in the article column, not a 3-up card grid crammed into a 65ch measure.
- `features/blog/views/blog-post-page.tsx` passes `meta: any` — type it as `BlogMeta`.

## 4. Quality floor

- **Contrast.** Silkscreen at `0.6875rem` in `--muted-foreground` (`#5e625c` on `#f4f1e6`) passes AA. `--bm-dim: #66706a` in light mode does not at that size — replace it with `--muted-foreground`.
- **Focus.** One recipe everywhere: `outline: 2px solid var(--primary); outline-offset: 3px` (already the bookmarks recipe; extend to projects and blog, which currently rely on the global `:focus-visible`).
- **Targets.** 44px for anything tappable, the existing convention. Crate rows are the one exception: 40px visual, 44px hit box via padding.
- **Colour is never the only signal.** Featured has `★` + `aria-label`; active filters carry `aria-pressed`; a channel LED always sits beside the printed channel name.
- **Reduced motion / reduced transparency** handled once globally (§0.2), never per component.
- **No new dependencies.** Syne, Space Grotesk, Geist, Geist Mono, JetBrains Mono and Orbitron are already loaded in `app/layout.tsx`.

## 5. Build order

Each phase is independently shippable and revertible; commit at these boundaries.

| # | Work | Files |
| --- | --- | --- |
| 1 | Glass, shell and motion tokens; `.glass-1` / `.glass-2`; global reduced-motion + reduced-transparency guards | `app/globals.css` |
| 2 | Header restyle: glass transport, playing-state record, data-driven waveform, `● REC` LED | `features/layout/components/signal-archive.tsx`, `.module.css` |
| 3 | Shared primitives: `waveform-data.ts`, `tag-chip.tsx`, single date formatter | `components/` |
| 4 | Crate index: rows-only list, sticky search bar, module rewrite, admin modal onto tokens, sitemap entry | `features/bookmarks/**`, `app/bookmarks/page.tsx`, `app/sitemap.xml/route.ts` |
| 5 | Release shelf + session log table + new module; add page metadata | `features/projects/**`, `app/projects/page.tsx` |
| 6 | Tracklist + sticky filter dock + `searchParams` + tag counts | `features/blog/components/blog-list.tsx`, `blog-card.tsx`, `blog-card-pinned.tsx`, `app/blog/page.tsx` |
| 7 | Liner notes article: token migration, transport progress, cue sheet, scoped Paper mode, LCD code blocks | `features/blog/components/blog-post.tsx`, `blog-header.tsx`, `table-of-contents.tsx`, `related-posts.tsx`, `view-counter.tsx` |
| 8 | Housekeeping | delete dead `features/projects/components/projects-section.tsx` and `features/landing-page/components/projects-section.tsx`; add the missing `date:` to `content/blog/deploying-portfolio-from-zero-to-production.md` (it currently falls back to "now", sorting unpredictably and making SSG output nondeterministic); correct the README's claim of a `Radio` watermark on `ProjectCardMini`, which no longer exists in code |

**Constraints while executing.** `tests/performance-preservation.test.ts` asserts every `BlogMeta` field exists and `expect(post.published).toBe(true)` — do not rename frontmatter fields or change `published` semantics. Nothing in `tests/` covers projects or bookmarks, so those two pages are unguarded by automation: verify them by eye.

## 6. Verification

1. `npx tsc --noEmit` and `npm run lint` — no regressions.
2. `npx jest tests/performance-preservation.test.ts` — blog engine contract intact.
3. `pnpm dev`, then inspect `/projects`, `/bookmarks`, `/blog`, `/blog/setup-hermes-agent` (long, code-heavy) and `/blog/why-i-rebuilt-my-portfolio` (short — the pair proves the waveform actually varies). **No production build, no `rm -rf .next`.**
4. Viewports 390 / 768 / 1280 / 1600 in both themes. Dark is where glass must read; light must stay solid and still look intentional.
5. Emulate `prefers-reduced-transparency: reduce` (all blur off, panels opaque) and `prefers-reduced-motion: reduce` (no assembly animation, record doesn't spin).
6. Keyboard-only pass on each page: tab order, focus rings legible against glass, sticky dock and crate rows reachable, `Escape` closes the admin modal and the mobile TOC drawer.
7. Performance sanity: confirm no more than two blurred layers per view; paste ~200 links into a local copy of `content/bookmarks.json` and confirm the crate list still scrolls cleanly.
8. Contrast spot-check on silkscreen and host text in both themes, target ≥ 4.5:1.
