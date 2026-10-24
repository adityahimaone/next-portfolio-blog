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
  batch?: <T = unknown>(statements: unknown[]) => Promise<D1Result<T>[]>
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

async function getLocalFileBookmarks(): Promise<Bookmark[]> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), 'content', 'bookmarks.json')
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Worker runtime or fs not available
  }
  return []
}

async function saveLocalFileBookmarks(bookmarks: Bookmark[]): Promise<boolean> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), 'content', 'bookmarks.json')
    fs.writeFileSync(filePath, JSON.stringify(bookmarks, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function readBookmarks(): Promise<Bookmark[]> {
  const db = await getDb()
  if (!db) return getLocalFileBookmarks()

  const { results } = await db
    .prepare('SELECT * FROM bookmarks')
    .bind()
    .all<BookmarkRow>()

  const rows = (results ?? []).map(rowToBookmark)
  if (rows.length > 0) return rows

  const local = await getLocalFileBookmarks()
  return local.length > 0 ? local : []
}

export async function insertBookmark(bookmark: Bookmark): Promise<void> {
  const db = await getDb()
  if (!db) {
    const local = await getLocalFileBookmarks()
    local.unshift(bookmark)
    await saveLocalFileBookmarks(local)
    return
  }

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

export async function insertBookmarks(bookmarks: Bookmark[]): Promise<number> {
  if (bookmarks.length === 0) return 0
  const db = await getDb()
  if (!db) {
    const local = await getLocalFileBookmarks()
    local.unshift(...bookmarks)
    await saveLocalFileBookmarks(local)
    return bookmarks.length
  }

  const stmts = bookmarks.map((bookmark) =>
    db
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
      ),
  )

  if (typeof (db as any).batch === 'function') {
    const CHUNK_SIZE = 50
    for (let i = 0; i < stmts.length; i += CHUNK_SIZE) {
      await (db as any).batch(stmts.slice(i, i + CHUNK_SIZE))
    }
  } else {
    for (const stmt of stmts) {
      await stmt.run()
    }
  }

  return bookmarks.length
}

export async function updateBookmark(
  id: string,
  bookmark: Bookmark,
): Promise<boolean> {
  const db = await getDb()
  if (!db) {
    const local = await getLocalFileBookmarks()
    const index = local.findIndex((b) => b.id === id)
    if (index === -1) return false
    local[index] = { ...local[index], ...bookmark }
    await saveLocalFileBookmarks(local)
    return true
  }

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
  if (!db) {
    const local = await getLocalFileBookmarks()
    const filtered = local.filter((b) => b.id !== id)
    if (filtered.length === local.length) return false
    await saveLocalFileBookmarks(filtered)
    return true
  }

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