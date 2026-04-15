import { HeaderKnob } from '@/features/layout/header'
import { Footer2025V2 } from '@/features/layout/footer'
import { BlogList } from '@/features/blog/components/blog-list'

export const metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
}

export default function BlogPage() {
  return (
    <>
      <HeaderKnob />
      <BlogList />
      <Footer2025V2 />
    </>
  )
}
