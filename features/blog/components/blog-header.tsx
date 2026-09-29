import type { BlogMeta } from '../lib/blog'
import { ViewCounter } from './view-counter'
import { TagChip } from '@/components/tag-chip'
import { formatDate } from '@/lib/date'
import styles from '../blog.module.css'

export function BlogHeader({ meta }: { meta: BlogMeta }) {
  return (
    <header className={styles.headline}>
      <div className={styles.headlineMeta}>
        <time dateTime={meta.date}>{formatDate(meta.date, 'long')}</time>
        <span aria-hidden="true">·</span>
        <span>{meta.readingTime}</span>
        <span aria-hidden="true">·</span>
        <ViewCounter slug={meta.slug} />
      </div>

      <h1 className={styles.headlineTitle}>{meta.title}</h1>
      <p className={styles.standfirst}>{meta.description}</p>

      {meta.tags.length > 0 && (
        <div className={styles.tagLine}>
          {meta.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}
    </header>
  )
}
