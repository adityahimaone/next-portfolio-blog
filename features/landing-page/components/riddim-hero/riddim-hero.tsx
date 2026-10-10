'use client'

import { useEffect, useRef, useState } from 'react'

import { TopBar } from '@/features/layout/components/top-bar'
import { SCREEN_COPY } from './riddim-content'
import { HeroIndex, RiddimMachine } from './riddim-device'
import { AboutCard, StorySides } from './riddim-story'
import { useRiddimHero } from './use-riddim-hero'
import styles from './riddim-hero.module.css'

/**
 * The hero: the machine, and a camera that walks it.
 *
 * The page opens on the top half of the instrument — the RIDDIM header, the
 * speaker, the lit screen and the console's own row of knobs — and scrolling
 * pulls the camera back until the whole machine is in frame, which is the
 * frame that leaves the sides free for printed annotations
 * (`riddim-story.tsx`). There the pads play, the PLAY key presses itself and
 * the screen swaps; then the camera pushes back into the LCD, now on the next
 * chapter's plane, and the backlight flips from green to the About band's
 * cream so the handoff has no seam.
 *
 * The machine is a clone of the photograph, so it prints what the photograph
 * prints — the hardware is not relabelled with the site's destinations. The
 * page's own name is the document's `h1`, kept off the glass, and the machine
 * is still the navigation: every control is a link, and the screen prints
 * whichever one is armed.
 *
 * The camera is one pure function, `riddimStory(progress)`, and the stylesheet
 * turns its numbers into a translate plus a scale — no WebGL, no 3D, no
 * per-element writes on the scroll path.
 *
 * Two viewport facts decide who owns the links:
 *
 *   - below 769px a 84-unit pad is 34px, too small to be the navigation, so
 *     the links move to the stack under the poster and the machine's controls
 *     go back to being drawings;
 *   - below 1181px the story — which needs the room either side of the machine
 *     for its columns — stands down for the static poster, and the stack
 *     carries the copy and the index.
 *
 * Both are read after mount rather than during render, so the server output —
 * the stack, which is the layout that works everywhere — is also what a client
 * without JS keeps.
 */

const WIDE_QUERY = '(min-width: 1181px)'
const LIVE_QUERY = '(min-width: 769px)'

function useMachineLayout() {
  const [layout, setLayout] = useState({ interactive: false, onMachine: false })

  useEffect(() => {
    const wide = window.matchMedia(WIDE_QUERY)
    const live = window.matchMedia(LIVE_QUERY)
    const sync = () =>
      setLayout({ interactive: live.matches, onMachine: wide.matches })

    sync()
    wide.addEventListener('change', sync)
    live.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      live.removeEventListener('change', sync)
    }
  }, [])

  return layout
}

export function RiddimHero() {
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { interactive, onMachine } = useMachineLayout()

  useRiddimHero({ heroRef, stageRef })

  return (
    <section
      id="home"
      ref={heroRef}
      className={styles.hero}
      data-rack-section
      data-riddim-hero
    >
      <TopBar />
      {/* The machine prints the photograph's words, not the page's, so the
          hero's heading is the document's — present for search and for a
          screen reader, and off the glass. */}
      <h1 className={styles.srOnly}>
        {SCREEN_COPY.title} — {SCREEN_COPY.role}
      </h1>
      <div className={styles.roomWrap} aria-hidden="true">
        <div className={styles.room} />
      </div>
      <div className={styles.stage} ref={stageRef} data-riddim-stage>
        <div className={styles.sticky}>
          <div className={styles.camera}>
            <RiddimMachine interactive={interactive} />
            {/* The letterbox is the LCD's own rect, moved by the same camera
                as the machine, so the plane below is clipped to exactly the
                screen at every zoom. `aria-hidden`: it is the machine's own
                surface, and the heading above already carries the name. */}
            <div className={styles.letterbox} aria-hidden="true">
              <div className={`${styles.plane} ${styles.aboutPlane}`}>
                <AboutCard />
              </div>
            </div>
          </div>
          {onMachine ? <StorySides /> : null}
        </div>
      </div>
      {onMachine ? null : <HeroIndex showIndex={!interactive} />}
    </section>
  )
}
