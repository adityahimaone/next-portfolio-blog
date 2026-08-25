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
      <div className="relative w-full max-w-lg overflow-hidden rounded-md border border-border bg-card p-6 text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            {isAdmin ? (
            <Save className="h-5 w-5 text-primary" />
            ) : (
            <Lock className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-lg font-extrabold text-foreground">
              {!isAdmin
                ? 'Admin Authorization Required'
                : editingBookmark
                ? 'Edit Bookmark'
                : 'Add New Curated Bookmark'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Login Form (If Not Authenticated) */}
        {!isAdmin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">
              Please enter your administrator credentials to access bookmark controls.
            </p>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-950/60 text-red-300 text-xs font-mono font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
            <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">USERNAME</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
            <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">PASSWORD</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-sm bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary-light disabled:opacity-50"
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
              <div className="flex items-center gap-3 rounded-sm border border-primary/40 bg-primary/10 p-3 text-xs font-mono">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background">
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
                  <div className="font-bold text-primary">PREVIEW FAVICON & DOMAIN:</div>
                  <div className="text-foreground">{liveDomain}</div>
                </div>
              </div>
            )}

            {/* Title & URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">
                  TITLE <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Docs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">
                  URL <span className="text-primary">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {BOOKMARK_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">TAGS (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Frontend, Audio"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-mono font-bold text-muted-foreground">DESCRIPTION</label>
              <textarea
                rows={3}
                placeholder="Brief summary of why this resource is useful..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Custom Favicon URL & Featured Switch */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-mono font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-0"
                />
                <span>FEATURED RESOURCE</span>
              </label>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                className="rounded-sm border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                className="rounded-sm bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-light disabled:opacity-50"
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
