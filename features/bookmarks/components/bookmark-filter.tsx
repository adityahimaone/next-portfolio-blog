'use client'

import { BookmarkCategory } from '../types'
import { BOOKMARK_CATEGORIES } from '../constants/categories'
import { Search, X, Sparkles, Filter, LayoutList, LayoutGrid, ArrowUpDown, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function BookmarkFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  selectedTags,
  onRemoveTag,
  allAvailableTags,
  onSelectTag,
  featuredOnly,
  onToggleFeatured,
  onResetFilters,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  groupByCategory,
  onToggleGroupByCategory,
  totalCount,
  filteredCount,
}: BookmarkFilterProps) {
  const isFiltered = searchQuery.length > 0 || selectedCategory !== 'All' || selectedTags.length > 0 || featuredOnly

  return (
    <div className="space-y-4 mb-8">
      {/* Top Bar: Search Input + Sort Dropdown + Grouping + View Mode Switch + Featured Switch */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search bookmarks by title, description, domain, or tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls: Sort dropdown, Group Toggle, View Mode, Featured */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline font-semibold">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="bg-transparent text-white font-bold font-mono focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-zinc-900 text-white">Date (Latest)</option>
              <option value="oldest" className="bg-zinc-900 text-white">Date (Oldest)</option>
              <option value="a-z" className="bg-zinc-900 text-white">Name (A – Z)</option>
              <option value="z-a" className="bg-zinc-900 text-white">Name (Z – A)</option>
            </select>
          </div>

          {/* Category Grouping Toggle (Active when All categories selected) */}
          <button
            onClick={onToggleGroupByCategory}
            title="Toggle Category Grouping"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all',
              groupByCategory
                ? 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Grouped</span>
          </button>

          {/* List vs Grid Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-zinc-700 bg-zinc-900">
            <button
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all',
                viewMode === 'list'
                  ? 'bg-amber-400 text-zinc-950 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all',
                viewMode === 'grid'
                  ? 'bg-amber-400 text-zinc-950 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Featured Filter Button */}
          <button
            onClick={onToggleFeatured}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all',
              featuredOnly
                ? 'border-amber-400/80 bg-amber-950/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white'
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Featured</span>
          </button>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800/80">
        <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 font-semibold mr-1 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span>CATEGORIES:</span>
        </div>

        {BOOKMARK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 border',
                isSelected
                  ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500'
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Active Tags Filter & Popular Tags */}
      {(selectedTags.length > 0 || allAvailableTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mr-3">
              <span className="text-[11px] font-mono text-amber-300 font-bold">ACTIVE TAGS:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold"
                >
                  #{tag}
                  <button onClick={() => onRemoveTag(tag)} className="hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {allAvailableTags.length > 0 && selectedTags.length === 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">POPULAR TAGS:</span>
              {allAvailableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 hover:border-amber-400 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Counter Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 font-medium pt-1">
        <div>
          SHOWING <span className="text-amber-400 font-extrabold">{filteredCount}</span> OF{' '}
          <span className="text-white font-extrabold">{totalCount}</span> BOOKMARKS
        </div>
        <div className="uppercase text-[11px] tracking-wider text-zinc-400 flex items-center gap-3">
          <span>SORT: <strong className="text-amber-400 uppercase">{sortBy}</strong></span>
          <span>•</span>
          <span>VIEW: <strong className="text-white uppercase">{viewMode}</strong></span>
        </div>
      </div>
    </div>
  )
}

