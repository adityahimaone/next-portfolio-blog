'use client'

import { Unlock, Plus } from 'lucide-react'
import { SignalArchiveHeader } from '@/features/layout'
import type { Bookmark } from '../types'
import styles from '../bookmarks.module.css'

interface BookmarkHeroProps {
  bookmarks: Bookmark[]
  isAdmin: boolean
  onOpenAdminModal: () => void
  onToggleAdminLogin: () => void
}

export function BookmarkHero({
  bookmarks,
  isAdmin,
  onOpenAdminModal,
  onToggleAdminLogin,
}: BookmarkHeroProps) {
  const featuredCount = bookmarks.filter((b) => b.featured).length
  const channelCount = new Set(bookmarks.map((b) => b.category)).size

  return (
    <div className={styles.hero}>
      <SignalArchiveHeader
        activeSection="bookmarks"
        meterCount={bookmarks.length}
        label="Input 02 / Signal archive"
        title="Saved signals"
        description="Tools, references, and ideas that influence how I design and build production interfaces."
        aside={
          <div>
            <div className={styles.stats} aria-label="Bookmark summary">
              <div className={styles.stat}>
                <span className={styles.statValue}>{bookmarks.length}</span>
                <span className={styles.statLabel}>saved</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{channelCount}</span>
                <span className={styles.statLabel}>channels</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{featuredCount}</span>
                <span className={styles.statLabel}>featured</span>
              </div>
            </div>

            <div className={styles.adminRow}>
              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenAdminModal}
                    className={styles.adminButton}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Add bookmark
                  </button>
                  <button
                    type="button"
                    onClick={onToggleAdminLogin}
                    className={styles.adminLock}
                    title="Signed in as adityahimaone — lock the panel"
                  >
                    <Unlock size={14} aria-hidden="true" />
                    <span>adityahimaone</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        }
      />
    </div>
  )
}
