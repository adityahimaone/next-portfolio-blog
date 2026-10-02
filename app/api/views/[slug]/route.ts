import { NextRequest } from 'next/server'
import { incrementViews, readViews } from '@/lib/d1'

// Was a `.views.json` file rewritten with fs.writeFileSync on every request.
// Workers have a read-only ephemeral filesystem, so the counter lives in D1 now.
// The increment is a single upsert rather than read-modify-write, which also
// fixes the lost counts the file version had under concurrent requests.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const views = await incrementViews(slug)

  return Response.json({ views })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const views = await readViews(slug)

  return Response.json({ views })
}