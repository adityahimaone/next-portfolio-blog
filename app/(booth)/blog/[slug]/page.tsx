import { getPost, getAllPosts, getRelatedPosts } from '@/features/blog/lib/blog'
import { BlogPostPage } from '@/features/blog'
import type { Metadata } from 'next'
import { blogPosting, breadcrumbList, JsonLd } from '@/lib/structured-data'
import { WEBSITE_URL } from '@/lib/constants'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { meta } = getPost(slug)
  const url = `${WEBSITE_URL}/blog/${slug}`
  return {
    title: `${meta.title} — adityahimaone`,
    description: meta.description,
    // Post pages were the one route serving the same prose at two addresses,
    // since nothing told the index which of them was canonical.
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: 'article',
      // `meta.date` was a raw gray-matter `Date`, so this shipped
      // `article:published_time="[object Object]"` on every post. blog.ts now
      // normalises it to an ISO string.
      publishedTime: meta.date,
      tags: meta.tags,
      authors: ['https://x.com/adityahimaone'],
      // No post sets `cover` in frontmatter, so this guard never fired and no
      // per-post image was ever declared here. The sibling
      // `opengraph-image.tsx` supplies one by convention instead.
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
  const orderedPosts = await getAllPosts()

  const url = `${WEBSITE_URL}/blog/${slug}`

  // A post carried no structured data at all, so the one page on the site with
  // real prose to index was invisible to anything reading for `BlogPosting`.
  const posting = blogPosting({
    title: meta.title,
    description: meta.description,
    datePublished: meta.date,
    url,
    tags: meta.tags,
    // No post sets a cover, so this was always undefined and the builder
    // emitted a BlogPosting with no image — ineligible for Article rich
    // results. The builder now falls back to a stable site image.
    image: meta.cover,
  })

  // `BlogPostPage` already renders a visible breadcrumb nav — this is the same
  // trail in the form a crawler can read.
  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: meta.title, path: `/blog/${slug}` },
  ])

  return (
    <>
      <JsonLd data={posting} />
      <JsonLd data={breadcrumbs} />
      <BlogPostPage
        meta={meta}
        content={content}
        relatedPosts={relatedPosts}
        orderedPosts={orderedPosts}
      />
    </>
  )
}
