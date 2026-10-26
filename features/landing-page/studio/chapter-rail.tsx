'use client'

import { motion, useReducedMotion, useScroll } from 'motion/react'

import { CHAPTERS, scrollToSection } from './studio-data'
import styles from './studio.module.css'

export function ChapterRail({ active }: { active: string }) {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()

  return (
    <nav className={styles.rail} aria-label="Page chapters" data-chapter-rail>
      <div className={styles.railTrack} aria-hidden>
        <motion.div
          className={styles.railFill}
          style={{ scaleY: scrollYProgress }}
        />
      </div>
      {CHAPTERS.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          className={styles.railItem}
          data-active={active === chapter.id}
          onClick={() => scrollToSection(chapter.id, reduced)}
          aria-label={`${chapter.number} ${chapter.label}`}
          aria-current={active === chapter.id ? 'true' : undefined}
        >
          <span className={styles.railLabel}>{chapter.label}</span>
          <span className={styles.railDot} />
        </button>
      ))}
    </nav>
  )
}
