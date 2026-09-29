import {
  Bookmark,
  FolderGit2,
  Home,
  Music,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  readonly label: string
  readonly href: string
  readonly Icon: LucideIcon
}

/**
 * One definition for every dock. The landing page's magnetic dock and the
 * booth dock previously declared their own arrays, which is how they drifted
 * apart: one used FolderGit2 for Projects and called /music "Mixtape", the
 * other used Layers and called it "Music". Icons and labels now come from
 * here so they cannot diverge again.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Projects', href: '/projects', Icon: FolderGit2 },
  { label: 'Bookmarks', href: '/bookmarks', Icon: Bookmark },
  { label: 'Blog', href: '/blog', Icon: Newspaper },
  { label: 'Mixtape', href: '/music', Icon: Music },
]

export function isActiveNavItem(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
