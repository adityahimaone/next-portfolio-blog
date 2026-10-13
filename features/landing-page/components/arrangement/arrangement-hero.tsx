'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { PatchPanel } from '../patch/patch-panel'
import {
  ARRANGEMENT_CLIPS,
  ARRANGEMENT_LANES,
  ARRANGEMENT_MODE,
  RULER_AXIS_LABEL,
  RULER_LABELS,
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
 *
 * What is inside the PROFILE clip is not a section of this page. It is the
 * Patch: the clip opened, drawn with the same kit as the mixer below, on a cream
 * faceplate rather than this dark ground. Same machine, different window — see
 * `components/patch/`.
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

  useArrangementHero({
    sectionRef,
    trackRef,
    cameraRef,
    seamRef,
    // The hook owns which module the read has reached; `selected` is the same
    // state the module buttons read and the one a click writes.
    setAboutIndex: setSelected,
  })
  useHeroDockVisibility({ sectionRef, seamRef })

  // The clock is the one readout on this instrument that is true without being
  // invented. Seeded empty and filled in an effect, so the server and the client
  // agree on the first render. There is no BPM readout: nothing here keeps a
  // tempo.
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

  // The clips record themselves in, once. `data-boot` is what makes that true
  // rather than "on every re-render": it is set for 1.2s and then removed, and
  // the animation is gated on it. A state flag rather than a CSS animation on
  // load, because a CSS-only version would replay on every remount and would
  // have no way to be retired for reduced motion beyond the media query.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    section.dataset.boot = ''
    const timer = window.setTimeout(
      () => section.removeAttribute('data-boot'),
      1200,
    )
    return () => {
      window.clearTimeout(timer)
      section.removeAttribute('data-boot')
    }
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
          {/* The story line. It names the stage the playhead is in, so the
              ruler's ticks are read rather than decoded. Both writes are on
              change only — three across the whole scroll.

              `data-arr-stage-label`, not `data-arr-stage`: the latter is the
              stage *wrapper* below (the hook measures its height, and
              `about-chapter.ts` uses it as the "am I inside the arrangement"
              marker). Reusing it here would make `querySelector` find the
              wrapper — an ancestor wins document order — and the stage write
              would replace the whole hero with one word. */}
          <span
            className={`${styles.lcd} ${styles.lcdStage}`}
            aria-hidden="true"
          >
            <small data-arr-stage-label>{RULER_LABELS[0]}</small>
            <b data-arr-caption />
          </span>
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

        {/* The ruler is a child of the stage, not of the track area, and that is
            the whole of "the seam is structural". It is the one piece of the
            instrument's furniture that does not belong to the world being
            zoomed: it measures the arrangement from outside it, so it must not
            be clipped by the window the camera dives through, and it must not be
            painted over by the panel the dive reveals. A DAW has one ruler and
            it is always at the top; this is the same rule.

            It reads the camera's own properties (`--arr-zoom`, `--arr-camera-x`)
            so its ticks track the clips under it. The hook writes those on the
            track area *and* on this element — the two smallest nodes that read
            them — which is why it carries `data-arr-ruler`. */}
        <ArrangementRuler />

        <div ref={trackRef} className={styles.trackArea}>
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
                    <ArrangementClip
                      key={clip.id}
                      clip={clip}
                      index={ARRANGEMENT_CLIPS.indexOf(clip)}
                    />
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
            the furniture above and below. Its top edge is the ruler's bottom
            edge, so the ruler stays visible through the dive and the panel opens
            beneath it rather than under it. Its clip-path insets are therefore
            measured from its own edges — see `chromeHeight` / `rulerHeight` in
            `ArrangementGeometry`.

            `inert` is not set here. The hook sets it on the first frame, and the
            hook never runs on phones or under reduced motion — where the media
            queries put this back in the flow and it must stay reachable. */}
        <div ref={seamRef} className={styles.seam}>
          <PatchPanel active={selected} onSelect={setSelected} />
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
