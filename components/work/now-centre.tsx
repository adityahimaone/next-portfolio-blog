'use client'

import Image from 'next/image'
import { motion, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useState } from 'react'
import type { LibraryTrack } from './library-data'
import styles from './work.module.css'

type NowCentreProps = {
  track: LibraryTrack
  trackProgress: MotionValue<number>
  onOpenLiner: () => void
  isPlaying: boolean
}

export function NowCentre({
  track,
  trackProgress,
  onOpenLiner,
  isPlaying,
}: NowCentreProps) {
  const [lineIndex, setLineIndex] = useState(0)

  useMotionValueEvent(trackProgress, 'change', (progress) => {
    const next = Math.min(
      track.lyrics.length - 1,
      Math.floor(progress * track.lyrics.length),
    )
    setLineIndex((previous) => (previous === next ? previous : next))
  })

  return (
    <div className={styles.centre}>
      {/* Top band: 1fr of the 1fr/2fr split — artwork, metadata. */}
      <div className={styles.centreTop}>
        <motion.div
          key={`art-${track.id}`}
          className={styles.centreArtWrap}
          initial={{ opacity: 0, transform: 'translate3d(0, 10px, 0)' }}
          animate={{ opacity: 1, transform: 'translate3d(0, 0, 0)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className={styles.centreArt}
            onClick={onOpenLiner}
            aria-label={`Open liner notes for ${track.title}`}
          >
            <Image
              src={track.cover}
              alt={`${track.title} cover`}
              fill
              sizes="(max-width: 900px) 60vw, 360px"
              priority={track.id === 0}
            />
            <span className={styles.centreArtScrim} />
          </button>
        </motion.div>

        <motion.div
          key={`meta-${track.id}`}
          className={styles.centreMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* The title already headlines the banner above, so this block carries
              the supporting metadata instead of repeating it. */}
          <span className={styles.silkscreen}>
            {track.album} · {track.year}
          </span>
          <p className={styles.centreDesc}>{track.description}</p>
          <ul className={styles.centreStack}>
            {track.stack.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Bottom band: 2fr — the running lyric view. */}
      <div className={styles.lyricStage}>
        <ul className={styles.lyricLines} aria-label="Running notes">
          {track.lyrics.map((line, index) => {
            // Distance from the active line drives opacity and scale, so the
            // whole block reads as a continuous surface rather than a list.
            const distance = Math.abs(index - lineIndex)
            const opacity = Math.max(0.12, 0.95 - distance * 0.26)
            const scale = Math.max(0.9, 1 - distance * 0.035)
            return (
              <li
                key={line}
                className={styles.lyricLine}
                data-active={index === lineIndex}
                style={{ opacity, transform: `scale(${scale})` }}
              >
                {line}
              </li>
            )
          })}
        </ul>
        <span className={styles.lyricGlow} aria-hidden="true" />
      </div>

      {isPlaying && (
        <span className={styles.srOnly} role="status">
          Playing {track.title}
        </span>
      )}
    </div>
  )
}
