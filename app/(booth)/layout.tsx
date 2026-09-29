'use client'

import { usePathname } from 'next/navigation'
import { BoothShell } from '@/components/booth'

/**
 * The booth shell for the archive routes.
 *
 * It has to live in a layout rather than inside each page: pages register
 * their transport into the dock through context, and a component cannot
 * consume a provider that it renders itself.
 *
 * The default wash is signal orange. Pages retint the room through
 * `useRoomChannel()` as their context changes, and this resets it on
 * navigation so one route's colour never leaks into the next.
 */
const DEFAULT_HUE = '#ff5a1f'

export default function BoothLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <BoothShell hue={DEFAULT_HUE} key={pathname}>
      {children}
    </BoothShell>
  )
}
