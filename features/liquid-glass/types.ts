/**
 * Content model for Side Two.
 *
 * These types are the contract between the site and whatever is producing the
 * content. Today that is a local mock source (`lib/cms.ts`); swapping in Sanity,
 * Contentful or MDX means writing one adapter that satisfies `PortfolioSource`
 * and changing a single line — no component imports a data file directly.
 *
 * Shapes are deliberately close to the portable-text / rich-text conventions
 * those CMSs emit, so a mapping layer stays mechanical instead of becoming a
 * rewrite.
 */

export type ProjectLinkKind = 'live' | 'source' | 'case'

export interface ProjectLink {
  kind: ProjectLinkKind
  label: string
  href: string
}

/** Visible size in the works grid. The grid is authored, not computed. */
export type ProjectSpan = 'feature' | 'wide' | 'standard'

export interface Project {
  id: string
  slug: string
  /** 1-based position on the sleeve. Rendered as `01 /`. */
  order: number
  title: string
  /** Sleeve genre: "AI Infrastructure", "Product", … */
  category: string
  tagline: string
  /** Two or three sentences for the expanded view. */
  summary: string
  year: number
  role: string
  stack: string[]
  /** What actually shipped. Used in the card's expanded state. */
  highlights: string[]
  links: ProjectLink[]
  cover: string
  coverAlt: string
  /** CSS colour used for the card's ambient wash. */
  accent: string
  span: ProjectSpan
  /** Optional in-card audio preview; omitted when the project has no sound. */
  preview?: {
    src: string
    title: string
    duration: string
  }
}

export type NoteBlockType = 'paragraph' | 'heading' | 'quote' | 'list' | 'code'

export interface NoteBlock {
  type: NoteBlockType
  text?: string
  items?: string[]
  language?: string
  code?: string
}

export interface Note {
  id: string
  slug: string
  /** 1-based tracklist position. */
  order: number
  title: string
  excerpt: string
  /** ISO date; the UI formats it as `2026.04.15`. */
  publishedAt: string
  /** Track length, read straight off the liner notes. */
  duration: string
  readingMinutes: number
  tags: string[]
  lead?: boolean
  body: NoteBlock[]
  updatedAt?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  /** Audio file in /public. */
  src: string
  bpm: number
  key: string
  /** Shown on the dock. */
  role: string
}

/** The two calls every consumer needs, in the shape a headless source returns. */
export interface PortfolioSource {
  getProjects(): Promise<Project[]>
  getProject(slug: string): Promise<Project | null>
  getNotes(): Promise<Note[]>
  getNote(slug: string): Promise<Note | null>
  getTracks(): Promise<Track[]>
}
