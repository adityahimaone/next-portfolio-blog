'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'motion/react'
import { AmbientBackdrop } from './ambient-backdrop'
import { ArtistPanel } from './artist-panel'
import { GlassFilters } from './glass-filters'
import { LibrarySidebar } from './library-sidebar'
import {
  ARTIST_ROWS,
  LIBRARY_TRACKS,
  nowPlayingArtist,
  type LibraryTrack,
} from './library-data'
import { NowCentre } from './now-centre'
import { PlayerBar } from './player-bar'
import { PlayerBanner, PlayerChrome } from './player-chrome'
import { useMediaQuery, useRefraction } from './use-glass'
import { useWorkScroll } from './use-work-scroll'
import styles from './work.module.css'

const LinerNotes = dynamic(
  () => import('./liner-notes').then((module) => module.LinerNotes),
  { ssr: false },
)

const COUNT = LIBRARY_TRACKS.length
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const coverButtonRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION)
  const refract = useRefraction()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Gated on mount so a reduced-motion visitor never sees the tall scroll-driven
  // section render and then collapse — that reflow is what the preference exists
  // to prevent.
  const scrollDriven = mounted && !reducedMotion

  const [linerId, setLinerId] = useState<number | null>(null)
  const [manualIndex, setManualIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [query, setQuery] = useState('')

  const scroll = useWorkScroll(sectionRef, COUNT)
  const activeIndex = scrollDriven ? scroll.activeIndex : manualIndex
  const trackProgress = scroll.trackProgress

  const track: LibraryTrack = LIBRARY_TRACKS[activeIndex] ?? LIBRARY_TRACKS[0]
  const linerTrack = LIBRARY_TRACKS.find((item) => item.id === linerId) ?? null

  const { scrollYProgress: entrance } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const entranceStyle = useTransform(
    entrance,
    (value) => `scale(${0.97 + value * 0.03})`,
  )
  const entranceOpacity = useTransform(entrance, [0, 0.55, 1], [0, 1, 1])

  useEffect(() => {
    if (!scrollDriven) setIsPlaying(false)
  }, [scrollDriven])

  const selectTrack = useCallback(
    (index: number) => {
      const next = (index + COUNT) % COUNT
      if (!scrollDriven) setManualIndex(next)
      else scroll.scrollToTrack(next)
    },
    [scrollDriven, scroll],
  )

  const go = useCallback(
    (delta: -1 | 1) => selectTrack(activeIndex + delta),
    [selectTrack, activeIndex],
  )

  const openLiner = useCallback((target: LibraryTrack) => {
    setLinerId(target.id)
  }, [])

  const closeLiner = useCallback(() => setLinerId(null), [])

  useEffect(() => {
    if (scrollDriven) return
    const onKeyDown = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null
      if (el?.closest('a, button, [role="slider"], input, textarea')) return

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          go(1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          go(-1)
          break
        case ' ':
          event.preventDefault()
          setIsPlaying((value) => !value)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [go, scrollDriven])

  return (
    <section
      ref={sectionRef}
      id="work"
      className={styles.work}
      style={
        {
          '--work-accent': track.palette.accent,
          ...(scrollDriven
            ? { height: `calc(100svh + ${COUNT * 55}svh)` }
            : {}),
        } as React.CSSProperties
      }
      data-reduced-motion={scrollDriven ? undefined : 'true'}
      data-rack-section
      data-no-heading-reveal
    >
      <GlassFilters />

      <div className={styles.stage}>
        <AmbientBackdrop palette={track.palette} />

        <motion.div
          className={styles.shell}
          style={
            scrollDriven
              ? { transform: entranceStyle, opacity: entranceOpacity }
              : undefined
          }
        >
          <PlayerChrome query={query} onQueryChange={setQuery} />

          <PlayerBanner
            track={track}
            activeIndex={activeIndex}
            total={COUNT}
            onSelect={selectTrack}
          />

          <div className={styles.columns}>
            <LibrarySidebar
              tracks={LIBRARY_TRACKS}
              activeIndex={activeIndex}
              query={query}
              onSelect={selectTrack}
            />

            <NowCentre
              track={track}
              trackProgress={trackProgress}
              isPlaying={isPlaying && scrollDriven}
              onOpenLiner={() => openLiner(track)}
            />

            <ArtistPanel artists={ARTIST_ROWS} />
          </div>

          <PlayerBar
            track={track}
            artist={nowPlayingArtist}
            trackProgress={trackProgress}
            isPlaying={isPlaying && scrollDriven}
            onTogglePlay={() => setIsPlaying((value) => !value)}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
          />
        </motion.div>

        {/* Keeps every project as real text for crawlers, since the sidebar rows
            are icon-plus-label only. */}
        <ul className={styles.srOnly}>
          {LIBRARY_TRACKS.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title} — {item.description}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <LinerNotes
        project={linerTrack}
        refract={refract}
        returnFocusTo={coverButtonRef.current}
        onClose={closeLiner}
      />
    </section>
  )
}
