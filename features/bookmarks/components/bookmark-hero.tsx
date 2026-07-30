'use client'

import Link from 'next/link'
import { ArrowLeft, Lock, Unlock, Plus, Bookmark as BookmarkIcon, Sparkles } from 'lucide-react'
import { Bookmark } from '../types'

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
    <div className="mb-10 pt-4">
      {/* Back to Home Link (matches Projects Page) */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-400 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors font-medium"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="font-mono text-xs font-semibold tracking-wider text-amber-400 uppercase">
              CURATED DIRECTORY & RESOURCES
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-400">
            Bookmarks
          </h1>
          <p className="mt-2 text-base text-zinc-400 max-w-2xl">
            A hand-picked collection of developer tools, interactive UI design inspirations, AI platforms, audio tech, and essential documentation.
          </p>
        </div>

        {/* Stats Summary & Admin Control */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2 font-mono text-xs text-zinc-300">
            <span className="text-amber-400 font-bold">{bookmarks.length}</span> Total
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-bold">{totalCategories}</span> Categories
            <span className="text-zinc-600">•</span>
            <span className="text-purple-400 font-bold flex items-center gap-1">
              {featuredCount} <Sparkles className="h-3 w-3 inline text-purple-400" />
            </span>
          </div>

          {/* Admin Action Button */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdminModal}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add Bookmark
              </button>
              <button
                onClick={onToggleAdminLogin}
                title="Admin Logged In (Click to lock)"
                className="p-2 rounded-lg border border-emerald-500/50 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 transition-all text-xs flex items-center gap-1.5 font-mono"
              >
                <Unlock className="h-4 w-4" />
                <span>adityahimaone</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleAdminLogin}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-all hover:text-white"
            >
              <Lock className="h-3.5 w-3.5" />
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
