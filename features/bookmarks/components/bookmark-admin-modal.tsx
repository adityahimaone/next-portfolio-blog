'use client'

import { useState, useEffect } from 'react'
import type { Bookmark, BookmarkFormData } from '../types'
import { CHANNEL_CATEGORIES } from '../constants/categories'
import { extractDomain, getFaviconUrl } from '../utils/favicon'
import { X, Lock, Save, AlertCircle } from 'lucide-react'
import styles from '../library.module.css'

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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

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
                ? 'Edit bookmark'
                : 'Add bookmark'}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  placeholder="Next.js docs"
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
        )}
      </div>
    </div>
  )
}
