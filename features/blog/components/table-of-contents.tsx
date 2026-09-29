'use client'

import { useEffect, useState, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { List, X } from 'lucide-react'
import styles from '../blog.module.css'

interface TocItem {
  id: string
  text: string
  level: number
}

/** Slug that mirrors the positional ids assigned to rendered headings below. */
function parseHeadings(content: string): TocItem[] {
  const items: TocItem[] = []
  let h2Count = 0
  let h3Count = 0

  for (const line of content.split('\n')) {
    const h2 = line.match(/^## (.+)/)
    const h3 = line.match(/^### (.+)/)

    if (h2) {
      h2Count += 1
      h3Count = 0
      items.push({ id: `section-${h2Count}`, text: h2[1].trim(), level: 2 })
    } else if (h3) {
      h3Count += 1
      items.push({
        id: `section-${h2Count}-${h3Count}`,
        text: h3[1].trim(),
        level: 3,
      })
    }
  }

  return items
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState('')
  const [items, setItems] = useState<TocItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setItems(parseHeadings(content))
  }, [content])

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-96px 0px -70% 0px' },
    )

    const timer = setTimeout(() => {
      let h2Idx = 0
      let h3Idx = 0
      let lastH2 = 0

      document.querySelectorAll('article h2').forEach((el) => {
        h2Idx += 1
        h3Idx = 0
        lastH2 = h2Idx
        el.id = `section-${h2Idx}`
        observer.observe(el)
      })

      document.querySelectorAll('article h3').forEach((el) => {
        h3Idx += 1
        el.id = `section-${lastH2}-${h3Idx}`
        observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [items])

  const handleClick = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  if (items.length === 0) return null

  return (
    <>
      <nav className={`${styles.cue} glass-2`} aria-label="On this page">
        <span className={styles.cueTitle}>Cue sheet</span>
        <ul className={styles.cueList}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                aria-current={activeId === item.id ? 'true' : undefined}
                className={`${styles.cueItem} ${item.level === 3 ? styles.cueSub : ''} ${
                  activeId === item.id ? styles.cueActive : ''
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.cueFoot}>{items.length} sections</p>
      </nav>

      <div className="xl:hidden">
        <m.button
          type="button"
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.96 }}
          aria-label="Open table of contents"
          className={`${styles.cueFab} glass-2`}
        >
          <List size={16} aria-hidden="true" />
          <span className="silkscreen">Contents</span>
          <span className={styles.cueCount}>{items.length}</span>
        </m.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className={styles.drawerBackdrop}
              />
              <m.div
                role="dialog"
                aria-modal="true"
                aria-label="On this page"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`${styles.drawer} glass-2`}
              >
                <div className={styles.drawerHead}>
                  <span className={styles.cueTitle}>Cue sheet</span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={styles.drawerClose}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                <ul className={styles.cueList}>
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(item.id)}
                        className={`${styles.cueItem} ${item.level === 3 ? styles.cueSub : ''} ${
                          activeId === item.id ? styles.cueActive : ''
                        }`}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
