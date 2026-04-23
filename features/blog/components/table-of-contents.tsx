'use client'

import { useEffect, useState, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { List, X } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('')
  const [items, setItems] = useState<TocItem[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Parse headings from markdown
  useEffect(() => {
    const headings: TocItem[] = []
    const lines = content.split('\n')
    let h2Count = 0
    let h3Count = 0

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)/)
      const h3Match = line.match(/^### (.+)/)

      if (h2Match) {
        h2Count++
        h3Count = 0
        const text = h2Match[1].trim()
        const id = `section-${h2Count}`
        headings.push({ id, text, level: 2 })
      } else if (h3Match) {
        h3Count++
        const text = h3Match[1].trim()
        const id = `section-${h2Count}-${h3Count}`
        headings.push({ id, text, level: 3 })
      }
    }

    setItems(headings)
  }, [content])

  // Observe rendered headings
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    const timer = setTimeout(() => {
      let h2Idx = 0
      let h3Idx = 0
      let lastH2 = 0

      const h2Elements = document.querySelectorAll('article h2')
      const h3Elements = document.querySelectorAll('article h3')

      h2Elements.forEach((el, i) => {
        h2Idx = i + 1
        h3Idx = 0
        lastH2 = h2Idx
        const id = `section-${h2Idx}`
        el.id = id
        observer.observe(el)
      })

      h3Elements.forEach((el) => {
        h3Idx++
        const id = `section-${lastH2}-${h3Idx}`
        el.id = id
        observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [items])

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMobileOpen(false)
  }, [])

  if (items.length === 0) return null

  return (
    <>
      {/* DESKTOP: Sticky Sidebar */}
      <div className="sticky top-24">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-light" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            On this page
          </h3>
        </div>

        {/* TOC List */}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
          <ul className="space-y-0.5 border-l border-zinc-200 dark:border-zinc-800">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    'group relative block w-full text-left text-sm transition-all',
                    'py-1.5 pr-2',
                    item.level === 3 && 'pl-6',
                    item.level === 2 && 'pl-3',
                    activeId === item.id
                      ? 'font-medium text-primary dark:text-primary-light'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200',
                  )}
                >
                  {/* Active indicator */}
                  <span
                    className={cn(
                      'absolute -left-px top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full transition-all',
                      activeId === item.id
                        ? 'bg-primary dark:bg-primary-light'
                        : 'bg-transparent group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700',
                    )}
                  />
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer indicator */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-600">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>{items.length} sections</span>
        </div>
      </div>

      {/* MOBILE: Floating Pill + Drawer */}
      <div className="xl:hidden">
        {/* Floating Button */}
        <m.button
          onClick={() => setIsMobileOpen(true)}
          className="fixed right-4 bottom-28 z-40 flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-4 shadow-lg backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/90"
          whileTap={{ scale: 0.95 }}
        >
          <List size={16} className="text-zinc-600 dark:text-zinc-300" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Contents
          </span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
            {items.length}
          </span>
        </m.button>

        {/* Bottom Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />

              {/* Drawer */}
              <m.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] rounded-t-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-light" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      On this page
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto px-2 py-2">
                  <ul className="space-y-0.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleClick(item.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                            activeId === item.id
                              ? 'bg-primary/10 font-medium text-primary dark:bg-primary/20 dark:text-primary-light'
                              : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold',
                              activeId === item.id
                                ? 'bg-primary text-white dark:bg-primary-light dark:text-zinc-900'
                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
                            )}
                          >
                            {item.level === 2 ? 'H' : '—'}
                          </span>
                          <span className="truncate">{item.text}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
