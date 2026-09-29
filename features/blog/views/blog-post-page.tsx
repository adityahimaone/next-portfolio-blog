import { BlogPost } from '../components/blog-post'
import type { BlogMeta } from '../lib/blog'

interface BlogPostPageProps {
  meta: BlogMeta
  content: string
  relatedPosts?: BlogMeta[]
  /** Tracklist order, so the dock can step through the archive. */
  orderedPosts?: BlogMeta[]
}

/**
 * `orderedPosts` is the full list in the order the tracklist shows it, so
 * prev/next follow what the reader actually sees rather than a sort order
 * they never chose.
 */
export function BlogPostPage({
  meta,
  content,
  relatedPosts,
  orderedPosts,
}: BlogPostPageProps) {
  const order = orderedPosts ?? []
  const at = order.findIndex((post) => post.slug === meta.slug)

  return (
    <BlogPost
      meta={meta}
      content={content}
      relatedPosts={relatedPosts}
      prevPost={at > 0 ? order[at - 1] : undefined}
      nextPost={at >= 0 && at < order.length - 1 ? order[at + 1] : undefined}
    />
  )
}
