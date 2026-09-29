import { memo } from 'react'
import Link from 'next/link'
import type { BlogMeta } from '../lib/blog'
import {
  formatRuntime,
  minutesFromReadingTime,
  waveformFromReadingTime,
} from '@/components/waveform-data'
import { TagChip } from '@/components/tag-chip'
import { formatDate } from '@/lib/date'
import styles from '../blog.module.css'

interface BlogCardProps {
  post: BlogMeta
  /** Tracklist position, e.g. `A3`. Pinned rows read `LEAD`. */
  code: string
  lead?: boolean
}

/**
 * One entry in the tracklist. The trace on the right is generated from the
 * article's runtime, so a reader can size a post before opening it (design.md §3.1).
 */
export const BlogCard = memo(function BlogCard({
  post,
  code,
  lead = false,
}: BlogCardProps) {
  const minutes = minutesFromReadingTime(post.readingTime)
  const trace = waveformFromReadingTime(post.readingTime)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`${styles.track} ${lead ? styles.lead : ''}`}
    >
      <span
        className={`${styles.gutter} silkscreen ${lead ? styles.leadGutter : ''}`}
      >
        {code}
      </span>

      <span className={styles.body}>
        <span className={styles.meta}>
          {lead && <span className={styles.leadBadge}>Lead single</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
        </span>

        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.description}>{post.description}</p>

        {post.tags.length > 0 && (
          <span className={styles.tags}>
            {post.tags.slice(0, 5).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </span>
        )}
      </span>

      <span className={styles.plate} aria-hidden="true">
        <span className={styles.bars}>
          {trace.map((height, index) => (
            <span key={index} style={{ ['--h' as string]: `${height}%` }} />
          ))}
        </span>
        <span className={styles.runtime}>{formatRuntime(minutes)}</span>
      </span>
    </Link>
  )
})
