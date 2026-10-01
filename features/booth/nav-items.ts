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
 *
 * These are the destinations that are their own place. `/work`, `/about` and
 * `/guides` are deliberately absent — their content lives inside the surfaces
 * they were pulled out of, so a nav entry would only be a second place to look
 * for something already on the page you are reading. `/contact` is a section
 * of the landing page rather than a route, so it is linked by anchor at the
 * point of use.
 *
 * Five is also what the mobile dock fits at 320px without either clipping or
 * hiding destinations. A nine-item version needed a "More" menu that existed
 * only because of the entries removed from here.
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
