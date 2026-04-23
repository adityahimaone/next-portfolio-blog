import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { unstable_cache } from 'next/cache'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type BlogMeta = {
  title: string
  slug: string
  date: string
  description: string
  tags: string[]
  cover?: string
  published: boolean
  pinned?: boolean
  readingTime: string
}

function _getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

  const posts = files.map(file => {
    const slug = file.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { data, content: body } = matter(content)
    const stats = readingTime(body)

    return {
      title: data.title ?? slug,
      slug,
      date: data.date ?? new Date().toISOString(),
      description: data.description ?? '',
      tags: data.tags ?? [],
      cover: data.cover,
      published: data.published ?? true,
      pinned: data.pinned ?? false,
      readingTime: stats.text,
    } as BlogMeta
  })

  return posts
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Cached version — reads from disk only once per hour
export const getAllPosts = unstable_cache(
  async () => _getAllPosts(),
  ['blog-posts'],
  { revalidate: 3600 },
)

export function getPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data, content: body } = matter(content)
  const stats = readingTime(body)

  return {
    meta: {
      title: data.title ?? slug,
      slug,
      date: data.date ?? new Date().toISOString(),
      description: data.description ?? '',
      tags: data.tags ?? [],
      cover: data.cover,
      published: data.published ?? true,
      pinned: data.pinned ?? false,
      readingTime: stats.text,
    } as BlogMeta,
    content: body,
  }
}

export function getAllSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return []

  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
}

// Get related posts based on tag similarity (Jaccard index)
export async function getRelatedPosts(currentSlug: string, limit: number = 3): Promise<BlogMeta[]> {
  const allPosts = await getAllPosts()
  const currentPost = allPosts.find(p => p.slug === currentSlug)
  if (!currentPost) return []

  const currentTags = new Set(currentPost.tags)
  if (currentTags.size === 0) return []

  const scored = allPosts
    .filter(p => p.slug !== currentSlug && p.published)
    .map(post => {
      const postTags = new Set(post.tags)
      const intersection = new Set([...currentTags].filter(t => postTags.has(t)))
      const union = new Set([...currentTags, ...postTags])
      const score = union.size > 0 ? intersection.size / union.size : 0
      return { post, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)

  return scored
}
