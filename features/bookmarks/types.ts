export interface Bookmark {
  id: string
  title: string
  url: string
  description: string
  category: string
  tags: string[]
  faviconUrl?: string
  featured?: boolean
  createdAt: string
}

export type BookmarkCategory =
  | 'All'
  | 'Dev Tools'
  | 'UI & Design'
  | 'AI & ML'
  | 'Audio & DAW'
  | 'Inspiration'
  | 'Articles'

export interface BookmarkFormData {
  title: string
  url: string
  description: string
  category: string
  tags: string
  featured: boolean
  customFaviconUrl?: string
}
