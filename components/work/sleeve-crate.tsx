'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { trackLabel, type WorkProject } from '@/data/projects'
import styles from './work.module.css'

interface SleeveCrateProps {
  projects: WorkProject[]
  activeIndex: number
  onSelect: (index: number) => void
}

/**
 * The crate doubles as the section's navigation: the active sleeve lifts and
 * its neighbours fan a couple of degrees toward it, so position is readable
 * without reading any text.
 */
export function SleeveCrate({
  projects,
  activeIndex,
  onSelect,
}: SleeveCrateProps) {
  return (
    <div
      className={styles.crate}
      role="listbox"
      aria-label="Projects"
      aria-activedescendant={`work-sleeve-${projects[activeIndex].id}`}
    >
      {projects.map((project, i) => {
        const offset = i - activeIndex
        const active = offset === 0
        return (
          <motion.button
            key={project.id}
            id={`work-sleeve-${project.id}`}
            role="option"
            aria-selected={active}
            type="button"
            className={styles.sleeve}
            onClick={() => onSelect(i)}
            animate={{
              y: active ? -14 : 0,
              scale: active ? 1.06 : 1,
              rotate: active ? 0 : Math.sign(offset) * -2,
            }}
            whileHover={{ y: active ? -14 : -6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ ['--sleeve-accent' as string]: project.palette.accent }}
          >
            <span className={styles.sleeveArt}>
              <Image
                src={project.cover}
                alt={project.title}
                fill
                sizes="120px"
              />
            </span>
            <span className={styles.sleeveTag}>
              {trackLabel(i, projects.length)}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
