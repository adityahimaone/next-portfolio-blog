import Link from 'next/link'
import type { BlogMeta } from '../lib/blog'
import { formatDate } from '@/lib/date'
import styles from '../blog.module.css'

/**
 * Compact rows inside the article column — three cards crammed into a 65ch
 * measure used to be unreadable (design.md §3.2).
 */
export function RelatedPosts({ posts }: { posts: BlogMeta[] }) {
  if (posts.length === 0) return null

  return (
    <section className={styles.related}>
      <h2 className={styles.sectionTitle}>Also in the crate</h2>
      <div className={styles.relatedList}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={styles.relatedRow}
          >
            <time dateTime={post.date} className={styles.relatedDate}>
              {formatDate(post.date)}
            </time>
            <span className={styles.relatedTitle}>{post.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
