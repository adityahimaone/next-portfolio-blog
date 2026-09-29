'use client'

import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useState } from 'react'
import { PROJECT_PREVIEW_DURATION, formatProjectTime } from '@/data/projects'
import { GlassPanel } from './glass-panel'
import styles from './work.module.css'

interface TransportProps {
  trackProgress: MotionValue<number>
  isPlaying: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
}

export function Transport({
  trackProgress,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
}: TransportProps) {
  const width = useTransform(trackProgress, (p) => `${p * 100}%`)
  const [elapsed, setElapsed] = useState(0)

  useMotionValueEvent(trackProgress, 'change', (p) => {
    const next = Math.round(p * PROJECT_PREVIEW_DURATION)
    setElapsed((prev) => (prev === next ? prev : next))
  })

  return (
    <GlassPanel small className={styles.transport}>
      <div className={styles.times}>
        <span>{formatProjectTime(elapsed)}</span>
        <span>-{formatProjectTime(PROJECT_PREVIEW_DURATION - elapsed)}</span>
      </div>

      <div
        className={styles.track}
        role="slider"
        aria-label="Track position"
        aria-valuemin={0}
        aria-valuemax={PROJECT_PREVIEW_DURATION}
        aria-valuenow={elapsed}
        aria-valuetext={`${formatProjectTime(elapsed)} elapsed`}
      >
        <motion.span style={{ width }} />
      </div>

      <div className={styles.buttons}>
        <button type="button" onClick={onPrev} aria-label="Previous project">
          <SkipBack size={17} />
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause record' : 'Spin record'}
        >
          {isPlaying ? (
            <Pause size={21} />
          ) : (
            <Play size={21} fill="currentColor" />
          )}
        </button>
        <button type="button" onClick={onNext} aria-label="Next project">
          <SkipForward size={17} />
        </button>
      </div>
    </GlassPanel>
  )
}
