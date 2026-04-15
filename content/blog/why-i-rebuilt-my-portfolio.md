---
title: "Why I Rebuilt My Portfolio"
slug: why-i-rebuilt-my-portfolio
date: 2026-04-15
description: "My old portfolio was a mess. Here's how I rebuilt it with Next.js 15, Tailwind v4, and a feature-based architecture."
tags: [nextjs, tailwind, portfolio, web-dev]
published: true
---

# Why I Rebuilt My Portfolio

Last year I built my portfolio in a rush. It worked, but the codebase was... let's just say it wouldn't win any architecture awards. I had 30+ dead component files, versioned names like `hero-2025-v2.tsx`, and a single `data.ts` file that contained everything from projects to blog posts to social links.

## The Problem

The old structure was type-based — all components in one folder, all hooks in another, all utils in another. Sounds organized, right? Wrong. When I wanted to add a new feature, I had to touch 4 different folders. Deleting a feature meant hunting through the entire codebase.

## The Solution: Feature-Based Architecture

I switched to a feature-based structure where each feature is a self-contained folder:

```
features/
├── landing-page/    # All homepage sections
├── blog/            # This blog you're reading
├── projects/        # Project showcase
└── layout/          # Header, footer
```

Now adding a new feature is as simple as creating one folder. Everything related to that feature — components, data, hooks, utils — lives in one place.

## Tech Stack

- **Next.js 15** — App Router, Server Components
- **Tailwind CSS v4** — Native `@theme` directive, no config file
- **Motion** — Framer Motion successor for animations
- **TypeScript** — Because type safety matters

## What I Learned

1. **Delete ruthlessly** — I removed ~30 dead files. If it's not imported, it's dead weight.
2. **Group by feature, not by type** — This is the single biggest improvement to code organization.
3. **Start simple** — Raw markdown for the blog, no MDX overhead. Upgrade only when you need to.

The portfolio is now lean, organized, and ready for whatever I want to add next.
