'use client'

import { Cover } from '@/features/booth/cover'
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Repeat2,
  Shuffle,
} from 'lucide-react'
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useState } from 'react'
import { formatProjectTime, PROJECT_PREVIEW_DURATION } from '@/data/projects'
import type { ArtistRow, LibraryTrack } from './library-data'
import { GlassPanel } from './glass-panel'
import styles from './work.module.css'

type PlayerBarProps = {
  track: LibraryTrack
  artist: ArtistRow
  trackProgress: MotionValue<number>
  isPlaying: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
}

export function PlayerBar({
  track,
  artist,
  trackProgress,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
}: PlayerBarProps) {
  const width = useTransform(trackProgress, (progress) => `${progress * 100}%`)
  const [elapsed, setElapsed] = useState(0)

  useMotionValueEvent(trackProgress, 'change', (progress) => {
    setElapsed(Math.round(progress * PROJECT_PREVIEW_DURATION))
  })

  const remaining = Math.max(0, PROJECT_PREVIEW_DURATION - elapsed)

  return (
    <GlassPanel
      small
      className={styles.playerBar}
      role="region"
      aria-label="Player"
    >
      <div className={styles.playerIdentity}>
        <span className={styles.playerArt}>
          {/* Cover, not next/image: an empty `cover` throws in next/image, and
              two of the six releases have no artwork. */}
          <Cover
            seed={track.slug}
            title={track.title}
            src={track.cover || undefined}
            sizes="34px"
          />
        </span>
        <span className={styles.playerMeta}>
          <span className={styles.playerTitle}>{track.title}</span>
          <span className={styles.playerArtist}>{artist.name}</span>
        </span>
      </div>

      <div className={styles.playerControls}>
        <div className={styles.playerButtons}>
          <button
            type="button"
            aria-label="Shuffle"
            className={styles.iconButton}
          >
            <Shuffle size={15} />
          </button>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous project"
            className={styles.iconButton}
          >
            <SkipBack size={17} />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={styles.playButton}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className={styles.iconButton}
          >
            <SkipForward size={17} />
          </button>
          <button
            type="button"
            aria-label="Repeat"
            className={styles.iconButton}
          >
            <Repeat2 size={15} />
          </button>
        </div>

        <div className={styles.playerTimeline}>
          <span className={styles.playerTime}>
            {formatProjectTime(elapsed)}
          </span>
          <div
            className={styles.playerTrack}
            role="slider"
            aria-label="Track progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(
              (elapsed / PROJECT_PREVIEW_DURATION) * 100,
            )}
            aria-valuetext={`${formatProjectTime(elapsed)} elapsed`}
            aria-readonly="true"
            tabIndex={0}
          >
            <motion.span style={{ width }} />
          </div>
          <span className={styles.playerTime}>
            -{formatProjectTime(remaining)}
          </span>
        </div>
      </div>

      <div className={styles.playerSpacer} />
    </GlassPanel>
  )
}
