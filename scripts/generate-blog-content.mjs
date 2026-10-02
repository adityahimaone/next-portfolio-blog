#!/usr/bin/env node
/**
 * Inlines content/blog/*.md into a TypeScript module.
 *
 * The blog was read with fs.readdirSync/readFileSync at request time. That works
 * on a VPS but not on Cloudflare Workers, where the filesystem is read-only and
 * ephemeral — a post list request would find no files at all.
 *
 * This runs before `next build` and emits
 * features/blog/lib/generated-content.ts, so the markdown becomes a plain module
 * the bundler inlines. The alternative, shipping the .md files as static assets
 * and fetching them per request, would add a network round trip to every page
 * render and to the sitemap and RSS routes.
 *
 * Parsing happens here, at build time, rather than in the worker: gray-matter
 * and reading-time never have to be in the deployed bundle.
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const OUT_FILE = path.join(
  process.cwd(),
  'features',
  'blog',
  'lib',
  'generated-content.ts',
)

/**
 * gray-matter returns a JS Date for an unquoted YAML date. Normalise to ISO
 * here so the emitted literal is a plain string and callers never have to
 * defend against `[object Object]` interpolation.
 */
function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' && value) return value
  return new Date().toISOString()
}

if (!fs.existsSync(BLOG_DIR)) {
  console.error(`No blog directory at ${BLOG_DIR}`)
  process.exit(1)
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort()

const entries = files.map((file) => {
  const slug = file.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
  const { data, content: body } = matter(raw)
  const stats = readingTime(body)

  return {
    slug,
    title: data.title ?? slug,
    date: toIsoDate(data.date),
    dateModified: data.dateModified ? toIsoDate(data.dateModified) : undefined,
    description: data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover ?? undefined,
    published: data.published ?? true,
    pinned: data.pinned ?? false,
    readingTime: stats.text,
    body,
  }
})

const payload = JSON.stringify(entries, null, 2)

const source = `// GENERATED FILE — do not edit and do not commit by hand.
// Regenerate with: node scripts/generate-blog-content.mjs
// It runs automatically as part of \`pnpm build\`.
//
// The markdown used to be read from disk at request time. Workers have a
// read-only ephemeral filesystem, so the posts are inlined here at build time
// instead.

export type GeneratedPost = {
  slug: string
  title: string
  date: string
  dateModified?: string
  description: string
  tags: string[]
  cover?: string
  published: boolean
  pinned: boolean
  readingTime: string
  body: string
}

export const POSTS: GeneratedPost[] = ${payload}
`

fs.writeFileSync(OUT_FILE, source, 'utf-8')

const published = entries.filter((e) => e.published).length
console.log(
  `generated-content: ${entries.length} posts (${published} published) -> ${path.relative(process.cwd(), OUT_FILE)}`,
)