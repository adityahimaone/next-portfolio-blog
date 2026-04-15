import { getPost, getAllSlugs } from '@/features/blog/blog'
import { BlogPost } from '@/features/blog/components/blog-post'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { meta } = getPost(slug)
  return {
    title: `${meta.title} — adityahimaone`,
    description: meta.description,
    openGraph: {
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
  return <BlogPost meta={meta} content={content} />
}
