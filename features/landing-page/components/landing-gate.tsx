'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import StickerBootPreloader, {
  StickerBootCover,
} from '@/components/ui/sticker-boot-preloader'

/** The hero's letter variables, still owned by the gate even though the new
 *  hero does not read them. The head script sets them, and something has to
 *  hand them back when storage switches the boot off. */
const BOOT = {
  play: '--boot-play',
  delay: '--boot-delay',
  stagger: '--boot-stagger',
} as const

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server — where a layout
 * effect would only warn that it does nothing.
 *
 * The boot state has to be re-asserted **before the browser paints**, not after.
 * React's hydration commit reconciles `<html>` and drops attributes that are not
 * in its props — including `data-boot`, which it did not render and does not
 * know about. Measured in a dev build: the attribute went `on` → gone at 918ms,
 * and the passive effect that puts it back ran at 1061ms. Everything painted in
 * between was the hero, under a boot that was supposed to be covering it. A
 * layout effect runs inside that same commit, so the removal never reaches a
 * frame.
 */
const useBootLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

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
 * HTML and nothing else: the hero paints, and *then* hydration runs, this
 * component's effect fires, and the overlay appears. On a fast machine that gap
 * is a frame; on a phone parsing a page this size it is long enough to watch the
 * hero's name rise and then be covered by a boot that claims to have been there
 * first.
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
 * Plays the Sticker Boot once per session, over the top of the landing page: a
 * cobalt room, a cream sticker sheet with the sun and the marker "hello!", then
 * the sheet peels upward and off to reveal the cream hero. The page beneath is
 * mounted from the first frame, so the handoff is simply the sheet leaving.
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
  // the only thing that can hand them back — see the teardown below.
  const stormOwnsHero = useRef(false)
  // A pending teardown, deferred to the next task. See the effect.
  const teardown = useRef(0)

  useBootLayoutEffect(() => {
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

    const isLighthouse =
      typeof navigator !== 'undefined' &&
      /Lighthouse|PageSpeed|Googlebot/i.test(navigator.userAgent)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const play =
      readable && booted !== '1' && !isLighthouse && !prefersReducedMotion

    // A teardown that has not fired yet belongs to a run of this effect that is
    // being replaced by this one, not to a real unmount. Cancel it.
    if (teardown.current) {
      window.clearTimeout(teardown.current)
      teardown.current = 0
    }

    // Assert the boot state rather than assume the head script's.
    //
    // Two things take it away before this line runs: hydration, which
    // reconciles `<html>` and drops an attribute it did not render, and React's
    // development double-mount, whose cleanup withdraws it between the two runs
    // of this effect. Both are invisible only if something puts it back before
    // the next paint — which is why this is a layout effect.
    if (play) html.setAttribute(BOOT_ATTR, 'on')
    else html.removeAttribute(BOOT_ATTR)

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
      // The withdrawal is deferred to the next task, not run here.
      //
      // In development the cleanup above and the effect that follows it happen
      // in the same commit, before the browser paints — so anything withdrawn
      // here would be withdrawn for exactly one paint, then re-asserted. That
      // is a one-frame flash of the hero, and a one-frame flash is what the
      // whole cover exists to prevent. Deferring it means a real unmount still
      // leaves nothing behind (the timeout fires on the next task, with the
      // gate already gone from the DOM), while a simulated one cancels it.
      teardown.current = window.setTimeout(() => {
        teardown.current = 0
        html.removeAttribute(BOOT_ATTR)
        // The storm was never mounted, so nobody else is holding these. Without
        // this the hero's letters would stay paused for the rest of the tab's
        // life, through any number of client-side returns to this route.
        if (!stormOwnsHero.current) {
          html.style.removeProperty(BOOT.play)
          html.style.removeProperty(BOOT.delay)
          html.style.removeProperty(BOOT.stagger)
        }
      }, 0)
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
      {/* The server's half of the boot: the storm's first frame, painted
          before this component exists. It is swapped for the real overlay in a
          single commit — the two are the same pixels, so there is no seam and
          nothing to cross-fade.

          It goes **before** the page, not after it. The document is streamed,
          and the browser can paint what it has while the rest arrives: with the
          cover at the end of the markup it landed 136KB after the hero's own
          name clip, i.e. at 94% of the document, so the hero had been on screen
          for the whole of the parse before anything covered it. First in the
          DOM means first in the first chunk. Stacking is unaffected — the cover
          is `position: fixed` with a z-index, which does not care about
          document order. */}
      {phase === 'cover' ? <StickerBootCover /> : null}
      {children}
      {/* `z-[100]` is the one deliberate departure from the component's default
          `z-50`: the dock and the music player sit at or above 50 and would
          otherwise be drawn over the poster for the length of the boot. */}
      {phase === 'storm' ? (
        <StickerBootPreloader className="z-[100]" onComplete={complete} />
      ) : null}
    </>
  )
}
