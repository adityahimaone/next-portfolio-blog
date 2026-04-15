
# Blog Feature Design

## Overview

Simple markdown-based blog. Write posts as .md files in `content/blog/`, rendered at build time with SSG.

## Content Structure

### Directory
```
content/blog/
├── my-first-post/
│   └── index.md
├── building-my-portfolio/
│   └── index.md
└── react-server-components-guide/
    └── index.md
```

Or flat files:
```
content/blog/
├── my-first-post.md
├── building-my-portfolio.md
└── react-server-components-guide.md
```

**Recommendation:** Flat files for simplicity. Use folder structure only if posts need local images.

### Frontmatter Schema

```yaml
```

### Required Fields
- `title` — Post title
- `slug` — URL slug (matches filename or folder name)
- `date` — Publication date (YYYY-MM-DD)
- `description` — Short summary for meta + cards
- `published` — true/false (draft control)

### Optional Fields
- `tags` — Array of tags for filtering
- `cover` — OG image / hero image path

## Routes

| Route | Description |
|-------|-------------|
| `/blog` | Blog list page — all posts, sorted by date |
## Overview

Simple markdown-based blog. Write posts as .md files in `content/blog/`, parsed at build time with `gray-matter`. Raw `.md` — no MDX overhead.

## Why Raw Markdown (not MDX)?

| Approach | Pros | Cons |
|----------|------|------|
| **Raw .md** ✅ | Simple, works with any editor, portable, zero build complexity | No JSX in posts |
| MDX | Can embed React components | Needs @next/mdx + @mdx-js/*, more complex |
| MDX Remote (RSC) | Best of both worlds | Extra dependency, server-only |

For a portfolio blog, you don't need JSX in posts. Raw `.md` + `gray-matter` + `reading-time` is all you need.

```bash
pnpm add gray-matter reading-time
```

That's it. Two dependencies. No @next/mdx needed.

### File: `features/blog/blog.ts`

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type BlogMeta = {
  title: string
  slug: string
  date: string
  description: string
  tags: string[]
  cover?: string
  published: boolean
  readingTime: string
}

export function getAllPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  
  const posts = files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { data, content: body } = matter(content)
    const stats = readingTime(body)
    
    return {
      ...data,
      slug,
      readingTime: stats.text,
    } as BlogMeta
  })
  
  return posts
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data, content: body } = matter(content)
  const stats = readingTime(body)
  
  return {
    meta: { ...data, slug, readingTime: stats.text } as BlogMeta,
    content: body,
  }
}

export function getAllSlugs() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}
```

### File: `app/blog/page.tsx`

```tsx
import { BlogList } from '@/features/blog'

export const metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
}

export default function BlogPage() {
  return <BlogList />
}
```

### File: `app/blog/[slug]/page.tsx`

```tsx
import { getPost, getAllSlugs } from '@/features/blog'
import { BlogPost } from '@/features/blog'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { meta } = getPost(params.slug)
  return {
    title: `${meta.title} — adityahimaone`,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      ...(meta.cover && { images: [meta.cover] }),
    },
  }
}

export default function Page({ params }) {
  const { meta, content } = getPost(params.slug)
  return <BlogPost meta={meta} content={content} />
}
```

## UI Components

All inside `features/blog/components/`:
- Title, date, reading time, description
- Tags as small pills
- Link to `/blog/[slug]`
- Hover effect matching site theme

### `components/blog/blog-header.tsx`
- Title (h1)
- Date formatted (e.g., "April 15, 2026")
- Reading time
- Tags
- Optional cover image

### `components/blog/mdx-components.tsx`
- Custom styled components for MDX rendering
- Code blocks with syntax highlighting (consider `rehype-pretty-code`)
- Callout boxes
- Image with caption

## Sample Blog Post

```markdown

# Why I Rebuilt My Portfolio

Last year I built my portfolio in a rush. It worked, but the code was messy...
```

## Navigation Integration

Add "Blog" link to header navigation (header-knob.tsx). Should appear between "Projects" and "Contact" or in a dedicated nav item.

## SEO

- Each post generates its own metadata
- Blog list has `/blog` route metadata
- RSS feed at `/blog/rss.xml` (optional, future)

## Future Enhancements

- [ ] RSS feed
- [ ] Tag filtering on blog list page
- [ ] Search (client-side, simple)
- [ ] MDX components for interactive demos
- [ ] Table of contents for long posts
- [ ] Related posts suggestion
