import fs from 'fs'
import path from 'path'
import { BookmarksPage, Bookmark } from '@/features/bookmarks'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Curated Bookmarks | Web Resources & Tools',
  description: 'A curated list of developer tools, design resources, audio synthesis frameworks, and articles collected by Aditya.',
}

function getBookmarks(): Bookmark[] {
  try {
    const filePath = path.join(process.cwd(), 'content', 'bookmarks.json')
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as Bookmark[]
    }
  } catch (error) {
    console.error('Failed to load initial bookmarks:', error)
  }
  return []
}

export default function Page() {
  const initialBookmarks = getBookmarks()

  return <BookmarksPage initialBookmarks={initialBookmarks} />
}
