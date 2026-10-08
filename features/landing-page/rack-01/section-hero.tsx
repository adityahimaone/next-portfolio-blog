'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { PadSea, PAD_GRID_DESKTOP, PAD_VOICE_NAMES } from '../components/hero'
import { BrokenLightText } from '../components/broken-light-text'
import { TextCascade } from '../components/text-cascade'
import { useHeroMotion } from '../components/hero/use-hero-motion'
import { SignalField } from './signal-field'
import { TopBar } from '@/features/layout/components/top-bar'
import { RESUME_URL } from './shared'
import styles from './rack-01.module.css'

/**
 * The hero: an instrument, not a stack of cards.
 *
 * The device wall that used to fill this panel is gone — its twelve tiles are
 * now the pad sea behind the copy, which is the same idea at a scale that can
 * carry the whole first screen. The DOM that survives is deliberate: the giant
 * name, one editorial panel (LCD tag, tagline, subtext, three lit link-pads,
 * three readouts), the rail, and the handoff panel. `use-rack-animations` still
 * addresses every one of those by class name and still drives the boot, the
 * collapse and the About handoff; this component only had to stop handing it a
 * wall of device tiles.
 *
 * The name is a neon sign rather than a heading: `BrokenLightText` (the repo's
 * own broken-tube engine, which the retired device wall used to be the only
 * consumer of) powers it on tube by tube and leaves it glowing in the pad sea's
 * two colours. The greeting that used to roll through the name moved down to
 * the LCD tag, where status chatter belongs and where it can stay for good.
 *
 * Motion is split in two on purpose:
 *   - `useRackAnimations` keeps the tuned DOM timelines.
 *   - `useHeroMotion` adds the scroll bridge the 3D field needs, the chromatic
 *     offset, and the per-line wave motion the rack hook gave up.
 */

/** Read off the grid rather than restated, so the rail cannot drift. */
const HERO_PAD_COUNT = PAD_GRID_DESKTOP.cols * PAD_GRID_DESKTOP.rows

export function Hero() {
  const [greeting, setGreeting] = useState('Hello')
  const [voicedPad, setVoicedPad] = useState<{
    index: number
    name: string
  } | null>(null)

  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const readoutsRef = useRef<HTMLDivElement>(null)
  const voiceTimer = useRef<number | null>(null)

  // Written by the scroll bridge, read inside the WebGL frame loop. Plain refs
  // rather than state: this value changes every scroll frame.
  const progress = useRef(0)
  const energy = useRef(0)

  useHeroMotion({ heroRef, titleRef, readoutsRef, progress, energy })

  useEffect(() => {
    // The LCD boots the way a device does: a greeting, then where it is.
    const toJapanese = window.setTimeout(() => setGreeting('こんにちは'), 820)
    const toPlace = window.setTimeout(
      () => setGreeting('Jakarta, Indonesia'),
      2100,
    )
    return () => {
      window.clearTimeout(toJapanese)
      window.clearTimeout(toPlace)
    }
  }, [])

  useEffect(
    () => () => {
      if (voiceTimer.current !== null) window.clearTimeout(voiceTimer.current)
    },
    [],
  )

  const handlePadHit = useCallback((index: number) => {
    setVoicedPad({
      index,
      name: PAD_VOICE_NAMES[index % PAD_VOICE_NAMES.length],
    })
    if (voiceTimer.current !== null) window.clearTimeout(voiceTimer.current)
    voiceTimer.current = window.setTimeout(() => setVoicedPad(null), 1500)
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--hero-pointer-x',
      `${event.clientX - rect.left}px`,
    )
    event.currentTarget.style.setProperty(
      '--hero-pointer-y',
      `${event.clientY - rect.top}px`,
    )
  }

  return (
    <section id="home" ref={heroRef} className={styles.hero} data-rack-section>
      <div className={styles.heroStage} onPointerMove={handlePointerMove}>
        {/* Inside the stage so the bar scrolls away with the hero instead of
            sitting above it. `.topBar` is z-50 and the field is z-0, so it
            still paints on top. */}
        <TopBar />
        <div className={styles.heroBootSequence} aria-hidden="true">
          <i />
          <span>Routing signal</span>
        </div>
        {/* Room light behind the field. Ahead of the pad sea in the DOM and at
            the same z-0, so it shows through the gaps between pads rather than
            over them. */}
        <SignalField />

        <PadSea progress={progress} energy={energy} onPadHit={handlePadHit} />

        {/* The legacy wall node stays in the tree, empty. `useRackAnimations`
            reaches for `.heroDeviceWall` with a non-null assertion, and its
            `::after` still draws the vignette that keeps the name readable —
            so the animation and the scrim both survive the tiles being gone. */}
        <div className={styles.heroDeviceWall} aria-hidden="true" />

        <div
          ref={titleRef}
          className={styles.heroBackdropName}
          aria-hidden="true"
        >
          {/* One wrapper per line: the two are animated independently so the
              name rides the swell instead of moving as a single plate. Inside
              each, `BrokenLightText` powers the tubes on character by
              character. Seeded, so both renders agree on the schedule. */}
          <span className={styles.heroNameLine} data-hero-name-line>
            <BrokenLightText
              text="ADITYA"
              mode="settle"
              seed={17}
              glowColor="#fff2e2"
              flickerWindowMs={[40, 380]}
              maxFlickers={4}
              extraBrokenChance={0.12}
            />
          </span>
          <span className={styles.heroNameLine} data-hero-name-line>
            <BrokenLightText
              text="HIMAWAN"
              mode="settle"
              seed={41}
              glowColor="#ff5a1f"
              flickerWindowMs={[70, 470]}
              maxFlickers={5}
              extraBrokenChance={0.16}
            />
          </span>
        </div>

        <div className={styles.heroAtmosphere} aria-hidden="true" />

        <div className={styles.heroImmersiveContent}>
          {/* The rack root is the page's single <main>, so this stays a div. */}
          <div className={styles.heroEditorialPanel}>
            <div className={styles.heroKicker}>
              <i aria-hidden="true" />
              <span>Frontend Engineer</span>
              <em className={styles.heroKickerReadout}>
                <TextCascade
                  text={
                    voicedPad
                      ? `Pad ${String(voicedPad.index + 1).padStart(2, '0')} / ${voicedPad.name}`
                      : greeting
                  }
                  animateInitial={false}
                />
              </em>
            </div>
            <h1 className={styles.srOnly}>Aditya Himawan, Frontend Engineer</h1>
            <strong className={styles.heroPanelTitle}>
              Built for the moment after launch.
            </strong>
            <p>Frontend systems for products that have to work at scale.</p>
            <div className={styles.heroActions}>
              <a href="#work" className={styles.heroLinkPad}>
                <i aria-hidden="true" />
                <span>See the works</span>
                <ArrowDownRight size={17} aria-hidden="true" />
              </a>
              <Link href="/blog" className={styles.heroLinkPad}>
                <i aria-hidden="true" />
                <span>Read the notes</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className={styles.heroLinkPad}
              >
                <i aria-hidden="true" />
                <span>Open résumé</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div
              ref={readoutsRef}
              className={styles.heroInlineProof}
              aria-label="Career highlights"
            >
              <span data-hero-readout>
                <b>4+</b> years
              </span>
              <span data-hero-readout>
                <b>3</b> product teams
              </span>
              <span data-hero-readout>
                <b>15K+</b> users
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroBottomRail}>
          <span>{HERO_PAD_COUNT} pads / 120 BPM / web audio</span>
          <a href="#about">
            About Aditya <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className={styles.heroAboutHandoff} aria-hidden="true">
          <span>Next signal / 02</span>
          <strong>Profile</strong>
        </div>
      </div>
    </section>
  )
}
