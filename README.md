# Portfolio Blog

Personal portfolio and blog — Next.js 15, Tailwind CSS v4, feature-based architecture.

**Live:** [adityahimaone.tech](https://adityahimaone.space)

## Stack

| Layer     | Tech                       |
| --------- | -------------------------- |
| Framework | Next.js 15 (App Router)    |
| Styling   | Tailwind CSS v4            |
| Animation | Motion (Framer Motion)     |
| Icons     | Lucide React               |
| Theme     | next-themes (dark/light)   |
| Blog      | Raw Markdown + gray-matter |
| Music     | Tone.js                    |
| Language  | TypeScript                 |

## Project Structure

```
next-portfolio-blog/
├── app/                        # Next.js routes
│   ├── page.tsx                # Homepage
│   ├── blog/                   # Blog routes
│   │   ├── page.tsx            # /blog — list
│   │   └── [slug]/page.tsx     # /blog/[slug] — post
│   ├── api/                    # API routes (Spotify)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles + Tailwind theme
│
├── features/                   # Feature-based architecture
│   ├── landing-page/           # Homepage sections
│   │   ├── sections/           # hero, about, skills, experience, contact
│   │   ├── spotify/            # music player, now playing, marquee
│   │   ├── animations/         # preloader
│   │   ├── data.ts             # experience, social links
│   │   └── landing-page.tsx    # composition file
│   ├── blog/                   # Blog feature
│   │   ├── blog.ts             # engine (read .md, parse frontmatter)
│   │   ├── components/         # blog-card, blog-header, blog-list, blog-post
│   │   └── index.ts
│   ├── projects/               # Projects feature
│   │   ├── github.ts           # GitHub API integration
│   │   ├── data.ts             # featured projects
│   │   ├── components/         # project-card, project-card-mini, section
│   │   └── index.ts
│   └── layout/                 # Header, footer
│
├── components/                 # Shared UI primitives
├── hooks/                      # Shared hooks
├── lib/                        # Shared utils (cn, constants)
├── types/                      # Shared types
├── content/blog/               # Markdown blog posts
├── public/                     # Static assets
└── docs/                       # Project documentation
```

## Features

### Global / Application Layout

- Hardware-styled navigation toggles with LED indicators
- Persistent, uninterrupted `MusicPlayer` integrated directly into `app/layout.tsx` for seamless audio across all routes
- Global Dark/Light theme toggle
- Custom preloader sequences utilizing `sessionStorage` execution logic

### Landing Page

- Hero section with hardware style constraints and dynamic initialization delays
- About, Skills, Experience, Projects sections
- Interactive Music/Spotify integration (now playing API, magnetic music player)
- Hardware-styled smooth scrolling anchors

### Blog

- Markdown-based posts in `content/blog/`
- Auto-generated routes via `[slug]`
- Client-side dynamic tag filtering system
- Reading time estimation
- Unified component layout parity with native Projects routing
- Custom music-themed UI styling (Animated CSS equalizer decorations)
- Static generation (SSG)

### Projects

- Featured projects with distinct, music-themed hover effects (Spinning Vinyl `/Disc3` watermark)
- Auto-fetched recent repos from GitHub API presented on hardware-styled mini cards with Oversized Radio watermarks
- Tech stack tags
- GitHub stats (stars, language)

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

3. Done — route auto-generated at `/blog/my-post`

### New Featured Project

1. Open `features/projects/data.ts`
2. Add entry to `FEATURED_PROJECTS`:

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

3. Done — shows in Projects section

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Documentation

Detailed docs in [`docs/`](./docs/):

- [tasks.md](./docs/tasks.md) — Task breakdown by phase
- [structure.md](./docs/structure.md) — File structure design
- [stack.md](./docs/stack.md) — Stack audit and upgrade plan
- [blog.md](./docs/blog.md) — Blog feature design
- [projects.md](./docs/projects.md) — Projects feature design

## License

MIT
