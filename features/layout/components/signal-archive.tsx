'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { waveformBars } from '@/components/waveform-data'
import styles from './signal-archive.module.css'

type ArchiveSection = 'projects' | 'bookmarks' | 'blog'

interface SignalArchiveHeaderProps {
  label: string
  title: string
  description: string
  activeSection: ArchiveSection
  aside?: ReactNode
  /**
   * Number of items on the page. The timeline waveform is generated from it,
   * so the trace reports the size of the archive rather than decorating (design.md §0.0).
   */
  meterCount?: number
}

const sections: Array<{
  id: ArchiveSection
  href: string
  label: string
  /** Position of this section within the 01/02/03 sequence. */
  playhead: number
}> = [
  { id: 'projects', href: '/projects', label: 'Projects', playhead: 0.18 },
  { id: 'bookmarks', href: '/bookmarks', label: 'Bookmarks', playhead: 0.5 },
  { id: 'blog', href: '/blog', label: 'Blog', playhead: 0.82 },
]

export function SignalArchiveHeader({
  label,
  title,
  description,
  activeSection,
  aside,
  meterCount = 12,
}: SignalArchiveHeaderProps) {
  const { isPlaying } = useAudio()
  const active = sections.find((s) => s.id === activeSection) ?? sections[0]
  // The bar count stays high enough to read as a trace; the seed carries the
  // page's own item count so the shape still reports the archive's size.
  const bars = waveformBars(`${activeSection}:${meterCount}`, 48, {
    maxHeight: 0.92,
    minHeight: 0.14,
  })

  return (
    <header className={styles.header}>
      <div className={styles.transport}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>AH Studio</span>
        </Link>
        <nav className={styles.nav} aria-label="Archive sections">
          {sections.map((section, index) => (
            <Link
              key={section.id}
              href={section.href}
              className={styles.navLink}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {section.label}
            </Link>
          ))}
        </nav>
        <span className={styles.rec} data-live={isPlaying || undefined}>
          <span className={styles.recLed} aria-hidden="true" />
          <span className="silkscreen">Rec</span>
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.copy}>
          <span className={styles.label}>{label}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        {aside ? (
          <div className={styles.aside}>{aside}</div>
        ) : (
          <div
            className={styles.record}
            data-spinning={isPlaying || undefined}
            aria-hidden="true"
          >
            <span />
          </div>
        )}
      </div>

      <div
        className={styles.timeline}
        aria-hidden="true"
        style={{
          ['--playhead' as string]: `${Math.round(active.playhead * 100)}%`,
        }}
      >
        <span className={styles.playhead} />
        <div className={styles.waveform}>
          {bars.map((height, index) => (
            <span
              key={index}
              style={{
                ['--h' as string]: `${height}%`,
                ['--i' as string]: index,
              }}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
