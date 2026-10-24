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
} from 'lucide-react'
import { PageHeader } from '@/features/booth/page-header'
import {
  SKILL_GROUPS as DEFAULT_SKILL_GROUPS,
  SKILLS_SOURCE,
  installCommand,
  skillUrl,
  type RecommendedSkill,
  type SkillGroup,
} from '../constants/catalogue'
import { SkillAdminModal } from '../components/skill-admin-modal'
import type { BulkSkillInput } from '../utils/bulk-parser'
import styles from '../skills.module.css'

interface SkillsPageProps {
  initialGroups?: SkillGroup[]
}

function SkillsPageContent({ initialGroups }: SkillsPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [groups, setGroups] = useState<SkillGroup[]>(
    initialGroups && initialGroups.length > 0
      ? initialGroups
      : DEFAULT_SKILL_GROUPS,
  )

  const [isAdmin, setIsAdmin] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'single' | 'bulk'>('single')
  const [editingSkill, setEditingSkill] = useState<
    (RecommendedSkill & { category?: string }) | null
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<
    (RecommendedSkill & { category?: string }) | null
  >(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Derive counts from actual current groups
  const totalSkills = useMemo(
    () => groups.reduce((acc, g) => acc + g.skills.length, 0),
    [groups],
  )
  const totalInstalled = useMemo(
    () =>
      groups.reduce(
        (acc, g) => acc + g.skills.filter((s) => s.installed).length,
        0,
      ),
    [groups],
  )

  const categories = useMemo(() => groups.map((g) => g.title), [groups])

  // Sync groups if initialGroups change
  useEffect(() => {
    if (initialGroups && initialGroups.length > 0) {
      setGroups(initialGroups)
    }
  }, [initialGroups])

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
    skillData: RecommendedSkill & { category: string },
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
        const refreshed = await fetch('/api/skills').then((r) => r.json())
        if (refreshed.groups) {
          setGroups(refreshed.groups)
        }
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
        const refreshed = await fetch('/api/skills').then((r) => r.json())
        if (refreshed.groups) {
          setGroups(refreshed.groups)
        }
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
        const refreshed = await fetch('/api/skills').then((r) => r.json())
        if (refreshed.groups) {
          setGroups(refreshed.groups)
        }
        setDeleteTarget(null)
      }
    } catch {}
    setIsDeleting(false)
  }

  return (
    <main className={styles.page} id="main-content">
      <PageHeader
        index="04"
        eyebrow="Skills"
        title="Skills worth installing."
        description="Agent skills I have actually run, plus the ones from the directory that are worth the install. Grouped by what they are for."
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
          <span>Sourced from the agent skills directory.</span>
          <a
            href={SKILLS_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            skills.sh
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </p>

        {groups.map((group) => (
          <section
            key={group.title}
            className={styles.group}
            style={{ ['--led' as string]: group.hue }}
          >
            <div className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <span className={styles.groupCount}>
                {group.skills.length} skills
              </span>
            </div>

            <ul className={styles.rowList}>
              {group.skills.map((skill, index) => (
                <li key={`${skill.repo}/${skill.name}`}>
                  <a
                    href={skillUrl(skill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={installCommand(skill)}
                    className={styles.row}
                    data-admin={isAdmin ? 'true' : undefined}
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
                    </span>

                    <span className={styles.meta}>
                      <span className={styles.installs}>
                        {skill.installs} installs
                      </span>
                    </span>

                    {isAdmin && (
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingSkill({ ...skill, category: group.title })
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
                            setDeleteTarget({ ...skill, category: group.title })
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
              ))}
            </ul>
          </section>
        ))}

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
        categories={categories}
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
              <h3 id="confirm-delete-skill-title" className={styles.confirmTitle}>
                Remove Skill
              </h3>
            </div>
            <p className={styles.confirmText}>
              Are you sure you want to remove{' '}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.repo}) from the{' '}
              <em>{deleteTarget.category}</em> catalogue? This will immediately
              update the published skills.
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
