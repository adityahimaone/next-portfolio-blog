import type { Bookmark } from '@/features/bookmarks/types'

/**
 * D1 access layer, replacing the fs-based reads and writes.
 *
 * Two things this must handle that a plain `db.prepare(...)` call does not:
 *
 * 1. `getCloudflareContext` throws outside the Workers runtime. Every call here
 *    is lazy (inside a request), never at module load, so importing this file
 *    during `next build` stays safe.
 * 2. The D1 binding is absent in local `next dev` unless
 *    `initOpenNextCloudflareForDev()` is wired into next.config.mjs. Callers
 *    already handle an empty result set, so a null binding degrades to "no
 *    data" rather than throwing.
 */

type D1Result<T> = {
  results?: T[]
  success?: boolean
  error?: string
}

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T>() => Promise<D1Result<T>>
      // `meta.changes` is how D1 reports affected rows, which is how the
      // update/delete below distinguish "not found" from "found".
      run: () => Promise<{ meta?: { changes?: number }; success?: boolean; error?: string }>
      first: <T>() => Promise<T | null>
    }
  }
}

export async function getDb(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = await getCloudflareContext({ async: true })
    return (ctx.env as { DB?: D1Database }).DB ?? null
  } catch {
    return null
  }
}

type BookmarkRow = {
  id: string
  title: string
  url: string
  description: string
  category: string
  tags: string
  favicon_url: string | null
  featured: number
  created_at: string
}

function rowToBookmark(row: BookmarkRow): Bookmark {
  let tags: string[] = []
  try {
    const parsed = JSON.parse(row.tags)
    if (Array.isArray(parsed)) tags = parsed
  } catch {
    tags = []
  }

  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description,
    category: row.category,
    tags,
    faviconUrl: row.favicon_url ?? undefined,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
  }
}

export async function readBookmarks(): Promise<Bookmark[]> {
  const db = await getDb()
  if (!db) return []

  const { results } = await db
    .prepare('SELECT * FROM bookmarks')
    .bind()
    .all<BookmarkRow>()

  return (results ?? []).map(rowToBookmark)
}

export async function insertBookmark(bookmark: Bookmark): Promise<void> {
  const db = await getDb()
  if (!db) throw new Error('D1 binding unavailable')

  await db
    .prepare(
      `INSERT INTO bookmarks (id, title, url, description, category, tags, favicon_url, featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      bookmark.id,
      bookmark.title,
      bookmark.url,
      bookmark.description,
      bookmark.category,
      JSON.stringify(bookmark.tags),
      bookmark.faviconUrl ?? null,
      bookmark.featured ? 1 : 0,
      bookmark.createdAt,
    )
    .run()
}

export async function updateBookmark(
  id: string,
  bookmark: Bookmark,
): Promise<boolean> {
  const db = await getDb()
  if (!db) throw new Error('D1 binding unavailable')

  const result = await db
    .prepare(
      `UPDATE bookmarks
       SET title = ?, url = ?, description = ?, category = ?, tags = ?,
           favicon_url = ?, featured = ?
       WHERE id = ?`,
    )
    .bind(
      bookmark.title,
      bookmark.url,
      bookmark.description,
      bookmark.category,
      JSON.stringify(bookmark.tags),
      bookmark.faviconUrl ?? null,
      bookmark.featured ? 1 : 0,
      id,
    )
    .run()

  return Boolean(result.meta?.changes)
}

export async function deleteBookmark(id: string): Promise<boolean> {
  const db = await getDb()
  if (!db) throw new Error('D1 binding unavailable')

  const result = await db
    .prepare('DELETE FROM bookmarks WHERE id = ?')
    .bind(id)
    .run()

  return Boolean(result.meta?.changes)
}

/**
 * Bumps a view counter and returns the new total.
 *
 * Done as an upsert + increment rather than read-then-write: the old file-based
 * version lost counts under concurrent requests, and D1 serializes writes to a
 * given row so this is atomic without a transaction.
 */
export async function incrementViews(slug: string): Promise<number> {
  const db = await getDb()
  if (!db) return 0

  await db
    .prepare(
      `INSERT INTO views (slug, count) VALUES (?, 1)
       ON CONFLICT(slug) DO UPDATE SET count = count + 1`,
    )
    .bind(slug)
    .run()

  const row = await db
    .prepare('SELECT count FROM views WHERE slug = ?')
    .bind(slug)
    .first<{ count: number }>()

  return row?.count ?? 0
}

export async function readViews(slug: string): Promise<number> {
  const db = await getDb()
  if (!db) return 0

  const row = await db
    .prepare('SELECT count FROM views WHERE slug = ?')
    .bind(slug)
    .first<{ count: number }>()

  return row?.count ?? 0
}