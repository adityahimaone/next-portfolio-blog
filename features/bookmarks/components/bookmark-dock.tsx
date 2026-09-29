'use client'

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import styles from '../bookmarks.module.css'

interface BookmarkDockProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalCount: number
  filteredCount: number
}

/**
 * The single control on this page: search. Sort, grouping, view mode and the
 * tag rail were dropped — an index is already organised (design.md §2).
 */
export function BookmarkDock({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: BookmarkDockProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <div className={`${styles.dock} glass-2`}>
      <div className={styles.search}>
        <Search className={styles.searchIcon} size={16} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className={styles.searchInput}
          aria-label="Search bookmarks"
          placeholder="Search title, domain, description or tag…"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className={styles.clearSearch}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>
      <span className={styles.dockMeta} aria-live="polite">
        {filteredCount} / {totalCount}
        <span aria-hidden="true"> · ⌘K</span>
      </span>
    </div>
  )
}
