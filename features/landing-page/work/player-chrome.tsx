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

      {/* The banner used to fade up with its own children, which meant the
          title, the supporting line and the play button all arrived together as
          a flat wash. The title now uses the rack's masked-slot rise — it comes
          up out of its own line box, the same motif every other section heading
          uses — and the supporting copy stays as a quiet fade behind it. */}
      <motion.div
        key={track.id}
        className={styles.banner}
        initial="hidden"
        animate="shown"
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: 0.06 } },
        }}
      >
        <div className={styles.bannerBody}>
          <motion.span
            className={styles.silkscreen}
            variants={{
              hidden: { opacity: 0 },
              shown: { opacity: 1, transition: { duration: 0.2 } },
            }}
          >
            {trackLabel(activeIndex)} / {String(total).padStart(2, '0')} ·{''}
            {track.album}
          </motion.span>
          <div className={styles.bannerTitleMask}>
            {/* Motion's variant type does not admit `yPercent`, so the rise is
                expressed as an em offset. The title's font-size is a clamp, so
                `1.08em` tracks whatever size it resolved to and the start stays
                just below the mask edge at every viewport. */}
            <motion.h3
              className={styles.bannerTitle}
              variants={{
                hidden: { y: '1.08em' },
                shown: {
                  y: '0em',
                  transition: {
                    duration: 0.42,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              {track.title}
            </motion.h3>
          </div>
          <motion.p
            className={styles.bannerSub}
            variants={{
              hidden: { opacity: 0, y: 6 },
              shown: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.26, delay: 0.08 },
              },
            }}
          >
            {track.role} · {track.genre} · {track.year}
          </motion.p>
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
