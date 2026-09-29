'use client'

import { motion } from 'motion/react'
import type { ArtistRow } from './library-data'
import styles from './work.module.css'

type ArtistPanelProps = {
  artists: readonly ArtistRow[]
}

/**
 * Placeholder credits, sized to match a real player's artist column. Avatars
 * are generated gradients, not photographs — the column is set dressing and
 * implies no endorsement.
 */
export function ArtistPanel({ artists }: ArtistPanelProps) {
  return (
    <aside className={styles.artistPanel} aria-label="Top artists">
      <div className={styles.artistHead}>
        <span className={styles.artistTitle}>Top Artists</span>
        <span className={styles.silkscreen} aria-hidden="true">
          {artists.length}
        </span>
      </div>

      <ul className={styles.artistList}>
        {artists.map((artist, index) => (
          <motion.li
            key={artist.id}
            className={styles.artistRow}
            initial={{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }}
            animate={{ opacity: 1, transform: 'translate3d(0, 0, 0)' }}
            transition={{
              duration: 0.24,
              // Short stagger so the column resolves rather than appearing flat.
              delay: 0.03 * index,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span
              className={styles.artistArt}
              style={{
                background: `linear-gradient(140deg, ${artist.from}, ${artist.to})`,
              }}
              aria-hidden="true"
            />
            <span className={styles.artistMeta}>
              <span className={styles.artistName}>{artist.name}</span>
              <span className={styles.artistSub}>{artist.meta}</span>
            </span>
          </motion.li>
        ))}
      </ul>

      <div className={styles.artistPromo}>
        <span className={styles.artistPromoTitle}>Open channel</span>
        <p className={styles.artistPromoBody}>
          Available for frontend work, design engineering, and the occasional
          hard interface problem.
        </p>
        <a
          className={styles.artistPromoCta}
          href="mailto:adityahimaone@gmail.com"
        >
          Get in touch
        </a>
      </div>
    </aside>
  )
}
