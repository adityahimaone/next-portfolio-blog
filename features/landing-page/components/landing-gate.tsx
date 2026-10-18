'use client'

import { useCallback, useEffect, useState } from 'react'

import SignalLockPreloader from '@/components/ui/signal-lock-preloader'

/**
 * The session's key. `sessionStorage`, not `localStorage`: the boot belongs to
 * the visit, so a new tab gets its own and a reader who comes back tomorrow
 * sees it again. Nothing about the page depends on it having been set.
 */
const SESSION_KEY = 'aditya-landing-session-boot'

/**
 * Plays the Signal Lock preloader once per session, over the top of the landing
 * page: a playhead sweeps three track lanes, the name decodes out of vertical
 * reels, and the lanes shutter open (1.4s in all).
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
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    let booted = '0'
    try {
      booted = window.sessionStorage.getItem(SESSION_KEY) ?? '0'
    } catch {
      // Storage can be unavailable. The gate is skipped and the page is used
      // as it is, which is the harmless half of the failure.
      return
    }
    if (booted === '1') return

    // Deferred by a frame rather than set synchronously in the effect body.
    // Two reasons, and the second is the load-bearing one: the landing page
    // underneath has to be laid out before the overlay lands on top of it, and
    // setting state synchronously here is the cascading-render pattern React's
    // own lint rules reject. The gate is one frame later than it could be,
    // which is invisible, and the page is measurably ready when it arrives.
    const frame = window.requestAnimationFrame(() => setShowGate(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const complete = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Storage can be unavailable. The page remains usable.
    }
    setShowGate(false)
  }, [])

  return (
    <>
      {children}
      {/* `z-[100]` is the one deliberate departure from the component's default
          `z-50`: the dock and the music player sit at or above 50 and would
          otherwise be drawn over the poster for the length of the boot. */}
      {showGate ? (
        <SignalLockPreloader className="z-[100]" onComplete={complete} />
      ) : null}
    </>
  )
}
