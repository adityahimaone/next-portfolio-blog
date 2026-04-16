import { BlogPage, getAllPosts } from '@/features/blog'

export const metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
}

export default function Page() {
  const posts = getAllPosts()
  return <BlogPage posts={posts} />
}
