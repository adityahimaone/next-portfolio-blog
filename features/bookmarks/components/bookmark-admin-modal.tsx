'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Bookmark, BookmarkFormData, BulkBookmarkInput } from '../types'
import { CHANNEL_CATEGORIES } from '../constants/categories'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { parseBulkBookmarks } from '../utils/bulk-parser'
import {
  X,
  Lock,
  Save,
  AlertCircle,
  FilePlus,
  Layers,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import styles from '../library.module.css'

interface BookmarkAdminModalProps {
  isOpen: boolean
  onClose: () => void
  isAdmin: boolean
  onLoginSuccess: () => void
  editingBookmark?: Bookmark | null
  onSaveBookmark: (formData: BookmarkFormData, id?: string) => Promise<boolean>
  onSaveBulkBookmarks?: (
    bookmarks: BulkBookmarkInput[],
  ) => Promise<{ success: boolean; count: number; error?: string }>
  initialTab?: 'single' | 'bulk'
}

export function BookmarkAdminModal({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  editingBookmark,
  onSaveBookmark,
  onSaveBulkBookmarks,
  initialTab = 'single',
}: BookmarkAdminModalProps) {
  const [tab, setTab] = useState<'single' | 'bulk'>(initialTab)

  // Login states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Single bookmark form states
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Dev Tools')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)
  const [customFaviconUrl, setCustomFaviconUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Bulk bookmark states
  const [bulkInput, setBulkInput] = useState('')
  const [bulkCategory, setBulkCategory] = useState<string>('Dev Tools')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [bulkMessage, setBulkMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Real-time parsed bulk bookmarks
  const parsedBulkItems = useMemo(() => {
    return parseBulkBookmarks(bulkInput, bulkCategory)
  }, [bulkInput, bulkCategory])

  useEffect(() => {
    if (editingBookmark) {
      setTab('single')
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
    setBulkMessage(null)
  }, [editingBookmark, isOpen])

  if (!isOpen) return null

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
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
      setLoginError('Failed to connect to the authentication route')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSaveSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !url.trim()) {
      setFormError('Title and URL are required')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const success = await onSaveBookmark(
      { title, url, description, category, tags, featured, customFaviconUrl },
      editingBookmark?.id,
    )

    setIsSubmitting(false)
    if (success) {
      onClose()
    } else {
      setFormError('Could not save this bookmark. Try again.')
    }
  }

  const handleBulkSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (parsedBulkItems.length === 0) {
      setBulkMessage({
        type: 'error',
        text: 'Please enter at least one valid URL or bookmark entry.',
      })
      return
    }

    if (!onSaveBulkBookmarks) {
      setBulkMessage({
        type: 'error',
        text: 'Bulk bookmark handler is unavailable.',
      })
      return
    }

    setIsBulkSubmitting(true)
    setBulkMessage(null)

    try {
      const result = await onSaveBulkBookmarks(parsedBulkItems)
      if (result.success) {
        setBulkMessage({
          type: 'success',
          text: `Successfully imported ${result.count} bookmarks!`,
        })
        setBulkInput('')
      } else {
        setBulkMessage({
          type: 'error',
          text: result.error || 'Failed to import bulk bookmarks.',
        })
      }
    } catch {
      setBulkMessage({
        type: 'error',
        text: 'An unexpected error occurred during bulk import.',
      })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const liveDomain = url ? extractDomain(url) : 'example.com'
  const liveFavicon = url ? getFaviconUrl(url, customFaviconUrl) : ''

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <div
        className={`${styles.modal} glass`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} id="bookmark-modal-title">
            {isAdmin ? (
              <Save size={18} aria-hidden="true" />
            ) : (
              <Lock size={18} aria-hidden="true" />
            )}
            {!isAdmin
              ? 'Admin sign-in required'
              : editingBookmark
                ? `Edit bookmark`
                : 'Bookmark Management'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.modalClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!isAdmin ? (
          <form onSubmit={handleLoginSubmit}>
            <p className={styles.modalHint}>
              Enter administrator credentials to unlock bookmark controls.
            </p>

            {loginError && (
              <p className={styles.error}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>{loginError}</span>
              </p>
            )}

            <div className={styles.field}>
              <label
                className={`${styles.fieldLabel} silkscreen`}
                htmlFor="bm-user"
              >
                Username
              </label>
              <input
                id="bm-user"
                type="text"
                required
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label
                className={`${styles.fieldLabel} silkscreen`}
                htmlFor="bm-pass"
              >
                Password
              </label>
              <input
                id="bm-pass"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="submit"
                className={styles.submit}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Signing in…' : 'Unlock admin panel'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {!editingBookmark && (
              <div className={styles.adminTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'single'}
                  onClick={() => setTab('single')}
                  className={`${styles.adminTab} ${
                    tab === 'single' ? styles.adminTabActive : ''
                  }`}
                >
                  <FilePlus size={14} aria-hidden="true" />
                  Single Bookmark
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'bulk'}
                  onClick={() => setTab('bulk')}
                  className={`${styles.adminTab} ${
                    tab === 'bulk' ? styles.adminTabActive : ''
                  }`}
                >
                  <Layers size={14} aria-hidden="true" />
                  Bulk Import
                </button>
              </div>
            )}

            {tab === 'single' ? (
              <form onSubmit={handleSaveSubmit}>
                {formError && (
                  <p className={styles.error}>
                    <AlertCircle size={16} aria-hidden="true" />
                    <span>{formError}</span>
                  </p>
                )}

                {url && (
                  <div className={styles.preview}>
                    <div className={styles.previewValue}>
                      <div className={`${styles.previewLabel} silkscreen`}>
                        Host
                      </div>
                      <div>{liveDomain}</div>
                    </div>
                    <img
                      src={liveFavicon}
                      alt=""
                      width={24}
                      height={24}
                      onError={(event) => {
                        ;(event.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label
                      className={`${styles.fieldLabel} silkscreen`}
                      htmlFor="bm-title"
                    >
                      Title
                    </label>
                    <input
                      id="bm-title"
                      type="text"
                      required
                      placeholder="e.g. Three.js"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label
                      className={`${styles.fieldLabel} silkscreen`}
                      htmlFor="bm-url"
                    >
                      URL
                    </label>
                    <input
                      id="bm-url"
                      type="url"
                      required
                      placeholder="https://…"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label
                      className={`${styles.fieldLabel} silkscreen`}
                      htmlFor="bm-category"
                    >
                      Channel
                    </label>
                    <select
                      id="bm-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className={styles.input}
                    >
                      {CHANNEL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label
                      className={`${styles.fieldLabel} silkscreen`}
                      htmlFor="bm-tags"
                    >
                      Tags
                    </label>
                    <input
                      id="bm-tags"
                      type="text"
                      placeholder="React, Frontend, Audio"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label
                    className={`${styles.fieldLabel} silkscreen`}
                    htmlFor="bm-desc"
                  >
                    Description
                  </label>
                  <textarea
                    id="bm-desc"
                    rows={3}
                    placeholder="Why this resource is useful"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label
                    className={`${styles.fieldLabel} silkscreen`}
                    htmlFor="bm-favicon"
                  >
                    Custom favicon URL
                  </label>
                  <input
                    id="bm-favicon"
                    type="text"
                    placeholder="Leave empty to use the host favicon"
                    value={customFaviconUrl}
                    onChange={(event) => setCustomFaviconUrl(event.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.checkRow}>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(event) => setFeatured(event.target.checked)}
                    />
                    Featured
                  </label>

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={onClose}
                      className={styles.ghost}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? 'Saving…'
                        : editingBookmark
                          ? 'Update bookmark'
                          : 'Save bookmark'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit}>
                <div className={styles.bulkHint}>
                  Paste URLs one per line, pipe-separated (
                  <span className={styles.codeExample}>url | title | channel</span>
                  ), or a JSON array of bookmarks.
                </div>

                {bulkMessage && (
                  <p
                    className={
                      bulkMessage.type === 'error'
                        ? styles.error
                        : styles.preview
                    }
                    style={
                      bulkMessage.type === 'success'
                        ? { color: 'var(--primary)', borderColor: 'var(--primary)' }
                        : undefined
                    }
                  >
                    {bulkMessage.type === 'error' ? (
                      <AlertCircle size={16} aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={16} aria-hidden="true" />
                    )}
                    <span>{bulkMessage.text}</span>
                  </p>
                )}

                <div className={styles.field}>
                  <label
                    className={`${styles.fieldLabel} silkscreen`}
                    htmlFor="bulk-category"
                  >
                    Default Channel for pasted items
                  </label>
                  <select
                    id="bulk-category"
                    value={bulkCategory}
                    onChange={(event) => setBulkCategory(event.target.value)}
                    className={styles.input}
                  >
                    {CHANNEL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <div className={styles.bulkSummary}>
                    <label
                      className={`${styles.fieldLabel} silkscreen`}
                      htmlFor="bulk-textarea"
                    >
                      Bulk Entries
                    </label>
                    <span className={styles.badge}>
                      <Sparkles size={11} aria-hidden="true" />
                      {parsedBulkItems.length}{' '}
                      {parsedBulkItems.length === 1 ? 'entry' : 'entries'}{' '}
                      detected
                    </span>
                  </div>
                  <textarea
                    id="bulk-textarea"
                    rows={7}
                    placeholder={`https://threejs.org | Three.js | 3D
https://motion.dev | Motion | Motion
https://lucide.dev`}
                    value={bulkInput}
                    onChange={(event) => setBulkInput(event.target.value)}
                    className={styles.input}
                    style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                  />
                </div>

                {parsedBulkItems.length > 0 && (
                  <div>
                    <div
                      className={`${styles.fieldLabel} silkscreen`}
                      style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}
                    >
                      Preview (first {Math.min(parsedBulkItems.length, 5)})
                    </div>
                    <div className={styles.bulkPreviewList}>
                      {parsedBulkItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className={styles.bulkPreviewItem}>
                          <span className={styles.bulkPreviewTitle}>
                            {item.title || item.url}
                          </span>
                          <span className={styles.bulkPreviewCategory}>
                            {item.category}
                          </span>
                        </div>
                      ))}
                      {parsedBulkItems.length > 5 && (
                        <div
                          style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--booth-ink-dim)',
                            paddingTop: '0.2rem',
                          }}
                        >
                          + {parsedBulkItems.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.modalActions} style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.ghost}
                  >
                    Cancel
                  </button>
                  {bulkInput && (
                    <button
                      type="button"
                      onClick={() => setBulkInput('')}
                      className={styles.ghost}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={
                      isBulkSubmitting || parsedBulkItems.length === 0
                    }
                  >
                    {isBulkSubmitting
                      ? 'Importing…'
                      : `Import ${parsedBulkItems.length} Bookmarks`}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
