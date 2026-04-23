'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    // Track view
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {})

    // Get current count
    fetch(`/api/views/${slug}`)
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch(() => {})
  }, [slug])

  return (
    <span className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
      <Eye size={14} />
      {views !== null ? `${views.toLocaleString()} views` : '—'}
    </span>
  )
}
