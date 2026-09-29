# Portfolio Blog

Personal portfolio and blog — Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, feature-sliced architecture.

**Live:** [adityahimaone.space](https://adityahimaone.space)

## Stack

| Layer        | Tech                                |
| ------------ | ----------------------------------- |
| Framework    | Next.js 16.3.7 (App Router, Turbopack) |
| UI runtime   | React 19.3                          |
| Styling      | Tailwind CSS v4 + CSS Modules       |
| Animation    | GSAP (scroll), Motion (components)  |
| Smooth scroll| Lenis                               |
| Icons        | Lucide React                        |
| Theme        | next-themes (dark/light)            |
| Blog         | Raw Markdown + gray-matter          |
| Audio        | Tone.js (lazy-loaded)               |
| Language     | TypeScript 5                        |

**Requirements:** Node.js 20.9+ (Next 16 floor), pnpm.

## Project Structure

Every piece of UI belongs to the feature that owns it. `components/ui/` holds
genuine primitives shared across features; `hooks/` and `lib/` hold logic used
by more than one.

```
next-portfolio-blog/
├── app/                          # Next.js routes — thin, they delegate
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout, fonts, theme + audio providers
│   ├── globals.css               # Tailwind theme tokens, glass material
│   ├── (booth)/                  # Shared archive chrome (projects, bookmarks, blog)
│   ├── blog/[slug]/              # Post + its opengraph image
│   ├── music/  projects/  bookmarks/  contact/  ui/  spotify-setup/
│   └── api/                      # Route handlers (bookmarks, Spotify, views)
│
├── features/                     # One folder per feature
│   ├── landing-page/             # The homepage
│   │   ├── rack-01/              # Section components + useRackAnimations
│   │   ├── components/hero/      # DawHero, broken-light-text, text-cascade
│   │   ├── work/                 # The listening-booth work section
│   │   ├── spotify/  constants/  lib/
│   │   └── views/landing-page.tsx
│   ├── booth/                    # Archive shell: room, dock, cover, filter row
│   ├── blog/                     # views, components, lib/blog.ts
│   ├── projects/                 # views, components, constants, lib/github.ts
│   ├── bookmarks/                # views, components, hooks, constants
│   ├── layout/                   # Top bar, magnetic dock, theme toggle
│   ├── music/  mixtape/          # Audio playgrounds and the mixtape UI
│   └── index.ts per feature      # Named exports only — routes import through this
│
├── components/ui/                # Cross-feature primitives (knob, slider, screw, footer)
├── hooks/                        # Shared hooks (use-media, click-outside, hide-interface)
├── lib/                          # cn(), dates, easing, waveform data
├── content/blog/                 # Markdown posts
├── content/bookmarks.json        # Bookmark archive
├── data/                         # Project/track data
├── types/                        # Shared types
├── e2e/                          # Playwright specs
├── tests/                        # Jest unit tests
└── docs/                         # Design and planning documents
```

## Features

### Landing Page

Seven sections composed in `rack-01/rack-01.tsx`, with every scroll-linked
animation isolated in `use-rack-animations.ts`:

- Hero with a hardware-styled device wall and a boot sequence
- About, Skills, Experience and Contact strips that scrub off scroll position
- Smooth scrolling via Lenis, disabled entirely under `prefers-reduced-motion`
- Music player and now-playing surface

> The GSAP timelines select elements by **CSS-module class name**, not by ref.
> Renaming a class in `rack-01.module.css` breaks the animation without a type
> error. `e2e/landing-page.spec.ts` guards the section count for this reason.

### Shared Archive Chrome

`/projects`, `/bookmarks` and `/blog` share one system, specified in [`design.md`](./design.md):

- Liquid-glass material with a two-layer blur budget
- `SignalArchiveHeader` — a glass transport, a record that turns only while audio
  is actually playing, and a timeline derived from the page's own data
- Global `prefers-reduced-motion` and `prefers-reduced-transparency` guards

### Blog

- Markdown posts in `content/blog/` with a tracklist, filter dock, and
  `?tag=` / `?q=` / `?sort=` shareable URLs
- Waveform traces generated deterministically from each article's reading time
- Transport scrub bar, sticky cue-sheet TOC, scoped "Paper" reading mode
- LCD-tinted code blocks with a copy control, `max-w-[68ch]` measure
- Static generation, with async `params` per the Next 16 request APIs

### Projects

- Featured projects as release-shelf rows: catalogue spine, typed credits, a
  record that slides out of the sleeve on hover
- Recent GitHub pushes as a session-log data table

### Bookmarks

- `content/bookmarks.json` grouped into channels, rendered as a dense index
- Single search field (⌘K) across title, description, URL, category and tags
- `j` / `k` keyboard navigation — additive, never the only way to reach a link
- Admin add/edit/delete behind a login-gated modal

## Adding Content

### New Blog Post

1. Create `content/blog/my-post.md`
2. Add frontmatter:

```markdown
---
title: 'My Post Title'
slug: my-post
date: 2026-04-15
description: 'Short description'
tags: [nextjs, typescript]
published: true
---

Content here...
```

3. Done — the route is generated at `/blog/my-post`

### New Featured Project

1. Open `features/projects/constants/index.ts`
2. Add an entry to `FEATURED_PROJECTS`:

```typescript
{
  name: 'Project Name',
  slug: 'project-slug',
  githubSlug: 'repo-name',
  description: 'What it does',
  tech: ['Next.js', 'TypeScript'],
  demo: 'https://demo.url', // optional
}
```

3. Done — shows in the Projects section

## Development

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve the build
```

## Checks

```bash
pnpm test         # Jest — unit tests for pure logic and data
pnpm test:e2e     # Playwright — builds, serves, and drives a real browser
pnpm lint         # ESLint (Next 16 removed `next lint`)
```

`pnpm test:e2e` runs against a production build, so run `pnpm build` first if
you have changed anything. It needs Playwright's Chromium: `pnpm exec playwright install chromium`.

> There is a known intermittent failure in `pnpm build` on some machines —
> a missing `.next/server/functions-config-manifest.json` during "Collecting
> page data". Re-running the build resolves it. Pre-existing, not introduced by
> the Next 16 upgrade.

## Architecture Notes

**Barrels name their exports.** Feature `index.ts` files export explicitly
rather than `export *`, so a route importing `BookmarksPage` cannot accidentally
pull in a component's internals. Routes import through the barrel; files inside a
feature import by relative path.

**Unreachability is the test for dead code.** A component is dead when no route
can reach it by following imports, not when its name is absent from a search —
`layout`, `header` and `hooks` are ordinary words, and a barrel re-export keeps
dead code reachable.

**Animations move, they don't get rewritten.** The GSAP timelines in
`use-rack-animations.ts` were extracted from the old monolithic component
verbatim and verified by diff. They are tuned to the decimal; a "clean"
reimplementation is a silent regression.

## Documentation

Design and planning documents in [`docs/`](./docs/), including
[design.md](./design.md) and [docs/DESIGN_BOOTH.md](./docs/DESIGN_BOOTH.md).
Several of the other files there are historical planning notes and no longer
describe the current code.

## License

MIT
