'use client'

import { useState } from 'react'
import { Bookmark } from '../types'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { CATEGORY_COLORS } from '../constants/categories'
import { ExternalLink, Edit, Trash2, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const theme = CATEGORY_COLORS[bookmark.category] || {
    bg: 'bg-amber-800/90',
    text: 'text-amber-100',
    border: 'border-amber-400',
    cardBorder: 'border-amber-400/60 hover:border-amber-300',
    cardGradient: 'from-amber-900/70 via-orange-800/60 to-amber-900/70',
    iconBg: 'bg-amber-800/90 border-amber-400 text-amber-100',
    glow: 'rgba(254,243,199,0.4)',
    accentColor: '#fde047',
  }

  // --- LIST VIEW MODE ---
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 sm:p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl',
          theme.cardGradient,
          theme.cardBorder,
          bookmark.featured && 'ring-1 ring-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        )}
      >
        {/* Soft Ambient Hover Glow */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${theme.glow}` }}
        />

        {/* Left Side: Favicon + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Favicon Frame */}
          <div
            className={cn(
              'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105',
              theme.iconBg
            )}
          >
            {!imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconSrc}
                alt={`${bookmark.title} icon`}
                className="h-5 w-5 object-contain rounded-sm"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <Globe className="h-4 w-4 text-white" />
            )}
            {bookmark.featured && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black shadow-[0_0_6px_rgba(245,158,11,0.9)]">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate drop-shadow-sm">
                {bookmark.title}
              </h3>
              <span className="font-mono text-[11px] text-zinc-300 font-semibold">({domain})</span>
              <span
                className={cn(
                  'shrink-0 text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm',
                  theme.bg,
                  theme.text,
                  theme.border
                )}
              >
                {bookmark.category}
              </span>
            </div>

            {bookmark.description && (
              <p className="text-xs text-zinc-100 font-normal leading-normal line-clamp-1 mb-1">
                {bookmark.description}
              </p>
            )}

            {/* Tag List */}
            {bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 text-zinc-200 hover:text-amber-300 hover:border-amber-400/80 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visit Link + Admin Actions */}
        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white font-mono text-xs font-bold transition-all shadow-sm hover:bg-amber-400 hover:text-zinc-950 hover:border-amber-300 active:scale-95"
          >
            <span>Visit</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-0.5 bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700">
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className="p-1 rounded hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className="p-1 rounded hover:bg-zinc-700 text-zinc-300 hover:text-rose-300 transition-colors"
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
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-4 shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden',
        theme.cardGradient,
        theme.cardBorder,
        bookmark.featured && 'ring-1 ring-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      )}
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Glow Hover Accent */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 20px ${theme.glow}` }}
      />

      <div>
        {/* Header: Favicon + Title + Category */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5 pt-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105',
                theme.iconBg
              )}
            >
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconSrc}
                  alt={`${bookmark.title} icon`}
                  className="h-5 w-5 object-contain rounded-sm"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <Globe className="h-4 w-4 text-white" />
              )}
              {bookmark.featured && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black shadow-[0_0_6px_rgba(245,158,11,0.9)]">
                  ★
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate drop-shadow-sm">
                {bookmark.title}
              </h3>
              <span className="font-mono text-[11px] text-zinc-300 font-semibold block truncate">{domain}</span>
            </div>
          </div>

          <span
            className={cn(
              'shrink-0 text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm',
              theme.bg,
              theme.text,
              theme.border
            )}
          >
            {bookmark.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-100 font-normal leading-relaxed mb-3 line-clamp-2">
          {bookmark.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Tag List */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {bookmark.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700 text-zinc-200 hover:text-amber-300 hover:border-amber-400/80 transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white font-mono text-xs font-bold transition-all shadow-sm hover:bg-amber-400 hover:text-zinc-950 hover:border-amber-300 active:scale-95"
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-0.5 bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700">
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className="p-1 rounded hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className="p-1 rounded hover:bg-zinc-700 text-zinc-300 hover:text-rose-300 transition-colors"
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
