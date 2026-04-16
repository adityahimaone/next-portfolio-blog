import { SubpageHeader, Footer } from '@/features/layout'
import { BlogList } from '../components/blog-list'

import type { BlogMeta } from '../lib/blog'

export function BlogPage({ posts }: { posts: BlogMeta[] }) {
  return (
    <>
      <SubpageHeader />
      <main className="min-h-screen pt-28">
        <BlogList posts={posts} />
      </main>
      <Footer />
    </>
  )
}
