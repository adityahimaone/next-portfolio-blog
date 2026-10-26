'use client'

import { usePathname } from 'next/navigation'
import { AudioEngineProvider } from '../audio/engine'
import { SmoothScroll } from '../scroll/smooth-scroll'
import { GlassDock } from './dock/glass-dock'
import { MusicPlayer } from '@/features/landing-page/spotify/music-player'
import { MagneticDock } from '@/features/layout/components/magnetic-dock'

/**
 * Which chrome a route gets.
 *
 * Side Two owns `/` and `/notes`. Everything else — the archive, the booth, the
 * booking pages — still runs the previous shell, including its own nav and its
 * own scroll engine. Rather than mount both and fight, the root layout asks
 * this component and renders exactly one.
 *
 * The audio provider sits above this switch so the graph is never torn down by
 * navigation; only the transport UI changes with the route.
 */
const WORLD_ROUTES = ['/', '/notes']

function isWorld(pathname: string) {
  return WORLD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export function WorldChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/'
  const world = isWorld(pathname)

  if (!world) {
    return (
      <>
        <div className="relative flex-1">{children}</div>
        <MusicPlayer />
        <MagneticDock />
      </>
    )
  }

  return (
    <AudioEngineProvider>
      <SmoothScroll>
        <div className="relative flex-1">{children}</div>
        <GlassDock />
      </SmoothScroll>
    </AudioEngineProvider>
  )
}
