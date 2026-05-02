import { getPost, getAllPosts, getRelatedPosts } from '@/features/blog/lib/blog'
import { BlogPostPage } from '@/features/blog'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { meta } = getPost(slug)
  const url = `https://adityahimaone.space/blog/${slug}`
  return {
    title: `${meta.title} — adityahimaone`,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: 'article',
      ...(meta.cover && { images: [meta.cover] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      ...(meta.cover && { images: [meta.cover] }),
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { meta, content } = getPost(slug)
  const relatedPosts = await getRelatedPosts(slug, 3)
  return <BlogPostPage meta={meta} content={content} relatedPosts={relatedPosts} />
}
