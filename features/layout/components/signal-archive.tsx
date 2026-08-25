import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './signal-archive.module.css'

type ArchiveSection = 'projects' | 'bookmarks' | 'blog'

interface SignalArchiveHeaderProps {
  label: string
  title: string
  description: string
  activeSection: ArchiveSection
  aside?: ReactNode
}

export function SignalArchiveHeader({
  label,
  title,
  description,
  activeSection,
  aside,
}: SignalArchiveHeaderProps) {
  const sections: Array<{ id: ArchiveSection; href: string; label: string }> = [
    { id: 'projects', href: '/projects', label: 'Projects' },
    { id: 'bookmarks', href: '/bookmarks', label: 'Bookmarks' },
    { id: 'blog', href: '/blog', label: 'Blog' },
  ]

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
      </div>
      <div className={styles.body}>
        <div className={styles.copy}>
          <span className={styles.label}>{label}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : <div className={styles.record} aria-hidden="true"><span /></div>}
      </div>
      <div className={styles.timeline} aria-hidden="true">
        <span className={styles.playhead} />
        <div className={styles.waveform}>
          {[18, 30, 12, 42, 24, 36, 15, 27, 9, 22, 34, 16, 26, 38, 14, 32].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </header>
  )
}
