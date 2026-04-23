import { ImageResponse } from 'next/og'
import { getPost } from '@/features/blog/lib/blog'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { meta } = getPost(slug)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #27272a 2px, transparent 0), radial-gradient(circle at 75px 75px, #27272a 2px, transparent 0)',
          backgroundSize: '100px 100px',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#273281',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
          <span
            style={{
              fontSize: '20px',
              color: '#a1a1aa',
              fontWeight: 500,
            }}
          >
            adityahimaone
          </span>
        </div>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          {meta.title}
        </h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
          {meta.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '18px',
                color: '#a1a1aa',
                background: '#18181b',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #27272a',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
