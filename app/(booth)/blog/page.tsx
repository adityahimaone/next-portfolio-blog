import type { Metadata } from 'next'
import { BlogPage, getAllPosts } from '@/features/blog'
import { itemList, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Blog — adityahimaone',
  description: 'Thoughts on frontend development, design, and code.',
  // Was missing entirely while /projects had one, so the two index pages
  // disagreed about how they identify themselves.
  alternates: {
    canonical: '/blog',
    // The feed has existed at /rss.xml all along but nothing pointed a reader
    // or a crawler at it.
    types: { 'application/rss+xml': `${WEBSITE_URL}/rss.xml` },
  },
  openGraph: {
    title: 'Blog — adityahimaone',
    description: 'Thoughts on frontend development, design, and code.',
    url: `${WEBSITE_URL}/blog`,
    type: 'website',
    images: [
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adityahimaone',
    title: 'Blog — adityahimaone',
    description: 'Thoughts on frontend development, design, and code.',
    images: [
      'https://ucarecdn.com/b624aa7d-978f-44ef-8e45-bf3c12f1e846/memojilaptop1.png',
    ],
  },
}

export default async function Page() {
  const posts = await getAllPosts()

  const jsonLd = itemList({
    name: 'Blog — adityahimaone',
    description: 'Thoughts on frontend development, design, and code.',
    items: posts.map((post) => ({
      name: post.title,
      url: `${WEBSITE_URL}/blog/${post.slug}`,
      description: post.description,
    })),
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogPage posts={posts} />
    </>
  )
}
