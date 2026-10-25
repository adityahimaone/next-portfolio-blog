'use client'

import { useState, useEffect, useMemo } from 'react'
import type { RecommendedSkill, SkillTag } from '../constants/catalogue'
import { parseBulkSkills, type BulkSkillInput } from '../utils/bulk-parser'
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
import styles from '../skills.module.css'

interface SkillAdminModalProps {
  isOpen: boolean
  onClose: () => void
  isAdmin: boolean
  onLoginSuccess: () => void
  editingSkill?: (RecommendedSkill & { owner?: string }) | null
  tags: SkillTag[]
  onSaveSkill: (
    skill: RecommendedSkill & { owner?: string },
    oldKey?: { name: string; repo: string },
  ) => Promise<boolean>
  onSaveBulkSkills?: (
    skills: BulkSkillInput[],
  ) => Promise<{ success: boolean; count: number; error?: string }>
  initialTab?: 'single' | 'bulk'
}

export function SkillAdminModal({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  editingSkill,
  tags,
  onSaveSkill,
  onSaveBulkSkills,
  initialTab = 'single',
}: SkillAdminModalProps) {
  const [tab, setTab] = useState<'single' | 'bulk'>(initialTab)

  // Login states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Single skill form states
  const [name, setName] = useState('')
  const [repo, setRepo] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [installed, setInstalled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Bulk skill states
  const [bulkInput, setBulkInput] = useState('')
  const [bulkTags, setBulkTags] = useState<string[]>([])
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [bulkMessage, setBulkMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const parsedBulkItems = useMemo(() => {
    return parseBulkSkills(bulkInput, bulkTags)
  }, [bulkInput, bulkTags])

  useEffect(() => {
    if (editingSkill) {
      setTab('single')
      setName(editingSkill.name)
      setRepo(editingSkill.repo)
      setDescription(editingSkill.description || '')
      setSelectedTags(editingSkill.tags || [])
      setInstalled(Boolean(editingSkill.installed))
    } else {
      setName('')
      setRepo('')
      setDescription('')
      setSelectedTags([])
      setInstalled(false)
    }
    setFormError('')
    setLoginError('')
    setBulkMessage(null)
  }, [editingSkill, isOpen])

  // Dismiss bottom dock while modal is open
  useEffect(() => {
    if (!isOpen) return

    document.body.dataset.bookmarkModal = 'open'
    document.body.dataset.modalOpen = 'true'
    return () => {
      delete document.body.dataset.bookmarkModal
      delete document.body.dataset.modalOpen
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleTag = (
    slug: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(slug)
        ? current.filter((tag) => tag !== slug)
        : [...current, slug],
    )
  }

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')

    try {
      const res = await fetch('/api/skills', {
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
    if (!name.trim() || !repo.trim()) {
      setFormError('Skill name and GitHub repo (owner/repo) are required')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const success = await onSaveSkill(
      {
        name: name.trim(),
        repo: repo.trim(),
        description: description.trim(),
        tags: selectedTags,
        installed,
      },
      editingSkill
        ? { name: editingSkill.name, repo: editingSkill.repo }
        : undefined,
    )

    setIsSubmitting(false)
    if (success) {
      onClose()
    } else {
      setFormError('Could not save this skill. Try again.')
    }
  }

  const handleBulkSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (parsedBulkItems.length === 0) {
      setBulkMessage({
        type: 'error',
        text: 'Please enter at least one valid skill definition',
      })
      return
    }

    if (!onSaveBulkSkills) {
      setBulkMessage({
        type: 'error',
        text: 'Bulk skill ingest is not supported',
      })
      return
    }

    setIsBulkSubmitting(true)
    setBulkMessage(null)

    try {
      const res = await onSaveBulkSkills(parsedBulkItems)
      if (res.success) {
        setBulkMessage({
          type: 'success',
          text: `Successfully ingested ${res.count} skill${res.count === 1 ? '' : 's'}`,
        })
        setBulkInput('')
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        setBulkMessage({
          type: 'error',
          text: res.error || 'Failed to ingest bulk skills',
        })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error during bulk submission'
      setBulkMessage({ type: 'error', text: message })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  return (
    <div
      className={styles.dialogBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-modal-title"
      >
        <span
          className={`${styles.chassisScrew} ${styles.chassisScrewTL}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.chassisScrew} ${styles.chassisScrewTR}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.chassisScrew} ${styles.chassisScrewBL}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.chassisScrew} ${styles.chassisScrewBR}`}
          aria-hidden="true"
        />

        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalMeta}>
              <span>ADMIN BUS // SKILL CATALOGUE</span>
            </div>
            <h2 id="skill-modal-title" className={styles.modalTitle}>
              {isAdmin ? (
                editingSkill ? (
                  <>Edit Skill</>
                ) : tab === 'bulk' ? (
                  <>Bulk Ingest Skills</>
                ) : (
                  <>Add New Skill</>
                )
              ) : (
                <>
                  <Lock size={16} aria-hidden="true" />
                  Skill Management Login
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.modalClose}
            aria-label="Close modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {!isAdmin ? (
          <form onSubmit={handleLoginSubmit}>
            <p className={styles.modalHint}>
              Enter admin credentials to add, edit, or remove skills.
            </p>

            {loginError && (
              <div className={styles.error} role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="admin-user" className={styles.fieldLabel}>
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-pass" className={styles.fieldLabel}>
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.ghost}
                disabled={isLoggingIn}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submit}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Verifying...' : 'Unlock Panel'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {!editingSkill && (
              <div
                className={styles.adminTabs}
                role="tablist"
                aria-label="Ingest mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'single'}
                  onClick={() => setTab('single')}
                  className={`${styles.adminTab} ${tab === 'single' ? styles.adminTabActive : ''}`}
                >
                  <FilePlus size={14} aria-hidden="true" />
                  <span>Single Skill</span>
                  {tab === 'single' && (
                    <span className={styles.tabPip} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'bulk'}
                  onClick={() => setTab('bulk')}
                  className={`${styles.adminTab} ${tab === 'bulk' ? styles.adminTabActive : ''}`}
                >
                  <Layers size={14} aria-hidden="true" />
                  <span>Bulk Ingest</span>
                  {tab === 'bulk' && (
                    <span className={styles.tabPip} aria-hidden="true" />
                  )}
                </button>
              </div>
            )}

            {tab === 'single' ? (
              <form onSubmit={handleSaveSubmit}>
                {formError && (
                  <div className={styles.error} role="alert">
                    <AlertCircle size={16} aria-hidden="true" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label htmlFor="skill-name" className={styles.fieldLabel}>
                      Skill Name *
                    </label>
                    <input
                      id="skill-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.input}
                      placeholder="e.g. emil-design-eng"
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="skill-repo" className={styles.fieldLabel}>
                      GitHub Repo *
                    </label>
                    <input
                      id="skill-repo"
                      type="text"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      className={styles.input}
                      placeholder="e.g. owner/repo"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="skill-desc" className={styles.fieldLabel}>
                    Description
                  </label>
                  <textarea
                    id="skill-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.input}
                    placeholder="Brief description of the skill and what it does..."
                    rows={2}
                  />
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Tags ({selectedTags.length} selected)
                  </span>
                  <div className={styles.tagPicker}>
                    {tags.map((tag) => {
                      const active = selectedTags.includes(tag.slug)
                      return (
                        <label
                          key={tag.slug}
                          className={`${styles.tagOption} ${active ? styles.tagOptionActive : ''}`}
                          style={{ ['--tag' as string]: tag.hue }}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() =>
                              toggleTag(tag.slug, selectedTags, setSelectedTags)
                            }
                          />
                          <span>{tag.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.checkRow}>
                  <label className={styles.tactileCheck}>
                    <input
                      type="checkbox"
                      checked={installed}
                      onChange={(e) => setInstalled(e.target.checked)}
                    />
                    <span className={styles.tactileCheckLabel}>
                      Mark as installed in this workspace (&quot;In use&quot;)
                    </span>
                  </label>
                </div>

                <div
                  className={styles.modalActions}
                  style={{ marginTop: '1.25rem' }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.ghost}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={isSubmitting}
                  >
                    <Save size={14} aria-hidden="true" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Skill'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit}>
                <p className={styles.bulkHint}>
                  Paste skills line-by-line using{' '}
                  <span className={styles.codeExample}>
                    name | repo | tag1,tag2 | description
                  </span>
                  , or paste a ui-skills.com URL, or a raw JSON array.
                </p>

                {bulkMessage && (
                  <div
                    className={
                      bulkMessage.type === 'error'
                        ? styles.error
                        : styles.preview
                    }
                    role="alert"
                  >
                    {bulkMessage.type === 'error' ? (
                      <AlertCircle size={16} aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={16} aria-hidden="true" />
                    )}
                    <span>{bulkMessage.text}</span>
                  </div>
                )}

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Fallback Tags ({bulkTags.length} selected)
                  </span>
                  <div className={styles.tagPicker}>
                    {tags.map((tag) => {
                      const active = bulkTags.includes(tag.slug)
                      return (
                        <label
                          key={tag.slug}
                          className={`${styles.tagOption} ${active ? styles.tagOptionActive : ''}`}
                          style={{ ['--tag' as string]: tag.hue }}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() =>
                              toggleTag(tag.slug, bulkTags, setBulkTags)
                            }
                          />
                          <span>{tag.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="bulk-skills" className={styles.fieldLabel}>
                    Skill Definitions
                  </label>
                  <textarea
                    id="bulk-skills"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className={styles.input}
                    placeholder={`my-skill | owner/skills | motion,interaction | What it does\nhttps://www.ui-skills.com/skills/emilkowalski/animate`}
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                  />
                </div>

                {parsedBulkItems.length > 0 && (
                  <div>
                    <div className={styles.bulkSummary}>
                      <span className={styles.badge}>
                        <Sparkles size={12} aria-hidden="true" />
                        {parsedBulkItems.length} valid skill
                        {parsedBulkItems.length === 1 ? '' : 's'} detected
                      </span>
                    </div>

                    <div className={styles.bulkPreviewList}>
                      {parsedBulkItems.map((item, idx) => (
                        <div key={idx} className={styles.bulkPreviewItem}>
                          <span className={styles.bulkPreviewTitle}>
                            {item.name} ({item.repo})
                          </span>
                          <span className={styles.bulkPreviewCategory}>
                            {item.tags.join(', ') || 'no tags'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={styles.modalActions}
                  style={{ marginTop: '1.25rem' }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.ghost}
                    disabled={isBulkSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={isBulkSubmitting || parsedBulkItems.length === 0}
                  >
                    <Layers size={14} aria-hidden="true" />
                    <span>
                      {isBulkSubmitting
                        ? 'Ingesting...'
                        : `Ingest ${parsedBulkItems.length} Skills`}
                    </span>
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
