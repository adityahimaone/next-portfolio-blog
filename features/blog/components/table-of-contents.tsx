'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('')
  const [items, setItems] = useState<TocItem[]>([])

  useEffect(() => {
    // Extract headings from markdown content
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

    // Inject IDs into rendered headings
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

    // Small delay to wait for ReactMarkdown to render
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
  }, [content])

  if (items.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="hidden xl:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          On this page
        </h3>
        <ul className="space-y-1 border-l border-zinc-200 dark:border-zinc-800">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={cn(
                  'block w-full text-left text-sm transition-colors hover:text-primary dark:hover:text-primary-light',
                  item.level === 3 && 'pl-4',
                  activeId === item.id
                    ? 'border-l-2 border-primary pl-3 font-medium text-primary dark:border-primary-light dark:text-primary-light'
                    : 'border-l-2 border-transparent pl-3 text-zinc-600 dark:text-zinc-400',
                  item.level === 3 && activeId === item.id && 'pl-7',
                  item.level === 3 && activeId !== item.id && 'pl-7',
                )}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
