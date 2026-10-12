'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { About } from '../../rack-01/section-about'
import {
  ARRANGEMENT_CLIPS,
  ARRANGEMENT_LANES,
  ARRANGEMENT_MODE,
  PROOF_READOUTS,
  RULER_AXIS_LABEL,
  YEAR_MAX,
  YEAR_MIN,
} from './arrangement-data'
import { ArrangementClip } from './arrangement-clip'
import { ArrangementPlayhead } from './arrangement-playhead'
import { ArrangementRail } from './arrangement-rail'
import { ArrangementRuler } from './arrangement-ruler'
import { useArrangementHero } from './use-arrangement-hero'
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
}: {
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const seamRef = useRef<HTMLDivElement>(null)
  const [clock, setClock] = useState('')

  useArrangementHero({ sectionRef, trackRef, cameraRef, seamRef })

  // The clock is the one readout on this instrument that is true without being
  // invented. Seeded empty and filled in an effect, so the server and the client
  // agree on the first render. There is no BPM readout: About's playhead is
  // parked, so there is no tempo to report, and a readout for motion that does
  // not happen is exactly the decoration §0.0 forbids.
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
          <span>ADITYA HIMAWAN / FRONTEND SESSION</span>
          <time aria-label="Your local time">{clock}</time>
          <nav aria-label="Portfolio">
            <a href="#work">Projects</a>
            <Link href="/blog">Notes</Link>
            <Link href="/bookmarks">Bookmarks</Link>
            <a href="#about">About</a>
          </nav>
        </header>

        <div ref={trackRef} className={styles.trackArea}>
          <ArrangementRuler live detail />

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
                  <span className={styles.laneLabel}>{lane.label}</span>
                  {ARRANGEMENT_CLIPS.filter(
                    (clip) => clip.laneId === lane.id,
                  ).map((clip) => (
                    <ArrangementClip key={clip.id} clip={clip} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.pinned}>
            <ArrangementPlayhead />
            <ArrangementRail />
          </div>
        </div>

        <footer className={styles.proof}>
          <div className={styles.proofReadouts}>
            {PROOF_READOUTS.map((readout) => (
              <div key={readout.unit}>
                <b>{readout.value}</b>
                <small>{readout.unit}</small>
                <span className={styles.meter} aria-hidden="true">
                  <i style={{ '--ratio': readout.ratio } as CSSProperties} />
                </span>
                <small>{readout.meter}</small>
              </div>
            ))}
          </div>
          <span className={styles.axis}>{axis}</span>
          <a className={styles.proofJump} href="#about">
            Open profile →
          </a>
          {/* The nav is hidden in the chrome on phones, where the header has one
              line and no room for four links. It reappears here, in the flow,
              rather than being dropped. */}
          <nav className={styles.proofNav} aria-label="Portfolio">
            <a href="#work">Projects</a>
            <Link href="/blog">Notes</Link>
            <Link href="/bookmarks">Bookmarks</Link>
            <a href="#about">About</a>
          </nav>
        </footer>

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
          <About selected={selected} setSelected={setSelected} />
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
