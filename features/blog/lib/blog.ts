import { unstable_cache } from 'next/cache'
import { POSTS } from './generated-content'

export type BlogMeta = {
  title: string
  slug: string
  date: string
  /**
   * When the post was last substantively updated. Absent on every post today,
   * which is why `BlogPosting.dateModified` had nothing to report and the
   * sitemap could only echo `date`. Defaults to the publish date so a post that
   * is never edited still declares a coherent pair.
   */
  dateModified?: string
  description: string
  tags: string[]
  cover?: string
  published: boolean
  pinned?: boolean
  readingTime: string
}

/**
 * The posts are generated into a module at build time
 * (scripts/generate-blog-content.mjs) rather than read from disk. The old
 * `fs.readdirSync` version could not run on Workers at all, and the reads it did
 * on the VPS happened on every request, behind an `unstable_cache` that hid
 * them until the first miss.
 */
function _getAllPosts(): BlogMeta[] {
  return POSTS.filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      date: p.date,
      dateModified: p.dateModified ?? p.date,
      description: p.description,
      tags: p.tags,
      cover: p.cover,
      published: p.published,
      pinned: p.pinned,
      readingTime: p.readingTime,
    }))
}

// Still cached: these are read by the blog index, the sitemap and the RSS feed,
// all of which want the same list. R2 backs the incremental cache via the
// NEXT_INC_CACHE_R2_BUCKET binding, so this survives between requests.
export const getAllPosts = unstable_cache(
  async () => _getAllPosts(),
  ['blog-posts'],
  { revalidate: 3600 },
)

export function getPost(slug: string) {
  const post = POSTS.find((p) => p.slug === slug)
  if (!post) {
    throw new Error(`Unknown blog post: ${slug}`)
  }

  return {
    meta: {
      title: post.title,
      slug: post.slug,
      date: post.date,
      description: post.description,
      tags: post.tags,
      cover: post.cover,
      published: post.published,
      pinned: post.pinned,
      readingTime: post.readingTime,
    } as BlogMeta,
    content: post.body,
  }
}

export function getAllSlugs() {
  return POSTS.map((p) => p.slug)
}

// Get related posts based on tag similarity (Jaccard index)
export async function getRelatedPosts(
  currentSlug: string,
  limit: number = 3,
): Promise<BlogMeta[]> {
  const allPosts = await getAllPosts()
  const currentPost = allPosts.find((p) => p.slug === currentSlug)
  if (!currentPost) return []

  const currentTags = new Set(currentPost.tags)
  if (currentTags.size === 0) return []

  const scored = allPosts
    .filter((p) => p.slug !== currentSlug && p.published)
    .map((post) => {
      const postTags = new Set(post.tags)
      const intersection = new Set(
        [...currentTags].filter((t) => postTags.has(t)),
      )
      const union = new Set([...currentTags, ...postTags])
      const score = union.size > 0 ? intersection.size / union.size : 0
      return { post, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)

  return scored
}
