'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

import { RIDDIM_SCROLL_SVH } from './riddim-choreography'
import { SCREEN_COPY } from './riddim-content'
import { HeroIndex, RiddimMachine } from './riddim-device'
import { PlaneScreen } from './riddim-screen'
import { RiddimSide } from './riddim-side'
import { useRiddimHero } from './use-riddim-hero'
import styles from './riddim-hero.module.css'

/**
 * The hero: the machine at its own screen, then out and back in.
 *
 * A pinned stage (`RIDDIM_SCROLL_SVH` tall, `.stage` sticky inside it). You
 * arrive on the frame the machine was photographed in — its screen filling the
 * width, the fascia above it, the console and its metronome below — and the
 * story runs from there: the camera pulls back until the whole machine is in
 * frame with the page's copy and track list either side, the machine presses
 * its own PLAY key and its screen wipes to the profile card, and the camera
 * falls back in and lets the letterbox open until the profile screen — the
 * About section's own line — is the viewport, then gives way to the page.
 *
 * The scroll story lives in `riddim-choreography.ts` (what happens when) and
 * `riddim-camera.ts` (where the camera is); `use-riddim-hero.ts` writes them
 * into custom properties and `riddim-hero.module.css` turns those into
 * pixels. There is no top bar: the machine is the navigation (its controls,
 * `MACHINE_NAV`, plus the three destinations on the screen's own top row), and
 * the side panels repeat the two things most people want.
 *
 * Layout is chosen by media query alone, so first paint is right with no JS:
 * LIVE is the pinned stage; phones and reduced motion get the finished machine
 * in the flow of the page, with the copy and (on phones) the index under it in
 * `.stack`. The machine's controls become links only where it is the
 * navigation — `interactive` is read after mount, so the server output, which
 * has the stack's index, is also what a client without JS keeps.
 */

const LIVE_QUERY = '(min-width: 769px)'

function useInteractive() {
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    const live = window.matchMedia(LIVE_QUERY)
    const sync = () => setInteractive(live.matches)
    sync()
    live.addEventListener('change', sync)
    return () => live.removeEventListener('change', sync)
  }, [])

  return interactive
}

export function RiddimHero() {
  const heroRef = useRef<HTMLElement>(null)
  const interactive = useInteractive()

  useRiddimHero({ heroRef })

  return (
    <section
      id="home"
      ref={heroRef}
      className={styles.hero}
      data-rack-section
      data-riddim-hero
      data-plane="off"
      data-side="off"
      style={{ '--hero-scroll': RIDDIM_SCROLL_SVH } as CSSProperties}
    >
      <div className={styles.stage} data-riddim-stage>
        <div className={styles.room} aria-hidden="true" />
        <div className={styles.rig}>
          <RiddimMachine interactive={interactive} />
        </div>
        <RiddimSide />
        <p className={styles.boot}>{SCREEN_COPY.hint[0]}</p>
        <div className={styles.plane}>
          <PlaneScreen />
        </div>
      </div>
      <HeroIndex showIndex={!interactive} />
    </section>
  )
}
