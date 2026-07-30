import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Bookmark } from '@/features/bookmarks/types'

const FILE_PATH = path.join(process.cwd(), 'content', 'bookmarks.json')

const ADMIN_USER = 'adityahimaone'
const ADMIN_PASS = 'adit143'

function verifyAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-auth')
  const cookieAuth = req.cookies.get('admin_auth')?.value

  const expectedToken = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64')

  if (cookieAuth === expectedToken) return true
  if (authHeader) {
    if (authHeader.startsWith('Basic ')) {
      const token = authHeader.substring(6).trim()
      return token === expectedToken
    }
    if (authHeader === expectedToken || authHeader === `${ADMIN_USER}:${ADMIN_PASS}`) {
      return true
    }
  }
  return false
}

function readBookmarks(): Bookmark[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return []
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    return JSON.parse(raw) as Bookmark[]
  } catch (error) {
    console.error('Error reading bookmarks JSON:', error)
    return []
  }
}

function writeBookmarks(bookmarks: Bookmark[]): void {
  const dirPath = path.dirname(FILE_PATH)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(bookmarks, null, 2), 'utf-8')
}

// GET /api/bookmarks
export async function GET() {
  const bookmarks = readBookmarks()
  return NextResponse.json({ success: true, bookmarks })
}

// POST /api/bookmarks (Add or Login Check)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Action: Login check
    if (body.action === 'login') {
      const { username, password } = body
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64')
        const response = NextResponse.json({ success: true, message: 'Authenticated successfully' })
        response.cookies.set('admin_auth', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        return response
      }
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    // Require Auth for write operations
    if (!verifyAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin credentials required.' }, { status: 401 })
    }

    const { title, url, description, category, tags, faviconUrl, featured } = body
    if (!title || !url) {
      return NextResponse.json({ success: false, message: 'Title and URL are required' }, { status: 400 })
    }

    const bookmarks = readBookmarks()
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      title,
      url,
      description: description || '',
      category: category || 'Dev Tools',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      faviconUrl: faviconUrl || `https://www.google.com/s2/favicons?domain=${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}&sz=64`,
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
    }

    bookmarks.unshift(newBookmark)
    writeBookmarks(bookmarks)

    return NextResponse.json({ success: true, bookmark: newBookmark })
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/bookmarks (Edit)
export async function PUT(req: NextRequest) {
  try {
    if (!verifyAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, url, description, category, tags, faviconUrl, featured } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Bookmark ID is required' }, { status: 400 })
    }

    let bookmarks = readBookmarks()
    const index = bookmarks.findIndex((b) => b.id === id)
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Bookmark not found' }, { status: 404 })
    }

    bookmarks[index] = {
      ...bookmarks[index],
      title: title ?? bookmarks[index].title,
      url: url ?? bookmarks[index].url,
      description: description ?? bookmarks[index].description,
      category: category ?? bookmarks[index].category,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : bookmarks[index].tags,
      faviconUrl: faviconUrl ?? bookmarks[index].faviconUrl,
      featured: featured !== undefined ? Boolean(featured) : bookmarks[index].featured,
    }

    writeBookmarks(bookmarks)
    return NextResponse.json({ success: true, bookmark: bookmarks[index] })
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/bookmarks (Delete)
export async function DELETE(req: NextRequest) {
  try {
    if (!verifyAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Bookmark ID required' }, { status: 400 })
    }

    let bookmarks = readBookmarks()
    const filtered = bookmarks.filter((b) => b.id !== id)

    if (filtered.length === bookmarks.length) {
      return NextResponse.json({ success: false, message: 'Bookmark not found' }, { status: 404 })
    }

    writeBookmarks(filtered)
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
