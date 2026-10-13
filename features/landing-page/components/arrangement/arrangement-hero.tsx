'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { About } from '../../rack-01/section-about'
import {
  ARRANGEMENT_CLIPS,
  ARRANGEMENT_LANES,
  ARRANGEMENT_MODE,
  RULER_AXIS_LABEL,
  YEAR_MAX,
  YEAR_MIN,
} from './arrangement-data'
import { ArrangementClip } from './arrangement-clip'
import { ArrangementPlayhead } from './arrangement-playhead'
import { ArrangementRail, GHOST_TRACKS } from './arrangement-rail'
import { ArrangementMixer } from './arrangement-mixer'
import { ArrangementRuler } from './arrangement-ruler'
import { useArrangementHero } from './use-arrangement-hero'
import { useHeroDockVisibility } from './use-hero-dock-visibility'
import styles from './arrangement.module.css'

/**
 * The landing hero: a session, not a picture of one.
 *
 * The reference is a DAW playlist — a dark ground, a hairline grid, horizontal
 * clips whose length means something, a bar ruler, a playhead, a transport
 * strip. Five of those six carry data natively, which is why this works where a
 * decorative "music theme" would not. The rule from `design.md` §0.0 applies
 * unchanged: **every music motif encodes something real. No data, no motif.**
 *
 * So a lane is a stage of frontend production, a clip is a piece of that work,
 * a clip's width is how much of the skill set it covers, its bars are one per
 * listed technology, the ruler's ticks are the five stages, and the playhead is
 * where the work currently is.
 *
 * The name lives *inside* the timeline, in its own tall lane, at display scale.
 * It is the only full-saturation element on the screen — everything else is
 * mixed toward the hero's own ground, so the eye has exactly one thing to land
 * on. It is also the one documented exception to "a clip's width is a duration":
 * the name is not a stage, so it spans the record.
 */
export function ArrangementHero({
  selected,
  setSelected,
  aboutProgress,
  setAboutProgress,
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
  aboutProgress: number
  setAboutProgress: React.Dispatch<React.SetStateAction<number>>
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const seamRef = useRef<HTMLDivElement>(null)
  const [clock, setClock] = useState('')

  useArrangementHero({
    sectionRef,
    trackRef,
    cameraRef,
    seamRef,
    setAboutProgress,
    // The hook owns which card the read has reached; `selected` is the same
    // state the cards and the panel's clips read, and the one a click writes.
    setAboutIndex: setSelected,
  })
  useHeroDockVisibility({ sectionRef, seamRef })

  // The clock is the one readout on this instrument that is true without being
  // invented. Seeded empty and filled in an effect, so the server and the client
  // agree on the first render. There is no BPM readout: nothing here keeps a
  // tempo. The hero's own playhead parks on the PROFILE clip for the whole dive
  // and About's travels only as far as the read takes it, so a number for that
  // motion would be invented — which is the decoration §0.0 forbids.
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    tick()
    const timer = window.setInterval(tick, 30000)
    return () => window.clearInterval(timer)
  }, [])

  const profile = ARRANGEMENT_CLIPS.find((clip) => clip.kind === 'profile')
  const profileCentre = profile ? (profile.start + profile.end) / 2 : 0.625
  const axis =
    ARRANGEMENT_MODE === 'career'
      ? `${YEAR_MIN}–${YEAR_MAX.toFixed(1)} / CAREER RECORD`
      : `${RULER_AXIS_LABEL} / NOT ELAPSED TIME`

  return (
    <section
      id="home"
      ref={sectionRef}
      className={styles.hero}
      data-phase="open"
      data-detail="false"
      data-rack-section
      style={
        {
          '--arr-profile-centre': profileCentre,
        } as CSSProperties
      }
    >
      <div className={styles.stage} data-arr-stage>
        <header className={styles.chrome}>
          <div className={styles.brand}>
            <i className={styles.brandMark} aria-hidden="true" />
            <span>ADITYA HIMAWAN</span>
            <small>FRONTEND SESSION</small>
          </div>
          <nav className={styles.menu} aria-label="Portfolio">
            <a href="#work">Projects</a>
            <Link href="/blog">Notes</Link>
            <Link href="/bookmarks">Bookmarks</Link>
            <a href="#about">About</a>
          </nav>
          <div className={styles.transport}>
            <button
              type="button"
              className={styles.tBtn}
              aria-label="Stop — back to the start"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <i className={styles.iconStop} />
            </button>
            <a
              className={`${styles.tBtn} ${styles.tPlay}`}
              href="#about"
              aria-label="Play — open the profile"
            >
              <i className={styles.iconPlay} />
            </a>
            <span
              className={`${styles.lcd} ${styles.lcdPos}`}
              aria-hidden="true"
            >
              <small>BAR</small>
              <b data-arr-position>001:01</b>
            </span>
            <span className={styles.lcd}>
              <small>LOCAL</small>
              <time aria-label="Your local time">{clock || '--:--'}</time>
            </span>
          </div>
        </header>

        <div ref={trackRef} className={styles.trackArea}>
          <ArrangementRuler />

          <div ref={cameraRef} className={styles.camera}>
            <div className={styles.lanes}>
              {ARRANGEMENT_LANES.map((lane) => (
                <div
                  key={lane.id}
                  data-lane={lane.id}
                  className={[
                    styles.lane,
                    lane.height === 'tall' ? styles.laneTall : '',
                    lane.id === 'name' ? styles.laneName : '',
                    lane.id === 'profile' ? styles.laneProfile : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {ARRANGEMENT_CLIPS.filter(
                    (clip) => clip.laneId === lane.id,
                  ).map((clip) => (
                    <ArrangementClip key={clip.id} clip={clip} />
                  ))}
                </div>
              ))}
              {Array.from({ length: GHOST_TRACKS }, (_, index) => (
                <div
                  key={`ghost-${index}`}
                  className={`${styles.lane} ${styles.laneGhost}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className={styles.pinned}>
            <ArrangementPlayhead />
            <ArrangementRail />
          </div>
        </div>

        <ArrangementMixer axis={axis} />

        {/* The seam: the clip's interior, revealed by the dive rather than
            reached by scrolling. It is laid out at its real size the whole time
            and uncovered by a clip-path that starts as the PROFILE clip's own
            rectangle — so this is a zoom, not a fade, and there is no second
            copy of About anywhere on the page.

            It is a child of the **stage**, not of `.trackArea`, and that is what
            lets it cover the chrome and the proof once the window is fully open.
            `.trackArea` is `overflow: hidden` (the camera's transformed lanes
            have to be clipped to it), so a seam inside it could never paint over
            the furniture above and below. Its clip-path insets are therefore
            measured from the stage's edges — see `chromeHeight` / `proofHeight`
            in `ArrangementGeometry`.

            `inert` is not set here. The hook sets it on the first frame, and the
            hook never runs on phones or under reduced motion — where the media
            queries put this back in the flow and it must stay reachable. */}
        <div ref={seamRef} className={styles.seam}>
          <About
            selected={selected}
            setSelected={setSelected}
            scrollProgress={aboutProgress}
          />
        </div>
      </div>

      {/* The skip link and every `#about` link land here. Not on the seam
          itself: a sticky element's rect is a function of scroll position, so
          an `#about` inside the stage resolves to the hero's scroll origin and
          the link would jump to the top of the hero instead of to the panel.
          This anchor sits exactly where the pinned window ends, which is the
          scroll offset at which the seam is fully open. */}
      <div id="about" className={styles.aboutAnchor} aria-hidden="true" />
    </section>
  )
}
