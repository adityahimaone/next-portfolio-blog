'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import SignalStormPreloader, {
  BOOT,
  StormCover,
} from '@/components/ui/signal-storm-preloader'

/**
 * The session's key. `sessionStorage`, not `localStorage`: the boot belongs to
 * the visit, so a new tab gets its own and a reader who comes back tomorrow
 * sees it again. Nothing about the page depends on it having been set.
 */
const SESSION_KEY = 'aditya-landing-session-boot'

/**
 * The attribute the `<head>` script in `app/layout.tsx` writes before the first
 * paint, and the only thing that makes the boot cover visible.
 *
 * It exists because of an ordering problem this component cannot solve alone.
 * Everything here is a client component, so the server ships the landing page's
 * HTML and nothing else: the hero paints, and *then* hydration runs, the effect
 * below fires, and the overlay appears. On a fast machine that gap is a frame;
 * on a phone parsing a page this size it is long enough to watch the hero's
 * name rise and then be covered by a boot that claims to have been there first.
 *
 * So the cover is not decided here. It is in the server's HTML already, and the
 * head script — which runs before anything is painted — says whether to show
 * it. That is the whole trick: the boot's first frame is painted by the server,
 * and this component only takes over from it.
 */
const BOOT_ATTR = 'data-boot'

/**
 * Where the boot is in its life.
 *
 * `cover`  the server's ground is up; nothing has been hydrated yet.
 * `storm`  the real overlay owns the frame and is playing.
 * `done`   the boot is over. No overlay at all — and it must not fall back to
 *          `cover`, which is why this is a phase and not a boolean.
 */
type Phase = 'cover' | 'storm' | 'done'

/**
 * Plays the Signal Storm preloader once per session, over the top of the landing
 * page: studio words run edge to edge across the hero's own ground, are pulled
 * into the hero's name clip, and the hero's own letters rise onto it (2.52s in
 * all). `SignalLockPreloader` (the 1.4s playhead version) is a drop-in
 * alternative: swap the import and the element below.
 *
 * The page stays mounted underneath. That is the point: the arrangement has to
 * be measured and laid out before the lanes leave, or the hero would arrive
 * mid-refresh and the camera's first frame would land on a page that had not
 * settled. Nothing is deferred to the gate either, so a reader who never sees
 * it (a repeat visit, or storage switched off) gets exactly the same page.
 *
 * `sessionStorage` can throw. Every access is guarded, and the failure mode is
 * the harmless one: the gate shows, or the gate is skipped, and the landing
 * page is usable either way.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('cover')
  // Whether the storm got far enough to take ownership of the hero's letter
  // variables. Until it does, they are the head script's, and this component is
  // the only thing that can hand them back — see the cleanup below.
  const stormOwnsHero = useRef(false)

  useEffect(() => {
    const html = document.documentElement
    let booted = '0'
    let readable = true
    try {
      booted = window.sessionStorage.getItem(SESSION_KEY) ?? '0'
    } catch {
      // Storage can be unavailable. The boot is skipped and the page is used
      // as it is, which is the harmless half of the failure.
      readable = false
    }

    const play = readable && booted !== '1'

    // The script and this effect read the same key, so they should always
    // agree. If they do not — storage cleared between the two, or a browser
    // that partitions `sessionStorage` per frame — the script's answer is the
    // one already on screen, so it is withdrawn immediately rather than left
    // for the state update below.
    if (!play) html.removeAttribute(BOOT_ATTR)

    // Deferred by a frame rather than set synchronously in the effect body.
    // Two reasons, and the second is the load-bearing one: the landing page
    // underneath has to be laid out before the overlay lands on top of it, and
    // setting state synchronously here is the cascading-render pattern React's
    // own lint rules reject. The cover is holding the frame meanwhile, so the
    // frame this costs is not a frame of hero.
    const frame = window.requestAnimationFrame(() => {
      if (!play) {
        setPhase('done')
        return
      }
      stormOwnsHero.current = true
      setPhase('storm')
    })

    return () => {
      window.cancelAnimationFrame(frame)
      html.removeAttribute(BOOT_ATTR)
      // The storm was never mounted, so nobody else is holding these. Without
      // this the hero's letters would stay paused for the rest of the tab's
      // life, through any number of client-side returns to this route.
      if (!stormOwnsHero.current) {
        html.style.removeProperty(BOOT.play)
        html.style.removeProperty(BOOT.delay)
        html.style.removeProperty(BOOT.stagger)
      }
    }
  }, [])

  const complete = useCallback(() => {
    // Withdraw the head script's flag. The cover it controls left the DOM when
    // the storm took over, so this is not about uncovering the page — it is so
    // that a later client-side return to this route, which remounts the gate
    // without re-running the script, does not find a stale `on` and flash a
    // cover it can no longer decide to keep.
    document.documentElement.removeAttribute(BOOT_ATTR)
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Storage can be unavailable. The page remains usable.
    }
    setPhase('done')
  }, [])

  return (
    <>
      {children}
      {/* The server's half of the boot: the storm's first frame, painted
          before this component exists. It is swapped for the real overlay in a
          single commit — the two are the same pixels, so there is no seam and
          nothing to cross-fade. */}
      {phase === 'cover' ? <StormCover /> : null}
      {/* `z-[100]` is the one deliberate departure from the component's default
          `z-50`: the dock and the music player sit at or above 50 and would
          otherwise be drawn over the poster for the length of the boot. */}
      {phase === 'storm' ? (
        <SignalStormPreloader className="z-[100]" onComplete={complete} />
      ) : null}
    </>
  )
}
