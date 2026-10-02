'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CassetteFace, cassetteThemeVars } from './cassette-face'
import { EXPERIENCES } from '../constants'
import styles from './rack-01.module.css'

/**
 * The cassette that leaves the experience deck and lands on the now-playing
 * artwork in the work player.
 *
 * It is a CLONE of the deck's own cassette, not a drawing of one. The shell
 * reuses the deck's `.cassette` class outright — same border radius, same
 * gradient, same padding — and the interior is the shared `CassetteFace`, the
 * same component the carousel renders. An approximation reads as a different
 * tape the instant the deck's shell fades and this one takes its place, which
 * is exactly what a hand-drawn stand-in did.
 *
 * Both stages are `overflow: hidden` and mid-transform for the whole seam
 * window, so an in-flow element cannot cross between them. This is portalled to
 * `document.body` and positioned `fixed`, which puts it outside both clipping
 * contexts and lets it be measured against each in turn.
 *
 * Nothing here is positioned by React: the seam timeline in `useRackAnimations`
 * measures the deck's cassette and the artwork every frame, then writes the
 * transform. The default `opacity: 0` in CSS means the worst case before that
 * setup runs is an invisible element.
 */

/**
 * The cassette that is playing when the seam opens.
 *
 * The deck's index advances across the first 52% of its own scrub and then
 * holds, so by the time the seam runs the carousel has settled on the last
 * entry — `Universities & Academies`. Cloning that one keeps the handoff on the
 * cassette the reader was actually looking at.
 */
const EJECT_INDEX = EXPERIENCES.length - 1

export function EjectProxy() {
  /* Gated on mount rather than on `typeof document`. Branching on the global
     during render returns the portal on the client's first pass but null on the
     server's, so React discards the mismatch — the same reason LinerNotes waits
     for an effect instead of testing the environment. */
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(
    <div className={styles.ejectProxy} aria-hidden="true">
      {/* `.cassetteActive` alongside `.cassette` because the seam timeline reads
          the deck's active cassette by that class; reusing it here too would make
          `querySelector` ambiguous, so this one is addressed as `.ejectCassette`
          and only the shell class is borrowed. */}
      <div
        className={`${styles.cassette} ${styles.ejectCassette}`}
        style={cassetteThemeVars(EJECT_INDEX)}
      >
        <CassetteFace index={EJECT_INDEX} />
      </div>
    </div>,
    document.body,
  )
}
