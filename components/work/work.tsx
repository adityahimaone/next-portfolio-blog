'use client'

import { useEffect, useRef, useState } from 'react'
import { LayoutGroup } from 'motion/react'
import { WORK_PROJECTS, trackLabel } from '@/data/projects'
import { AmbientBackdrop } from './ambient-backdrop'
import { GlassFilters, useWorkScroll } from './use-work-scroll'
import { NowPlaying } from './now-playing'
import { Turntable } from './turntable'
import { SleeveCrate } from './sleeve-crate'
import { Transport } from './transport'
import { LinerNotes } from './liner-notes'
import styles from './work.module.css'

const COUNT = WORK_PROJECTS.length

/**
 * `05 / Selected work`, rebuilt as a turntable.
 *
 * Scroll is the tonearm: the section is one viewport per release, and the
 * needle tracks position within the active one. There is no autoplay timer,
 * so scrolling stays the single source of truth and a paused record simply
 * stops spinning.
 */
export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const { trackProgress, activeIndex, lineIndex, angle, scrollToTrack } =
    useWorkScroll(sectionRef, COUNT)
  const [isPlaying, setIsPlaying] = useState(true)
  const [linerId, setLinerId] = useState<number | null>(null)

  const project = WORK_PROJECTS[activeIndex]
  const linerProject =
    linerId === null
      ? null
      : (WORK_PROJECTS.find((p) => p.id === linerId) ?? null)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (
        target?.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        scrollToTrack((activeIndex + 1) % COUNT)
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        scrollToTrack((activeIndex - 1 + COUNT) % COUNT)
      } else if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying((v) => !v)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, scrollToTrack])

  return (
    <section
      ref={sectionRef}
      id="work"
      className={styles.work}
      style={{ height: `calc(100svh + ${COUNT * 70}svh)` }}
      data-rack-section
      data-no-heading-reveal
    >
      <GlassFilters />
      <div className={styles.stage}>
        <AmbientBackdrop palette={project.palette} />

        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowIndex}>05</span>
              <span>Selected work</span>
            </p>
            <h2 className={styles.title}>Proof in the product.</h2>
          </div>
          <div className={styles.hint}>
            <span>SIDE {trackLabel(activeIndex)[0]}</span>
            <span>
              {trackLabel(activeIndex)} / {String(COUNT).padStart(2, '0')}
            </span>
          </div>
        </header>

        <div className={styles.main}>
          <NowPlaying
            project={project}
            lineIndex={lineIndex}
            onOpenLiner={() => setLinerId(project.id)}
          />
          <Turntable project={project} angle={angle} isPlaying={isPlaying} />
        </div>

        <div className={styles.bottom}>
          <SleeveCrate
            projects={WORK_PROJECTS}
            activeIndex={activeIndex}
            onSelect={scrollToTrack}
          />
          <Transport
            trackProgress={trackProgress}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((v) => !v)}
            onPrev={() => scrollToTrack((activeIndex - 1 + COUNT) % COUNT)}
            onNext={() => scrollToTrack((activeIndex + 1) % COUNT)}
          />
        </div>
      </div>

      <LayoutGroup>
        <LinerNotes
          project={linerProject}
          index={
            linerId === null
              ? 0
              : WORK_PROJECTS.findIndex((p) => p.id === linerId)
          }
          onClose={() => setLinerId(null)}
        />
      </LayoutGroup>
    </section>
  )
}
