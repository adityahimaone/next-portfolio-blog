import { BlogPage, getAllPosts } from '@/features/blog'

export const metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
  openGraph: {
    title: 'Blog — adityahimaone',
    description: 'Thoughts on frontend development, design, and code.',
    url: 'https://adityahimaone.space/blog',
    type: 'website',
    images: ['https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'Blog — adityahimaone',
    description: 'Thoughts on frontend development, design, and code.',
    images: ['https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png'],
  },
}

export default async function Page() {
  const posts = await getAllPosts()
  return <BlogPage posts={posts} />
}
