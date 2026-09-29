'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import type { WorkProject } from '@/data/projects'
import { GlassPanel } from './glass-panel'
import styles from './work.module.css'

interface NowPlayingProps {
  project: WorkProject
  lineIndex: number
  onOpenLiner: () => void
}

export function NowPlaying({
  project,
  lineIndex,
  onOpenLiner,
}: NowPlayingProps) {
  return (
    <GlassPanel className={styles.nowPlaying}>
      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(8px)', y: -8 }}
          transition={{ duration: 0.32 }}
        >
          <div className={styles.npTop}>
            <motion.button
              type="button"
              className={styles.npCover}
              onClick={onOpenLiner}
              aria-label={`Open liner notes for ${project.title}`}
              layoutId={`work-cover-${project.slug}`}
            >
              <Image
                src={project.cover}
                alt={`${project.title} cover`}
                fill
                sizes="260px"
                priority={project.id === 0}
              />
            </motion.button>

            <div>
              <span className={styles.npKicker}>
                {project.genre} · {project.year}
              </span>
              <h3 className={styles.npTitle}>{project.title}</h3>
              <p className={styles.npDesc}>{project.description}</p>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className={styles.npLink}
              >
                Open project
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          <ul className={styles.lyrics} aria-label="Project highlights">
            {project.highlights.map((line, i) => (
              <li key={line} data-active={i === lineIndex}>
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </GlassPanel>
  )
}
