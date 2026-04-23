import { BlogPage, getAllPosts } from '@/features/blog'

export const metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
}

export default async function Page() {
  const posts = await getAllPosts()
  return <BlogPage posts={posts} />
}
