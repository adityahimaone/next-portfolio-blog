'use client'

import { useState } from 'react'
import { Bookmark } from '../types'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { ExternalLink, Edit, Trash2, Globe } from 'lucide-react'
import styles from '../bookmarks.module.css'

interface BookmarkCardProps {
  bookmark: Bookmark
  viewMode: 'grid' | 'list'
  isAdmin: boolean
  onTagClick: (tag: string) => void
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (id: string) => void
}

export function BookmarkCard({
  bookmark,
  viewMode,
  isAdmin,
  onTagClick,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const [imgError, setImgError] = useState(false)
  const domain = extractDomain(bookmark.url)
  const faviconSrc = getFaviconUrl(bookmark.url, bookmark.faviconUrl)
  // --- LIST VIEW MODE ---
  if (viewMode === 'list') {
    return (
      <div
        className={`${styles.card} ${styles.listCard} ${bookmark.featured ? styles.featured : ''}`}
      >
        {/* Soft Ambient Hover Glow */}
        {/* Left Side: Favicon + Info */}
        <div className={styles.cardMain}>
          {/* Favicon Frame */}
          <div className={styles.icon}>
            {!imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconSrc}
                alt={`${bookmark.title} icon`}
                className="h-5 w-5 object-contain"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <Globe className="h-4 w-4 text-primary-foreground" />
            )}
            {bookmark.featured && (
              <span className="absolute -top-1 -right-1 text-[10px] text-primary">
                ★
              </span>
            )}
          </div>

          <div className={styles.cardBody}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={styles.cardTitle}>
                {bookmark.title}
              </h3>
              <span className={styles.domain}>{domain}</span>
              <span
                className={styles.categoryMark}
              >
                {bookmark.category}
              </span>
            </div>

            {bookmark.description && (
              <p className={`${styles.cardDescription} line-clamp-1`}>
                {bookmark.description}
              </p>
            )}

            {/* Tag List */}
            {bookmark.tags.length > 0 && (
              <div className={styles.cardMeta}>
                {bookmark.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className={styles.tag}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visit Link + Admin Actions */}
        <div className={styles.cardActions}>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visit}
          >
            <span>Visit</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {isAdmin && (
            <div className={styles.adminActions}>
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className={styles.adminAction}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className={styles.adminAction}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- GRID VIEW MODE ---
  return (
    <div
      className={`${styles.card} ${styles.gridCard} ${bookmark.featured ? styles.featured : ''}`}
    >
      <div className={styles.cardBody}>
        {/* Header: Favicon + Title + Category */}
        <div className="flex items-start justify-between gap-2.5">
          <div className={styles.cardMain}>
            <div className={styles.icon}>
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconSrc}
                  alt={`${bookmark.title} icon`}
                  className="h-5 w-5 object-contain"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <Globe className="h-4 w-4 text-primary-foreground" />
              )}
              {bookmark.featured && (
                <span className="absolute -top-1 -right-1 text-[10px] text-primary">
                  ★
                </span>
              )}
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>
                {bookmark.title}
              </h3>
              <span className={styles.domain}>{domain}</span>
            </div>
          </div>

          <span
            className={styles.categoryMark}
          >
            {bookmark.category}
          </span>
        </div>

        {/* Description */}
        <p className={`${styles.cardDescription} line-clamp-2`}>
          {bookmark.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Tag List */}
        {bookmark.tags.length > 0 && (
          <div className={styles.cardMeta}>
            {bookmark.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={styles.tag}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className={styles.cardActions}>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.visit}
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {isAdmin && (
            <div className={styles.adminActions}>
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className={styles.adminAction}
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className={styles.adminAction}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
