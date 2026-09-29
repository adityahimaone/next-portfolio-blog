'use client'

import { useState } from 'react'
import { Edit, Trash2, Globe } from 'lucide-react'
import type { Bookmark } from '../types'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import styles from '../bookmarks.module.css'

interface BookmarkRowProps {
  bookmark: Bookmark
  /** Channel LED colour, from CATEGORY_COLORS. */
  channelColor?: string
  isAdmin: boolean
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (id: string) => void
}

/**
 * One saved link. A row, not a card: the index is meant to be scanned at
 * speed, so description text lives in the tooltip and the host appears on hover.
 */
export function BookmarkRow({
  bookmark,
  channelColor,
  isAdmin,
  onEdit,
  onDelete,
}: BookmarkRowProps) {
  const [imgError, setImgError] = useState(false)
  const host = extractDomain(bookmark.url)
  const faviconSrc = getFaviconUrl(bookmark.url, bookmark.faviconUrl)

  return (
    <li
      className={styles.row}
      style={{ ['--channel' as string]: channelColor }}
    >
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.rowLink}
        title={bookmark.description || bookmark.url}
      >
        <span className={styles.led} aria-hidden="true" />
        {imgError ? (
          <span className={styles.fallback}>
            <Globe size={14} aria-hidden="true" />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconSrc}
            alt=""
            className={styles.favicon}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        <span className={styles.title}>{bookmark.title}</span>
        {bookmark.featured && (
          <span className={styles.star} role="img" aria-label="Featured">
            ★
          </span>
        )}
        <span className={styles.host}>{host}</span>
      </a>

      {isAdmin && (
        <div className={styles.adminActions}>
          <button
            type="button"
            onClick={() => onEdit?.(bookmark)}
            className={styles.adminAction}
            aria-label={`Edit ${bookmark.title}`}
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(bookmark.id)}
            className={styles.adminAction}
            aria-label={`Delete ${bookmark.title}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </li>
  )
}
