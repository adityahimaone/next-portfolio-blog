'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
 * ## Where the session ends
 *
 * The camera dives once into the PROFILE clip, and the machine is left there.
 * What used to open out of that dive was the Patch — a synth faceplate built
 * from the same kit as the mixer, sitting in the clip's interior. It is gone.
 * The handoff now belongs to `components/bench/`, which carries the reader out
 * of the device entirely and into an editorial About. This component's part in
 * it is passive and it is three things: keeping the stage pinned for
 * `--arr-hold` — the length of the bench's own hold — so the machine is still
 * while it comes apart, publishing `data-arr-stage` on the stage, and marking
 * each piece the bench takes away with a `data-arr-*` marker of its own. Nothing
 * here animates the exit itself; the seam's clock is the bench's, and a second
 * clock over the same scroll would only be a second thing to keep in step.
 *
 * Two older handoff contracts are still published and currently unread: the
 * outgoing device's `data-matter-device` and the source region's
 * `data-matter-source`, both of which the retired `components/matter/` bridge
 * consumed. The bench continues neither — it takes the machine apart in place
 * rather than carrying the signal out of the clip — so it reads neither. They
 * are kept because the publishing side is this component's own measurement and
 * removing it would change nothing a reader can see.
 *
 * That is why there is no `#about` in this file. The clip's interior is not a
 * section any more, and an anchor that resolves to the top of a long pinned
 * runway lands a reader at the start of an animation instead of at the thing
 * they asked for. There is exactly one `#about` on the page, and it is the
 * heading of the biography.
 */
export function ArrangementHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const [clock, setClock] = useState('')

  useArrangementHero({ sectionRef, trackRef, cameraRef })
  useHeroDockVisibility({ sectionRef })

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
        {/* The ground the whole instrument is drawn on, and the one part of the
            machine the seam dissolves rather than moves.

            It has to be its own layer rather than the stage's own `background`,
            because the stage's background cannot be faded without taking every
            piece with it — opacity multiplies down the tree. So the stage's
            background is handed to this element in the motion layout and this
            element's opacity becomes the seam's to write, which leaves the
            furniture free to leave at full strength over the About it uncovers.
            It sits at `z-index: -1` inside the stage's own stacking context, so
            it paints behind the chrome, the ruler, the lanes and the mixer
            without needing to be a sibling of any of them. */}
        <div className={styles.ground} data-arr-ground aria-hidden="true" />

        {/* `data-arr-chrome` is the seam's marker, not a readout's: the toolbar
            is the piece that leaves upward when the handoff takes the machine
            apart. See `BENCH_HERO_EXITS`. */}
        <header className={styles.chrome} data-arr-chrome>
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
            the whole of "the ruler is structural". It is the one piece of the
            instrument's furniture that does not belong to the world being
            zoomed: it measures the arrangement from outside it, so it must not
            be clipped by the window the camera dives through, and it must not be
            painted over by whatever the dive reveals. A DAW has one ruler and
            it is always at the top; this is the same rule.

            It reads the camera's own properties (`--arr-zoom`, `--arr-camera-x`)
            so its ticks track the clips under it. The hook writes those on the
            track area *and* on this element — the two smallest nodes that read
            them — which is why it carries `data-arr-ruler`. */}
        <ArrangementRuler />

        {/* `data-matter-device` is a retired handoff's marker — see the header.
            The live one is `data-arr-stage` on the stage above, which is what
            the bench takes apart. It is the *stage* and not this track area on
            purpose: the handoff takes the whole machine away, chrome, ruler,
            transport and all, so that what is left around it is only the About
            behind it. The focusable chrome it carries is why the seam has to
            park the stage's `visibility` once the exits are done — an
            `opacity: 0` layer would leave the nav and the transport in the tab
            order over a page that is no longer on screen. */}
        <div ref={trackRef} className={styles.trackArea} data-matter-device>
          {/* `data-arr-camera` is the seam's, and it is on the camera rather
              than on the track area so that the rail and the playhead can leave
              on their own axes while the clip content dissolves where it
              stands. It is the one piece with no direction to leave in: the
              camera *is* the frame at the end of the dive. */}
          <div ref={cameraRef} className={styles.camera} data-arr-camera>
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
                      source={clip.kind === 'profile'}
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
      </div>
    </section>
  )
}
