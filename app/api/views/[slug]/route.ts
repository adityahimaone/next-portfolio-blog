import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

const VIEWS_FILE = path.join(process.cwd(), '.views.json')

function readViews(): Record<string, number> {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      return JSON.parse(fs.readFileSync(VIEWS_FILE, 'utf-8'))
    }
  } catch {
    // ignore
  }
  return {}
}

function writeViews(views: Record<string, number>) {
  fs.writeFileSync(VIEWS_FILE, JSON.stringify(views, null, 2))
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = readViews()
  views[slug] = (views[slug] || 0) + 1
  writeViews(views)

  return Response.json({ views: views[slug] })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = readViews()

  return Response.json({ views: views[slug] || 0 })
}
