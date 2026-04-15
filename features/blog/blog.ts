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
    meta: {
      title: data.title ?? slug,
      slug,
      date: data.date ?? new Date().toISOString(),
      description: data.description ?? '',
      tags: data.tags ?? [],
      cover: data.cover,
      published: data.published ?? true,
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
