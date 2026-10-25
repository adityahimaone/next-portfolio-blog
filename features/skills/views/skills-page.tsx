'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowUpRight,
  Plus,
  Layers,
  Unlock,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  X,
} from 'lucide-react'
import { PageHeader } from '@/features/booth/page-header'
import {
  SKILLS_SOURCE,
  installCommand,
  skillUrl,
  type RecommendedSkill,
  type SkillTag,
  type SkillsCatalog,
} from '../constants/catalogue'
import { SkillAdminModal } from '../components/skill-admin-modal'
import type { BulkSkillInput } from '../utils/bulk-parser'
import styles from '../skills.module.css'

const MAX_ROW_TAGS = 4

interface SkillsPageProps {
  initialCatalog: SkillsCatalog
}

function SkillsPageContent({ initialCatalog }: SkillsPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [catalog, setCatalog] = useState<SkillsCatalog>(initialCatalog)
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const [isAdmin, setIsAdmin] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'single' | 'bulk'>('single')
  const [editingSkill, setEditingSkill] = useState<RecommendedSkill | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<RecommendedSkill | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const tagsBySlug = useMemo(() => {
    const map = new Map<string, SkillTag>()
    for (const tag of catalog.tags) map.set(tag.slug, tag)
    return map
  }, [catalog.tags])

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const skill of catalog.skills) {
      for (const tag of skill.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return counts
  }, [catalog.skills])

  const totalSkills = catalog.skills.length
  const totalInstalled = useMemo(
    () => catalog.skills.filter((skill) => skill.installed).length,
    [catalog.skills],
  )

  const visibleSkills = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return catalog.skills.filter((skill) => {
      // Every selected tag has to be on the skill, so adding one narrows.
      if (activeTags.some((tag) => !skill.tags.includes(tag))) return false
      if (!needle) return true
      return (
        skill.name.toLowerCase().includes(needle) ||
        skill.repo.toLowerCase().includes(needle) ||
        skill.description.toLowerCase().includes(needle)
      )
    })
  }, [catalog.skills, activeTags, query])

  // Check admin access via URL parameter or cookie session
  useEffect(() => {
    const adminParam =
      searchParams.get('admin') === '1' ||
      (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('admin') === '1')

    if (adminParam) {
      setIsAdmin(true)
      if (typeof fetch === 'function') {
        fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'activate_admin' }),
        }).catch(() => {})
      }
      return
    }

    if (typeof fetch === 'function') {
      fetch('/api/skills?check_auth=1')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsAdmin(true)
          }
        })
        .catch(() => {})
    }
  }, [searchParams])

  // Hide dock when delete confirmation is open
  useEffect(() => {
    if (!deleteTarget) return
    document.body.dataset.bookmarkModal = 'open'
    document.body.dataset.modalOpen = 'true'
    return () => {
      delete document.body.dataset.bookmarkModal
      delete document.body.dataset.modalOpen
    }
  }, [deleteTarget])

  const toggleTag = (slug: string) => {
    setActiveTags((current) =>
      current.includes(slug)
        ? current.filter((tag) => tag !== slug)
        : [...current, slug],
    )
  }

  const clearFilters = () => {
    setActiveTags([])
    setQuery('')
  }

  const refreshCatalog = async () => {
    const refreshed = await fetch('/api/skills').then((r) => r.json())
    if (refreshed.catalog) setCatalog(refreshed.catalog)
  }

  const handleLockAdmin = async () => {
    try {
      await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
    } catch {}
    setIsAdmin(false)
    setIsModalOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('admin')
    router.replace(url.pathname)
  }

  const handleSaveSkill = async (
    skillData: RecommendedSkill & { owner?: string },
    oldKey?: { name: string; repo: string },
  ) => {
    try {
      const isEditing = Boolean(oldKey)
      const res = await fetch('/api/skills', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing
            ? {
                oldName: oldKey?.name,
                oldRepo: oldKey?.repo,
                ...skillData,
              }
            : skillData,
        ),
      })
      const data = await res.json()
      if (data.success) {
        await refreshCatalog()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleSaveBulkSkills = async (skillsToIngest: BulkSkillInput[]) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          skills: skillsToIngest,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshCatalog()
        return { success: true, count: data.count || skillsToIngest.length }
      }
      return { success: false, count: 0, error: data.message }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest skills'
      return { success: false, count: 0, error: msg }
    }
  }

  const handleDeleteSkill = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/skills', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deleteTarget.name,
          repo: deleteTarget.repo,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshCatalog()
        setDeleteTarget(null)
      }
    } catch {}
    setIsDeleting(false)
  }

  const filtersActive = activeTags.length > 0 || query.trim().length > 0

  return (
    <main className={styles.page} id="main-content">
      <PageHeader
        index="04"
        eyebrow="Skills"
        title="Skills worth installing."
        description="The whole ui-skills.com directory in one place, tagged the way that site tags it: filter by what a skill is for, then read the ones that earn their place."
        hint={
          <>
            <ArrowUpRight size={14} aria-hidden="true" />
            {totalSkills} listed · {totalInstalled} in use
          </>
        }
      />

      <div className={styles.body}>
        {/* Admin Management Bar */}
        {isAdmin && (
          <div
            className={styles.adminBar}
            role="region"
            aria-label="Skill management"
          >
            <div className={styles.adminBarStatus}>
              <span className={styles.adminLed} aria-hidden="true" />
              <div className={styles.adminStatusGroup}>
                <span className={styles.adminStatusTitle}>
                  ADMIN BUS // SKILL MANAGEMENT
                </span>
                <span className={styles.adminStatusSub}>
                  CATALOGUE RW UNLOCKED
                </span>
              </div>
            </div>

            <div className={styles.adminBarActions}>
              <button
                type="button"
                onClick={() => {
                  setEditingSkill(null)
                  setModalTab('single')
                  setIsModalOpen(true)
                }}
                className={`${styles.adminButton} ${styles.solidButton}`}
              >
                <Plus size={15} aria-hidden="true" />
                Add Skill
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSkill(null)
                  setModalTab('bulk')
                  setIsModalOpen(true)
                }}
                className={`${styles.adminButton} ${styles.bulkButton}`}
              >
                <Layers size={14} aria-hidden="true" />
                Bulk Ingest
              </button>
              <button
                type="button"
                onClick={handleLockAdmin}
                className={styles.adminButton}
                title="Lock the management bus"
              >
                <Unlock size={14} aria-hidden="true" />
                Lock
              </button>
            </div>
          </div>
        )}

        <p className={styles.source}>
          <span>
            Every entry is tagged with its own topics from the directory.
          </span>
          <a
            href={SKILLS_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            ui-skills.com
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </p>

        {/* Filter bench */}
        <div className={styles.filters}>
          <div className={styles.searchRow}>
            <Search
              size={15}
              aria-hidden="true"
              className={styles.searchIcon}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.search}
              placeholder="Search by name, repo, or what it does…"
              aria-label="Search skills"
            />
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className={styles.clearButton}
              >
                <X size={13} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          <div
            className={styles.chipRail}
            role="group"
            aria-label="Filter by tag"
          >
            <button
              type="button"
              onClick={clearFilters}
              aria-pressed={activeTags.length === 0}
              className={`${styles.chip} ${styles.chipAll} ${
                activeTags.length === 0 ? styles.chipActive : ''
              }`}
            >
              All
              <span className={styles.chipCount}>{totalSkills}</span>
            </button>
            {catalog.tags.map((tag) => {
              const active = activeTags.includes(tag.slug)
              return (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  aria-pressed={active}
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  style={{ ['--tag' as string]: tag.hue }}
                >
                  {tag.label}
                  <span className={styles.chipCount}>
                    {tagCounts.get(tag.slug) ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          <p className={styles.filterStatus} aria-live="polite">
            Showing <strong>{visibleSkills.length}</strong> of {totalSkills}
            {activeTags.length > 1 && ' · matching every selected tag'}
            {activeTags.length === 1 &&
              ` · tagged ${tagsBySlug.get(activeTags[0])?.label}`}
          </p>
        </div>

        {visibleSkills.length === 0 ? (
          <p className={styles.empty}>
            No skill in the directory matches that. Remove a tag or clear the
            search.
          </p>
        ) : (
          <ul className={styles.rowList}>
            {visibleSkills.map((skill, index) => {
              const lead = tagsBySlug.get(skill.tags[0])
              const shown = skill.tags.slice(0, MAX_ROW_TAGS)
              const overflow = skill.tags.length - shown.length
              return (
                <li key={`${skill.repo}/${skill.name}`}>
                  <a
                    href={skillUrl(skill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={installCommand(skill)}
                    className={styles.row}
                    data-admin={isAdmin ? 'true' : undefined}
                    style={{ ['--led' as string]: lead?.hue }}
                  >
                    <span className={styles.num}>{index + 1}</span>

                    <span className={styles.name}>
                      <span className={styles.nameText}>
                        <span className={styles.nameLabel}>{skill.name}</span>
                        {skill.installed && (
                          <span className={styles.installed}>In use</span>
                        )}
                      </span>
                      <span className={styles.repo}>{skill.repo}</span>
                      <span className={styles.desc}>{skill.description}</span>
                      <span className={styles.tagRow}>
                        {shown.map((slug) => {
                          const tag = tagsBySlug.get(slug)
                          if (!tag) return null
                          return (
                            <span
                              key={slug}
                              className={styles.tag}
                              style={{ ['--tag' as string]: tag.hue }}
                            >
                              {tag.label}
                            </span>
                          )
                        })}
                        {overflow > 0 && (
                          <span className={styles.tagOverflow}>
                            +{overflow}
                          </span>
                        )}
                      </span>
                    </span>

                    {isAdmin && (
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingSkill(skill)
                            setModalTab('single')
                            setIsModalOpen(true)
                          }}
                          className={styles.rowAction}
                          title={`Edit ${skill.name}`}
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Edit2 size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeleteTarget(skill)
                          }}
                          className={`${styles.rowAction} ${styles.rowActionDelete}`}
                          title={`Delete ${skill.name}`}
                          aria-label={`Delete ${skill.name}`}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    <ArrowUpRight
                      size={14}
                      className={styles.arrow}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              )
            })}
          </ul>
        )}

        <p className={styles.footNote}>
          Install any of them with{' '}
          <code className={styles.footCode}>
            npx skills add https://github.com/&lt;owner&gt;/&lt;repo&gt; --skill
            &lt;name&gt;
          </code>
          . Hover a row for the exact command.
        </p>
      </div>

      {/* Admin Add/Edit/Bulk Modal */}
      <SkillAdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSkill(null)
        }}
        isAdmin={isAdmin}
        onLoginSuccess={() => setIsAdmin(true)}
        editingSkill={editingSkill}
        tags={catalog.tags}
        onSaveSkill={handleSaveSkill}
        onSaveBulkSkills={handleSaveBulkSkills}
        initialTab={modalTab}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className={styles.dialogBackdrop}
          onClick={() => setDeleteTarget(null)}
          role="presentation"
        >
          <div
            className={`${styles.modal} ${styles.confirmModal}`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-skill-title"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#ef4444',
                marginBottom: '0.5rem',
              }}
            >
              <AlertTriangle size={18} aria-hidden="true" />
              <h3
                id="confirm-delete-skill-title"
                className={styles.confirmTitle}
              >
                Remove Skill
              </h3>
            </div>
            <p className={styles.confirmText}>
              Are you sure you want to remove{' '}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.repo}) from
              the catalogue? This will immediately update the published skills.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={styles.ghost}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSkill}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Delete Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export function SkillsPage(props: SkillsPageProps) {
  return (
    <Suspense fallback={null}>
      <SkillsPageContent {...props} />
    </Suspense>
  )
}
