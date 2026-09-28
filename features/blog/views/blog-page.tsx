import { TopBar, Footer } from '@/features/layout'
import { BlogList } from '../components/blog-list'

import type { BlogMeta } from '../lib/blog'

export function BlogPage({ posts }: { posts: BlogMeta[] }) {
  return (
    <>
      <TopBar />
      <main id="main-content" className="min-h-screen pt-16">
        <BlogList posts={posts} />
      </main>
      <Footer />
    </>
  )
}
