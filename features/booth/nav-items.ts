import {
  Bookmark,
  BookOpen,
  Briefcase,
  FolderGit2,
  Home,
  Mail,
  Music,
  Newspaper,
  User,
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
 * `/contact` was absent from this list, and from `SOCIAL_LINKS`, which left it
 * as the site's only orphan: a real page, present in the sitemap, linked from
 * nowhere. A sitemap is not an internal link — nothing on the site pointed at
 * it except the footer email address, which bypasses the page entirely.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Projects', href: '/projects', Icon: FolderGit2 },
  { label: 'Work', href: '/work', Icon: Briefcase },
  { label: 'Guides', href: '/guides', Icon: BookOpen },
  { label: 'Bookmarks', href: '/bookmarks', Icon: Bookmark },
  { label: 'Blog', href: '/blog', Icon: Newspaper },
  { label: 'Mixtape', href: '/music', Icon: Music },
  { label: 'About', href: '/about', Icon: User },
  { label: 'Contact', href: '/contact', Icon: Mail },
]

export function isActiveNavItem(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
