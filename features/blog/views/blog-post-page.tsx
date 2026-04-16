import { BlogPost } from '../components/blog-post'
import { SubpageHeader, Footer } from '@/features/layout'

interface BlogPostPageProps {
  meta: any
  content: string
}

export function BlogPostPage({ meta, content }: BlogPostPageProps) {
  return (
    <>
      <SubpageHeader />
      <main className="min-h-screen pt-14">
        <BlogPost meta={meta} content={content} />
      </main>
      <Footer />
    </>
  )
}
