'use client'

import { Heart, ListMusic, Play, Radio, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { trackLabel } from '@/data/projects'
import { WorkHeading } from './work-heading'
import { nowPlayingArtist, type LibraryTrack } from './library-data'
import styles from './work.module.css'

/**
 * Decorative chrome, not navigation: these render as spans with no href and no
 * click handler. They were "Home / Projects / Albums / Stack" and the search
 * asked what you wanted to listen to, which is a music player's vocabulary
 * applied to a list of code projects — and the one place a visitor would
 * reasonably expect the metaphor to break down. Re-worded to the work's own
 * language while keeping the player layout intact.
 */
const TABS = ['Home', 'Projects', 'Credits', 'Stack'] as const

type PlayerChromeProps = {
  query: string
  onQueryChange: (value: string) => void
}

export function PlayerChrome({ query, onQueryChange }: PlayerChromeProps) {
  return (
    <div className={styles.chrome}>
      <div className={styles.windowControls} aria-hidden="true">
        <span className={styles.dotRed} />
        <span className={styles.dotAmber} />
        <span className={styles.dotGreen} />
      </div>

      <div className={styles.discMark} aria-hidden="true">
        <Radio size={15} />
      </div>

      <nav className={styles.tabs} aria-label="Player sections">
        {TABS.map((tab) => (
          <span
            key={tab}
            className={styles.tab}
            data-active={tab === 'Projects'}
            aria-current={tab === 'Projects' ? 'page' : undefined}
          >
            {tab}
          </span>
        ))}
      </nav>

      <div className={styles.searchWrap}>
        <Search size={14} aria-hidden="true" className={styles.searchIcon} />
        <input
          type="search"
          className={styles.search}
          placeholder="Search the work…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search projects"
        />
      </div>

      <div className={styles.chromeActions}>
        <button
          type="button"
          className={styles.chromeIcon}
          aria-label="Liked songs"
        >
          <Heart size={15} />
        </button>
        <button type="button" className={styles.chromeIcon} aria-label="Queue">
          <ListMusic size={15} />
        </button>
        <span
          className={styles.avatar}
          aria-hidden="true"
          style={{
            background: `linear-gradient(140deg, ${nowPlayingArtist.from}, ${nowPlayingArtist.to})`,
          }}
        />
      </div>
    </div>
  )
}

type BannerProps = {
  track: LibraryTrack
  activeIndex: number
  total: number
  onSelect: (index: number) => void
}

/** The section heading and now-playing banner share one row. */
export function PlayerBanner({
  track,
  activeIndex,
  total,
  onSelect,
}: BannerProps) {
  return (
    <div className={styles.bannerRow}>
      <WorkHeading index="05" eyebrow="Selected work">
        Work that ships.
      </WorkHeading>

      <motion.div
        key={track.id}
        className={styles.banner}
        initial={{ opacity: 0, transform: 'translate3d(0, 10px, 0)' }}
        animate={{ opacity: 1, transform: 'translate3d(0, 0, 0)' }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.bannerBody}>
          <span className={styles.silkscreen}>
            {trackLabel(activeIndex)} / {String(total).padStart(2, '0')} ·{' '}
            {track.album}
          </span>
          <h3 className={styles.bannerTitle}>{track.title}</h3>
          <p className={styles.bannerSub}>
            {track.role} · {track.genre} · {track.year}
          </p>
        </div>
        <button
          type="button"
          className={styles.bannerPlay}
          onClick={() => onSelect(activeIndex)}
          aria-label={`Play ${track.title}`}
        >
          <Play size={22} fill="currentColor" />
        </button>
      </motion.div>
    </div>
  )
}
