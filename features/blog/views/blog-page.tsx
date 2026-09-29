import { Suspense } from 'react'
import { Footer } from '@/features/layout'
import { BlogList } from '../components/blog-list'
import type { BlogMeta } from '../lib/blog'

/**
 * The shell has to sit *above* BlogList: the list registers its transport
 * into the dock through context, and a component cannot consume a provider
 * it renders itself.
 */
export function BlogPage({ posts }: { posts: BlogMeta[] }) {
  return (
    <>
      {/* Filters live in the URL, so the list reads searchParams. */}
      <Suspense fallback={null}>
        <BlogList posts={posts} />
      </Suspense>
      <Footer />
    </>
  )
}
