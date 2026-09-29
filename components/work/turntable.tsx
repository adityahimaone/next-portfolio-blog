'use client'

import Image from 'next/image'
import { AnimatePresence, motion, type MotionValue } from 'motion/react'
import type { WorkProject } from '@/data/projects'
import styles from './work.module.css'

interface TurntableProps {
  project: WorkProject
  angle: MotionValue<number>
  isPlaying: boolean
}

export function Turntable({ project, angle, isPlaying }: TurntableProps) {
  return (
    <div className={styles.turntable}>
      <div className={styles.platter}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={project.id}
            className={styles.disc}
            data-playing={isPlaying}
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.grooves} />
            <span className={styles.label}>
              <Image
                src={project.cover}
                alt=""
                fill
                sizes="200px"
                priority={project.id === 0}
              />
            </span>
            <span className={styles.spindle} />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div className={styles.tonearm} style={{ rotate: angle }}>
        <span className={styles.armBar} />
        <span className={styles.headshell} />
      </motion.div>
    </div>
  )
}
