'use client'

import { useRef, useState } from 'react'
import { ArrowUpRight, Pencil, Play, Star, Trash2 } from 'lucide-react'
import type { Bookmark } from '../types'
import { channelColor } from '../constants/categories'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { SitePeek } from './site-peek'
import styles from '../library.module.css'

interface TrackRowProps {
  bookmark: Bookmark
  index: number
  active: boolean
  isAdmin?: boolean
  /** False on touch, where there is no hover to preview from. */
  canHover?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

/**
 * One saved link as a library row. The index becomes a play glyph on hover,
 * the way a music list does — the row is still a plain anchor underneath, so
 * the affordance is decorative and the link always works.
 *
 * The live peek is a sibling of the anchor, never a child: an iframe inside the
 * link would consume the click the row exists to make. Preview is bound to
 * hover only, never to `active`, so arrowing the list with j/k does not fire a
 * request per row.
 */
export function TrackRow({
  bookmark,
  index,
  active,
  isAdmin = false,
  canHover = true,
  onEdit,
  onDelete,
}: TrackRowProps) {
  const rowRef = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <li data-active={active || undefined}>
      <a
        ref={rowRef}
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        title={bookmark.description || bookmark.url}
        className={styles.track}
        style={{ ['--led' as string]: channelColor(bookmark.category) }}
        onMouseEnter={() => canHover && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className={styles.index}>
          <span className={styles.num}>{index + 1}</span>
          <Play size={14} className={styles.playGlyph} aria-hidden="true" />
        </span>

        <span className={styles.art}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFaviconUrl(bookmark.url, bookmark.faviconUrl)}
            alt=""
            loading="lazy"
          />
        </span>

        <span className={styles.name}>
          <span className={styles.nameText}>{bookmark.title}</span>
          {bookmark.featured && (
            <Star size={12} className={styles.pinStar} aria-label="Pinned" />
          )}
        </span>

        <span className={styles.host}>{extractDomain(bookmark.url)}</span>
        {isAdmin ? (
          <span className={styles.rowActions}>
            <button
              type="button"
              onClick={onEdit}
              className={styles.rowAction}
              aria-label={`Edit ${bookmark.title}`}
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={styles.rowAction}
              aria-label={`Delete ${bookmark.title}`}
            >
              <Trash2 size={13} />
            </button>
          </span>
        ) : (
          <ArrowUpRight size={14} className={styles.arrow} aria-hidden="true" />
        )}
      </a>

      <SitePeek url={bookmark.url} anchorRef={rowRef} hovered={hovered} />
    </li>
  )
}
