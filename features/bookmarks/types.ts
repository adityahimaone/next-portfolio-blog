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
  // Hand-written channels
  | 'Dev Tools'
  | 'UI & Design'
  | 'AI & ML'
  | 'Audio & DAW'
  | 'Inspiration'
  | 'Articles'
  // designeer.xyz groups, imported by scripts/import-designeer.mjs
  | 'Design Galleries'
  | 'Interface Design'
  | 'Reading'
  | 'Component Libraries'
  | 'Motion'
  | 'Development'
  | 'Agents & MCP'
  | 'Deploy'
  | 'Type'
  | 'Color'
  | '3D'
  | 'Shaders'
  | 'Icons'
  | 'Utilities'
  | 'Desktop'
  | 'Video & Capture'
  | 'Whiteboard'
  | 'Design Engineers'

export interface BookmarkFormData {
  title: string
  url: string
  description: string
  category: string
  tags: string
  featured: boolean
  customFaviconUrl?: string
}
