'use client'

import { usePathname } from 'next/navigation'
import { BoothShell } from '@/features/booth'

/**
 * The booth shell for the archive routes.
 *
 * It has to live in a layout rather than inside each page: pages register
 * their transport into the dock through context, and a component cannot
 * consume a provider that it renders itself.
 *
 * Each route gets its own wash so the room reads as somewhere different per
 * page instead of one orange everywhere. Pages still retint the room through
 * `useRoomChannel()` as their own context changes — the bookmarks page tints
 * per channel — and `key={pathname}` resets it on navigation so one route's
 * colour never leaks into the next.
 */
const ROUTE_HUES: Record<string, string> = {
  '/projects': '#ff5a1f',
  '/bookmarks': '#2dd4bf',
  '/blog': '#a78bfa',
  // The guides are the blog's long-form sibling and wear the same reader, so
  // they take the same wash. Without this they inherited the orange default,
  // which read as a different room from the page furniture they share.
  '/guides': '#a78bfa',
  '/mix': '#f472b6',
  '/music': '#38bdf8',
  '/contact': '#fbbf24',
}

const DEFAULT_HUE = '#ff5a1f'

/** Longest-prefix match, so `/blog/[slug]` inherits the blog's wash. */
function hueFor(pathname: string): string {
  if (ROUTE_HUES[pathname]) return ROUTE_HUES[pathname]
  for (const [route, hue] of Object.entries(ROUTE_HUES)) {
    if (pathname.startsWith(`${route}/`)) return hue
  }
  return DEFAULT_HUE
}

export default function BoothLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <BoothShell hue={hueFor(pathname)} key={pathname}>
      {children}
    </BoothShell>
  )
}
