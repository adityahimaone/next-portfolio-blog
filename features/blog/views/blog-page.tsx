import { Suspense } from 'react'
import { BlogList } from '../components/blog-list'
import type { BlogMeta } from '../lib/blog'

/**
 * The shell has to sit *above* BlogList: the list registers its transport
 * into the dock through context, and a component cannot consume a provider
 * it renders itself.
 *
 * The footer comes from BoothShell, which every booth route renders — the page
 * used to add the old layout footer on top of it, so /blog showed two.
 */
export function BlogPage({ posts }: { posts: BlogMeta[] }) {
  return (
    <Suspense fallback={null}>
      <BlogList posts={posts} />
    </Suspense>
  )
}
