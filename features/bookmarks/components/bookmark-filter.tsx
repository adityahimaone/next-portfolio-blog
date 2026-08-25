'use client'

import { BookmarkCategory } from '../types'
import { BOOKMARK_CATEGORIES } from '../constants/categories'
import { Search, X, Sparkles, Filter, LayoutList, LayoutGrid, ArrowUpDown, Layers } from 'lucide-react'
import styles from '../bookmarks.module.css'

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a'

interface BookmarkFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: BookmarkCategory
  onCategorySelect: (category: BookmarkCategory) => void
  selectedTags: string[]
  onRemoveTag: (tag: string) => void
  allAvailableTags: string[]
  onSelectTag: (tag: string) => void
  featuredOnly: boolean
  onToggleFeatured: () => void
  onResetFilters: () => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
  sortBy: SortOption
  onSortByChange: (sort: SortOption) => void
  groupByCategory: boolean
  onToggleGroupByCategory: () => void
  totalCount: number
  filteredCount: number
}

export function BookmarkFilter(props: BookmarkFilterProps) {
  const { searchQuery, onSearchChange, selectedCategory, onCategorySelect, selectedTags, onRemoveTag, allAvailableTags, onSelectTag, featuredOnly, onToggleFeatured, onResetFilters, viewMode, onViewModeChange, sortBy, onSortByChange, groupByCategory, onToggleGroupByCategory, totalCount, filteredCount } = props
  const isFiltered = Boolean(searchQuery || selectedCategory !== 'All' || selectedTags.length || featuredOnly)

  return (
    <section className={styles.filter} aria-label="Bookmark filters">
      <div className={styles.filterTop}>
        <div className={styles.search}>
          <Search className={styles.searchIcon} size={16} aria-hidden="true" />
          <input type="search" aria-label="Search bookmarks" placeholder="Search title, domain, tag..." value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} className={styles.searchInput} />
          {searchQuery && <button type="button" onClick={() => onSearchChange('')} className={styles.clearSearch} aria-label="Clear search"><X size={15} /></button>}
        </div>
        <div className={styles.controls}>
          <label className={styles.controlButton}><ArrowUpDown size={13} aria-hidden="true" /><span className={styles.controlLabel}>Sort</span><select value={sortBy} onChange={(event) => onSortByChange(event.target.value as SortOption)} className={styles.select} aria-label="Sort bookmarks"><option value="newest">Latest</option><option value="oldest">Oldest</option><option value="a-z">A to Z</option><option value="z-a">Z to A</option></select></label>
          <button type="button" onClick={onToggleGroupByCategory} className={`${styles.controlButton} ${groupByCategory ? styles.activeControl : ''}`} aria-pressed={groupByCategory}><Layers size={13} /> Group</button>
          <button type="button" onClick={() => onViewModeChange('list')} className={`${styles.controlButton} ${viewMode === 'list' ? styles.activeControl : ''}`} aria-pressed={viewMode === 'list'}><LayoutList size={13} /> List</button>
          <button type="button" onClick={() => onViewModeChange('grid')} className={`${styles.controlButton} ${viewMode === 'grid' ? styles.activeControl : ''}`} aria-pressed={viewMode === 'grid'}><LayoutGrid size={13} /> Grid</button>
          <button type="button" onClick={onToggleFeatured} className={`${styles.controlButton} ${featuredOnly ? styles.activeControl : ''}`} aria-pressed={featuredOnly}><Sparkles size={13} /> Featured</button>
          {isFiltered && <button type="button" onClick={onResetFilters} className={styles.reset}><X size={13} /> Reset</button>}
        </div>
      </div>
      <div className={styles.categoryRow}><span className={styles.categoryLead}><Filter size={13} /> Channels</span>{BOOKMARK_CATEGORIES.map((category) => <button type="button" key={category} onClick={() => onCategorySelect(category)} className={`${styles.categoryButton} ${selectedCategory === category ? styles.activeCategory : ''}`} aria-pressed={selectedCategory === category}>{category}</button>)}</div>
      {(selectedTags.length > 0 || allAvailableTags.length > 0) && <div className={styles.tagRow}><span className={styles.tagLead}>{selectedTags.length ? 'Active tags' : 'Quick tags'}</span>{(selectedTags.length ? selectedTags : allAvailableTags.slice(0, 10)).map((tag) => selectedTags.length ? <span key={tag} className={`${styles.tag} ${styles.selectedTag}`}>#{tag}<button type="button" onClick={() => onRemoveTag(tag)} aria-label={`Remove ${tag}`}><X size={11} /></button></span> : <button type="button" key={tag} onClick={() => onSelectTag(tag)} className={styles.tag}>#{tag}</button>)}</div>}
      <div className={styles.meta}><span>Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong></span><span>{sortBy} / {viewMode}</span></div>
    </section>
  )
}
