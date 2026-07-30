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
          'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-gradient-to-r p-4.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5',
          theme.cardGradient,
          theme.cardBorder,
          bookmark.featured && 'ring-2 ring-amber-300 shadow-[0_0_22px_rgba(254,243,199,0.4)]'
        )}
      >
        {/* Soft Warm Glow Accent */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 25px ${theme.glow}` }}
        />

        {/* Left Side: Favicon + Info */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          {/* Favicon Frame */}
          <div
            className={cn(
              'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform group-hover:scale-105',
              theme.iconBg
            )}
          >
            {!imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconSrc}
                alt={`${bookmark.title} icon`}
                className="h-6 w-6 object-contain rounded"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <Globe className="h-5 w-5 text-white" />
            )}
            {bookmark.featured && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-300 text-zinc-950 text-[10px] font-bold shadow-[0_0_10px_rgba(254,243,199,0.9)]">
                ★
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-extrabold text-base text-white group-hover:text-amber-200 transition-colors truncate">
                {bookmark.title}
              </h3>
              <span className="font-mono text-xs text-zinc-200 font-medium">({domain})</span>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm',
                  theme.bg,
                  theme.text,
                  theme.border
                )}
              >
                {bookmark.category}
              </span>
            </div>

            <p className="text-xs text-zinc-100 font-medium leading-relaxed line-clamp-1 mb-2">
              {bookmark.description || 'No description provided.'}
            </p>

            {/* Tag List */}
            <div className="flex flex-wrap gap-1.5">
              {bookmark.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-500 text-white hover:text-amber-200 hover:border-amber-300 hover:bg-slate-700 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Visit Link + Admin Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/80">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all shadow-md',
              theme.bg,
              theme.text,
              theme.border,
              'hover:brightness-125 hover:scale-105 active:scale-95'
            )}
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-600">
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className="p-1.5 rounded hover:bg-slate-700 text-white hover:text-amber-200 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className="p-1.5 rounded hover:bg-slate-700 text-white hover:text-rose-300 transition-colors"
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
        'group relative flex flex-col justify-between rounded-xl border bg-gradient-to-b p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 overflow-hidden',
        theme.cardGradient,
        theme.cardBorder,
        bookmark.featured && 'ring-2 ring-amber-300 shadow-[0_0_22px_rgba(254,243,199,0.4)]'
      )}
    >
      {/* Top Warm Pastel Accent Strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Glow Hover Accent */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${theme.glow}` }}
      />

      <div>
        {/* Header: Favicon + Title + Category */}
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform group-hover:scale-105',
                theme.iconBg
              )}
            >
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconSrc}
                  alt={`${bookmark.title} icon`}
                  className="h-6 w-6 object-contain rounded"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <Globe className="h-5 w-5 text-white" />
              )}
              {bookmark.featured && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-300 text-zinc-950 text-[10px] font-bold shadow-[0_0_10px_rgba(254,243,199,0.9)]">
                  ★
                </span>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                {bookmark.title}
              </h3>
              <span className="font-mono text-xs text-zinc-200 font-medium">{domain}</span>
            </div>
          </div>

          <span
            className={cn(
              'shrink-0 text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm',
              theme.bg,
              theme.text,
              theme.border
            )}
          >
            {bookmark.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-100 font-medium leading-relaxed mb-4 line-clamp-2">
          {bookmark.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Tag List */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bookmark.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-500 text-white hover:text-amber-200 hover:border-amber-300 hover:bg-slate-700 transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/80">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md',
              theme.bg,
              theme.text,
              theme.border,
              'hover:brightness-125 hover:scale-105 active:scale-95'
            )}
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-600">
              <button
                onClick={() => onEdit?.(bookmark)}
                title="Edit Bookmark"
                className="p-1.5 rounded hover:bg-slate-700 text-white hover:text-amber-200 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(bookmark.id)}
                title="Delete Bookmark"
                className="p-1.5 rounded hover:bg-slate-700 text-white hover:text-rose-300 transition-colors"
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
