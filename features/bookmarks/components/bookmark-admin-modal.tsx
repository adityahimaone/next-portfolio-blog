'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkFormData } from '../types'
import { BOOKMARK_CATEGORIES } from '../constants/categories'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { X, Lock, Key, Save, AlertCircle } from 'lucide-react'

interface BookmarkAdminModalProps {
  isOpen: boolean
  onClose: () => void
  isAdmin: boolean
  onLoginSuccess: () => void
  editingBookmark?: Bookmark | null
  onSaveBookmark: (formData: BookmarkFormData, id?: string) => Promise<boolean>
}

export function BookmarkAdminModal({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  editingBookmark,
  onSaveBookmark,
}: BookmarkAdminModalProps) {
  // Login Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Bookmark Form state
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Dev Tools')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)
  const [customFaviconUrl, setCustomFaviconUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (editingBookmark) {
      setTitle(editingBookmark.title)
      setUrl(editingBookmark.url)
      setDescription(editingBookmark.description)
      setCategory(editingBookmark.category)
      setTags(editingBookmark.tags.join(', '))
      setFeatured(Boolean(editingBookmark.featured))
      setCustomFaviconUrl(editingBookmark.faviconUrl || '')
    } else {
      setTitle('')
      setUrl('')
      setDescription('')
      setCategory('Dev Tools')
      setTags('')
      setFeatured(false)
      setCustomFaviconUrl('')
    }
    setFormError('')
    setLoginError('')
  }, [editingBookmark, isOpen])

  if (!isOpen) return null

  // Handle Admin Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      })
      const data = await res.json()

      if (data.success) {
        onLoginSuccess()
      } else {
        setLoginError(data.message || 'Invalid admin credentials')
      }
    } catch {
      setLoginError('Failed to connect to authentication server')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle Save / Add / Edit Bookmark submit
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setFormError('Title and URL are required')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const success = await onSaveBookmark(
      {
        title,
        url,
        description,
        category,
        tags,
        featured,
        customFaviconUrl,
      },
      editingBookmark?.id
    )

    setIsSubmitting(false)
    if (success) {
      onClose()
    } else {
      setFormError('Failed to save bookmark. Please try again.')
    }
  }

  const liveDomain = url ? extractDomain(url) : 'example.com'
  const liveFavicon = url ? getFaviconUrl(url, customFaviconUrl) : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Save className="h-5 w-5 text-amber-400" />
            ) : (
              <Lock className="h-5 w-5 text-amber-400" />
            )}
            <h2 className="text-lg font-extrabold text-white">
              {!isAdmin
                ? 'Admin Authorization Required'
                : editingBookmark
                ? 'Edit Bookmark'
                : 'Add New Curated Bookmark'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Login Form (If Not Authenticated) */}
        {!isAdmin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <p className="text-xs text-zinc-300 font-medium">
              Please enter your administrator credentials to access bookmark controls.
            </p>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-950/60 text-red-300 text-xs font-mono font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">USERNAME</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">PASSWORD</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 font-bold text-zinc-950 text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-50"
              >
                {isLoggingIn ? 'Authenticating...' : 'Unlock Admin Panel'}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Add/Edit Bookmark Form */
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-950/60 text-red-300 text-xs font-mono font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Favicon & Domain Preview Bar */}
            {url && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-xs font-mono">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={liveFavicon}
                    alt="Preview favicon"
                    className="h-4.5 w-4.5 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <div className="text-amber-300 font-bold">PREVIEW FAVICON & DOMAIN:</div>
                  <div className="text-zinc-200">{liveDomain}</div>
                </div>
              </div>
            )}

            {/* Title & URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  TITLE <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Docs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  URL <span className="text-amber-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {BOOKMARK_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">TAGS (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Frontend, Audio"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">DESCRIPTION</label>
              <textarea
                rows={3}
                placeholder="Brief summary of why this resource is useful..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Custom Favicon URL & Featured Switch */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-400 focus:ring-0"
                />
                <span>FEATURED RESOURCE</span>
              </label>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingBookmark
                    ? 'Update Bookmark'
                    : 'Save Bookmark'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
