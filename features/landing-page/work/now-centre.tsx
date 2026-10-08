'use client'

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react'
import { useState } from 'react'
import { Cover } from '@/features/booth/cover'
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
        {/* A sleeve swap, not a cross-dissolve. The outgoing sleeve scales down
            and blurs as it goes, the incoming one arrives slightly oversized and
            settles — so at no point are two half-legible covers stacked on top of
            each other, which is what a plain AnimatePresence crossfade does to a
            square. Both live in one grid cell and overlap only in the frames
            where neither is readable. */}
        <div className={styles.centreArtWrap}>
          <AnimatePresence initial={false}>
            <motion.div
              key={`out-${track.id}`}
              className={styles.centreArtLayer}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(3px)' }}
              transition={{
                duration: 0.34,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                type="button"
                className={styles.centreArt}
                data-work-art
                onClick={onOpenLiner}
                aria-label={`Open liner notes for ${track.title}`}
              >
                {/* Cover, not next/image: an empty `cover` throws in next/image,
                    and two of the six releases have no artwork. The button is
                    already 1:1, so Cover fills it exactly. */}
                <Cover
                  seed={track.slug}
                  title={track.title}
                  src={track.cover || undefined}
                  sizes="(max-width: 900px) 60vw, 320px"
                  priority={track.id === 0}
                />
                <span className={styles.centreArtScrim} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          key={`meta-${track.id}`}
          className={styles.centreMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
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
