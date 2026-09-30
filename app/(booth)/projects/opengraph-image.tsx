import { ImageResponse } from 'next/og'
import { WORK_PROJECTS } from '@/data/projects'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

/**
 * /projects had no `opengraph-image.tsx`, and its metadata block declared
 * `openGraph` with no `images` — which Next treats as a full replacement, not
 * a merge, so the root defaults never applied and the route emitted no
 * og:image at all. Shared links rendered with a bare text card.
 *
 * Styled after the per-post image so both surfaces read as the same site.
 */
export default function Image() {
  const stack = [...new Set(WORK_PROJECTS.flatMap((project) => project.stack))]

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
          <span style={{ fontSize: '20px', color: '#a1a1aa', fontWeight: 500 }}>
            adityahimaone
          </span>
        </div>
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            marginBottom: '20px',
          }}
        >
          Shipped Work
        </h1>
        <p
          style={{
            fontSize: '26px',
            color: '#a1a1aa',
            maxWidth: '820px',
            marginBottom: '28px',
          }}
        >
          {WORK_PROJECTS.length} production systems, interfaces and experiments.
        </p>
        <div
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}
        >
          {stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '18px',
                color: '#a1a1aa',
                background: '#18181b',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #27272a',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
