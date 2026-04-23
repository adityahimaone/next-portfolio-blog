import { BlogPost } from '../components/blog-post'
import { SubpageHeader, Footer } from '@/features/layout'
import type { BlogMeta } from '../lib/blog'

interface BlogPostPageProps {
  meta: any
  content: string
  relatedPosts?: BlogMeta[]
}

export function BlogPostPage({ meta, content, relatedPosts }: BlogPostPageProps) {
  return (
    <>
      <SubpageHeader />
      <main className="min-h-screen pt-14">
        <BlogPost meta={meta} content={content} relatedPosts={relatedPosts} />
      </main>
      <Footer />
    </>
  )
}
