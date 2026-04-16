---
title: "Why I Rebuilt My Portfolio"
slug: why-i-rebuilt-my-portfolio
date: 2026-04-15
description: "My old portfolio was a mess. Here's how I rebuilt it with Next.js 15, Tailwind v4, and a feature-based architecture."
tags: [nextjs, tailwind, portfolio, web-dev]
published: true
---

# Why I Rebuilt My Portfolio

Last year I built my portfolio in a rush. It worked, but the codebase was not something I was proud of. I had 30 dead component files sitting in the repo, versioned names like `hero-2025-v2.tsx` that told a story of failed experiments I never cleaned up, and a single `data.ts` file that contained everything — projects, blog posts, social links, experience data, all jammed into one 200-line export.

## The Problem

The old structure was type-based. All components lived in one folder, all hooks in another, all utils in another. It sounds organized until you try to add a feature. Adding a new page meant touching four different folders — components, hooks, utils, and the route itself. Deleting a feature was worse. I had to hunt through the entire codebase to find every import, every reference, every leftover utility that only existed to support the thing I was removing.

```
# The old nightmare
components/
├── hero-2025-v2.tsx         # Active
├── hero-2025.tsx            # Dead
├── hero.tsx                 # Dead
├── about-2025-v2.tsx        # Active
├── about-2.tsx              # Dead
├── about.tsx                # Dead
├── footer-2025-v2.tsx       # Dead
├── footer-2025.tsx          # Dead
├── footer.tsx               # Dead
...30+ files, half unused
```

## The Fix: Feature-Based Architecture

I switched to a feature-based structure where each feature is a self-contained folder. Everything related to that feature — components, data, hooks, utils — lives in one place.

```
features/
├── landing-page/
│   ├── components/
│   │   ├── hero-section.tsx
│   │   ├── about-section.tsx
│   │   ├── skills-section.tsx
│   │   ├── experience-section.tsx
│   │   └── contact/
│   ├── constants/
│   ├── hooks/
│   ├── views/
│   └── index.ts
├── blog/
│   ├── components/
│   ├── lib/
│   ├── views/
│   └── index.ts
├── projects/
└── layout/
    ├── components/
    ├── constants/
    └── index.ts
```

Now adding a new feature is creating one folder. Deleting a feature is deleting one folder. No hunting, no orphaned imports, no guessing whether a file is still used somewhere.

## The Stack

The rebuild runs on Next.js 15 with App Router and Server Components. Tailwind CSS v4 with the native `@theme` directive — no config file, everything lives in CSS.

```css
@theme {
  --color-primary: #273281;
  --color-primary-light: #3a468b;
  --color-accent: #e6a817;
  --animate-float: float 6s ease-in-out infinite;
  --animate-spin-slow: spin 4s linear infinite;
}
```

Motion handles animations (the Framer Motion successor), Lucide for icons, next-themes for dark mode. The blog uses raw markdown with gray-matter for frontmatter parsing — no MDX overhead. I considered MDX but decided the added complexity was not worth it for a portfolio blog. Raw markdown works, it is portable, and it does not couple my content to any specific rendering pipeline.

```bash
# The only two dependencies for the blog
pnpm add gray-matter reading-time
```

## What Actually Mattered

The single biggest improvement was grouping by feature, not by type. Everything else — the dead file cleanup, the barrel exports, the better naming conventions — those were consequences of that one decision. When you structure code around what it does instead of what kind of file it is, the right organization follows naturally.

Deleting ruthlessly was the second most important thing. I removed roughly 30 files that were not imported anywhere. Some had been sitting in the repo for months. Dead code is not just clutter — it is confusion. Every time you open a folder and see 15 files where only 5 are active, you waste mental energy figuring out which is which.

Starting simple with the blog paid off. Raw markdown, no build pipeline, no plugin ecosystem to maintain. I can write posts in any editor, version them in git, and render them with a straightforward function that reads the file and parses the frontmatter. If I ever need interactive components in posts, I can add MDX then. Not before.

The portfolio is now lean, organized, and ready for whatever comes next.
