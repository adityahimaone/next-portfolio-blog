'use client'

import {
  ARTIST_ROWS,
  LIBRARY_TRACKS,
  buildArchiveTracks,
  nowPlayingArtist,
  type ArchiveTrack,
  type LibraryTrack,
} from './library-data'
import { PlayerChrome, PlayerBanner } from './player-chrome'
import { LibrarySidebar } from './library-sidebar'
import { NowCentre } from './now-centre'
import { ArtistPanel } from './artist-panel'
import { PlayerBar } from './player-bar'
import type { MotionValue } from 'motion/react'
import styles from './work.module.css'

/**
 * The player window: the Work section's instrument.
 *
 * Extracted so the radio flip can mount it as the back
 * face of the radio body (chapters/experience-work/
 * radio-stage.tsx) while the legacy layout keeps it in
 * the work section's sticky stage. The markup is
 * unchanged; the state it renders stays in the work
 * section, which owns the track, the query, the
 * transport and the live archive list.
 *
 * `className` lets the flip layout size the shell to
 * the radio's back face without reaching into this
 * module's stylesheet from another one.
 */
export function WorkShell({
  className,
  track,
  archiveTracks,
  activeIndex,
  total,
  trackProgress,
  isPlaying,
  query,
  onQueryChange,
  onSelectTrack,
  onTogglePlay,
  onPrev,
  onNext,
  onOpenLiner,
}: {
  className?: string
  track: LibraryTrack
  archiveTracks: readonly ArchiveTrack[]
  activeIndex: number
  total: number
  trackProgress: MotionValue<number>
  isPlaying: boolean
  query: string
  onQueryChange: (value: string) => void
  onSelectTrack: (index: number) => void
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onOpenLiner: () => void
}) {
  return (
    <div className={`${styles.shell} ${className ?? ''}`} data-work-shell>
      <PlayerChrome query={query} onQueryChange={onQueryChange} />
      <PlayerBanner
        track={track}
        activeIndex={activeIndex}
        total={total}
        onSelect={onSelectTrack}
      />
      <div className={styles.columns}>
        <LibrarySidebar
          tracks={LIBRARY_TRACKS}
          archiveTracks={archiveTracks}
          activeIndex={activeIndex}
          query={query}
          onSelect={onSelectTrack}
        />
        <NowCentre
          track={track}
          trackProgress={trackProgress}
          isPlaying={isPlaying}
          onOpenLiner={onOpenLiner}
        />
        <ArtistPanel artists={ARTIST_ROWS} />
      </div>
      <PlayerBar
        track={track}
        artist={nowPlayingArtist}
        trackProgress={trackProgress}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  )
}
