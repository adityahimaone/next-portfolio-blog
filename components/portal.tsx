'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: ReactNode
}

/**
 * Renders children into `document.body` instead of the local React tree.
 *
 * Use this for any `position: fixed` overlay (modals, dialogs, drawers)
 * that lives inside an ancestor with a CSS `transform` (e.g. scroll-driven
 * parallax wrappers). A `transform` on an ancestor creates a new containing
 * block, which traps `fixed` descendants inside that ancestor's box instead
 * of the viewport. Portaling to `document.body` sidesteps that entirely.
 */
export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
