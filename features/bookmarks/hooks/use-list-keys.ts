'use client'

import { useEffect, useState } from 'react'

/**
 * j/k to move, Enter to open — additive keyboard support for the library
 * list, never the only way to reach a link.
 */
export function useListKeys(count: number, onOpen: (index: number) => void) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive((prev) => Math.min(prev, Math.max(0, count - 1)))
  }, [count])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (
        target?.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((prev) => Math.min(count - 1, prev + 1))
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((prev) => Math.max(0, prev - 1))
      } else if (event.key === 'Enter') {
        onOpen(active)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, active, onOpen])

  return { active, setActive }
}

/** `g` then a letter jumps between destinations; `/` focuses search. */
export function useGlobalShortcuts(onShortcut: (key: string) => void) {
  useEffect(() => {
    let armed = false
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (
        target?.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (armed) {
        armed = false
        if (timer) clearTimeout(timer)
        onShortcut(event.key.toLowerCase())
        return
      }

      if (event.key.toLowerCase() === 'g') {
        armed = true
        timer = setTimeout(() => {
          armed = false
        }, 1200)
        return
      }

      onShortcut(event.key.toLowerCase())
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (timer) clearTimeout(timer)
    }
  }, [onShortcut])
}
