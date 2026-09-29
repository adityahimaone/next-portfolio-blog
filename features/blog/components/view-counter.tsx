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
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
    >
      <Eye size={13} aria-hidden="true" />
      {views !== null ? `${views.toLocaleString()} views` : 'views —'}
    </span>
  )
}
