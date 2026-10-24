import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { Bookmark } from '@/features/bookmarks/types'
import {
  queryBookmarks,
  parsePage,
  PAGE_SIZE,
} from '@/features/bookmarks/lib/bookmarks'
import {
  readBookmarks,
  insertBookmark,
  insertBookmarks,
  updateBookmark,
  deleteBookmark,
} from '@/lib/d1'

/**
 * Admin credentials come from the environment. They used to be literals in
 * this file, which put the password in git history on a public repository —
 * recoverable from the commit even after the value is changed here.
 *
 * They are read per request rather than at module load: Next evaluates route
 * modules while collecting page data at build time, so a module-level throw on
 * a missing variable fails the build on any machine that has not exported
 * them. Missing credentials instead mean every write is refused, which is the
 * safe direction to fail and keeps `next build` independent of the deploy
 * environment.
 */
function credentials(): { user: string; pass: string } | null {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS
  if (user && pass) return { user, pass }
  if (process.env.NODE_ENV !== 'production') {
    return { user: user || 'admin', pass: pass || 'admin' }
  }
  return null
}

function expectedTokenFor(user: string, pass: string): string {
  return Buffer.from(`${user}:${pass}`).toString('base64')
}

function verifyAuth(req: NextRequest): boolean {
  const creds = credentials()
  // Fail closed: with no credentials configured, nothing can authenticate.
  if (!creds) return false

  const authHeader =
    req.headers.get('authorization') || req.headers.get('x-admin-auth')
  const cookieAuth = req.cookies.get('admin_auth')?.value
  const expectedToken = expectedTokenFor(creds.user, creds.pass)

  // timingSafeEqual needs equal-length buffers, so compare lengths first and
  // do the cheap rejection before taking the slower constant-time path.
  const matches = (candidate: string | undefined) => {
    if (!candidate) return false
    const given = Buffer.from(candidate)
    const expected = Buffer.from(expectedToken)
    return given.length === expected.length && timingSafeEqual(given, expected)
  }

  if (matches(cookieAuth)) return true
  if (authHeader) {
    if (authHeader.startsWith('Basic ')) {
      return matches(authHeader.substring(6).trim())
    }
    if (matches(authHeader) || authHeader === `${creds.user}:${creds.pass}`) {
      return true
    }
  }
  return false
}

// GET /api/bookmarks
//
// Paged by default. "Load more" on /bookmarks fetches the next page from here
// and appends it, so this used to be the only reader of the catalogue on a
// client-side navigation — and it was re-sending all 559 rows on every mount.
// `?all=1` is the escape hatch for anything that genuinely needs the whole set.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Auth check ping for admin state initialization
  if (searchParams.get('check_auth') === '1') {
    const isAuthed = verifyAuth(req)
    return NextResponse.json({ success: true, authenticated: isAuthed })
  }

  const all = searchParams.get('all') === '1'
  const bookmarks = await readBookmarks()

  if (all) {
    return NextResponse.json({ success: true, bookmarks })
  }

  const result = queryBookmarks(bookmarks, {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    page: parsePage(searchParams.get('page') ?? undefined),
  })

  return NextResponse.json(
    {
      success: true,
      bookmarks: result.items,
      total: result.total,
      page: result.page,
      pageCount: result.pageCount,
      hasMore: result.page < result.pageCount,
      pageSize: PAGE_SIZE,
    },
    {
      // The catalogue is a file in the repo and only changes on deploy, but a
      // minute is enough to absorb the burst of appends one "Load more" click
      // makes without ever serving a stale count for long.
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}

// POST /api/bookmarks (Add, Bulk Add, Login Check, Logout)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Action: Login check
    if (body.action === 'login') {
      const { username, password } = body
      const creds = credentials()
      if (creds && username === creds.user && password === creds.pass) {
        const response = NextResponse.json({
          success: true,
          message: 'Authenticated successfully',
        })
        response.cookies.set(
          'admin_auth',
          expectedTokenFor(creds.user, creds.pass),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          },
        )
        return response
      }
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Action: Logout
    if (body.action === 'logout') {
      const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      })
      response.cookies.set('admin_auth', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
      return response
    }

    // Require Auth for write operations
    if (!verifyAuth(req)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Admin credentials required.',
        },
        { status: 401 },
      )
    }

    // Action: Bulk Add
    if (body.action === 'bulk' || Array.isArray(body.bookmarks)) {
      const items = Array.isArray(body.bookmarks) ? body.bookmarks : []
      if (items.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No bookmark entries provided' },
          { status: 400 },
        )
      }

      const now = Date.now()
      const newBookmarks: Bookmark[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item || !item.url) continue

        let fullUrl = String(item.url).trim()
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
          fullUrl = `https://${fullUrl}`
        }

        let domain = ''
        try {
          domain = new URL(fullUrl).hostname
        } catch {
          continue
        }

        const cleanHost = domain.replace(/^www\./, '')
        const title =
          item.title && String(item.title).trim()
            ? String(item.title).trim()
            : cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1)

        const tags = Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
            ? item.tags
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
            : []

        newBookmarks.push({
          id: `bm-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          url: fullUrl,
          description: item.description ? String(item.description).trim() : '',
          category: item.category ? String(item.category).trim() : 'Dev Tools',
          tags,
          faviconUrl:
            item.faviconUrl ||
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          featured: Boolean(item.featured),
          createdAt: new Date().toISOString(),
        })
      }

      if (newBookmarks.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No valid URLs found in submission' },
          { status: 400 },
        )
      }

      await insertBookmarks(newBookmarks)

      return NextResponse.json({
        success: true,
        count: newBookmarks.length,
        bookmarks: newBookmarks,
      })
    }

    // Action: Single Add
    const { title, url, description, category, tags, faviconUrl, featured } =
      body
    if (!title || !url) {
      return NextResponse.json(
        { success: false, message: 'Title and URL are required' },
        { status: 400 },
      )
    }

    let sanitizedUrl = url.trim()
    if (
      !sanitizedUrl.startsWith('http://') &&
      !sanitizedUrl.startsWith('https://')
    ) {
      sanitizedUrl = `https://${sanitizedUrl}`
    }

    let host = ''
    try {
      host = new URL(sanitizedUrl).hostname
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL provided' },
        { status: 400 },
      )
    }

    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      title,
      url: sanitizedUrl,
      description: description || '',
      category: category || 'Dev Tools',
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
          ? tags
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
      faviconUrl:
        faviconUrl ||
        `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
    }

    await insertBookmark(newBookmark)

    return NextResponse.json({ success: true, bookmark: newBookmark })
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// PUT /api/bookmarks (Edit)
export async function PUT(req: NextRequest) {
  try {
    if (!verifyAuth(req)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Admin credentials required.',
        },
        { status: 401 },
      )
    }

    const body = await req.json()
    const {
      id,
      title,
      url,
      description,
      category,
      tags,
      faviconUrl,
      featured,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Bookmark ID is required' },
        { status: 400 },
      )
    }

    const bookmarks = await readBookmarks()
    const index = bookmarks.findIndex((b) => b.id === id)
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Bookmark not found' },
        { status: 404 },
      )
    }

    bookmarks[index] = {
      ...bookmarks[index],
      title: title ?? bookmarks[index].title,
      url: url ?? bookmarks[index].url,
      description: description ?? bookmarks[index].description,
      category: category ?? bookmarks[index].category,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
          ? tags
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
          : bookmarks[index].tags,
      faviconUrl: faviconUrl ?? bookmarks[index].faviconUrl,
      featured:
        featured !== undefined ? Boolean(featured) : bookmarks[index].featured,
    }

    // Single-row UPDATE rather than rewrite-everything-then-persist, so a
    // concurrent add during the read above is not silently reverted.
    const updated = await updateBookmark(id, bookmarks[index])
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Bookmark not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, bookmark: bookmarks[index] })
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// DELETE /api/bookmarks (Delete)
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyAuth(req)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Admin credentials required.',
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Bookmark ID is required' },
        { status: 400 },
      )
    }

    const deleted = await deleteBookmark(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Bookmark not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
