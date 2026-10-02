'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {})

    fetch(`/api/views/${slug}`)
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch(() => {})
  }, [slug])

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        // Reserved so the count resolving in does not reflow the flex row it
        // sits in — the previous swap of "views —" for "1,204 views" pushed
        // the metadata around it sideways.
        minWidth: '6.5em',
      }}
    >
      <Eye size={13} aria-hidden="true" />
      {views !== null ? (
        <span
          style={{
            // Crossfades rather than popping, so the number arriving reads as
            // the same element filling in rather than a different object.
            animation: 'view-counter-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {views.toLocaleString()} views
        </span>
      ) : (
        /* Was `opacity: 0.55`, which put this at 2.09:1. It now carries no
           opacity of its own: the parent already sets --booth-ink-dim, and
           fading a dim ink again is what pushed it under. `aria-hidden`
           because the real count replaces this placeholder, so announcing both
           would read the number twice. */
        <span aria-hidden="true">views —</span>
      )}
    </span>
  )
}
