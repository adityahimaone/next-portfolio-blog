'use client'

import { Lock, Unlock, Plus } from 'lucide-react'
import { SignalArchiveHeader } from '@/features/layout'
import { Bookmark } from '../types'
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
  const totalCategories = new Set(bookmarks.map((b) => b.category)).size

  return (
    <div className={styles.hero}>
      <SignalArchiveHeader
        activeSection="bookmarks"
        label="Input 02 / Signal archive"
        title="Saved signals"
        description="Tools, references, and ideas that influence how I design and build production interfaces."
        aside={
        <div>
          <div className={styles.stats} aria-label="Bookmark summary">
            <div className={styles.stat}><span className={styles.statValue}>{bookmarks.length}</span><span className={styles.statLabel}>saved</span></div>
            <div className={styles.stat}><span className={styles.statValue}>{totalCategories}</span><span className={styles.statLabel}>channels</span></div>
            <div className={styles.stat}><span className={styles.statValue}>{featuredCount}</span><span className={styles.statLabel}>featured</span></div>
          </div>

          {isAdmin ? (
            <div className={styles.adminRow}>
              <button
                onClick={onOpenAdminModal}
                className={styles.adminButton}
              >
                <Plus className="h-4 w-4" />
                Add Bookmark
              </button>
              <button
                onClick={onToggleAdminLogin}
                title="Admin Logged In (Click to lock)"
                className={styles.adminLock}
              >
                <Unlock className="h-4 w-4" />
                <span>adityahimaone</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleAdminLogin}
              className={styles.adminLock}
            >
              <Lock className="h-3.5 w-3.5" />
              Admin Panel
            </button>
          )}
        </div>
        }
      />
    </div>
  )
}
