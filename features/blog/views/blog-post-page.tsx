import { BlogPost } from '../components/blog-post'
import { TopBar, Footer } from '@/features/layout'
import type { BlogMeta } from '../lib/blog'

interface BlogPostPageProps {
  meta: any
  content: string
  relatedPosts?: BlogMeta[]
}

export function BlogPostPage({
  meta,
  content,
  relatedPosts,
}: BlogPostPageProps) {
  return (
    <>
      <TopBar />
      <main id="main-content" className="min-h-screen pt-16">
        <BlogPost meta={meta} content={content} relatedPosts={relatedPosts} />
      </main>
      <Footer />
    </>
  )
}
