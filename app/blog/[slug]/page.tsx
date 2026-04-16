import { getPost, getAllSlugs } from '@/features/blog/lib/blog'
import { BlogPostPage } from '@/features/blog'
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
  return <BlogPostPage meta={meta} content={content} />
}
