'use client'

import { useCallback, useEffect, useState } from 'react'

import SlatCountPreloader from '@/components/ui/slat-count-preloader'

/**
 * The session's key. `sessionStorage`, not `localStorage`: the boot belongs to
 * the visit, so a new tab gets its own and a reader who comes back tomorrow
 * sees it again. Nothing about the page depends on it having been set.
 */
const SESSION_KEY = 'aditya-landing-session-boot'

/** Hoisted so the boot cannot restart on an unrelated re-render: the sequence
 *  and the palette are props of the preloader, and an inline object would be a
 *  new identity every time this component renders. */
const BOOT_SEQUENCE = ['003', '002', '001', 'READY'] as const
const BOOT_PALETTE = {
  background: '#14171a',
  ink: '#eee9df',
  accent: '#ff5a1f',
} as const

/**
 * Boots the rack once per session, over the top of the landing page.
 *
 * The page stays mounted underneath. That is the point: the arrangement has to
 * be measured and laid out before the blinds leave, or the hero would arrive
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
      {showGate ? (
        <div className="fixed inset-0 z-[100]">
          <SlatCountPreloader
            sequence={BOOT_SEQUENCE}
            preset="ink"
            palette={BOOT_PALETTE}
            label="RACK 01 / SESSION BOOT"
            caption="Routing interface, systems and production notes."
            exit="blinds"
            hud
            interactive={false}
            onComplete={complete}
          />
        </div>
      ) : null}
    </>
  )
}
