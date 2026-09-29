'use client'

import { useEffect, useState } from 'react'

/**
 * True when the event came from somewhere the shortcuts must stay out of.
 *
 * `event.target` is typed as an EventTarget, which is not guaranteed to be an
 * HTMLElement — a keydown with no focused element resolves to the document,
 * and `target?.closest` then throws on a method that does not exist. The
 * optional chain only covers null and undefined, so the check has to be on the
 * method itself.
 */
function isFromField(event: KeyboardEvent): boolean {
  const target = event.target
  if (
    typeof (target as Element | null)?.closest === 'function' &&
    (target as Element).closest('input, textarea, select, [contenteditable]')
  ) {
    return true
  }
  return event.metaKey || event.ctrlKey || event.altKey
}

/**
 * j/k to move, Enter to open — additive keyboard support for the library
 * list, never the only way to reach a link.
 *
 * `active` starts null rather than 0: the list is not a text input with a
 * caret, so lighting row one on load implies a selection the reader never
 * made. It also means Enter does nothing until they have actually moved,
 * instead of opening the first link out of nowhere.
 *
 * `active` is an index into whatever list is currently rendered, so it has to
 * be dropped when the list is *replaced* — not merely resized. Switching
 * category or typing in the search rebuilds the rows, and a surviving index
 * silently points at a different bookmark than the one it lit up.
 */
export function useListKeys(
  count: number,
  onOpen: (index: number) => void,
  listKey?: string,
) {
  const [active, setActive] = useState<number | null>(null)

  // Any change to the list itself clears the selection, so the first keypress
  // after a filter change starts from the top of the new list rather than
  // resuming an index that no longer means what it did.
  useEffect(() => {
    setActive(null)
  }, [listKey])

  useEffect(() => {
    setActive((prev) => (prev === null ? null : Math.min(prev, count - 1)))
  }, [count])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isFromField(event)) return

      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault()
        // First press lands on row one, so arrowing down reads as "start
        // here" rather than skipping past the first row.
        setActive((prev) => Math.min(count - 1, (prev ?? -1) + 1))
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault()
        // Nothing selected yet: k does nothing rather than jumping to the
        // bottom of the list. With nothing to move up from, the only honest
        // reading of "up" is "stay put".
        setActive((prev) => (prev === null ? null : Math.max(0, prev - 1)))
      } else if (event.key === 'Enter') {
        if (active !== null) onOpen(active)
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
      if (isFromField(event)) return

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
