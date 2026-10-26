import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NoteReaderView, cms } from '@/features/liquid-glass'
import { WEBSITE_URL } from '@/lib/constants'
import { JsonLd, blogPosting } from '@/lib/structured-data'

type Params = { slug: string }

/** Every note is local today; a CMS source would keep the same contract. */
export async function generateStaticParams() {
  const notes = await cms.getNotes()
  return notes.map((note) => ({ slug: note.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const note = await cms.getNote(slug)

  if (!note) {
    return { title: 'Liner note not found' }
  }

  const url = `${WEBSITE_URL}/notes/${note.slug}`

  return {
    title: note.title,
    description: note.excerpt,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: `${note.title} — Liner notes`,
      description: note.excerpt,
      url,
      type: 'article',
      publishedTime: `${note.publishedAt}T00:00:00.000Z`,
      modifiedTime: `${note.updatedAt ?? note.publishedAt}T00:00:00.000Z`,
      tags: note.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title,
      description: note.excerpt,
    },
  }
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const [note, notes] = await Promise.all([cms.getNote(slug), cms.getNotes()])

  if (!note) notFound()

  const position = notes.findIndex((entry) => entry.slug === note.slug)
  const previous = position > 0 ? notes[position - 1] : null
  const next = position < notes.length - 1 ? notes[position + 1] : null

  const article = blogPosting({
    title: note.title,
    description: note.excerpt,
    datePublished: `${note.publishedAt}T00:00:00.000Z`,
    dateModified: note.updatedAt
      ? `${note.updatedAt}T00:00:00.000Z`
      : undefined,
    url: `${WEBSITE_URL}/notes/${note.slug}`,
    tags: note.tags,
  })

  return (
    <>
      <JsonLd data={article} />
      <NoteReaderView note={note} previous={previous} next={next} />
    </>
  )
}
