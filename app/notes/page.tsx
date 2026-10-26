import type { Metadata } from 'next'
import { NotesIndexView, cms } from '@/features/liquid-glass'
import { WEBSITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Liner notes',
  description:
    'Notes on shipping software, listening closely, and the boring middle of craft — sequenced like a tracklist.',
  alternates: {
    canonical: '/notes',
    types: { 'application/rss+xml': `${WEBSITE_URL}/rss.xml` },
  },
  openGraph: {
    title: 'Liner notes — Aditya Himawan',
    description:
      'Notes on shipping software, listening closely, and the boring middle of craft.',
    url: `${WEBSITE_URL}/notes`,
    type: 'website',
  },
}

export default async function NotesIndexPage() {
  const notes = await cms.getNotes()
  return <NotesIndexView notes={notes} />
}
